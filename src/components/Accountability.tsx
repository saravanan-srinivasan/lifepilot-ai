import React, { useState } from "react";
import { 
  UserCheck, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  ChevronRight, 
  Zap,
  Flame,
  User,
  Activity,
  ArrowRight,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AccountabilityProps {
  coachPersona: string;
}

export default function Accountability({ coachPersona }: AccountabilityProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<number>(75);
  const [focusLevel, setFocusLevel] = useState<number>(80);
  const [todayMood, setTodayMood] = useState<string>("balanced");
  const [notes, setNotes] = useState<string>("");
  const [coachResponse, setCoachResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [interventionAlert, setInterventionAlert] = useState<boolean>(false);

  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    const token = localStorage.getItem("lifepilot_token");
    try {
      const res = await fetch("/api/accountability", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        
        // If checked in today already, restore state
        const todayStr = new Date().toDateString();
        const hasTodayLog = (data.logs || []).some((log: any) => new Date(log.timestamp).toDateString() === todayStr);
        if (hasTodayLog) {
          const todayLog = (data.logs || []).find((log: any) => new Date(log.timestamp).toDateString() === todayStr);
          setCoachResponse(todayLog.coachFeedback);
          setIsCheckedIn(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch past check-in logs:", e);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  // Custom texts based on selected option
  const getCoachSpeech = () => {
    switch (coachPersona) {
      case "spartan":
        return {
          header: "HABIT COMMANDER",
          prompt: "Check your top priorities right now. No excuses. Let's find what is distracting you and fix it today.",
          alert: "FOCUS ALERT: Turn off your phone and block social media right now."
        };
      case "socrates":
        return {
          header: "THOUGHT GUIDE",
          prompt: "Are your small daily actions helping you reach your big goals? Let's see if we are working with focus or just wasting time.",
          alert: "COACH FACTOR: Are you avoiding this task because it is actually hard, or are you just nervous to start?"
        };
      case "zen":
      default:
        return {
          header: "SIMPLE ADVISOR",
          prompt: "Welcome. Take a deep breath and log your progress. We will help you plan your day simply.",
          alert: "RECOVERY ALERT: Your stress levels seem high today. Take a 5-minute quiet breathing break."
        };
    }
  };

  const coach = getCoachSpeech();

  const handleCheckInSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("lifepilot_token");
    try {
      const res = await fetch("/api/accountability/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sleepRating: energyLevel,
          routineAlignment: focusLevel,
          monomodeCompletion: todayMood === "balanced" ? 90 : todayMood === "distracted" ? 40 : 20,
          notes: notes
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.logs && data.logs.length > 0) {
          setCoachResponse(data.logs[0].coachFeedback);
          setLogs(data.logs);
        }
      }
    } catch (e) {
      console.error("Failed to commit accountability metric logs to server:", e);
    } finally {
      setLoading(false);
      setIsCheckedIn(true);
      if (energyLevel < 50 || focusLevel < 55) {
        setInterventionAlert(true);
      } else {
        setInterventionAlert(false);
      }
    }
  };

  const getPastSevenDays = () => {
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toDateString();
      
      const hasLog = logs.some(log => new Date(log.timestamp).toDateString() === dateString);
      const isToday = i === 0;
      
      let status: "completed" | "active" | "pending" = "pending";
      if (hasLog) {
        status = "completed";
      } else if (isToday) {
        status = "active";
      }

      days.push({
        day: dayNames[d.getDay()],
        status
      });
    }
    return days;
  };

  const checkinDays = getPastSevenDays();

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 text-zinc-100 relative z-10 font-sans w-full">
      
      {/* Symmetrical subtle top edge lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(circle_at_top,_rgba(25,25,35,0.08)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.03] pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono tracking-[0.2em] text-zinc-500 uppercase">
            <UserCheck className="w-3.5 h-3.5" />
            <span>DAILY HABIT CHECK-IN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white mt-1.5">AI Habit Coach</h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-md font-light leading-relaxed">
            Submit your daily stats. Our AI habit coach will analyze your energy and mood to help you structure your day simply.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="bg-[#0C0C10] border border-white/[0.04] px-4 py-2.5 rounded flex items-center gap-3 shrink-0 self-start">
          <Activity className="w-3.5 h-3.5 text-zinc-400" />
          <div>
            <span className="text-sm font-mono text-zinc-500 block uppercase leading-none">COACH SYSTEM</span>
            <span className="text-sm font-bold text-white font-mono mt-1 block font-light">ACTIVE & READY</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Mentor Panel */}
        <div className="spotlight-card p-6 rounded-2xl flex flex-col justify-between items-center text-center space-y-6 relative overflow-hidden min-h-[350px] shadow-2xl grain">
          <div className="space-y-4 w-full">
            <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest block">{coach.header}</span>
            <div className="w-12 h-12 rounded-full bg-white/[0.01] border border-white/[0.04] flex items-center justify-center mx-auto">
              <User className="w-4.5 h-4.5 text-zinc-400" />
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed italic max-w-xs font-light">
            "{coach.prompt}"
          </p>

          <div className="pt-3 border-t border-white/[0.02] w-full">
            <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest">MY AI COACH</div>
            <div className="text-sm font-semibold text-white mt-1 uppercase font-light tracking-wide">
              {coachPersona === "spartan" ? "Commander Bright" : coachPersona === "socrates" ? "Sage Socrates" : "Ora the Advisor"}
            </div>
          </div>
        </div>

        {/* Check-In form and progress elements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Calendar weekly block indicators */}
          <div className="spotlight-card p-4 rounded-2xl flex justify-between items-center shadow-md grain">
            <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest">WEEKLY PROGRESS</span>
            <div className="flex gap-2">
              {checkinDays.map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-1">
                  <span className="text-sm font-mono text-zinc-500">{day.day}</span>
                  <div className={`w-6 h-6 rounded flex items-center justify-center border font-mono text-sm font-bold transition-all duration-300 ${
                    day.status === 'completed' 
                      ? "bg-accent/15 border-accent/25 text-accent shadow-[0_4px_15px_rgba(91,110,245,0.1)]"
                      : day.status === 'active'
                      ? "bg-white/[0.01] border-white/20 text-white"
                      : "bg-[#09090C] border-none text-zinc-650"
                  }`}>
                    {day.status === 'completed' ? "✓" : "•"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isCheckedIn ? (
              <motion.div
                key="check-in-form"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="spotlight-card p-6 rounded-2xl space-y-6 shadow-2xl grain"
              >
                <div>
                  <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest font-bold">DAILY HABIT LOG</span>
                  <h3 className="text-sm font-semibold text-white mt-1">Log Energy & Mood</h3>
                  <p className="text-sm text-zinc-400 mt-1 font-light">Log how you feel physically and mentally today.</p>
                </div>

                <div className="space-y-2">
                  {/* Energy slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400 font-light">Energy Level Today</span>
                      <span className="text-zinc-300 font-mono font-semibold">{energyLevel}%</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/[0.05] rounded appearance-none cursor-pointer accent-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
                    />
                  </div>

                  {/* Focus slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-light">
                      <span className="text-zinc-400">Concentration Level Today</span>
                      <span className="text-zinc-300 font-mono font-semibold">{focusLevel}%</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      value={focusLevel}
                      onChange={(e) => setFocusLevel(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/[0.05] rounded appearance-none cursor-pointer accent-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
                    />
                  </div>

                  {/* Mood choosing */}
                  <div className="space-y-2">
                    <span className="text-sm text-zinc-400 block font-light">Mood Status</span>
                    <div className="grid grid-cols-3 gap-2">
                      {["balanced", "distracted", "fatigued"].map((m) => {
                        const isSelect = todayMood === m;
                        return (
                          <button
                            id={`btn-mood-select-${m}`}
                            key={m}
                            type="button"
                            onClick={() => setTodayMood(m)}
                            className={`py-2 rounded-xl text-sm font-semibold capitalize transition-all border cursor-pointer ${
                              isSelect 
                                ? "bg-accent/10 border-accent/30 text-accent shadow-[0_0_15px_rgba(91,110,245,0.15)]" 
                                : "bg-transparent border-white/[0.02] text-zinc-500 hover:text-white"
                            }`}
                          >
                            {m === "balanced" ? "Good" : m === "distracted" ? "Distracted" : "Tired"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Notes Textbox */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-sm font-mono text-zinc-500 uppercase tracking-widest block font-bold">MY DAILY REFLECTIONS (NOTES)</label>
                    <textarea 
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Write about any distractions, struggles, or small wins today..."
                      className="w-full p-3 bg-[#050507] border border-white/[0.04] rounded-xl text-sm text-white focus:outline-none focus:border-accent/40 transition-all font-light resize-none"
                    />
                  </div>
                </div>

                <button
                  id="btn-accountability-submit"
                  onClick={handleCheckInSubmit}
                  disabled={loading}
                  className="btn-accent w-full py-3 mt-2 shadow disabled:opacity-50"
                >
                  <span>{loading ? "Sending to Coach..." : "Submit Check-in"}</span>
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="check-in-success-insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Success report box */}
                <div className="spotlight-card p-6 rounded-2xl text-center space-y-3 relative overflow-hidden shadow-2xl grain">
                  <div className="w-10 h-10 rounded-full bg-white/[0.01] border border-white/[0.08] flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Parameters Saved</h3>
                  <p className="text-sm text-zinc-300 max-w-lg mx-auto font-light leading-relaxed italic bg-white/[0.01] p-4 rounded border border-white/[0.03] text-left">
                    "{coachResponse || "Your daily progress and energy details have been successfully shared with your AI Coach."}"
                  </p>
                </div>

                {/* Adaptive warning message if too low */}
                {interventionAlert && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-lg bg-red-950/[0.08] border border-red-900/10 text-left space-y-2 relative"
                  >
                    <div className="flex items-center gap-2 text-sm font-mono text-red-400 font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>COACH SUGGESTION</span>
                    </div>
                    <p className="text-sm text-red-200 leading-relaxed italic font-light">
                      "{coach.alert}"
                    </p>
                    <div className="pt-2 flex gap-3 text-sm font-mono text-zinc-500 uppercase font-light">
                      <span>FOCUS TIP TRIGGERED</span>
                    </div>
                  </motion.div>
                )}

                <button
                  id="btn-accountability-restart"
                  onClick={() => setIsCheckedIn(false)}
                  className="w-full py-2 bg-transparent border border-white/[0.02] hover:bg-white/[0.01] rounded text-sm font-mono font-semibold tracking-wide cursor-pointer text-center text-zinc-400 block hover:text-white"
                >
                  UPDATE DAILY STATS
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
