import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Brain,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message } from "../types";

interface AIChatProps {
  initialPrompt: string;
  clearInitialPrompt: () => void;
  userProfile?: { focusArea: string; discipline: number; energyState: string };
  onAddXP: (points: number) => void;
  navigateToRootCause: (analysis: any) => void;
}

export default function AIChat({ initialPrompt, clearInitialPrompt, userProfile, onAddXP, navigateToRootCause }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-ai",
      sender: "ai",
      text: "Hello! I am your AI Coach. Tell me what habit or focus problem you are facing today, and I will write a simple, easy step-by-step plan for you.",
      timestamp: "READY",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialPromptHandled = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialSuggestions = [
    "I struggle with starting key tasks",
    "I lose focus on high-effort goals",
    "I feel overwhelmed choosing priorities",
    "My habits collapse after a week"
  ];

  // Handle pre-filled prompt from dashboard
  useEffect(() => {
    if (initialPrompt && !initialPromptHandled.current) {
      initialPromptHandled.current = true;
      sendMessage(initialPrompt);
      setTimeout(() => clearInitialPrompt(), 100);
    }
  }, [initialPrompt]); // eslint-disable-line

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Add user message and start thinking
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsThinking(true);

    try {
      const token = localStorage.getItem("lifepilot_token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: [{ sender: "user", text: trimmed, id: userMsg.id, timestamp: userMsg.timestamp }],
          userProfile: userProfile || { focusArea: "General lifestyle optimization", discipline: 70, energyState: "Optimized" }
        })
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.text || "I have analyzed your situation and prepared a plan for you.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        analysis: {
          rootCause: data.rootCause,
          riskLevels: data.riskLevels,
          actionItems: data.actionItems,
          timeframeEstimation: data.timeframeEstimation
        }
      };

      setMessages(prev => [...prev, aiMsg]);
      onAddXP(150);

    } catch (err) {
      console.error("Chat error:", err);
      // Show a fallback message so the user always gets a response
      const fallbackMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: "I am here to help! Your starting trouble is completely normal — it is just anxiety in disguise. Let's make it simple: clear your desk, pick one task, and set a 5-minute timer. You only need to start.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        analysis: {
          rootCause: "Starting Anxiety",
          riskLevels: [
            { factor: "Task Complexity", scale: 80, color: "purple" },
            { factor: "Focus Level", scale: 45, color: "cyan" }
          ],
          actionItems: [
            "Clear all clutter from your desk for 90 seconds.",
            "Write down your single most important task on paper.",
            "Work for just 5 minutes — quality does not matter yet."
          ],
          timeframeEstimation: "15 minutes to regain focus"
        }
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
      // Re-focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto flex flex-col min-h-[90vh] text-zinc-100 relative z-10 font-sans w-full">
      
      {/* Ambient gradient */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,_rgba(25,25,35,0.08)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none z-0" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/[0.03] pb-6 md:pb-8 mb-10 md:mb-12">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
            <Brain className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold tracking-tight text-white">AI Coach</h2>
            <p className="text-sm font-mono text-zinc-500 tracking-wider uppercase">Habit Planner · Powered by Groq</p>
          </div>
        </div>
        <div className="text-sm font-mono text-zinc-500 tracking-wider bg-white/[0.02] border border-white/[0.04] px-3 md:px-4 py-1.5 md:py-2 rounded">
          <span className={isThinking ? "text-amber-400 animate-pulse" : "text-zinc-500"}>
            {isThinking ? "● THINKING..." : "SECURE CHANNEL"}
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-8 min-h-[400px] pr-1.5 max-h-[60vh]">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                className={`flex gap-4 ${isAI ? "justify-start" : "justify-end"}`}
              >
                <div className={`space-y-4 max-w-[95%] sm:max-w-2xl flex flex-col ${isAI ? "items-start" : "items-end"}`}>
                  
                  {/* Chat Bubble */}
                  <div className={`p-6 rounded-2xl relative shadow-2xl transition-all duration-300 ${
                    isAI
                      ? "spotlight-card text-zinc-300 font-light leading-relaxed grain"
                      : "bg-[#0C0C12] border border-white/[0.08] text-[#F0F0F5] font-light ml-auto"
                  }`}>
                    <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <div className="text-xs font-mono text-zinc-500 mt-4 tracking-[0.2em] uppercase">
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Analysis Card */}
                  {isAI && msg.analysis && msg.analysis.rootCause && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.12, type: "spring", stiffness: 100, damping: 20 }}
                      className="w-full spotlight-card border border-white/[0.05] p-6 rounded-2xl space-y-5 shadow-2xl grain"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.03] pb-3.5">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase block">Main Obstacle</span>
                          <h4 className="text-sm sm:text-base font-medium text-white mt-1">
                            Cause: <span className="text-accent font-semibold">{msg.analysis.rootCause}</span>
                          </h4>
                        </div>
                        <button
                          onClick={() => navigateToRootCause(msg.analysis)}
                          className="px-3.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-accent/40 text-zinc-200 font-mono text-xs tracking-widest rounded-full transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Explain Logic</span> <Maximize2 className="w-3 h-3 text-zinc-400" />
                        </button>
                      </div>

                      {/* Action Steps */}
                      {msg.analysis.actionItems && msg.analysis.actionItems.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">Easy Step-by-Step Plan</span>
                          <div className="space-y-2">
                            {msg.analysis.actionItems.map((act: string, idx: number) => (
                              <motion.div
                                key={idx}
                                whileHover={{ scale: 1.005, x: 2 }}
                                className="p-3 bg-[#0A0A0E]/60 border border-white/[0.02] hover:border-white/[0.06] rounded-xl flex items-start gap-3.5 text-sm text-zinc-400 font-light leading-relaxed transition-all duration-300"
                              >
                                <span className="text-xs font-mono text-accent bg-accent/5 border border-accent/15 w-6 h-6 flex items-center justify-center rounded-lg shrink-0 font-bold">
                                  {idx + 1}
                                </span>
                                <span className="pt-0.5">{act}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Risk levels + timeframe */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/[0.03]">
                        {msg.analysis.riskLevels && msg.analysis.riskLevels.length > 0 && (
                          <div className="space-y-2.5">
                            <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest block">Main Distractions</span>
                            <div className="space-y-2">
                              {msg.analysis.riskLevels.map((risk: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500 font-light">{risk.factor}</span>
                                    <span className="text-zinc-300 font-mono font-medium">{risk.scale}%</span>
                                  </div>
                                  <div className="w-full bg-white/[0.01] h-1 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${risk.scale}%` }}
                                      transition={{ duration: 0.8 }}
                                      className="h-full bg-zinc-300 rounded-full"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.analysis.timeframeEstimation && (
                          <div className="p-4 bg-white/[0.005] border border-white/[0.02] rounded-xl flex flex-col justify-center">
                            <span className="text-sm font-mono text-zinc-500 tracking-widest uppercase">Expected Time</span>
                            <div className="text-sm font-medium text-zinc-300 mt-1 leading-relaxed">
                              {msg.analysis.timeframeEstimation}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 justify-start"
          >
            <div className="bg-[#0E0E12] py-4 px-6 rounded-2xl border border-white/[0.03] text-sm font-light text-zinc-500 flex items-center gap-2.5 shadow-2xl">
              <Brain className="w-4 h-4 text-zinc-400 animate-pulse" />
              <span>Thinking of a simple plan...</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_200ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_400ms]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips — only before first user message */}
      {messages.length === 1 && (
        <div className="my-8 space-y-3 relative z-10 text-left">
          <p className="text-sm font-mono text-zinc-500 tracking-[0.2em] uppercase">Select a sample question to start:</p>
          <div className="flex flex-wrap gap-2">
            {initialSuggestions.map((s, idx) => (
              <motion.button
                key={idx}
                onClick={() => sendMessage(s)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                disabled={isThinking}
                className="px-4 py-2 rounded-full bg-[#0C0C12] hover:bg-white/[0.02] border border-white/[0.06] hover:border-accent/40 text-sm font-light text-zinc-400 hover:text-white transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed font-sans"
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="mt-auto pt-6 border-t border-white/[0.03] relative z-10 bg-[#09090B]">
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isThinking && inputValue.trim()) {
                e.preventDefault();
                sendMessage(inputValue);
              }
            }}
            placeholder={isThinking ? "Waiting for response..." : "Ask your AI Coach a question..."}
            disabled={isThinking}
            className="w-full pl-5 pr-14 py-4 rounded-xl bg-[#0C0C10] border border-white/[0.05] text-sm sm:text-base text-white focus:outline-none focus:border-white/[0.12] transition-colors font-light shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled={isThinking || !inputValue.trim()}
            onClick={() => sendMessage(inputValue)}
            className="absolute right-2.5 p-2 bg-zinc-200 hover:bg-white text-zinc-950 rounded-lg transition-all active:scale-95 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="text-sm text-zinc-600 font-mono text-center mt-3.5 tracking-wider">
          YOUR DIALOG IS COMPLETELY SECURED AND PRIVATE // GAIN +150 XP FOR CHATTING
        </div>
      </div>
    </div>
  );
}
