import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GitCompare, AlertTriangle, Loader2, Lock, ChevronRight, Cpu, Network } from 'lucide-react';

const agentConfig = {
  planner: {
    icon: Cpu,
    title: 'Planner',
    description: 'Breaks down your research query into a structured plan with sub-questions and objectives.',
    color: 'accentGreen',
    gradient: 'from-accentGreen/10 to-accentGreen/5',
    border: 'border-accentGreen/20',
    dot: 'bg-accentGreen',
    tag: 'Step 1',
  },
  hunter: {
    icon: Network,
    title: 'Hunter',
    description: 'Hunts for relevant papers, sources, and evidence related to your research topic.',
    color: 'accentPurple',
    gradient: 'from-accentPurple/10 to-accentPurple/5',
    border: 'border-accentPurple/20',
    dot: 'bg-accentPurple',
    tag: 'Step 2',
  },
  paperReader: {
    icon: BookOpen,
    title: 'Paper Reader',
    description: 'Extracts methodology, datasets, results, limitations, and key contributions.',
    color: 'accent',
    gradient: 'from-accent/10 to-accent/5',
    border: 'border-accent/20',
    dot: 'bg-accent',
    tag: 'Step 3',
  },
  comparator: {
    icon: GitCompare,
    title: 'Comparator',
    description: 'Generates structured comparison tables across multiple research dimensions.',
    color: 'accentAmber',
    gradient: 'from-accentAmber/10 to-accentAmber/5',
    border: 'border-accentAmber/20',
    dot: 'bg-accentAmber',
    tag: 'Step 4',
  },
  contradictionDetector: {
    icon: AlertTriangle,
    title: 'Contradiction Detector',
    description: 'Identifies conflicting claims, logical inconsistencies, and data conflicts.',
    color: 'red-400',
    gradient: 'from-red-400/10 to-red-400/5',
    border: 'border-red-400/20',
    dot: 'bg-red-400',
    tag: 'Step 5',
  },
};

export default function AgentCard({ type, loading, onClick, requiresLogin }) {
  const cfg = agentConfig[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const isLocked = requiresLogin;

  return (
    <motion.button
      id={`agent-card-${type}`}
      onClick={() => onClick?.(type)}
      whileHover={{ y: isLocked ? 0 : -3 }}
      whileTap={{ scale: 0.98 }}
      className={`glass rounded-2xl p-5 text-left w-full relative overflow-hidden border ${cfg.border} group transition-all ${isLocked ? 'opacity-70' : ''}`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-60`} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-${cfg.color}/15 border border-${cfg.color}/25 flex items-center justify-center`}>
            {loading
              ? <Loader2 size={18} className={`text-${cfg.color} animate-spin`} />
              : isLocked ? <Lock size={18} className="text-gray-500" />
              : <Icon size={18} className={`text-${cfg.color}`} />
            }
          </div>
          <div className="flex items-center gap-2">
            {isLocked && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-gray-500 text-xs">
                <Lock size={9} /> Login
              </div>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full bg-${cfg.color}/10 text-${cfg.color} font-medium border border-${cfg.color}/15`}>
              {cfg.tag}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-white mb-1.5">{cfg.title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed pr-2">{cfg.description}</p>

        <div className={`flex items-center gap-1 mt-4 text-xs font-medium text-${cfg.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
          {loading ? 'Analyzing...' : isLocked ? '🔒 PRO/PREMIUM required' : 'Runs automatically with analysis'}
          <ChevronRight size={12} />
        </div>
      </div>
    </motion.button>
  );
}
