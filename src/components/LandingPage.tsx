import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Check,
  Compass,
  Layers,
  Wind,
  ArrowUpRight,
  Sparkles,
  Brain,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

interface LandingPageProps {
  onJoinClick: () => void;
  onExploreDashboard: () => void;
}



function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{count}{suffix}</div>;
}

export default function LandingPage({ onJoinClick, onExploreDashboard }: LandingPageProps) {
  const [selectedTopic, setSelectedTopic] = useState<"focus" | "routine" | "pivot">("focus");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);



  const topics = {
    focus: {
      tag: "DEEP FOCUS",
      title: "Starting Trouble",
      subtitle: "Feeling lazy or nervous to start a big task.",
      rootCause: "Overthinking the work and getting distracted by phones or apps.",
      protocol: [
        "Start a 30-minute deep focus timer with zero phone notifications.",
        "Lower your expectations to zero to bypass the starting fear.",
        "Listen to steady focus music or rain sounds to stay calm.",
      ],
      duration: "45 Minutes",
    },
    routine: {
      tag: "FIXING BROKEN HABITS",
      title: "Broken Habits",
      subtitle: "Losing habit momentum after missing a single day.",
      rootCause: "Trying to be perfect and giving up entirely when a break happens.",
      protocol: [
        "Link your habits directly to morning events (like right after drinking tea).",
        "Follow the 'never miss twice' rule to maintain consistency.",
        "Keep simple, visible daily reminders on your desk.",
      ],
      duration: "7 Days Tracker",
    },
    pivot: {
      tag: "GETTING STUCK",
      title: "Getting Stuck",
      subtitle: "Working hard every day but not seeing any real progress.",
      rootCause: "Repeating the same boring routine without learning anything new.",
      protocol: [
        "Learn a new small skill for just 15 minutes every single day.",
        "Take a deliberate 3-day quiet rest to recharge your mind.",
        "Shift boring administrative work to low-energy hours.",
      ],
      duration: "14 Days Drift",
    },
  };

  const featureCards = [
    {
      icon: Wind,
      tag: "SILENT FOCUS",
      title: "Smart Daily Balance",
      description: "Quietly helps you focus. The system learns your distraction times and gently guides you back to work.",
      gradient: "from-violet-500/10 to-transparent",
    },
    {
      icon: Layers,
      tag: "EASY PLANNING",
      title: "Simple Steps",
      description: "We go beyond simple to-do lists. We break down starting trouble and laziness into easy, actionable steps.",
      gradient: "from-blue-500/10 to-transparent",
    },
    {
      icon: Compass,
      tag: "LIFE BALANCE",
      title: "Complete Harmony",
      description: "An elegant dashboard connecting focus, sleep, daily routines, and life goals together into a clear system.",
      gradient: "from-emerald-500/10 to-transparent",
    },
  ];

  const liveStats = [
    { icon: TrendingUp, label: "Focus Score", value: "94.8%", color: "text-violet-400" },
    { icon: Zap, label: "XP Earned", value: "+840", color: "text-amber-400" },
    { icon: Clock, label: "Time Saved", value: "14.2m", color: "text-blue-400" },
    { icon: Shield, label: "Privacy", value: "100%", color: "text-emerald-400" },
  ];

  return (
    <div className="relative text-zinc-100 min-h-screen font-sans bg-[#060608] overflow-hidden antialiased select-none grain">

      {/* ── AURORA BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Refined static ambient glow */}
        <div 
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-[0.10]"
          style={{ background: "radial-gradient(circle, #5B6EF5 0%, transparent 75%)", filter: "blur(120px)" }}
        />
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,6,10,0.95)_100%)]" />
      </div>



      {/* ── HERO SECTION ── */}
      <section ref={heroRef} id="hero-showcase" className="relative pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6 md:px-8 z-10 max-w-7xl mx-auto w-full">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center text-center">

          {/* Launch badge */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onClick={onExploreDashboard}
            className="badge-accent mb-10 hover:bg-accent/15 hover:border-accent/35 transition-colors cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>AI Habit Intelligence · Now Live</span>
              <ArrowRight className="w-3 h-3 text-accent group-hover:translate-x-0.5 transition-transform" />
            </span>
          </motion.div>

          {/* Main headline */}
          <div className="relative mb-8 md:mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[-0.045em] leading-[1.02] max-w-6xl"
            >
              <span className="text-[#F0F0F5]">Clarity for </span>
              <br className="hidden md:block" />
              <span className="relative inline-block">
                <span className="font-serif italic font-normal text-zinc-200">
                  busy lives.
                </span>
                {/* Underline accent line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent origin-left"
                />
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.35 }}
            className="text-lg sm:text-xl md:text-2xl max-w-2xl font-light leading-relaxed mb-12 md:mb-14 tracking-wide text-zinc-400"
          >
            A calm, intelligent app to build daily habits,{" "}
            <span className="text-zinc-200">beat stress</span>, and{" "}
            <span className="text-zinc-200">lock in deep focus</span> — powered by AI.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-lg mb-20 md:mb-24 px-4"
          >
            {/* Primary CTA */}
            <button
              id="btn-hero-join"
              onClick={onJoinClick}
              className="btn-accent w-full sm:w-auto px-10 py-4 font-semibold text-sm tracking-wide"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary CTA */}
            <button
              id="btn-hero-explore"
              onClick={onExploreDashboard}
              className="btn-ghost w-full sm:w-auto px-10 py-4 font-medium text-sm tracking-wide"
            >
              <span>Open Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* ── PREMIUM HERO MOCKUP ── */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
            className="w-full max-w-5xl relative"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-b from-violet-600/10 via-blue-600/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 left-1/4 right-1/4 h-16 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />

            {/* Main card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0f]/80 backdrop-blur-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)]">
              
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.015]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70 hover:bg-amber-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70 hover:bg-emerald-400 transition-colors cursor-pointer" />
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase">lifepilot.ai · SECURE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-mono text-zinc-500 tracking-wider">AI ACTIVE</span>
                </div>
              </div>

              {/* Content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
                
                {/* Left — live stats */}
                <div className="p-6 space-y-5">
                  <div className="text-[10px] font-mono text-zinc-600 tracking-[0.25em] uppercase mb-4">Live Metrics</div>
                  {liveStats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:border-white/10 transition-colors">
                          <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">{stat.label}</span>
                      </div>
                      <span className={`text-sm font-mono font-semibold ${stat.color}`}>{stat.value}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Middle — focus chart */}
                <div className="p-6 col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-600 tracking-[0.25em] uppercase">Focus Path Today</div>
                      <div className="text-base font-medium text-white mt-1">Deep Work Progress</div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-emerald-400 tracking-wider">HIGH FOCUS</span>
                    </div>
                  </div>

                  {/* Animated SVG chart */}
                  <div className="relative h-32 w-full mb-4">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(139,92,246,0.4)" />
                          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                        </linearGradient>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6d28d9" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      {/* Fill area */}
                      <motion.path
                        d="M 0 110 C 80 110, 140 85, 200 65 C 260 45, 310 30, 380 22 C 430 16, 500 12, 600 8 L 600 120 L 0 120 Z"
                        fill="url(#chartGrad)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.9 }}
                      />
                      {/* Line */}
                      <motion.path
                        d="M 0 110 C 80 110, 140 85, 200 65 C 260 45, 310 30, 380 22 C 430 16, 500 12, 600 8"
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, delay: 0.7, ease: "easeOut" }}
                      />
                      {/* Endpoint dot */}
                      <motion.circle
                        cx="600" cy="8" r="4"
                        fill="#8b5cf6"
                        filter="url(#glow)"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 2.5 }}
                      />
                      <motion.circle
                        cx="600" cy="8" r="8"
                        fill="rgba(139,92,246,0.2)"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 0.8, 0.4] }}
                        transition={{ delay: 2.5, duration: 0.6 }}
                      />
                    </svg>
                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] font-mono text-zinc-600">
                      <span>6AM</span><span>9AM</span><span>12PM</span><span>3PM</span><span>Now</span>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.04]">
                    {[
                      { label: "Habits Done", pct: 78, color: "bg-violet-500" },
                      { label: "Focus Score", pct: 94, color: "bg-blue-500" },
                      { label: "Energy", pct: 85, color: "bg-emerald-500" },
                    ].map((bar, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">{bar.label}</span>
                          <span className="text-[9px] font-mono text-zinc-400">{bar.pct}%</span>
                        </div>
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${bar.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${bar.pct}%` }}
                            transition={{ duration: 1.2, delay: 1 + i * 0.15, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="px-5 py-3 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {["FOCUS", "HABITS", "REVIEW", "JOURNAL"].map((tab, i) => (
                    <span key={i} className={`text-[9px] font-mono tracking-[0.2em] uppercase cursor-pointer transition-colors ${i === 0 ? "text-violet-400 border-b border-violet-400" : "text-zinc-600 hover:text-zinc-400"}`}>
                      {tab}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-zinc-600 tracking-widest">SYSTEM ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Elegant Side Telemetry Widgets */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -left-6 md:-left-16 top-1/4 hidden lg:flex items-center gap-3 bg-[#0C0C12]/95 border border-white/[0.07] backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl"
            >
              <div className="w-7 h-7 rounded bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">AI Coach</div>
                <div className="text-xs font-semibold text-zinc-200">Plan formulated</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -right-6 md:-right-16 bottom-1/3 hidden lg:flex items-center gap-3 bg-[#0C0C12]/95 border border-white/[0.07] backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl"
            >
              <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Telemetry XP</div>
                <div className="text-xs font-semibold text-emerald-400">+150 Points</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 bg-[#0C0C12]/95 border border-white/[0.07] backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl"
            >
              {["Deep Focus", "Habit Streaks", "AI Coaching"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

        </motion.div>
      </section>

      {/* ── ANIMATED METRICS STRIP ── */}
      <section className="border-y border-white/[0.04] bg-white/[0.01] py-10 z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/[0.03] via-transparent to-blue-500/[0.03] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { label: "DAILY FOCUS", target: 94, suffix: "%", sub: "Average focus accuracy", color: "text-violet-400" },
              { label: "MIND REST", target: 840, suffix: " XP", sub: "Weekly focus points", color: "text-amber-400" },
              { label: "LESS DELAY", target: 14, suffix: ".2m", sub: "Daily hesitation saved", color: "text-blue-400" },
              { label: "PRIVACY", target: 100, suffix: "%", sub: "Encrypted local storage", color: "text-emerald-400" },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-2 text-center group"
              >
                <div className="text-[10px] font-mono text-zinc-600 tracking-[0.25em] uppercase">{metric.label}</div>
                <div className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-tight font-mono ${metric.color} group-hover:scale-105 transition-transform duration-300`}>
                  <AnimatedCounter target={metric.target} suffix={metric.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-zinc-500 font-light">{metric.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HABIT DIAGNOSTIC ── */}
      <section id="ai-demo-diagnosis" className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8 z-10 py-16 sm:py-20 md:py-28">
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20"
          >
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-violet-400 uppercase">HABIT DIAGNOSTIC</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-100 tracking-tight">How We Fix Daily Obstacles</h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Select an issue below to see how we find the real root cause and build a simple step-by-step path to fix it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {(["focus", "routine", "pivot"] as const).map((key) => {
            const isSelected = selectedTopic === key;
            return (
              <motion.button
                id={`btn-demo-problem-${key}`}
                key={key}
                onClick={() => setSelectedTopic(key)}
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.985 }}
                className={`p-6 rounded-2xl text-center border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  isSelected
                    ? "border-violet-500/30 shadow-2xl shadow-violet-500/10"
                    : "bg-transparent border-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.02]"
                }`}
              >
                {isSelected && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent" />
                    <div className="absolute inset-0 bg-[#0d0d12]/80 backdrop-blur-sm" style={{ zIndex: -1 }} />
                  </>
                )}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em]">
                    0{key === "focus" ? "1" : key === "routine" ? "2" : "3"}
                  </span>
                  {isSelected && (
                    <motion.span
                      layoutId="active-dot"
                      className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                    />
                  )}
                </div>
                <h4 className="relative z-10 text-base md:text-lg font-medium text-zinc-200 mt-4 tracking-tight">{topics[key].title}</h4>
              </motion.button>
            );
          })}
        </div>

        <div className="bg-[#0B0B0F]/80 border border-white/[0.05] p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTopic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
                <div>
                  <span className="text-[10px] font-mono text-violet-400 tracking-widest uppercase">{topics[selectedTopic].tag}</span>
                  <h4 className="text-base sm:text-lg font-light text-zinc-100 mt-1.5 leading-tight">{topics[selectedTopic].subtitle}</h4>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-lg self-start sm:self-center">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span className="text-xs font-mono font-medium text-zinc-300">{topics[selectedTopic].duration}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest block mb-2">ROOT CAUSE</span>
                    <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">{topics[selectedTopic].rootCause}</p>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest block">CORRECTIVE PATH</span>
                    <div className="space-y-2.5">
                      {topics[selectedTopic].protocol.map((act, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="flex gap-3 items-start text-sm text-zinc-400 font-light leading-relaxed"
                        >
                          <span className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 w-6 h-6 flex items-center justify-center rounded-lg shrink-0 font-semibold">{idx + 1}</span>
                          <span className="pt-0.5">{act}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest block">STEADY HABIT BENEFITS</span>
                    <div className="text-xl font-light text-zinc-200 tracking-tight">Steady Habit Growth</div>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                      This strategy runs on your local system, helping you lower starting trouble and build daily consistency.
                    </p>
                  </div>
                  <button
                    onClick={onExploreDashboard}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600/80 to-blue-600/80 hover:from-violet-500 hover:to-blue-500 transition-all text-sm font-semibold text-white mt-6 cursor-pointer border border-violet-500/20 shadow-lg shadow-violet-500/10"
                  >
                    Start this routine now →
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-t border-white/[0.04] px-4 sm:px-6 md:px-8 z-10 relative w-full py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
            >
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-blue-400 uppercase">FEATURES OVERVIEW</span>
            </motion.div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-light text-zinc-100 tracking-tight">Designed for Peace of Mind</h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
              Simple, quiet tools that help you build good habits, beat daily stress, and work efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ type: "spring", stiffness: 85, damping: 20, delay: idx * 0.12 }}
                  whileHover={{ y: -8, scale: 1.015, transition: { duration: 0.25 } }}
                  className="spotlight-card rounded-2xl p-8 cursor-pointer relative overflow-hidden grain"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6 group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-300 relative z-10">
                    <IconComp className="w-5 h-5 text-zinc-300" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase block mb-2 relative z-10">{feat.tag}</span>
                  <h3 className="text-base font-semibold text-white mb-3 tracking-tight relative z-10">{feat.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-light relative z-10">{feat.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="border-t border-white/[0.04] px-4 sm:px-6 md:px-8 relative z-10 w-full py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="badge-accent"
            >
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-accent" />
                <span>PRICING</span>
              </span>
            </motion.div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-light text-zinc-100 tracking-tight">Simple & Fair Pricing</h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
              Basic habit tracking is completely free. Upgrade for full AI coaching access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 75, damping: 18, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="p-8 rounded-2xl border border-white/[0.06] bg-[#0c0c12]/60 backdrop-blur-sm flex flex-col justify-between space-y-8 grain"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">01 / FREE PLAN</span>
                  <h4 className="text-lg font-semibold text-white mt-2">Free Plan</h4>
                  <p className="text-sm text-zinc-400 mt-2 font-light leading-relaxed">Perfect for basic habit tracking and local statistics.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light text-zinc-200 font-mono tracking-tight">$0</span>
                  <span className="text-sm text-zinc-500 font-mono">/ forever</span>
                </div>
                <div className="space-y-3 pt-5 border-t border-white/[0.04]">
                  {["Habit diagnostic chats", "Daily habit dashboard", "Secure local storage", "Clean, quiet interface"].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-light">
                      <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0" /><span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={onExploreDashboard} className="btn-ghost w-full py-3 text-zinc-200 text-sm font-medium transition-all">
                Access Standard
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 75, damping: 18, delay: 0.2 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="p-8 rounded-2xl border border-accent/25 bg-[#0C0C12]/80 backdrop-blur-sm flex flex-col justify-between space-y-8 relative overflow-hidden grain shadow-2xl shadow-accent/5"
            >
              <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-24 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <div className="absolute -top-3 right-6 bg-accent/20 border border-accent/30 text-accent text-[9px] font-mono tracking-widest px-3 py-1 rounded-full uppercase font-medium">
                RECOMMENDED
              </div>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">02 / PREMIUM PLAN</span>
                  <h4 className="text-lg font-semibold text-white mt-2">Premium Plan</h4>
                  <p className="text-sm text-zinc-400 mt-2 font-light leading-relaxed">Full access to all features, unlimited AI coaching, and detailed habit reports.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light text-white font-mono tracking-tight">$19</span>
                  <span className="text-sm text-zinc-500 font-mono">/ monthly</span>
                </div>
                <div className="space-y-3 pt-5 border-t border-accent/15">
                  {["Unlimited AI coach chats", "Life balance map details", "Future savings simulator", "Premium habit bundles", "Daily coach suggestions", "Priority responses"].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-light">
                      <Check className="w-3.5 h-3.5 text-accent shrink-0" /><span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={onJoinClick} className="btn-accent w-full py-3 text-sm font-semibold tracking-wide">
                Activate Premium
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-white/[0.04] px-4 sm:px-6 md:px-8 max-w-6xl mx-auto relative z-10 w-full py-16 sm:py-20">
        <div className="text-center mb-12 space-y-3">
          <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">FAQ</span>
          <h2 className="text-2xl sm:text-3xl font-light text-zinc-200 tracking-tight">Common Questions</h2>
        </div>
        <div className="space-y-3 max-w-3xl mx-auto">
          {[
            { q: "How is this different from typical habit apps?", a: "Most products rely on nagging alerts and rigid checkmarks. We take a calmer, direct approach. By identifying emotional start friction, we build actionable options rather than pressure." },
            { q: "Is my personal data confidential?", a: "Entirely. All reflections, habit checklists, and session progress are localized on your client browser storage. No behavior logs are sold or sent to ad platforms." },
            { q: "What role does the AI play?", a: "The AI acts as an objective, mature sounding board for your goals, identifying root causes of stress-induced avoidance and writing step-by-step methods." },
            { q: "Can I adjust the system parameters?", a: "Yes. From the dashboard settings, the user can toggle target variables, select coach tone styles (reflective or structured), and configure focus presets." },
          ].map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="p-6 rounded-xl bg-[#0a0a0f]/60 border border-white/[0.04] hover:border-white/[0.08] transition-colors text-left group"
            >
              <h4 className="text-sm sm:text-base font-medium text-zinc-200 mb-2 group-hover:text-white transition-colors">{faq.q}</h4>
              <p className="text-sm text-zinc-500 font-light leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.04] py-8 md:py-10 px-4 sm:px-6 md:px-8 bg-[#060608] text-zinc-500 relative z-10 w-full">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-violet-500/30 flex items-center justify-center">
              <span className="text-xs text-violet-300 font-bold font-mono">LP</span>
            </div>
            <span className="font-medium tracking-tight text-sm text-zinc-300">LifePilot</span>
          </div>
          <div className="text-[11px] font-mono tracking-wider text-zinc-600 uppercase">
            © 2026 LifePilot · Built for clarity
          </div>
          <div className="flex gap-5 text-[11px] font-mono tracking-wider text-zinc-600 uppercase">
            {["Privacy", "Security", "System"].map(l => (
              <span key={l} className="hover:text-zinc-400 cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
