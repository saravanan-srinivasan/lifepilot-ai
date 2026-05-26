import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Volume2, 
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FocusMode() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [focusState, setFocusState] = useState<"focus" | "short-break" | "long-break">("focus");

  const [breathingText, setBreathingText] = useState("Inhale");
  const [breathingScale, setBreathingScale] = useState(1);

  const [ambientSound, setAmbientSound] = useState<"none" | "binaural" | "space" | "rain">("binaural");

  // Premium Web Audio Synthesis Engine
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  const stopSynthesizer = () => {
    activeNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        audioCtxRef.current.suspend();
      } catch (e) {}
    }
  };

  const startSynthesizer = async (soundType: string) => {
    stopSynthesizer();

    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const destination = ctx.destination;

    if (soundType === "binaural") {
      // Symmetrical Binaural beats: 200Hz L, 204Hz R for a 4Hz theta wave cognitive alignment
      const oscL = ctx.createOscillator();
      oscL.type = "sine";
      oscL.frequency.value = 200;

      const oscR = ctx.createOscillator();
      oscR.type = "sine";
      oscR.frequency.value = 204;

      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      const gainL = ctx.createGain();
      gainL.gain.value = 0.08;
      const gainR = ctx.createGain();
      gainR.gain.value = 0.08;

      if (pannerL && pannerR) {
        pannerL.pan.value = -1;
        pannerR.pan.value = 1;

        oscL.connect(pannerL).connect(gainL).connect(destination);
        oscR.connect(pannerR).connect(gainR).connect(destination);
      } else {
        oscL.connect(gainL).connect(destination);
        oscR.connect(gainR).connect(destination);
      }

      oscL.start();
      oscR.start();

      activeNodesRef.current.push(oscL, oscR);
    } else if (soundType === "space" || soundType === "rain") {
      // Procedurally generate pinkish low-pass noise or rain modulated waves
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";

      const gain = ctx.createGain();

      if (soundType === "space") {
        filter.frequency.value = 180;
        gain.gain.value = 0.45;
        noiseSource.connect(filter).connect(gain).connect(destination);
      } else {
        filter.type = "bandpass";
        filter.frequency.value = 600;
        filter.Q.value = 0.8;

        const rainGain = ctx.createGain();
        rainGain.gain.value = 0.25;

        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.25; // 4 seconds slow sweep cycles

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 220;

        lfo.connect(lfoGain).connect(filter.frequency);
        lfo.start();

        noiseSource.connect(filter).connect(rainGain).connect(destination);
        activeNodesRef.current.push(lfo);
      }

      noiseSource.start();
      activeNodesRef.current.push(noiseSource);
    }
  };

  useEffect(() => {
    if (timerRunning && ambientSound !== "none") {
      startSynthesizer(ambientSound);
    } else {
      stopSynthesizer();
    }
    return () => {
      stopSynthesizer();
    };
  }, [timerRunning, ambientSound]);

  const logCompletedSession = async () => {
    const totalDurationMap = {
      "focus": 1500,
      "short-break": 300,
      "long-break": 900
    };
    const taskSecs = totalDurationMap[focusState];

    const token = localStorage.getItem("lifepilot_token");
    try {
      await fetch("/api/focus/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          duration: taskSecs,
          mode: focusState,
          sound: ambientSound
        })
      });
    } catch (err) {
      console.error("Failed to commit focus session telemetry to server:", err);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      logCompletedSession();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Diaphragmatic breathing cycle
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick = (tick + 1) % 3;
      if (tick === 0) {
        setBreathingText("Inhale");
        setBreathingScale(1.1);
      } else if (tick === 1) {
        setBreathingText("Hold");
        setBreathingScale(1.1);
      } else {
        setBreathingText("Exhale");
        setBreathingScale(0.95);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStateChange = (state: "focus" | "short-break" | "long-break", secs: number) => {
    setFocusState(state);
    setTimerRunning(false);
    setTimeLeft(secs);
  };

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 text-zinc-100 relative z-10 font-sans flex flex-col items-center w-full">
      
      {/* Absolute backdrop glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(circle_at_top,_rgba(25,25,35,0.08)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      {/* Header Info */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-sm font-mono text-zinc-400 tracking-[0.2em] uppercase">
          <Clock className="w-3.5 h-3.5" />
          <span>DEEP FOCUS TIME</span>
        </div>
        <h1 className="text-2xl font-light tracking-tight text-white mb-1">Focus Timer</h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto font-light leading-relaxed">
          Reduce starting trouble and calm your mind using our breathing guide and quiet focus sounds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative z-10 mt-6 md:px-6">
        
        {/* Timer Box */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.006 }}
          className="spotlight-card rounded-2xl p-8 flex flex-col justify-between items-center text-center space-y-8 min-h-[380px] shadow-[0_30px_70px_rgba(0,0,0,0.85)] grain"
        >
          
          {/* Selector rail */}
          <div className="flex gap-1.5 p-1 bg-white/[0.015] rounded-full border border-white/[0.04] w-full relative z-10 overflow-hidden">
            {(["focus", "short-break", "long-break"] as const).map((mode) => {
              const isActive = focusState === mode;
              const label = mode === "focus" ? "deep focus" : mode === "short-break" ? "short break" : "long break";
              const secs = mode === "focus" ? 1500 : mode === "short-break" ? 300 : 900;
              return (
                <button
                  id={`btn-focus-mode-set-${mode}`}
                  key={mode}
                  onClick={() => handleStateChange(mode, secs)}
                  className={`relative flex-1 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-colors duration-200 cursor-pointer ${
                    isActive ? "text-zinc-950 font-bold" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-focus-state-pill"
                      className="absolute inset-0 bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] block">TIME REMAINING</span>
            <div className="text-6xl sm:text-7xl font-sans font-light tracking-tighter text-white font-mono select-none">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-4">
            <button
              id="btn-timer-reset"
              onClick={() => { setTimerRunning(false); setTimeLeft(focusState === "focus" ? 1500 : focusState === "short-break" ? 300 : 900); }}
              className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-full hover:bg-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-timer-toggle"
              onClick={() => setTimerRunning(!timerRunning)}
              className="px-7 py-3 bg-[#F0F0F5] hover:bg-white rounded-full text-[#06060A] font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg active:scale-95"
            >
              {timerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> <span>Start</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
            {timerRunning ? "● TIMER ACTIVE" : "○ TIMER PAUSED"}
          </div>
        </motion.div>

        {/* Respiratory and Acoustic Choices */}
        <div className="space-y-6">
          
          {/* Breathing pacer */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.006 }}
            className="spotlight-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between items-center text-center space-y-4 min-h-[190px] shadow-[0_30px_70px_rgba(0,0,0,0.85)] grain"
          >
            <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] border-b border-white/[0.03] pb-2.5 w-full">BREATHING PACER</h3>
            
            <div className="flex flex-col items-center justify-center my-1.5 space-y-3.5">
              <div className="relative flex items-center justify-center">
                {/* Expanding Halo Rings */}
                <motion.div 
                  animate={{ scale: breathingScale * 1.6, opacity: [0.12, 0.02, 0.12] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-20 h-20 rounded-full border border-accent/30 pointer-events-none"
                />
                <motion.div 
                  animate={{ scale: breathingScale }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.08] flex items-center justify-center relative shadow-[0_0_40px_rgba(91,110,245,0.1)]"
                >
                  <motion.div 
                    animate={{ scale: breathingText === "Inhale" ? [1, 1.4, 1] : breathingText === "Exhale" ? [1, 0.65, 1] : 1.1 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="w-4 h-4 rounded-full bg-accent shadow-[0_0_15px_rgba(91,110,245,0.6)]" 
                  />
                </motion.div>
              </div>
              <div className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-[0.1em]">{breathingText}</div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs font-light">
              Pace your breathing slowly to calm your mind and body.
            </p>
          </motion.div>

          {/* Sound options panel */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.006 }}
            className="spotlight-card rounded-2xl p-6 sm:p-7 space-y-4 shadow-[0_30px_70px_rgba(0,0,0,0.85)] grain"
          >
            <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] border-b border-white/[0.03] pb-2.5">FOCUS SOUNDS</h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { id: "none", label: "Pure Silence", sub: "Neutral air" },
                { id: "binaural", label: "Focus Waves", sub: "Static waves" },
                { id: "space", label: "White Noise", sub: "Cozy hum" },
                { id: "rain", label: "Gentle Rain", sub: "Soft stream" }
              ].map((sound) => {
                const isSelected = ambientSound === sound.id;
                return (
                  <button
                    id={`btn-ambient-sound-${sound.id}`}
                    key={sound.id}
                    onClick={() => setAmbientSound(sound.id as any)}
                    className={`relative p-4 rounded-xl text-left cursor-pointer overflow-hidden transition-all duration-300 border ${
                      isSelected 
                        ? "bg-[#141419]/70 border-accent/40 text-white shadow-xl" 
                        : "bg-[#09090C]/50 border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.1] text-zinc-400"
                    }`}
                  >
                    <div className="text-xs font-medium flex items-center justify-between relative z-10">
                      <span>{sound.label}</span>
                      {isSelected && <Radio className="w-3 h-3 text-accent" />}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 font-light leading-none relative z-10">{sound.sub}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
