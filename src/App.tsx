import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import AIChat from "./components/AIChat";
import RootCause from "./components/RootCause";
import LifeMap from "./components/LifeMap";
import Journeys from "./components/Journeys";
import FocusMode from "./components/FocusMode";
import FutureSimulator from "./components/FutureSimulator";
import Accountability from "./components/Accountability";
import Settings from "./components/Settings";
import Auth from "./components/Auth";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activePage, setActivePage] = useState<string>(() => {
    try { return sessionStorage.getItem("lifepilot_page") || "home"; } catch { return "home"; }
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // High-fidelity state properties
  const [coachPersona, setCoachPersona] = useState<string>("ora"); // default Ora (Zen)
  const [xpPoints, setXpPoints] = useState<number>(1200);
  
  // Holds analysis generated in chat to pass directly to RootCause analyzer screen
  const [diagnosticsAnalysis, setDiagnosticsAnalysis] = useState<any | null>(null);

  // Buffer prompt when clicking an action insight in dashboard
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>("");

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [smoothMouse, setSmoothMouse] = useState({ x: -1000, y: -1000 });

  // Persist active page to sessionStorage to survive HMR / re-renders
  useEffect(() => {
    try { sessionStorage.setItem("lifepilot_page", activePage); } catch {}
  }, [activePage]);

  // 1. Fetch Session on Mount
  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem("lifepilot_token");
      try {
        const res = await fetch("/api/auth/session", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data.loggedIn) {
            setIsLoggedIn(true);
            setXpPoints(data.user.xpPoints);
            setCoachPersona(data.user.coachPersona || "ora");
            setUserProfile(data.user);
          } else {
            setUserProfile(data.user); // guest profile
            setActivePage("home"); // Enforce home page for guests
          }
        }
      } catch (err) {
        console.error("Failed to query session coordinates on mount:", err);
        setActivePage("home");
      }
    };
    fetchSession();
  }, []);

  // 2. Sync Coach Persona Changes
  useEffect(() => {
    const syncCoach = async () => {
      const token = localStorage.getItem("lifepilot_token");
      try {
        await fetch("/api/user/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ coachPersona })
        });
      } catch (err) {
        console.error("Failed to sync coach index:", err);
      }
    };
    if (isLoggedIn) {
      syncCoach();
    }
  }, [coachPersona, isLoggedIn]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Beautiful visual inertia lag for expensive pointer following spotlight
  useEffect(() => {
    let animId: number;
    const updateSmoothPos = () => {
      setSmoothMouse((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        
        // Return directly if close enough to save computations
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          return mousePos;
        }

        const nextX = prev.x + dx * 0.08;
        const nextY = prev.y + dy * 0.08;
        return { x: nextX, y: nextY };
      });
      animId = requestAnimationFrame(updateSmoothPos);
    };
    animId = requestAnimationFrame(updateSmoothPos);
    return () => cancelAnimationFrame(animId);
  }, [mousePos]);

  const handleAddXP = async (points: number) => {
    setXpPoints(prev => prev + points);
    const token = localStorage.getItem("lifepilot_token");
    try {
      await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ xpPoints: xpPoints + points })
      });
    } catch (err) {
      console.error("Failed to persist XP boost to backend:", err);
    }
  };

  const navigateToPage = (page: string) => {
    if (page === "home") {
      setActivePage("home");
    } else if (isLoggedIn) {
      setActivePage(page);
    } else {
      setShowAuthOverlay(true);
    }
  };

  const handleTalkToAI = (prompt?: string) => {
    if (prompt) {
      setChatInitialPrompt(prompt);
    }
    navigateToPage("chat");
  };

  const navigateToRootCause = (analysis: any) => {
    setDiagnosticsAnalysis(analysis);
    setActivePage("root-cause");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("lifepilot_token");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.error("Logout notification request failed:", err);
    }
    localStorage.removeItem("lifepilot_token");
    setIsLoggedIn(false);
    setUserProfile(null);
    setCoachPersona("ora");
    setXpPoints(1200);
    setActivePage("home");
  };

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem("lifepilot_token", token);
    setIsLoggedIn(true);
    setXpPoints(user.xpPoints);
    setCoachPersona(user.coachPersona || "ora");
    setUserProfile(user);
    setActivePage("dashboard");
    setShowAuthOverlay(false);
  };

  return (
    <div id="life-pilot-main-container" className="min-h-screen bg-pilot-void text-white relative font-sans antialiased overflow-x-hidden select-none">
      
      {/* Background stars / grid mesh overlay */}
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />

      {/* Lag-Damped Premium Mouse Spotlight Orb */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute w-[350px] h-[350px] rounded-full opacity-[0.09] blur-[110px] bg-indigo-500 transition-opacity duration-1000 select-none pointer-events-none"
          style={{
            left: smoothMouse.x - 175,
            top: smoothMouse.y - 175,
            transform: "translateZ(0)",
          }}
        />
      </div>

      {/* 60FPS Ambient drifting orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="floating-orb w-[450px] h-[450px] bg-violet-600/10 top-[-10%] left-[10%]"
        />
        <motion.div
          animate={{
            x: [0, -100, 60, 0],
            y: [0, 80, -50, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="floating-orb w-[500px] h-[500px] bg-indigo-600/10 bottom-[15%] right-[5%]"
        />
        <motion.div
          animate={{
            x: [0, 40, -50, 0],
            y: [0, 100, -80, 0],
            scale: [1, 1.1, 0.85, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="floating-orb w-[300px] h-[300px] bg-cyan-500/5 top-[40%] left-[50%]"
        />
      </div>
      
      {/* Floating glass navigation dock */}
      <Navbar 
        activePage={activePage} 
        setActivePage={navigateToPage} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthOverlay(true)}
      />

      {/* Main Content Router */}
      <main className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {activePage === "home" && (
            <motion.div
              key="page-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage 
                onJoinClick={() => setShowAuthOverlay(true)}
                onExploreDashboard={() => navigateToPage("dashboard")}
              />
            </motion.div>
          )}

          {activePage === "dashboard" && (
            <motion.div
              key="page-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard 
                onTalkToAI={handleTalkToAI}
                navigateToPage={navigateToPage}
                xpPoints={xpPoints}
                onRefreshSession={async () => {
                  const token = localStorage.getItem("lifepilot_token");
                  try {
                    const res = await fetch("/api/auth/session", {
                      headers: token ? { "Authorization": `Bearer ${token}` } : {}
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setXpPoints(data.user.xpPoints);
                      setUserProfile(data.user);
                    }
                  } catch (e) {
                    console.error("Session refresh coordinates failed:", e);
                  }
                }}
              />
            </motion.div>
          )}

          {activePage === "chat" && (
            <motion.div
              key="page-chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AIChat 
                initialPrompt={chatInitialPrompt}
                clearInitialPrompt={() => setChatInitialPrompt("")}
                onAddXP={handleAddXP}
                navigateToRootCause={navigateToRootCause}
                userProfile={{ focusArea: "Routine deconstruction", discipline: 75, energyState: "Stable" }}
              />
            </motion.div>
          )}

          {activePage === "root-cause" && (
            <motion.div
              key="page-root-cause"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <RootCause customAnalysis={diagnosticsAnalysis} />
            </motion.div>
          )}

          {activePage === "life-map" && (
            <motion.div
              key="page-life-map"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <LifeMap />
            </motion.div>
          )}

          {activePage === "journeys" && (
            <motion.div
              key="page-journeys"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Journeys onAddXP={handleAddXP} />
            </motion.div>
          )}

          {activePage === "focus" && (
            <motion.div
              key="page-focus"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <FocusMode />
            </motion.div>
          )}

          {activePage === "future-self" && (
            <motion.div
              key="page-future"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <FutureSimulator />
            </motion.div>
          )}

          {activePage === "accountability" && (
            <motion.div
              key="page-accountability"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Accountability coachPersona={coachPersona} />
            </motion.div>
          )}

          {activePage === "settings" && (
            <motion.div
              key="page-settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Settings 
                coachPersona={coachPersona} 
                setCoachPersona={setCoachPersona} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Authentication Overlay */}
      <AnimatePresence>
        {showAuthOverlay && (
          <Auth 
            onSuccess={handleLoginSuccess}
            onCancel={() => setShowAuthOverlay(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
