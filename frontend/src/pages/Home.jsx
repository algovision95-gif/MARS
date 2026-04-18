import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Telescope, ArrowRight, Crown, Zap } from 'lucide-react';
import AgentStatusBar from '../components/AgentStatusBar';
import SearchInput from '../components/SearchInput';
import AgentCard from '../components/AgentCard';
import ResearchResult from '../components/ResearchResult';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const examples = [
  'Transformer architecture in NLP research',
  'Climate change mitigation strategies 2024',
  'CRISPR gene editing applications',
  'Large language model alignment techniques',
];

export default function Home() {
  const { user, setLoginModalOpen } = useAuth();
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [safetyWarning, setSafetyWarning] = useState('');

  // Search — available to EVERYONE (guests and logged-in)
  const runSearch = async ({ query, fileId }) => {
    if (!query && !fileId) return;
    setLoading(true);
    setError('');
    setSafetyWarning('');
    setResult(null);
    try {
      const payload = { query: query || 'Analyze this file' };
      const { data } = await api.post('/research/search', payload);

      if (data.safetyFlag && data.safetyFlag !== 'clean') {
        setSafetyWarning(data.safetyMessage);
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Full agent pipeline — requires login + PRO/PREMIUM
  const runAgents = async ({ query, fileId }) => {
    if (!user) { setLoginModalOpen(true); return; }
    if (!query && !fileId) return;

    if (user.subscriptionType === 'FREE') {
      setError('🔒 Agent access requires a PRO or PREMIUM subscription. Upgrade below!');
      return;
    }

    setAgentLoading(true);
    setError('');
    setSafetyWarning('');
    setResult(null);
    setActiveAgents(['planner', 'hunter', 'paper-reader', 'comparator', 'contradiction']);
    try {
      const payload = { query: query || 'Analyze this file' };
      if (fileId) payload.fileIds = [fileId];
      const { data } = await api.post('/research', payload);

      if (data.safetyFlag && data.safetyFlag !== 'clean') {
        setSafetyWarning(data.safetyMessage);
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAgentLoading(false);
      setActiveAgents([]);
    }
  };

  const handleAgentClick = (type) => {
    if (!user) { setLoginModalOpen(true); return; }
    if (!result) {
      setError('Please run a search first, then use agents for deeper analysis.');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AgentStatusBar activeAgents={activeAgents} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

          {/* Hero */}
          <AnimatePresence>
            {!result && !loading && !agentLoading && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="text-center pt-8 pb-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-accent/20 text-xs text-accent mb-6">
                  <Sparkles size={12} className="animate-pulse" />
                  Multi-Agent AI Research Platform
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Research at the speed<br />
                  <span className="gradient-text">of intelligence</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
                  Search freely without login. Activate AI agents with PRO/PREMIUM for deep analysis.
                </p>

                {/* Example queries */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {examples.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => runSearch({ query: ex })}
                      className="text-xs px-3 py-1.5 rounded-full glass border border-white/8 text-gray-400 hover:text-white hover:border-accent/30 transition-all"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Safety Warning */}
          <AnimatePresence>
            {safetyWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm leading-relaxed"
              >
                <p className="font-semibold mb-1">⚠️ Safety Alert</p>
                <p>{safetyWarning}</p>
                <button onClick={() => setSafetyWarning('')} className="mt-2 text-xs underline text-red-400">Dismiss</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {(loading || agentLoading) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-accentPurple/40 animate-spin-slow" />
                    <div className="absolute inset-4 rounded-full bg-accent/20 flex items-center justify-center">
                      <Telescope size={16} className="text-accent" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {agentLoading ? 'AI Agents Analyzing...' : 'Searching...'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {agentLoading
                        ? 'Planner → Hunter → Reader → Comparator → Detector'
                        : 'Generating comprehensive AI response'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm text-center"
              >
                {error}
                <button onClick={() => setError('')} className="ml-3 underline">Dismiss</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Input — always visible, no login required */}
          <SearchInput
            onSubmit={runSearch}
            onAgentSubmit={runAgents}
            loading={loading || agentLoading}
            user={user}
            onLoginRequired={() => setLoginModalOpen(true)}
          />

          {/* Results */}
          <AnimatePresence>
            {result && (
              <ResearchResult
                result={result}
                onClose={() => setResult(null)}
                onRunAgents={user ? () => runAgents({ query: result.query }) : null}
                user={user}
                onLoginRequired={() => setLoginModalOpen(true)}
              />
            )}
          </AnimatePresence>

          {/* Agent Cards */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 font-medium">
              Available Agents {!user && <span className="text-accentAmber ml-2">(Login Required)</span>}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AgentCard type="planner" loading={agentLoading && activeAgents.includes('planner')} onClick={handleAgentClick} requiresLogin={!user} />
              <AgentCard type="hunter" loading={agentLoading && activeAgents.includes('hunter')} onClick={handleAgentClick} requiresLogin={!user} />
              <AgentCard type="paperReader" loading={agentLoading && activeAgents.includes('paper-reader')} onClick={handleAgentClick} requiresLogin={!user} />
              <AgentCard type="comparator" loading={agentLoading && activeAgents.includes('comparator')} onClick={handleAgentClick} requiresLogin={!user} />
              <AgentCard type="contradictionDetector" loading={agentLoading && activeAgents.includes('contradiction')} onClick={handleAgentClick} requiresLogin={!user} />
            </div>
          </div>

          {/* Upgrade Banner */}
          {user && user.subscriptionType === 'FREE' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between p-5 rounded-2xl glass border border-accentAmber/20 glow-amber"
            >
              <div className="flex items-center gap-3">
                <Crown size={20} className="text-accentAmber" />
                <div>
                  <p className="text-sm font-semibold text-white">Upgrade to unlock AI Agents</p>
                  <p className="text-xs text-gray-400">PRO ₹499/mo · 100MB/day &nbsp;|&nbsp; PREMIUM ₹999/mo · 1GB/day</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => api.post('/subscription/subscribe', { plan: 'PRO' }).then(() => window.location.reload())}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-accentAmber/20 border border-accentAmber/40 text-accentAmber text-xs font-bold hover:bg-accentAmber/30 transition-colors"
                >
                  <Zap size={12} /> PRO
                </button>
                <button
                  onClick={() => api.post('/subscription/subscribe', { plan: 'PREMIUM' }).then(() => window.location.reload())}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accentAmber text-dark text-xs font-bold hover:bg-accentAmber/90 transition-colors"
                >
                  <Crown size={12} /> PREMIUM <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
