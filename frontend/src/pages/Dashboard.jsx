import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, UploadCloud, History, BarChart3, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchInput from '../components/SearchInput';
import AgentStatusBar from '../components/AgentStatusBar';
import ResearchResult from '../components/ResearchResult';
import api from '../services/api';

export default function Dashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [subStatus, setSubStatus] = useState(null);
  const [resLoading, setResLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeAgents, setActiveAgents] = useState([]);
  const [error, setError] = useState('');

  if (authLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;
  if (!user) return <Navigate to="/" />;

  useEffect(() => {
    Promise.all([
      api.get('/research/history').then(r => setHistory(r.data)).catch(() => {}),
      api.get('/subscription/status').then(r => setSubStatus(r.data)).catch(() => {}),
    ]).finally(() => setHistLoading(false));
  }, []);

  const runResearch = async ({ query, fileId }) => {
    if (!query && !fileId) return;
    setResLoading(true);
    setError('');
    setResult(null);
    setActiveAgents(['paper-reader', 'comparator', 'contradiction']);
    try {
      const payload = { query: query || 'Analyze this file' };
      if (fileId) payload.fileIds = [fileId];
      const { data } = await api.post('/research', payload);
      setResult(data);
      // Refresh history
      api.get('/research/history').then(r => setHistory(r.data)).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Research failed');
    } finally {
      setResLoading(false);
      setActiveAgents([]);
    }
  };

  const handleUpgrade = async () => {
    try {
      await api.post('/subscription/subscribe');
      await refreshUser();
      const r = await api.get('/subscription/status');
      setSubStatus(r.data);
    } catch {}
  };

  const used = subStatus?.dailyUsageMB ?? user.dailyUsageMB ?? 0;
  const limit = subStatus?.dailyLimitMB ?? (user.subscriptionType === 'FREE' ? 100 : 1024);
  const pct = Math.min((used / limit) * 100, 100);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AgentStatusBar activeAgents={activeAgents} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Plan', value: user.subscriptionType, color: user.subscriptionType === 'PREMIUM' ? 'text-accentAmber' : 'text-accent' },
              { label: 'Uploads Today', value: user.uploadsToday ?? 0, color: 'text-white' },
              { label: 'Storage Used', value: `${used.toFixed(1)}MB`, color: 'text-white' },
              { label: 'Researches', value: history.length, color: 'text-accentPurple' },
            ].map(({ label, value, color }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4"
              >
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </motion.div>
            ))}
          </div>

          {/* Storage Bar */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">Daily Storage</span>
              <span className="text-gray-300">{used.toFixed(1)} / {limit}MB</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${pct > 85 ? 'bg-accentRed' : 'bg-gradient-to-r from-accent to-accentPurple'}`}
              />
            </div>
            {pct > 80 && user.subscriptionType === 'FREE' && (
              <p className="text-xs text-accentRed mt-2">Storage almost full. <button onClick={handleUpgrade} className="underline">Upgrade</button></p>
            )}
          </div>

          {/* Research Input */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">New Research</p>
            <SearchInput onSubmit={runResearch} loading={resLoading} />
          </div>

          {/* Loading */}
          {resLoading && (
            <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin text-accent" />
              <span className="text-sm">Running AI agents...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Result */}
          {result && <ResearchResult result={result} onClose={() => setResult(null)} />}

          {/* Upgrade Card */}
          {user.subscriptionType === 'FREE' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between p-5 rounded-2xl glass border border-accentAmber/25"
            >
              <div className="flex items-center gap-3">
                <Crown size={22} className="text-accentAmber" />
                <div>
                  <p className="font-semibold text-white text-sm">Upgrade to PREMIUM</p>
                  <p className="text-xs text-gray-400 mt-0.5">1GB/day • Advanced analysis • Priority</p>
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accentAmber text-dark text-sm font-bold hover:opacity-90 transition-opacity"
              >
                ₹499/mo <ArrowRight size={14} />
              </button>
            </motion.div>
          )}
          {user.subscriptionType === 'PREMIUM' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-accentAmber/20 text-accentAmber text-xs">
              <Crown size={14} /> Premium Active — 1GB/day storage
            </div>
          )}

          {/* History */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium flex items-center gap-2">
              <History size={12} /> Research History
            </p>
            {histLoading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 size={14} className="animate-spin" /> Loading...</div>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-600 py-6 text-center">No research yet. Start your first query above!</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 10).map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-4 py-3 glass rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <BarChart3 size={14} className="text-accentPurple flex-shrink-0" />
                    <span className="text-sm text-gray-300 flex-1 truncate">{h.query}</span>
                    <span className="text-xs text-gray-600">{new Date(h.createdAt).toLocaleDateString()}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
