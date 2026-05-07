import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity, ShieldCheck, Globe, Sparkles } from 'lucide-react';

const agentInfo = {
  'planner': { label: 'Strategic Planning', icon: Activity, color: '#3b82f6' },
  'hunter': { label: 'Literature Hunting', icon: Globe, color: '#ec4899' },
  'paperReader': { label: 'Deep Extraction', icon: Cpu, color: '#10b981' },
  'comparator': { label: 'Cross-Synthesis', icon: Zap, color: '#fbbf24' },
  'contradictionDetector': { label: 'Integrity Shield', icon: ShieldCheck, color: '#ef4444' },
  'gapFinder': { label: 'Innovation Mining', icon: Sparkles, color: '#8b5cf6' }
};

export default function AgentStatusBar({ activeAgents = [] }) {
  const isAnyActive = activeAgents.length > 0;

  return (
    <div className="w-full h-12 flex items-center justify-center px-6 relative pointer-events-none">
      <AnimatePresence>
        {isAnyActive ? (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="flex items-center gap-6 px-6 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border)] backdrop-blur-md shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center gap-2 pr-4 border-r border-[var(--border)]">
              <div className="relative">
                <Globe size={14} className="text-[var(--accent)] animate-spin-slow" />
                <div className="absolute inset-0 bg-[var(--accent)]/20 blur-sm rounded-full" />
              </div>
              <span className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-widest">Global Intelligence Active</span>
            </div>

            <div className="flex items-center gap-4">
              {activeAgents.map((id, i) => {
                const info = agentInfo[id] || { label: id, icon: Zap, color: 'var(--text-main)' };
                const Icon = info.icon;
                return (
                  <motion.div 
                    key={id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <Icon size={12} style={{ color: info.color }} className="animate-pulse" />
                    <span className="text-[10px] font-medium text-[var(--text-muted)]">{info.label}</span>
                    {i < activeAgents.length - 1 && <div className="w-1 h-1 rounded-full bg-[var(--border)]" />}
                  </motion.div>
                );
              })}
            </div>

            <div className="pl-4 border-l border-[var(--border)]">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-0.5 bg-[var(--accent)] rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest"
          >
            <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
            AlgoVision Research Engine — Core v2.4.0
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Line Glow */}
      <AnimatePresence>
        {isAnyActive && (
          <motion.div 
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent origin-center"
            style={{ boxShadow: '0 0 15px var(--accent-glow)' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
