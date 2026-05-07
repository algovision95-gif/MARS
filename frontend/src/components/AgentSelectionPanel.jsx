import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Search, FileText, BarChart3, Zap, 
  Sparkles, Lock, CheckCircle2 
} from 'lucide-react';

const AGENTS = [
  { id: 'planner', label: 'Planner', icon: Brain, color: 'text-blue-400', premium: false },
  { id: 'hunter', label: 'Hunter', icon: Search, color: 'text-pink-400', premium: false },
  { id: 'paperReader', label: 'Paper Reader', icon: FileText, color: 'text-emerald-400', premium: false },
  { id: 'comparator', label: 'Comparator', icon: BarChart3, color: 'text-amber-400', premium: true },
  { id: 'contradictionDetector', label: 'Contradictions', icon: Zap, color: 'text-red-400', premium: true },
  { id: 'gapFinder', label: 'Gap Finder', icon: Sparkles, color: 'text-purple-400', premium: true },
];

export default function AgentSelectionPanel({ 
  selectedAgents, 
  onToggleAgent, 
  onRun, 
  loading, 
  isPremium,
  onOpenPremium,
  compact = false
}) {
  return (
    <div className={`w-full max-w-5xl mx-auto transition-all duration-500 ${
      compact 
        ? 'mt-2 p-2 rounded-3xl bg-[var(--card-bg)] border-[var(--border)]' 
        : 'mt-6 p-4 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--border)]'
    } backdrop-blur-md shadow-2xl`}>
      <div className={`flex flex-wrap items-center justify-between ${compact ? 'gap-2' : 'gap-4'}`}>
        <div className="flex flex-wrap items-center gap-2">
          {!compact && (
            <>
              <button
                onClick={() => {
                  if (selectedAgents.length === AGENTS.length) {
                    onToggleAgent('none'); // Custom signal to clear all
                  } else {
                    onToggleAgent('all'); // Custom signal to select all
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                  selectedAgents.length === AGENTS.length
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                    : 'bg-[var(--bg-color)] text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--text-muted)]'
                }`}
              >
                {selectedAgents.length === AGENTS.length ? 'Deselect All' : 'Select All'}
              </button>
              <div className="h-6 w-px bg-[var(--border)] mx-2" />
            </>
          )}

          {AGENTS.map((agent) => {
            const isSelected = selectedAgents.includes(agent.id);
            const isLocked = agent.premium && !isPremium;
            
            return (
              <button
                key={agent.id}
                onClick={() => {
                  if (isLocked) {
                    onOpenPremium?.();
                  } else {
                    onToggleAgent(agent.id);
                  }
                }}
                className={`flex items-center gap-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  compact ? 'px-3 py-1.5' : 'px-4 py-2.5'
                } ${
                  isSelected 
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30 shadow-lg shadow-[var(--accent)]/5' 
                    : 'bg-transparent text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--text-muted)] hover:text-[var(--text-muted)]'
                } ${isLocked ? 'opacity-40 grayscale' : ''}`}
              >
                {!compact && (
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[var(--accent)]/10' : 'bg-[var(--bg-color)]'}`}>
                    <agent.icon size={14} className={isSelected ? agent.color : 'text-[var(--text-dim)]'} />
                  </div>
                )}
                {compact && isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mr-1" />}
                {agent.label}
                {isLocked && <Lock size={9} className="ml-0.5 opacity-50" />}
              </button>
            );
          })}
        </div>

        {!compact && (
          <button
            onClick={onRun}
            disabled={loading || selectedAgents.length === 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
              selectedAgents.length > 0 && !loading
                ? 'btn-premium text-white hover:scale-105 active:scale-95'
                : 'bg-[var(--card-bg)] text-[var(--text-dim)] cursor-not-allowed border border-[var(--border)]'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles size={16} />
                </motion.div>
                Orchestrating...
              </div>
            ) : (
              'Run Selected Agents'
            )}
          </button>
        )}
      </div>
      
      {!compact && (
        <div className="mt-3 flex items-center justify-center gap-4 text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Multi-Agent Engine Active</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span>{isPremium ? 'Unlimited Orchestration' : 'Free: Max 2 Agents'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
