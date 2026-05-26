import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Map, 
  Sparkles, 
  Lock, 
  Check,
  Zap,
  Trophy,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";

interface JourneyItem {
  id: string;
  title: string;
  desc: string;
  xp: number;
  streak: number;
  level: number;
  unlocked: boolean;
  missions: { id: string; text: string; xp: number; completed: boolean }[];
  completed?: boolean;
}

interface JourneysProps {
  onAddXP: (points: number) => void;
}

export default function Journeys({ onAddXP }: JourneysProps) {
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>("escape-procrastination");
  const [loading, setLoading] = useState(true);
  
  const [journeys, setJourneys] = useState<JourneyItem[]>([
    {
      id: "escape-procrastination",
      title: "Clarity Alignment",
      desc: "Stop procrastination and set up a quiet, distraction-free environment to start your work.",
      xp: 1500,
      streak: 12,
      level: 3,
      unlocked: true,
      missions: [
        { id: "ep1", text: "Start with a simple 5-minute task", xp: 300, completed: true },
        { id: "ep2", text: "Turn off phone notifications and block distracting apps", xp: 400, completed: false },
        { id: "ep3", text: "Plan your next day's top 3 tasks the night before", xp: 500, completed: false }
      ]
    },
    {
      id: "productivity-reset",
      title: "Cognitive Reboot",
      desc: "Improve focus stamina by shifting from multitasking to single deep-focus blocks.",
      xp: 2200,
      streak: 8,
      level: 4,
      unlocked: true,
      missions: [
        { id: "pr1", text: "Do a single 90-minute deep focus work session", xp: 450, completed: false },
        { id: "pr2", text: "Take a 10-minute quiet walk without looking at your phone", xp: 350, completed: false },
        { id: "pr3", text: "Clear clutter by closing all browser tabs except the active one", xp: 300, completed: false }
      ]
    },
    {
      id: "rebuild-my-life",
      title: "System Restoration",
      desc: "Build a healthy lifestyle by fixing your sleep routine, spending habits, and exercise habits.",
      xp: 4500,
      streak: 5,
      level: 5,
      unlocked: true,
      missions: [
        { id: "rl1", text: "Sleep by 11:00 PM to establish a healthy sleep routine", xp: 600, completed: false },
        { id: "rl2", text: "Track and categorize all your weekly expenses", xp: 500, completed: false },
        { id: "rl3", text: "Do 30 minutes of light exercise or jogging", xp: 450, completed: false }
      ]
    },
    {
      id: "become-disciplined",
      title: "Sustained Discipline",
      desc: "Amplify starting motivation and build strong daily habits under pressure.",
      xp: 3000,
      streak: 15,
      level: 6,
      unlocked: false,
      missions: [
        { id: "bd1", text: "Drink a glass of water right after waking up and review your daily goals", xp: 500, completed: false },
        { id: "bd2", text: "Take a quick 1-minute cold water wash or shower to energize yourself", xp: 600, completed: false }
      ]
    }
  ]);

  const fetchJourneys = async () => {
    const token = localStorage.getItem("lifepilot_token");
    try {
      const res = await fetch("/api/journeys", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setJourneys(data);
        }
      }
    } catch (err) {
      console.error("Failed to query journey protocols:", err);
    } finally {
      setLoading(false);
    }
  };

  const [streakCount, setStreakCount] = useState<number>(0);

  useEffect(() => {
    fetchJourneys();
    
    const fetchStreak = async () => {
      const token = localStorage.getItem("lifepilot_token");
      try {
        const res = await fetch("/api/accountability", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const logs = data.logs || [];
          
          if (logs.length === 0) {
            setStreakCount(0);
            return;
          }
          
          let streak = 0;
          const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const datesSet = new Set(sortedLogs.map(log => new Date(log.timestamp).toDateString()));
          
          let cur = new Date();
          let checkedTodayOrYesterday = datesSet.has(cur.toDateString());
          
          if (!checkedTodayOrYesterday) {
            cur.setDate(cur.getDate() - 1);
            checkedTodayOrYesterday = datesSet.has(cur.toDateString());
          }
          
          if (checkedTodayOrYesterday) {
            while (datesSet.has(cur.toDateString())) {
              streak++;
              cur.setDate(cur.getDate() - 1);
            }
          }
          setStreakCount(streak);
        }
      } catch (err) {
        console.error("Failed to calculate streak:", err);
      }
    };
    fetchStreak();
  }, []);

  const selectedJourney = journeys.find(j => j.id === selectedJourneyId) || journeys[0];

  const handleCompleteMission = async (journeyIdx: number, missionIdx: number, completedAlready: boolean) => {
    if (completedAlready) return; 

    // Optimistic Update
    const updated = [...journeys];
    updated[journeyIdx].missions[missionIdx].completed = true;
    setJourneys(updated);

    const xpToReward = updated[journeyIdx].missions[missionIdx].xp;
    onAddXP(xpToReward);

    const token = localStorage.getItem("lifepilot_token");
    try {
      const res = await fetch("/api/journeys/toggle-mission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          journeyId: journeys[journeyIdx].id,
          missionId: journeys[journeyIdx].missions[missionIdx].id
        })
      });
      if (res.ok) {
        const data = await res.json();
        setJourneys(data.journeys);
      }
    } catch (err) {
      console.error("Failed to sync milestone completion:", err);
    }
  };

  const achievements = [
    { title: "Continuous Flow Streak", desc: "Maintained baseline focused parameters for 8 consecutive intervals", icon: Zap, unlocked: true },
    { title: "Gridlock Solution", desc: "Identified and resolved 3 active blocking factors", icon: Trophy, unlocked: true },
    { title: "Unshakable Willpower", desc: "Unlocking Level 6 cognitive limits", icon: Lock, unlocked: false }
  ];

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 text-zinc-100 relative z-10 font-sans w-full">
      
      {/* Symmetrical ambient layout highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(circle_at_top,_rgba(25,25,35,0.08)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.03] pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono tracking-[0.2em] text-zinc-500 uppercase">
            <Map className="w-3.5 h-3.5" />
            <span>HABIT JOURNEYS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white mt-1.5">
            Habit Journeys
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl font-light leading-relaxed">
            Commit to simple daily habit plans built to build focus, lower stress, and keep your life balanced.
          </p>
        </div>

        {/* Daily streak indicator */}
        <div className="bg-[#0C0C10] border border-white/[0.04] px-4 py-2.5 rounded  flex items-center gap-3 shrink-0 self-start">
          <Flame className="w-3.5 h-3.5 text-zinc-400" />
          <div>
            <span className="text-sm font-mono text-zinc-500 block uppercase leading-none">SYSTEM MOMENTUM</span>
            <span className="text-sm font-bold text-white font-mono mt-1 block">
              {streakCount} {streakCount === 1 ? 'DAY' : 'DAYS'} STREAK
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left selector rails */}
        <div className="space-y-4">
          <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest block px-1">ACTIVE SEQUENCES</span>
          
          <div className="space-y-2.5">
            {journeys.map((j, jIdx) => {
              const isSelected = selectedJourneyId === j.id;
              return (
                <button
                  id={`btn-journey-track-${j.id}`}
                  key={j.id}
                  onClick={() => setSelectedJourneyId(j.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? "bg-[#141419]/95 border-accent/20 shadow-[0_0_20px_rgba(91,110,245,0.06)]" 
                      : "bg-[#09090C]/80 border-white/[0.03] hover:bg-white/[0.005]"
                  }`}
                >
                  <div className="flex justify-between items-start w-full font-light">
                    <div>
                      <span className={`text-sm font-mono tracking-widest leading-none block uppercase ${isSelected ? 'text-accent' : 'text-zinc-500'}`}>LEVEL {j.level}</span>
                      <h4 className="text-sm sm:text-base font-semibold text-zinc-200 mt-1.5">{j.title}</h4>
                    </div>
                    {!j.unlocked && <Lock className="w-3 h-3 text-zinc-655" />}
                  </div>
                  
                  <p className="text-sm text-zinc-400 mt-2 font-light leading-relaxed line-clamp-2">
                    {j.desc}
                  </p>

                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.02] w-full text-sm font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {j.streak} days streak
                    </span>
                    <span className="text-zinc-300 font-semibold">
                      {j.missions.filter(m => m.completed).length} / {j.missions.length} completed
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed checklist workspace */}
        <div className="spotlight-card p-6 rounded-2xl lg:col-span-2 space-y-6 flex flex-col justify-between relative overflow-hidden shadow-2xl grain">
          <div className="space-y-5">
            <div className="flex justify-between items-start border-b border-white/[0.02] pb-3">
              <div>
                <span className="text-sm font-mono text-zinc-500 block">SELECTED SEQUENCE</span>
                <h3 className="text-sm sm:text-base font-semibold mt-1 text-white">{selectedJourney.title}</h3>
                <p className="text-sm text-zinc-400 max-w-lg mt-1 font-light leading-relaxed">{selectedJourney.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono text-zinc-500 block uppercase">STABILITY RATE</span>
                <div className="text-sm sm:text-base font-bold text-zinc-300 font-mono mt-1">
                  {(selectedJourney.missions.filter(m => m.completed).length / selectedJourney.missions.length * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Tasks list checklist */}
            <div className="space-y-3">
              <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest block font-bold">REQUIRED CONDITIONS</span>
              
              <div className="space-y-2">
                {selectedJourney.missions.map((m, mIdx) => (
                  <div 
                    key={m.id}
                    onClick={() => {
                      const journeyIdx = journeys.findIndex(j => j.id === selectedJourney.id);
                      handleCompleteMission(journeyIdx, mIdx, m.completed);
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer relative group ${
                      m.completed 
                        ? "bg-accent/[0.02] border-accent/15 text-zinc-400 font-semibold" 
                        : "bg-[#09090C] border-white/[0.03] hover:border-[#5B6EF5]/40 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        m.completed 
                          ? "bg-accent/20 border-accent/40 text-white" 
                          : "border-zinc-800"
                      }`}>
                        {m.completed && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={`text-sm ${m.completed ? 'line-through opacity-40' : 'font-light'}`}>
                        {m.text}
                      </span>
                    </div>

                    <div className="text-sm font-mono text-zinc-400 shrink-0">
                      {m.completed ? "QUALIFIED" : `+${m.xp} XP`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trophy log row */}
          <div className="pt-6 border-t border-white/[0.02] space-y-3">
            <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest block font-bold">HISTORIC REWARD METRICS</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {achievements.map((ach, idx) => {
                const IconComp = ach.icon;
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${
                    ach.unlocked 
                      ? "bg-white/[0.005] border-accent/10 text-zinc-350 shadow-[0_4px_20px_rgba(91,110,245,0.02)]" 
                      : "bg-[#09090C] border-white/[0.01] opacity-40"
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <IconComp className="w-3.5 h-3.5 text-zinc-400" />
                      <h4 className="text-sm font-semibold text-zinc-200">{ach.title}</h4>
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed font-light">{ach.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
