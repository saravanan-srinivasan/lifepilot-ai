import React, { useState } from "react";
import { 
  Compass, 
  LayoutDashboard, 
  MessageSquare, 
  Activity, 
  Flame, 
  Clock, 
  TrendingUp, 
  Settings, 
  Menu, 
  X,
  UserCheck,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
}

export default function Navbar({ activePage, setActivePage, isLoggedIn, onLogout, onLoginClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Elite, clean icons and labels for life-operating systems
  const navItems = [
    { id: "home", label: "Home", icon: Compass },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "chat", label: "Ask AI", icon: MessageSquare },
    { id: "root-cause", label: "Mind Obstacles", icon: Activity },
    { id: "life-map", label: "Life Map", icon: Compass },
    { id: "journeys", label: "My Habits", icon: Flame },
    { id: "focus", label: "Focus Timer", icon: Clock },
    { id: "future-self", label: "Future Planner", icon: TrendingUp },
    { id: "accountability", label: "Daily Review", icon: UserCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <nav id="glass-dock-navbar" className="fixed top-3 sm:top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[97%] sm:w-[95%] max-w-6xl px-2 sm:px-0">
        <div className="py-3 sm:py-4 px-5 sm:px-8 rounded-full flex items-center justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden bg-[#0A0A0E]/70 backdrop-blur-[28px] border border-white/[0.06] transition-all duration-300 gap-4">
          {/* Symmetrical white-on-dark premium signature */}
          {/* Symmetrical white-on-dark premium signature */}
          <div 
            id="brand-signature" 
            className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
            onClick={() => { setActivePage("home"); setMobileMenuOpen(false); }}
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-white/[0.03] border border-white/[0.10] flex items-center justify-center transition-colors group-hover:border-accent/40">
              <span className="text-zinc-200 font-mono font-semibold text-xs md:text-sm tracking-tight">LP</span>
            </div>
            <span className="font-serif italic font-normal text-lg md:text-xl tracking-tight text-white hidden sm:inline select-none">
              LifePilot
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5 overflow-x-auto max-w-[calc(100vw-280px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`relative px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-[13px] font-sans font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-desktop-pill"
                      className="absolute inset-0 bg-white/[0.04] border border-white/[0.10] rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 240, damping: 28, mass: 0.7 }}
                    />
                  )}
                  <IconComp className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                  <span className={`tracking-[-0.01em] ${isActive ? "inline" : "hidden xl:inline"}`}>{item.label}</span>
                  {!isLoggedIn && item.id !== "home" && (
                    <Lock className="w-2.5 h-2.5 text-zinc-500 ml-0.5 opacity-80" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3 md:gap-4">
            {isLoggedIn ? (
              <button
                id="btn-logout-auth"
                onClick={onLogout}
                className="px-4 py-2 rounded-full bg-transparent text-zinc-400 hover:text-[#F0F0F5] text-xs font-semibold border border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.12] transition-all cursor-pointer font-sans"
              >
                Sign Out
              </button>
            ) : (
              <button
                id="btn-login-auth"
                onClick={onLoginClick}
                className="px-5 py-2 rounded-full bg-[#F0F0F5] hover:bg-white text-[#06060A] text-xs font-semibold tracking-wide shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                Access System
              </button>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            id="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-full transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-[92%] px-2 sm:px-0 md:hidden"
          >
            <div className="p-3 sm:p-5 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col gap-2 relative overflow-hidden bg-[#0A0A0EF0] backdrop-blur-2xl border border-white/[0.06] max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="text-sm font-mono tracking-[0.2em] text-zinc-500 mb-3 px-2 uppercase font-semibold">SYSTEM STATUS</div>
              
               <div className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      id={`mobile-nav-link-${item.id}`}
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base font-normal rounded-xl flex items-center gap-2.5 sm:gap-3.5 transition-all cursor-pointer ${
                        isActive 
                          ? "bg-white/[0.03] border-l-2 border-white text-white font-medium" 
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.01]"
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-500"}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {!isLoggedIn && item.id !== "home" && (
                        <Lock className="w-3.5 h-3.5 text-zinc-600 mr-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Auth button toggle */}
              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                {isLoggedIn ? (
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-full bg-transparent text-zinc-400 text-sm border border-white/[0.04]"
                  >
                    Disconnect Profile
                  </button>
                ) : (
                  <button
                    onClick={() => { onLoginClick(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-full bg-zinc-100 text-[#09090B] text-sm font-semibold"
                  >
                    Sync Credentials
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
