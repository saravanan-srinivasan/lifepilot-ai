import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Workflow, 
  Flame, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Zap, 
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NodeArea {
  id: string;
  name: string;
  score: number;
  icon: any;
  status: 'critical' | 'stable' | 'optimal';
  progress: number;
  linkedNodes: string[];
  metrics: { name: string; val: string }[];
  // Relative placement coordinates inside the map container
  x: number;
  y: number;
}

export default function LifeMap() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("discipline");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [dbScores, setDbScores] = useState({
    life: 84,
    focus: 92,
    discipline: 78,
    energy: 65,
    finance: 74
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapScores = async () => {
      const token = localStorage.getItem("lifepilot_token");
      try {
        const res = await fetch("/api/habits", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data.scores) {
            setDbScores(data.scores);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic life map parameters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapScores();
  }, []);

  const disciplineScore = dbScores.discipline;
  const focusScore = dbScores.focus;
  const healthScore = dbScores.energy;
  const financeScore = dbScores.finance;
  const mentalScore = dbScores.life;

  const careerScore = Math.round((disciplineScore + financeScore) / 2);
  const learningScore = Math.round((focusScore + disciplineScore) / 2);
  const relationshipsScore = Math.round((mentalScore + healthScore) / 2);

  const nodes: NodeArea[] = [
    {
      id: "career",
      name: "Career Growth",
      score: careerScore,
      icon: TrendingUp,
      status: careerScore >= 80 ? "optimal" : careerScore >= 60 ? "stable" : "critical",
      progress: careerScore,
      linkedNodes: ["discipline", "learning", "finance"],
      x: 15,
      y: 20,
      metrics: [
        { name: "Career Direction", val: `${Math.min(100, careerScore + 3)}%` },
        { name: "Learning Time", val: `+${(learningScore / 25).toFixed(1)}h / wk` },
        { name: "Work Performance", val: careerScore >= 75 ? "Excellent" : "Stable" }
      ]
    },
    {
      id: "health",
      name: "Sleep Quality",
      score: healthScore,
      icon: Activity,
      status: healthScore >= 80 ? "optimal" : healthScore >= 60 ? "stable" : "critical",
      progress: healthScore,
      linkedNodes: ["discipline", "mental"],
      x: 82,
      y: 20,
      metrics: [
        { name: "Sleep Quality", val: `${healthScore}%` },
        { name: "Daily Rest Hours", val: `${(healthScore * 0.09).toFixed(1)} hours` },
        { name: "Heart Rate Recovery", val: healthScore >= 70 ? "Optimal" : "Stable" }
      ]
    },
    {
      id: "finance",
      name: "Savings",
      score: financeScore,
      icon: TrendingUp,
      status: financeScore >= 80 ? "optimal" : financeScore >= 60 ? "stable" : "critical",
      progress: financeScore,
      linkedNodes: ["career", "discipline"],
      x: 15,
      y: 80,
      metrics: [
        { name: "Savings Rate", val: `${Math.round(financeScore * 0.4)}%` },
        { name: "Monthly Savings", val: `+$${Math.round(financeScore * 6)} / month` },
        { name: "Emergency Reserves", val: financeScore >= 75 ? "Secure" : "Compounding" }
      ]
    },
    {
      id: "discipline",
      name: "Habit Consistency",
      score: disciplineScore,
      icon: Flame,
      status: disciplineScore >= 80 ? "optimal" : disciplineScore >= 60 ? "stable" : "critical",
      progress: disciplineScore,
      linkedNodes: ["career", "health", "focus", "learning"],
      x: 48,
      y: 50,
      metrics: [
        { name: "Habit Streak", val: `${Math.round(disciplineScore / 6.5)} Days` },
        { name: "Tasks Completed", val: `${disciplineScore}%` },
        { name: "Starting Fear Level", val: disciplineScore >= 80 ? "Minimal" : "Moderate" }
      ]
    },
    {
      id: "learning",
      name: "Self Improvement",
      score: learningScore,
      icon: BookOpen,
      status: learningScore >= 80 ? "optimal" : learningScore >= 60 ? "stable" : "critical",
      progress: learningScore,
      linkedNodes: ["career", "discipline", "focus"],
      x: 48,
      y: 15,
      metrics: [
        { name: "Reading Frequency", val: `${Math.round(learningScore / 20)} Days / wk` },
        { name: "Memory Retention", val: `${learningScore}%` },
        { name: "Weekly Review Time", val: `${(learningScore / 30).toFixed(1)} hours` }
      ]
    },
    {
      id: "relationships",
      name: "Relationships",
      score: relationshipsScore,
      icon: Users,
      status: relationshipsScore >= 80 ? "optimal" : relationshipsScore >= 60 ? "stable" : "critical",
      progress: relationshipsScore,
      linkedNodes: ["mental"],
      x: 82,
      y: 80,
      metrics: [
        { name: "Family & Friends Time", val: `${relationshipsScore}%` },
        { name: "Relationship Support", val: `${Math.min(100, relationshipsScore + 5)}%` },
        { name: "Social Connection", val: relationshipsScore >= 70 ? "Strong" : "Healthy" }
      ]
    },
    {
      id: "focus",
      name: "Focus Level",
      score: focusScore,
      icon: Zap,
      status: focusScore >= 80 ? "optimal" : focusScore >= 60 ? "stable" : "critical",
      progress: focusScore,
      linkedNodes: ["discipline", "learning", "mental"],
      x: 48,
      y: 85,
      metrics: [
        { name: "Max Focus Time", val: `${Math.round(focusScore * 0.5)} minutes` },
        { name: "Distraction Block Rate", val: `${focusScore}%` },
        { name: "Mental Recharge", val: focusScore >= 75 ? "Excellent" : "Stable" }
      ]
    },
    {
      id: "mental",
      name: "Peace of Mind",
      score: mentalScore,
      icon: Brain,
      status: mentalScore >= 80 ? "optimal" : mentalScore >= 60 ? "stable" : "critical",
      progress: mentalScore,
      linkedNodes: ["focus", "health", "relationships"],
      x: 82,
      y: 50,
      metrics: [
        { name: "Meditation Time", val: `${mentalScore}%` },
        { name: "Stress Management", val: mentalScore >= 75 ? "Optimal" : "Stable" },
        { name: "Mental Calmness", val: mentalScore >= 70 ? "Stable" : "Restless" }
      ]
    }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[3];

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 text-zinc-100 relative z-10 font-sans w-full">
      
      {/* Subtle top edge lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(circle_at_top,_rgba(25,25,35,0.08)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/[0.03] pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-mono tracking-[0.2em] text-zinc-500 uppercase">
            <Workflow className="w-3.5 h-3.5" />
            <span>LIFE BALANCE SYSTEM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white mt-1.5">
            Life Balance Map
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl font-light leading-relaxed">
            Everything is connected. Improving your Sleep Quality reduces stress, which boosts your Focus Level and helps you save more money and grow in your career.
          </p>
        </div>
        <div className="bg-[#0C0C10] border border-white/[0.04] p-3 rounded text-sm shrink-0 font-mono text-zinc-300">
          LIFE BALANCE DETAILS
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Constellation Interface */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.004 }}
          className="spotlight-card rounded-2xl p-6 sm:p-8 lg:col-span-2 flex flex-col justify-between relative min-h-[480px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
        >
          
          {/* Symmetrical connected lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {nodes.map((node) => {
              return node.linkedNodes.map((targetId) => {
                const targetNode = nodes.find(n => n.id === targetId);
                if (!targetNode) return null;

                const isMainConnection = selectedNodeId === node.id || selectedNodeId === targetId;
                const isHoveredConnection = hoveredNodeId === node.id || hoveredNodeId === targetId;
                
                let strokeColor = "rgba(255, 255, 255, 0.02)";
                let strokeWidth = 1;

                if (isHoveredConnection) {
                  strokeColor = "rgba(91, 110, 245, 0.6)"; // glowing active brand accent
                  strokeWidth = 1.5;
                } else if (isMainConnection) {
                  strokeColor = "rgba(91, 110, 245, 0.25)"; // brand accent line
                  strokeWidth = 1.2;
                }

                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${targetNode.x}%`}
                    y2={`${targetNode.y}%`}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-300"
                  />
                );
              });
            })}
          </svg>

          <div className="text-sm font-mono text-zinc-500 z-10 block uppercase tracking-[0.2em] text-left mb-6">
            Interactive Balance Map (Select a category to inspect):
          </div>

          <div className="relative w-full h-[320px] sm:h-[350px] z-10">
            {nodes.map((node) => {
              const IconComp = node.icon;
              const isSelected = selectedNodeId === node.id;
              const isLinkedToSelected = selectedNode.linkedNodes.includes(node.id);
              const isHovered = hoveredNodeId === node.id;
              
              return (
                <motion.button
                  id={`btn-lifemap-node-${node.id}`}
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  className={`absolute p-4 rounded-2xl border cursor-pointer flex flex-col items-center justify-center transition-all shadow-xl ${
                    isSelected 
                      ? "bg-[#141419]/95 border-accent/40 text-accent shadow-[0_0_20px_rgba(91,110,245,0.2)] z-20" 
                      : isLinkedToSelected
                      ? "bg-[#0C0C10]/95 border-accent/15 text-white z-10"
                      : isHovered
                      ? "bg-[#141419] border-white/[0.08] z-10"
                      : "bg-[#09090C]/90 border-white/[0.03]"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 border transition-all ${
                    isSelected 
                      ? "bg-accent/10 border-accent/30 text-accent" 
                      : isLinkedToSelected
                      ? "bg-white/[0.02] border-white/[0.05] text-zinc-300"
                      : "bg-white/[0.005] text-zinc-500 border-white/[0.02]"
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm sm:text-base font-medium text-zinc-200 tracking-tight whitespace-nowrap">{node.name}</h4>
                  <div className="text-sm font-mono text-zinc-500 mt-0.5">{node.score}%</div>
                  
                  {isLinkedToSelected && (
                    <span className="absolute -top-1.5 -right-1.5 font-mono text-sm tracking-[0.2em] leading-none bg-zinc-950 text-zinc-400 px-2 py-1 rounded-full border border-white/[0.06]">
                      LINK
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <p className="text-sm font-mono text-zinc-500 text-center mt-6 uppercase tracking-widest">
            How your different areas of life affect each other.
          </p>
        </motion.div>

        {/* Selected Area Inspector Panel */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedNode.id}
            initial={{ opacity: 0, x: 20, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            whileHover={{ y: -3, scale: 1.004 }}
            className="spotlight-card rounded-2xl p-6 sm:p-7 space-y-5 relative flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
          >
            <div>
              <div className="flex justify-between items-start border-b border-white/[0.03] pb-3.5">
                <div>
                  <span className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] block">CATEGORY DETAILS</span>
                  <h3 className="text-sm sm:text-base font-semibold text-white mt-1">{selectedNode.name}</h3>
                </div>
                <span className={`px-2.5 py-1 text-sm font-mono tracking-widest uppercase font-semibold rounded-full border ${
                  selectedNode.status === 'optimal' 
                    ? "bg-zinc-200/10 text-zinc-100 border-white/[0.06] "
                    : selectedNode.status === 'stable'
                    ? "bg-white/5 text-[#E4E4E7] border-white/[0.04]"
                    : "bg-red-500/10 text-red-350 border-red-500/10"
                }`}>
                  {selectedNode.status}
                </span>
              </div>

              <div className="mt-5 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-light">Category Score</span>
                  <span className="text-zinc-300 font-mono font-bold">{selectedNode.score}%</span>
                </div>
                <div className="w-full bg-white/[0.01] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full shadow-[0_0_8px_rgba(91,110,245,0.4)]" 
                    style={{ width: `${selectedNode.progress}%` }} 
                  />
                </div>
              </div>

              {/* Metrics rows */}
              <div className="space-y-3 mt-6">
                <span className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] block font-medium">METRICS</span>
                <div className="space-y-2 font-light">
                  {selectedNode.metrics.map((met, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.005, x: 2 }}
                      className="p-3 rounded-xl bg-[#09090D]/50 border border-white/[0.02] flex justify-between items-center text-sm transition-all duration-300"
                    >
                      <span className="text-zinc-400">{met.name}</span>
                      <span className="font-mono text-zinc-200 font-medium">{met.val}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.03] space-y-2">
              <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest block font-bold">CONNECTED CATEGORIES</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.linkedNodes.map((ln) => (
                  <span key={ln} className="text-sm font-mono uppercase bg-accent/5 text-accent-light px-2.5 py-0.5 rounded-full border border-accent/10">
                    ✦ {ln}
                  </span>
                ))}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>

    </div>
  );
}
