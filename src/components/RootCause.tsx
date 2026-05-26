import React, { useState } from "react";
import { 
  Activity, 
  BrainCircuit, 
  Layers, 
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

interface RootCauseProps {
  customAnalysis?: {
    rootCause?: string;
    riskLevels?: { factor: string; scale: number; color: string }[];
    actionItems?: string[];
    timeframeEstimation?: string;
  };
}

export default function RootCause({ customAnalysis }: RootCauseProps) {
  // Default deconstruction if user hasn't generated one in Chat
  const rootCause = customAnalysis?.rootCause || "Anxious Habit Loop";
  const risks = customAnalysis?.riskLevels || [
    { factor: "Dopamine & Phone Distractions", scale: 85, color: "zinc" },
    { factor: "Choosing Easy Comforts Over Hard Work", scale: 72, color: "zinc" },
    { factor: "Task Starting Fear (Anxiety)", scale: 64, color: "zinc" }
  ];
  const actions = customAnalysis?.actionItems || [
    "Commit to a 25-minute focus timer: Turn off phone and close social media tabs.",
    "Start work for just 5 minutes. Do not worry about mistakes; just write something.",
    "Prepare your desk the night before: Keep your book or laptop open so you can start instantly."
  ];
  const timeframe = customAnalysis?.timeframeEstimation || "48 Hours to reset focus";

  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 text-zinc-100 relative z-10 font-sans w-full">
      
      {/* Symmetrical thin neutral highlight */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(circle_at_top,_rgba(25,25,35,0.08)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      {/* Title */}
      <div className="border-b border-white/[0.03] pb-6">
        <div className="flex items-center gap-2 text-sm font-mono tracking-[0.2em] text-zinc-500 uppercase">
          <Activity className="w-3.5 h-3.5" />
          <span>Friction Analysis</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white mt-1.5">
          Friction Analyzer
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xl font-light leading-relaxed">
          Break down starting trouble and distraction obstacles into easy, simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Step Flow Diagram */}
        <div className="spotlight-card p-6 rounded-2xl lg:col-span-2 space-y-6 flex flex-col justify-between shadow-2xl overflow-hidden grain">
          <div className="flex justify-between items-center border-b border-white/[0.02] pb-3">
            <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest">HOW IT HAPPENS</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.02] border border-white/[0.04] rounded text-sm text-zinc-300 font-mono uppercase tracking-wider">
              Diagnostic Match: 96.2%
            </div>
          </div>

          {/* Connect node rows */}
          <div className="space-y-4 py-2 relative z-10">
            {[
              { id: 1, step: "initiator", title: "1. A Hard Task is Chosen", desc: "A hard task or goal is selected. Your mind sees it as big and complex, triggering immediate starting fear." },
              { id: 2, step: "evaluation", title: "2. Avoidance Decisions", desc: "Your brain compares the hard task against quick, easy pleasures like checking your phone or scrolling media." },
              { id: 3, step: "resolution", title: rootCause, desc: "To escape the starting fear, your subconscious makes you avoid the hard work and check social media instead." },
            ].map((node, index) => {
              const isHovered = hoveredNode === node.id;
              return (
                <div key={node.id} className="relative">
                  {index < 2 && (
                    <div className="absolute left-[20px] top-14 w-[1px] h-6 bg-white/[0.03]" />
                  )}
                  
                  <div 
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-crosshair ${
                      isHovered 
                        ? "bg-accent/[0.02] border-accent/25 shadow-xl" 
                        : "bg-transparent border-white/[0.02] hover:bg-white/[0.005]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border font-mono text-xs font-bold transition-all duration-200 ${
                        isHovered 
                          ? "bg-accent/10 text-accent border-accent/30" 
                          : "bg-white/[0.005] text-zinc-500 border-white/[0.02]"
                      }`}>
                        <span>0{node.id}</span>
                      </div>
                      <div>
                        <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest">{node.step}</span>
                        <h4 className="text-sm sm:text-base font-semibold text-zinc-200 mt-1">{node.title}</h4>
                        <p className="text-sm text-zinc-400 mt-1 leading-relaxed font-light">{node.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-sm font-mono text-zinc-500 text-center uppercase tracking-wider">
            How your brain makes choices daily.
          </p>
        </div>

        {/* Right limits metrics */}
        <div className="space-y-6">
          
          <div className="spotlight-card p-6 rounded-2xl space-y-4 shadow-xl grain">
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-white/[0.02] pb-2">RISK COMPONENTS</h3>
            
            <div className="space-y-4">
              {risks.map((risk, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 font-light">{risk.factor}</span>
                    <span className="text-zinc-355 font-mono font-bold">{risk.scale}%</span>
                  </div>
                  <div className="w-full bg-white/[0.01] h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent shadow-[0_0_8px_rgba(91,110,245,0.4)]" 
                      style={{ width: `${risk.scale}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corrective measures */}
          <div className="spotlight-card p-6 rounded-2xl space-y-4 relative overflow-hidden shadow-xl grain">
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-white/[0.02] pb-2">HOW TO FIX IT</h3>
            
            <div className="space-y-3">
              {actions.map((act, idx) => (
                <div key={idx} className="p-3 bg-[#09090C] border border-white/[0.02] rounded flex items-start gap-2.5">
                  <span className="text-sm font-mono font-bold text-zinc-400 bg-white/[0.02] px-1.5 py-0.5 rounded shrink-0">0{idx + 1}</span>
                  <p className="text-sm text-zinc-400 leading-relaxed font-light">{act}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.02] space-y-1">
              <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest block font-bold">EXPECTED TIMEFRAME</span>
              <div className="text-sm font-bold text-accent font-mono drop-shadow-[0_0_8px_rgba(91,110,245,0.2)]">{timeframe.toUpperCase()}</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
