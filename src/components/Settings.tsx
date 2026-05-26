import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Check,
  Cpu,
  Bell,
  Volume2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsProps {
  coachPersona: string;
  setCoachPersona: (persona: string) => void;
}

export default function Settings({ coachPersona, setCoachPersona }: SettingsProps) {
  const [xpTelemetry, setXpTelemetry] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  return (
    <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 text-zinc-100 relative z-10 font-sans w-full">
      
      {/* Symmetrical ambient highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(circle_at_top,_rgba(25,25,35,0.08)_0%,_rgba(0,0,0,0)_65%)] pointer-events-none z-0" />

      {/* Header Info */}
      <div className="border-b border-white/[0.03] pb-6">
        <div className="flex items-center gap-2 text-sm font-mono tracking-[0.2em] text-zinc-500 uppercase">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>SYSTEM PREFERENCES</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white mt-1.5">Settings</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xl font-light leading-relaxed">
          Manage your settings: choose your AI coach personality, toggle daily XP logging, and configure notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        
        {/* Navigation Rail */}
        <div className="bg-[#0C0C10]/40 border border-white/[0.03] p-4 rounded-lg space-y-1 self-start shadow-xl">
          {[
            { id: "persona", label: "Coach Persona", active: true },
            { id: "confidential", label: "Security Boundaries", active: false },
            { id: "telemetry", label: "Parameters Track", active: false },
            { id: "notifications", label: "Broadcast Limits", active: false }
          ].map((item) => (
            <div 
              key={item.id} 
              className={`w-full px-4 py-2.5 rounded text-sm font-mono tracking-widest uppercase transition-all flex items-center gap-2 relative ${
                item.active 
                  ? "bg-white/[0.02] text-white border-l border-white font-semibold" 
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Configurations panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* AI Coach Card */}
          <div className="bg-[#0C0C10]/40 border border-white/[0.03] p-6 rounded-lg space-y-5 shadow-2xl">
            <div>
              <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest">COACH SETTINGS</span>
              <h3 className="text-sm font-semibold text-white mt-1">AI Coach Personality</h3>
              <p className="text-sm text-zinc-400 mt-1 font-light">Choose how the AI advisor structures correction feedback.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "ora", name: "Ora the Advisor", desc: "Empathetic, calm, gentle habit guidance.", metric: "Clarity Focus" },
                { id: "socrates", name: "Sage Socrates", desc: "Inquisitive, posing thoughtful inquiries.", metric: "Reasoning Focus" },
                { id: "spartan", name: "Commander Bright", desc: "Direct, high-energy accountability.", metric: "Willpower Focus" }
              ].map((pCore) => {
                const isActive = coachPersona === pCore.id;
                return (
                  <button
                    id={`btn-persona-core-${pCore.id}`}
                    key={pCore.id}
                    onClick={() => setCoachPersona(pCore.id)}
                    className={`p-4 rounded border text-left transition-all flex flex-col justify-between cursor-pointer min-h-[140px] ${
                      isActive 
                        ? "bg-[#141419] border-accent/40 shadow-xl shadow-accent/5" 
                        : "bg-transparent border-white/[0.03] hover:bg-white/[0.005] hover:border-white/[0.06]"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-mono text-zinc-500 uppercase leading-none">{pCore.metric}</span>
                      <h4 className="text-sm font-semibold text-white mt-2 font-light">{pCore.name}</h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-light line-clamp-3">
                        {pCore.desc}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center shrink-0 self-end mt-2">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings toggles */}
          <div className="bg-[#0C0C10]/40 border border-white/[0.03] p-6 rounded-lg space-y-4 shadow-2xl">
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest border-b border-white/[0.02] pb-2">XP & NOTIFICATIONS</h3>
            
            <div className="space-y-4">
              {/* Toggle 1 - XP */}
              <div className="flex items-center justify-between p-4 bg-white/[0.005] border border-white/[0.02] rounded">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-accent" /> XP Progress Logging
                  </h4>
                  <p className="text-sm text-zinc-500 mt-1 max-w-sm font-light">Earn experience points automatically when you complete goals.</p>
                </div>
                <button
                  id="toggle-xp-telemetry"
                  onClick={() => setXpTelemetry(!xpTelemetry)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                    xpTelemetry ? "bg-accent" : "bg-white/10"
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-[#09090B] transition-transform duration-200 ${
                    xpTelemetry ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
 
              {/* Toggle 2 - Reminders */}
              <div className="flex items-center justify-between p-4 bg-white/[0.005] border border-white/[0.02] rounded">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-accent" /> Continuous Reminders
                  </h4>
                  <p className="text-sm text-zinc-500 mt-1 max-w-sm font-light">Enable daily reminder alerts for your active habits.</p>
                </div>
                <button
                  id="toggle-notifications"
                  onClick={() => setNotifications(!notifications)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                    notifications ? "bg-accent" : "bg-white/10"
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-[#09090B] transition-transform duration-200 ${
                    notifications ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Secure data indicator */}
          <div className="p-4 rounded bg-[#0C0C10]/40 border border-white/[0.03] flex items-start gap-4 shadow-xl">
            <Lock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">Private Sandbox Isolation</h4>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed font-light">
                Coaching telemetry logs and diagnostic parameters remain strictly sandboxed in private local state arrays. No external tracking is enabled.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
