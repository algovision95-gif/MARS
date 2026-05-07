import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Crown, Zap, Cpu, Network, BookOpen, GitCompare, AlertTriangle, Target } from 'lucide-react';
import AgentStatusBar from '../components/AgentStatusBar';
import SearchInput from '../components/SearchInput';
import AgentCard from '../components/AgentCard';
import AgentSelectionPanel from '../components/AgentSelectionPanel';
import ResearchResult from '../components/ResearchResult';
import AlgoVisionLogo from '../components/AlgoVisionLogo';
import { useAuth } from '../context/AuthContext';
import PremiumPopup from '../components/PremiumPopup';
import ResearchError from '../components/ResearchError';
import api from '../services/api';

const examples = [
  'Transformer architecture in NLP research',
  'Climate change mitigation strategies 2024',
  'CRISPR gene editing applications',
  'Large language model alignment techniques',
];

export default function Home({ onAgentsChange, activeProjectId }) {
  const { 
    user, 
    researchDepth, autoSelectAgents, setLoginModalOpen
  } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState(null); // null, 'quota', 'rate_limit', 'default'
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState(['planner', 'hunter', 'paperReader']);

  const handleToggleAgent = (id) => {
    if (id === 'all') {
      setSelectedAgents(['planner', 'hunter', 'paperReader', 'comparator', 'contradictionDetector', 'gapFinder']);
    } else if (id === 'none') {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(prev => 
        prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
      );
    }
  };

  const runSearch = async ({ query, fileId, mode, model, agents }) => {
    if (!query?.trim()) return;
    setErrorType(null);
    setResult(null);
    setLoading(true);
    
    // Auto-select agents based on mode or use provided agents
    const agentsToRun = agents || (mode === 'deep' ? ['all'] : ['paperReader', 'comparator', 'contradictionDetector']);
    onAgentsChange?.(agentsToRun);
    
    try {
      const payload = { 
        query,
        mode: mode || 'quick',
        model: model || 'openai/gpt-4o-mini',
        projectId: activeProjectId || null,
        agents: agentsToRun
      };
      
      const endpoint = (user && (mode !== 'quick' || agents)) ? '/research' : '/research/search';
      const { data } = await api.post(endpoint, payload);
      setResult(data);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.type) {
        setErrorType(errorData.type);
      } else if (err.response?.status === 403) {
        setErrorType('quota_limit');
      } else if (err.response?.status === 429) {
        setErrorType('rate_limit');
      } else {
        setErrorType('server_error');
      }
    } finally {
      setLoading(false);
      onAgentsChange?.([]);
    }
  };

  const runAgents = async () => {
    if (!user) { setLoginModalOpen(true); return; }
    if (!result?.query) return;
    onAgentsChange?.(['paperReader', 'comparator', 'contradictionDetector']);
    setLoading(true);
    try {
      const { data } = await api.post('/research', { query: result.query, runAgents: true });
      setResult(data);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.type) {
        setErrorType(errorData.type);
      } else if (err.response?.status === 403) {
        setErrorType('quota_limit');
      } else if (err.response?.status === 429) {
        setErrorType('rate_limit');
      } else {
        setErrorType('server_error');
      }
    } finally {
      setLoading(false);
      onAgentsChange?.([]);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex flex-col items-center justify-center min-h-full px-6 py-12"
            >
              {/* Logo + Heading */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                  <AlgoVisionLogo size={56} glow />
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-accent/20 text-xs text-accent mb-6">
                  <Sparkles size={12} className="animate-pulse" />
                  AlgoVision — AI Research OS
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-4 leading-tight">
                  What would you like to<br />
                  <span className="gradient-text">research today?</span>
                </h1>
                <p className="text-[var(--text-color)] opacity-60 text-sm max-w-lg mx-auto">
                  Search freely without login. Activate AI agents for deep analysis.
                </p>
              </div>

              {/* Example chips */}
              <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => runSearch({ query: ex })}
                    className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full glass border border-white/5 text-gray-500 hover:text-white hover:border-accent/20 hover:bg-accent/5 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="w-full max-w-3xl mx-auto space-y-6">
                <SearchInput
                  onSubmit={runSearch}
                  loading={loading}
                  user={user}
                  onLoginRequired={() => setLoginModalOpen(true)}
                  onOpenPremium={() => setShowPremiumPopup(true)}
                />

                <AgentSelectionPanel 
                  selectedAgents={selectedAgents}
                  onToggleAgent={handleToggleAgent}
                  onRun={() => {
                    const input = document.getElementById('research-input');
                    const query = input?.value || '';
                    if (query) {
                      runSearch({ query, agents: selectedAgents });
                    } else {
                      alert('Please enter a research topic first.');
                    }
                  }}
                  loading={loading}
                  isPremium={user?.subscriptionType !== 'FREE'}
                  onOpenPremium={() => setShowPremiumPopup(true)}
                />
              </div>

              {/* Agent Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-12 max-w-6xl w-full px-4">
                {['planner', 'hunter', 'paperReader', 'comparator', 'contradictionDetector', 'gapFinder'].map((type) => (
                  <AgentCard
                    key={type}
                    type={type}
                    loading={false}
                    requiresLogin={!user}
                    onClick={() => {
                      if (!user) { setLoginModalOpen(true); return; }
                      const input = document.getElementById('research-input');
                      const query = input?.value || '';
                      if (query) {
                        runSearch({ query, mode: 'standard', agents: [type] });
                      } else {
                        alert('Please enter a research query first to run this agent.');
                      }
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto w-full px-6 py-8 space-y-12"
            >
              {errorType ? (
                <ResearchError 
                  type={errorType} 
                  onRetry={() => { setErrorType(null); result?.query && runSearch({ query: result.query }); }}
                  onSwitchMode={() => { setErrorType(null); setResult(null); }}
                  onUpgrade={() => setShowPremiumPopup(true)}
                />
              ) : (
                <ResearchResult
                  result={result}
                  onClose={() => setResult(null)}
                  onRunAgents={runAgents}
                  onRunSearch={runSearch}
                  user={user}
                  onLoginRequired={() => setLoginModalOpen(true)}
                />
              )}

              {/* Search again + Agent Selection */}
              <div className="max-w-4xl mx-auto space-y-6 pt-10">
                <SearchInput
                  onSubmit={runSearch}
                  loading={loading}
                  user={user}
                  onLoginRequired={() => setLoginModalOpen(true)}
                  onOpenPremium={() => setShowPremiumPopup(true)}
                />
                
                <AgentSelectionPanel 
                  selectedAgents={selectedAgents}
                  onToggleAgent={handleToggleAgent}
                  onRun={() => {
                    const input = document.getElementById('research-input');
                    const query = input?.value || result?.query || '';
                    if (query) {
                      runSearch({ query, agents: selectedAgents });
                    } else {
                      alert('Please enter a research topic first.');
                    }
                  }}
                  loading={loading}
                  isPremium={user?.subscriptionType !== 'FREE'}
                  onOpenPremium={() => setShowPremiumPopup(true)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showPremiumPopup && <PremiumPopup onClose={() => setShowPremiumPopup(false)} />}
      </AnimatePresence>
    </div>
  );
}
