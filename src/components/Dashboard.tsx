import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Flame, 
  TrendingUp, 
  Cpu, 
  Battery, 
  ChevronRight,
  ArrowRight,
  Check,
  Target,
  Sparkles,
  Layers,
  Compass,
  ArrowUpRight
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  onTalkToAI: (initialPrompt?: string) => void;
  navigateToPage: (page: string) => void;
  xpPoints: number;
  onRefreshSession?: () => void;
}

export default function Dashboard({ onTalkToAI, navigateToPage, xpPoints, onRefreshSession }: DashboardProps) {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [scores, setScores] = useState({
    life: 84,
    focus: 92,
    discipline: 78,
    energy: 65,
    finance: 74
  });

  const fetchData = async () => {
    const token = localStorage.getItem("lifepilot_token");
    try {
      const res = await fetch("/api/habits", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions || []);
        if (data.scores) {
          setScores(data.scores);
        }
      }
    } catch (err) {
      console.error("Failed to query habit telemetry state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleMission = async (id: string, idx: number) => {
    // Optimistic UI updates
    const updated = [...missions];
    updated[idx].completed = !updated[idx].completed;
    setMissions(updated);

    const token = localStorage.getItem("lifepilot_token");
    try {
      const res = await fetch("/api/habits/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions);
        setScores(data.scores);
        if (onRefreshSession) {
          onRefreshSession();
        }
      }
    } catch (err) {
      console.error("Failed to sync checklist toggle:", err);
    }
  };

  const insights = [
    {
      id: "i1",
      topic: "Peak Focus Hours",
      desc: "Your concentration is highest between 9:00 AM and 11:30 AM. Do your most important tasks then.",
      action: "Set morning focus routine",
      prompt: "I want to block out distractions and design my morning focus sequence"
    },
    {
      id: "i2",
      topic: "Weekly Energy Level",
      desc: "Energy drops slightly on Wednesdays. Take a 10-minute quiet breathing break to recharge.",
      action: "Start a simple breathing break",
      prompt: "Detail a NSDR script to recover mental energy"
    },
    {
      id: "i3",
      topic: "Better Sleep Habits",
      desc: "Sleeping on time increases daily focus by up to 14%. Keep your bedtime consistent.",
      action: "Review evening rest habits",
      prompt: "Optimize my evening wind-down routine for better mental clarity"
    }
  ];

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 text-zinc-100 relative z-10 font-sans w-full">
      
      {/* Absolute clean backdrop alignment */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] sm:h-[400px] md:h-[450px] bg-[radial-gradient(circle_at_top,_rgba(25,25,35,0.15)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      {/* Title Header with Refined Layout */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8 border-b border-white/[0.03] pb-8 md:pb-10">
        <div>
          <span className="text-sm font-mono text-zinc-500 tracking-[0.2em] uppercase">Dashboard Overview</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white mt-2 md:mt-3">
            My Dashboard
          </h1>
        </div>

        {/* Muted Premium Level Identifier */}
        <div className="flex items-center gap-4 md:gap-6 bg-[#141419]/40 border border-white/[0.04] p-4 md:p-5 rounded-lg relative overflow-hidden backdrop-blur">
          <div className="absolute top-0 left-0 w-[1px] h-full bg-zinc-400" />
          <div>
            <div className="text-sm font-mono text-zinc-500 uppercase tracking-wider">Practice Level</div>
            <div className="text-sm md:text-base font-semibold text-zinc-200 mt-1 md:mt-1.5">Level 4 User</div>
          </div>
          <div className="bg-white/[0.02] px-4 md:px-5 py-2 md:py-2.5 rounded text-sm md:text-base font-mono font-bold text-zinc-300 border border-white/[0.04]">
            {xpPoints} XP
          </div>
        </div>
      </div>

      {/* bento grid: Scores & Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* SVG Centered Progress Dial */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          whileHover={{ y: -4, scale: 1.006 }}
          className="spotlight-card rounded-2xl p-7 md:p-8 flex flex-col justify-between min-h-[380px] relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.85)] grain"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-sm font-mono text-zinc-500 tracking-[0.2em] uppercase">Habit Score</span>
              <h2 className="text-base md:text-lg lg:text-xl font-semibold text-white mt-2 md:mt-3 tracking-tight font-sans">Daily Consistency Rating</h2>
            </div>
            <Activity className="w-4 h-4 text-accent animate-pulse" />
          </div>
 
          {/* Symmetrical High-Contrast Calibration Wheel */}
          <div className="my-8 md:my-10 flex items-center justify-center relative">
            <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90" viewBox="0 0 128 128">
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                className="stroke-white/[0.03]" 
                strokeWidth="4" 
                fill="transparent" 
              />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                className="stroke-accent transition-all duration-[800ms] ease-out" 
                strokeWidth="4.5" 
                fill="transparent" 
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (351.8 * scores.life) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-5xl md:text-6xl font-light tracking-tighter text-white font-mono"
              >
                {scores.life}
              </motion.span>
              <span className="text-sm font-mono text-zinc-500 tracking-[0.2em] uppercase mt-2 md:mt-3">Score</span>
            </div>
          </div>
 
           <div className="space-y-3 md:space-y-4 mt-4">
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-zinc-500 font-light">Consistency curve</span>
              <span className="text-accent font-mono text-xs md:text-sm tracking-wider font-semibold">+4.2% stability growth</span>
            </div>
            <div className="w-full bg-white/[0.01] h-2 md:h-2.5 rounded-full overflow-hidden">
              <div className="bg-accent h-full w-[82%] rounded-full opacity-80" />
            </div>
          </div>
        </motion.div>
 
        {/* Indicators parameters lists */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.006 }}
          className="spotlight-card rounded-2xl p-7 md:p-8 flex flex-col justify-between lg:col-span-2 space-y-8 shadow-[0_30px_70px_rgba(0,0,0,0.85)] grain"
        >
          <div className="flex justify-between items-start border-b border-white/[0.03] pb-4 md:pb-6">
            <div>
              <span className="text-sm font-mono text-zinc-500 tracking-[0.2em] uppercase">My Scores</span>
              <h2 className="text-base md:text-lg lg:text-xl font-semibold text-white mt-2 md:mt-3 tracking-tight font-sans">Daily Ratings</h2>
            </div>
            <span className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] font-medium">Metrics</span>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            
            {/* Focus rating */}
            <div className="p-5 md:p-6 rounded-xl bg-[#0c0c12]/40 border border-white/[0.03] hover:border-accent/20 hover:bg-white/[0.015] transition-all duration-300">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-zinc-400 font-light flex items-center gap-2">
                  <Cpu className="w-4 h-4 md:w-5 md:h-5 text-accent" /> Focus Level
                </span>
                <span className="text-accent font-mono font-semibold">{scores.focus}%</span>
              </div>
              <div className="w-full bg-white/[0.01] h-2 rounded-full mt-3 md:mt-4 overflow-hidden">
                <div className="bg-accent h-full rounded-full opacity-80" style={{ width: `${scores.focus}%` }} />
              </div>
              <p className="text-xs text-zinc-500 mt-3 md:mt-4 font-mono uppercase tracking-widest font-medium">Focus Session: 2 Hours</p>
            </div>
 
            {/* Completion metrics */}
            <div className="p-5 md:p-6 rounded-xl bg-[#0c0c12]/40 border border-white/[0.03] hover:border-accent/20 hover:bg-white/[0.015] transition-all duration-300">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-zinc-400 font-light flex items-center gap-2">
                  <Flame className="w-4 h-4 md:w-5 md:h-5 text-accent" /> My Consistency
                </span>
                <span className="text-accent font-mono font-semibold">{scores.discipline}%</span>
              </div>
              <div className="w-full bg-white/[0.01] h-2 rounded-full mt-3 md:mt-4 overflow-hidden">
                <div className="bg-accent h-full rounded-full opacity-80" style={{ width: `${scores.discipline}%` }} />
              </div>
              <p className="text-xs text-zinc-500 mt-3 md:mt-4 font-mono uppercase tracking-widest font-medium">Active Habits: 2</p>
            </div>
 
            {/* Cognitive battery */}
            <div className="p-5 md:p-6 rounded-xl bg-[#0c0c12]/40 border border-white/[0.03] hover:border-accent/20 hover:bg-white/[0.015] transition-all duration-300">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-zinc-400 font-light flex items-center gap-2">
                  <Battery className="w-4 h-4 md:w-5 md:h-5 text-accent" /> Energy & Rest
                </span>
                <span className="text-accent font-mono font-semibold">{scores.energy}%</span>
              </div>
              <div className="w-full bg-white/[0.01] h-2 rounded-full mt-3 md:mt-4 overflow-hidden">
                <div className="bg-accent h-full rounded-full opacity-80" style={{ width: `${scores.energy}%` }} />
              </div>
              <p className="text-xs text-zinc-500 mt-3 md:mt-4 font-mono uppercase tracking-widest font-medium">Take a break in 4 hours</p>
            </div>
 
            {/* Financial metrics */}
            <div className="p-5 md:p-6 rounded-xl bg-[#0c0c12]/40 border border-white/[0.03] hover:border-accent/20 hover:bg-white/[0.015] transition-all duration-300">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-zinc-400 font-light flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-accent" /> Money Savings
                </span>
                <span className="text-accent font-mono font-semibold">{scores.finance}%</span>
              </div>
              <div className="w-full bg-white/[0.01] h-2 rounded-full mt-3 md:mt-4 overflow-hidden">
                <div className="bg-accent h-full rounded-full opacity-80" style={{ width: `${scores.finance}%` }} />
              </div>
              <p className="text-xs text-zinc-500 mt-3 md:mt-4 font-mono uppercase tracking-widest font-medium">Savings: 9 months of emergency funds</p>
            </div>
 
          </div>
 
          <div className="pt-6 md:pt-8 border-t border-white/[0.03] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 md:gap-6">
            <span className="text-sm text-zinc-500 font-light">Estimate future savings based on daily choices</span>
            <button
              id="dash-simulate-btn"
              onClick={() => navigateToPage("future-self")}
              className="text-sm md:text-base font-mono font-semibold text-zinc-400 hover:text-white flex items-center gap-2 cursor-pointer group"
            >
              <span>PLAN MY FUTURE</span>
              <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
 
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Daily Tasks Module */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.2 }}
          whileHover={{ y: -3, scale: 1.004 }}
          className="spotlight-card rounded-2xl p-6 sm:p-7 lg:col-span-2 space-y-5 shadow-[0_30px_70px_rgba(0,0,0,0.85)] grain"
        >
          <div className="flex items-center justify-between border-b border-white/[0.03] pb-3.5">
            <div>
              <span className="text-sm font-mono text-zinc-500 tracking-[0.2em] uppercase">Today's Focus List</span>
              <h2 className="text-sm font-semibold text-white mt-1.5 tracking-tight font-sans">Daily Tasks</h2>
            </div>
            <div className="text-sm text-zinc-400 font-mono bg-white/[0.02] px-3.5 py-1.5 rounded-full border border-white/[0.06]">
              {missions.filter(m => m.completed).length} / {missions.length} COMPLETED
            </div>
          </div>

          <div className="space-y-2.5">
            {missions.map((mission, idx) => (
              <motion.div 
                key={mission.id}
                onClick={() => toggleMission(mission.id, idx)}
                whileHover={{ scale: 1.006, x: 2, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.015)" }}
                whileTap={{ scale: 0.995 }}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer relative ${
                  mission.completed 
                    ? "bg-white/[0.005] border-white/[0.02] text-zinc-500" 
                    : "bg-[#0A0A0E]/50 border-white/[0.04] text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                    mission.completed 
                      ? "bg-white/[0.05] border-white/20" 
                      : "border-zinc-800"
                  }`}>
                    {mission.completed && <Check className="w-2.5 h-2.5 text-zinc-400" />}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3.5">
                    <span className={`text-sm sm:text-base font-light tracking-wide ${mission.completed ? 'line-through opacity-45' : ''}`}>
                      {mission.text}
                    </span>
                    <span className="text-xs font-mono text-accent bg-accent/5 border border-accent/15 px-2.5 py-1 rounded-full w-max mt-1 sm:mt-0 font-medium">
                      {mission.category}
                    </span>
                  </div>
                </div>

                <div className="text-sm font-mono text-zinc-400 font-medium shrink-0">
                  +{mission.val} XP
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center text-sm">
            <span className="text-zinc-500 font-light">Updates daily at midnight.</span>
            <button
              id="dash-nav-journeys"
              onClick={() => navigateToPage("journeys")}
              className="font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer group text-sm sm:text-base"
            >
              <span>VIEW MY HABITS</span>
              <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Tactical Guidance Stream */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.3 }}
          whileHover={{ y: -3, scale: 1.004 }}
          className="spotlight-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-[0_30px_70px_rgba(0,0,0,0.85)] grain"
        >
          <div>
            <span className="text-sm font-mono text-zinc-500 tracking-[0.2em] uppercase">Daily Coach Tips</span>
            <h2 className="text-sm font-semibold text-white mt-1.5 tracking-tight font-sans">AI Suggestions</h2>
            <p className="text-sm text-zinc-500 mt-1.5 font-light leading-relaxed">Select a card below to ask your AI coach for custom tips.</p>
          </div>

          <div className="space-y-4 my-2 flex-1">
            {insights.map((insight) => (
              <motion.div 
                key={insight.id} 
                whileHover={{ x: 2, borderColor: "rgba(255,255,255,0.06)" }}
                className="p-4 rounded-xl bg-[#09090D]/60 border border-white/[0.03] hover:bg-white/[0.005] transition-all"
              >
                <div className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>{insight.topic}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed font-light">
                  {insight.desc}
                </p>
                <button
                  id={`btn-insight-talk-${insight.id}`}
                  onClick={() => onTalkToAI(insight.prompt)}
                  className="mt-2.5 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer group"
                >
                  <span>{insight.action.toUpperCase()}</span>
                  <ChevronRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>

          <button
            id="dash-talk-core-btn"
            onClick={() => onTalkToAI("")}
            className="btn-accent w-full py-3 rounded-full font-semibold text-sm sm:text-base cursor-pointer"
          >
            Talk to my AI Coach
          </button>
        </motion.div>

      </div>

    </div>
  );
}
