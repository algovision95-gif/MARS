import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Search, FileText, BarChart3, Zap, 
  Sparkles, Loader2, CheckCircle2, AlertCircle, Activity
} from 'lucide-react';

const AGENT_STEPS = {
  planner: [
    'Initializing research roadmap...',
    'Analyzing query parameters...',
    'Allocating intelligence resources...',
    'Structuring multi-agent pipeline...'
  ],
  hunter: [
    'Scanning global research databases...',
    'Filtering high-impact journals...',
    'Verifying source credibility...',
    'Aggregating relevant literature...'
  ],
  paperReader: [
    'Parsing technical methodology...',
    'Extracting data insights...',
    'Summarizing experimental results...',
    'Validating research claims...'
  ],
  comparator: [
    'Cross-referencing datasets...',
    'Identifying pattern correlations...',
    'Building comparative models...',
    'Synthesizing consensus data...'
  ],
  contradictionDetector: [
    'Checking evidence consistency...',
    'Isolating conflicting research data...',
    'Flagging potential biases...',
    'Calculating evidence reliability...'
  ],
  gapFinder: [
    'Mapping existing knowledge boundaries...',
    'Identifying unexplored research areas...',
    'Extrapolating future trends...',
    'Generating innovation roadmaps...'
  ]
};

export default function AgentLiveOperations({ agents, loading }) {
  const [activeSteps, setActiveSteps] = useState({});
  const [completedAgents, setCompletedAgents] = useState([]);

  useEffect(() => {
    if (!loading) {
      setCompletedAgents(agents);
      return;
    }

    setCompletedAgents([]);
    const intervals = [];

    agents.forEach((agentId) => {
      let stepIndex = 0;
      if (!AGENT_STEPS[agentId]) {
        console.warn(`Agent ${agentId} not found in STEPS`);
        return;
      }
      setActiveSteps(prev => ({ ...prev, [agentId]: AGENT_STEPS[agentId][0] }));

      const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < AGENT_STEPS[agentId].length) {
          setActiveSteps(prev => ({ ...prev, [agentId]: AGENT_STEPS[agentId][stepIndex] }));
        } else {
          // Simulation: wait a bit before completing
          if (Math.random() > 0.8) {
             setCompletedAgents(prev => Array.from(new Set([...prev, agentId])));
             clearInterval(interval);
          }
        }
      }, 3000 + Math.random() * 2000);
      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, [loading, agents]);

  if (!loading && completedAgents.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={12} className="text-[var(--accent)]" />
          Live Agent Orchestration
        </h3>
        {loading && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            PROCESSING
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agentId) => {
          const isCompleted = !loading || completedAgents.includes(agentId);
          const currentStep = activeSteps[agentId] || 'Initializing...';
          
          return (
            <motion.div 
              key={agentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border transition-all ${
                isCompleted 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-[var(--card-bg)] border-[var(--border)]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <AgentIcon id={agentId} active={!isCompleted} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isCompleted ? 'text-emerald-400' : 'text-[var(--text-main)]'}`}>
                    {agentId.replace(/([A-Z])/g, ' $1')}
                  </span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <Loader2 size={14} className="text-[var(--accent)] animate-spin" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className={`text-[10px] ${isCompleted ? 'text-emerald-500/60' : 'text-[var(--text-dim)]'} italic`}>
                  {isCompleted ? 'Analysis complete' : currentStep}
                </p>
                <div className="w-full h-1 rounded-full bg-[var(--border)] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '60%' }}
                    transition={{ duration: 10, ease: "linear" }}
                    className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-[var(--accent)]'} shadow-[0_0_8px_var(--accent-glow)]`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AgentIcon({ id, active }) {
  const icons = {
    planner: Brain,
    hunter: Search,
    paperReader: FileText,
    comparator: BarChart3,
    contradictionDetector: Zap,
    gapFinder: Sparkles
  };
  const Icon = icons[id] || Brain;
  return (
    <div className={`p-2 rounded-xl ${active ? 'bg-[var(--accent)]/10' : 'bg-[var(--card-bg)]'}`}>
      <Icon size={14} className={active ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'} />
    </div>
  );
}


