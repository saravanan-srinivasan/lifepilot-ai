import React, { useState } from "react";
import { 
  TrendingUp, 
  Activity, 
  Zap, 
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FutureSimulator() {
  const [discipline, setDiscipline] = useState<number>(65);
  const [focus, setFocus] = useState<number>(70);
  const [vitality, setVitality] = useState<number>(60);

  // Dynamic values based on slider metrics
  const multiplier = (discipline * 0.45) + (focus * 0.35) + (vitality * 0.2);
  const projectedAssets = Math.floor(45000 + (multiplier * multiplier * 210));
  const biologicalAgeIndex = Math.max(22, Math.floor(38 - (vitality * 0.16) - (discipline * 0.05)));
  const satisfactionTier = multiplier >= 85 ? "Optimal Balance" : multiplier >= 65 ? "Stable Compounding" : multiplier >= 45 ? "Active Friction Gaps" : "Underperforming Baseline";
  const trajectoryColor = multiplier >= 85 ? "text-accent font-bold" : multiplier >= 65 ? "text-[#7B8FF7] font-semibold" : multiplier >= 45 ? "text-zinc-400 font-light" : "text-zinc-500 font-light";

  // Dynamic SVG path calculations
  const p1y = 220 - (discipline * 1.0);
  const p2y = 170 - (focus * 1.2);
  const p3y = 110 - (multiplier * 1.0);
  const pathD = `M 20 230 Q 100 ${p1y}, 210 ${p2y} T 360 ${p3y}`;
  const fillD = `M 20 230 Q 100 ${p1y}, 210 ${p2y} T 360 ${p3y} L 360 260 L 20 260 Z`;

  const resetPreset = (d: number, f: number, v: number) => {
    setDiscipline(d);
    setFocus(f);
    setVitality(v);
  };

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 text-zinc-100 relative z-10 font-sans w-full">
      
      {/* Absolute backdrop glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(circle_at_top,_rgba(25,25,35,0.08)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.03] pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono tracking-[0.2em] text-zinc-500 uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
            <span>BEHAVIORAL PROJECTIONS SIMULATOR</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white mt-1.5">Future Planner</h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl font-light leading-relaxed">
            Configure your daily habit levels. We will simulate and calculate your estimated savings and brain age over a 10-year period.
          </p>
        </div>

        {/* Presets Selector rail */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.015] border border-white/[0.04] rounded-full">
          {[
            { label: "✦ High Focus", d: 88, f: 92, v: 85 },
            { label: "✦ Healthy Routine", d: 70, f: 70, v: 75 },
            { label: "✦ Low Motivation", d: 30, f: 25, v: 40 }
          ].map((preset, idx) => (
            <button 
              key={idx}
              onClick={() => resetPreset(preset.d, preset.f, preset.v)}
              className="px-3.5 py-1.5 text-sm font-mono tracking-wider uppercase text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-full transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Sliders Modifiers Deck */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.004 }}
          className="spotlight-card rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
        >
          <div>
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] border-b border-white/[0.03] pb-2.5">HABIT LEVELS</h3>
            <p className="text-sm text-zinc-400 mt-2.5 font-light leading-relaxed">Adjust the sliders below to see your future predictions.</p>
          </div>

          <div className="space-y-6">
            {/* Discipline Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-zinc-300 font-light flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-zinc-400" /> Habit Consistency
                </span>
                <span className="text-zinc-200 font-bold">{discipline}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100"
                value={discipline}
                onChange={(e) => setDiscipline(parseInt(e.target.value))}
                className="w-full h-1 bg-white/[0.05] rounded appearance-none cursor-pointer accent-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
              <span className="text-xs text-zinc-500 block leading-none font-mono uppercase tracking-[0.1em]">How consistently you complete your habits every day.</span>
            </div>

            {/* Focus Capacity Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-zinc-300 font-light flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-zinc-400" /> Daily Focus Time
                </span>
                <span className="text-zinc-200 font-bold">{focus}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100"
                value={focus}
                onChange={(e) => setFocus(parseInt(e.target.value))}
                className="w-full h-1 bg-white/[0.05] rounded appearance-none cursor-pointer accent-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
              <span className="text-xs text-zinc-500 block leading-none font-mono uppercase tracking-[0.1em]">How much time you spend on deep focus work.</span>
            </div>

            {/* Health Vitality Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-zinc-300 font-light flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-zinc-400" /> Sleep Schedule Quality
                </span>
                <span className="text-zinc-200 font-bold">{vitality}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100"
                value={vitality}
                onChange={(e) => setVitality(parseInt(e.target.value))}
                className="w-full h-1 bg-white/[0.05] rounded appearance-none cursor-pointer accent-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
              <span className="text-xs text-zinc-500 block leading-none font-mono uppercase tracking-[0.1em]">How consistent and high-quality your daily sleep is.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.03] text-sm text-zinc-500 leading-normal font-mono uppercase tracking-widest text-center">
            SIMULATION MODEL
          </div>
        </motion.div>

        {/* Outcome panels */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            whileHover={{ y: -3, scale: 1.004 }}
            className="spotlight-card rounded-2xl p-6 sm:p-7 relative overflow-hidden grid grid-cols-1 md:grid-cols-[1.35fr_0.75fr_0.9fr] gap-6 transition-all duration-300 shadow-[0_30px_70px_rgba(0,0,0,0.85)] grain"
          >
            {/* Net capital prediction */}
            <div className="space-y-1 md:col-span-1 flex flex-col justify-center">
              <span className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] block font-medium">Estimated 10-Year Savings</span>
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={projectedAssets}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent font-mono mt-1 tracking-tight drop-shadow-[0_0_8px_rgba(91,110,245,0.2)] animate-pulse-subtle"
                >
                  ₹{(projectedAssets * 83).toLocaleString("en-IN")}
                </motion.div>
              </AnimatePresence>
              <p className="text-xs text-zinc-500 font-light leading-relaxed mt-1">Estimated savings balance compounded in Rupees over 10 years.</p>
            </div>

            {/* Cognitive Age */}
            <div className="space-y-1 md:col-span-1 flex flex-col justify-center">
              <span className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] block font-medium">Brain Sharpness Age</span>
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={biologicalAgeIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-baseline gap-1.5 mt-1 drop-shadow-[0_0_8px_rgba(91,110,245,0.2)]"
                >
                  <span className="text-2xl sm:text-3xl font-bold text-accent font-mono">{biologicalAgeIndex}</span>
                  <span className="text-xs text-zinc-500 font-mono font-semibold uppercase tracking-widest">Y/O</span>
                </motion.div>
              </AnimatePresence>
              <p className="text-xs text-zinc-500 font-light leading-relaxed mt-1">Estimated sharpness of your brain compared to average age.</p>
            </div>

            {/* Trajectory */}
            <div className="space-y-1 md:col-span-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/[0.03] md:pl-6">
              <span className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] block font-bold">Habit Progress Status</span>
              <div className={`text-sm font-semibold mt-1.5 leading-tight ${trajectoryColor} transition-colors duration-200`}>
                {satisfactionTier.toUpperCase()}
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed mt-1">General assessment of your future quality of life.</p>
            </div>
          </motion.div>

          {/* SVG trajectory graph card */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.004 }}
            className="spotlight-card rounded-2xl p-6 sm:p-7 space-y-4 relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
          >
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
              <span className="text-sm font-mono text-zinc-500 tracking-[0.2em] uppercase">COGNITIVE GROWTH PREDICTION</span>
              <span className="text-sm font-mono text-zinc-350 uppercase tracking-[0.1em] font-medium">10-YEAR PREDICTION MODEL</span>
            </div>

            <div className="relative h-[245px] w-full bg-[#09090C] rounded-xl border border-white/[0.02] flex items-end p-4">
              <svg className="absolute inset-0 w-full h-[210px] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 380 250">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(91, 110, 245, 0.2)" />
                    <stop offset="100%" stopColor="rgba(91, 110, 245, 0.0)" />
                  </linearGradient>
                </defs>
                <motion.path 
                  d={fillD} 
                  fill="url(#chartGradient)"
                  className="transition-all duration-500 ease-out"
                />
                <motion.path 
                  d={pathD} 
                  fill="none" 
                  stroke="var(--color-accent)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  className="transition-all duration-500 ease-out"
                />
                <circle cx="20" cy="230" r="3.5" fill="#5B6EF5" stroke="#ffffff" strokeWidth="1.5" />
                <motion.circle cx="210" cy={p2y} r="4.5" fill="#5B6EF5" stroke="#ffffff" strokeWidth="1.5" className="transition-all duration-500" />
                <motion.circle cx="360" cy={p3y} r="5.5" fill="#5B6EF5" stroke="#ffffff" strokeWidth="1.5" className="transition-all duration-500" />
              </svg>

              <div className="flex justify-between w-full text-xs font-mono text-zinc-500 relative z-10 select-none uppercase tracking-wider">
                <span>YEAR 0 (NOW)</span>
                <span>YEAR 3</span>
                <span>YEAR 7</span>
                <span>YEAR 10 (PROJECTION)</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

    </div>
  );
}
