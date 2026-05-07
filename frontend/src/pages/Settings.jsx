import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Trash2, History, SlidersHorizontal, Loader2,
  AlertTriangle, LogOut, Zap, Cpu, Moon, Sun, Eye, EyeOff,
  Network, BookOpen, GitCompare, Target, Sparkles, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AGENT_LIST = [
  { id: 'planner', name: 'Research Planner', icon: Cpu, color: '#34d399' },
  { id: 'hunter', name: 'Literature Hunter', icon: Network, color: '#a855f7' },
  { id: 'paperReader', name: 'Paper Analyzer', icon: BookOpen, color: '#ec4899' },
  { id: 'comparator', name: 'Comparison Engine', icon: GitCompare, color: '#3b82f6' },
  { id: 'contradictionDetector', name: 'Contradiction Detector', icon: AlertTriangle, color: '#fbbf24' },
  { id: 'insightGenerator', name: 'Insight Generator', icon: Sparkles, color: '#06b6d4' },
];

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${enabled ? 'bg-accent' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, loading: authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Persisted settings
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('av_darkMode') !== 'false');
  const [aiMode, setAiMode] = useState(() => localStorage.getItem('av_aiMode') || 'fast');
  const [resultView, setResultView] = useState(() => localStorage.getItem('av_resultView') || 'detailed');
  const [showGraph, setShowGraph] = useState(() => localStorage.getItem('av_showGraph') !== 'false');
  const [enabledAgents, setEnabledAgents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('av_enabledAgents')) || AGENT_LIST.map(a => a.id); }
    catch { return AGENT_LIST.map(a => a.id); }
  });

  // Persist to localStorage on change
  useEffect(() => { localStorage.setItem('av_darkMode', darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem('av_aiMode', aiMode); }, [aiMode]);
  useEffect(() => { localStorage.setItem('av_resultView', resultView); }, [resultView]);
  useEffect(() => { localStorage.setItem('av_showGraph', showGraph); }, [showGraph]);
  useEffect(() => { localStorage.setItem('av_enabledAgents', JSON.stringify(enabledAgents)); }, [enabledAgents]);

  if (authLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;
  if (!user) return <Navigate to="/" />;

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear ALL your research history? This cannot be undone.')) return;
    setLoading(true);
    try {
      await api.delete('/research/history');
      showMsg('Research history cleared successfully.');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to clear history.', 'error');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Permanently delete your account and all data?')) return;
    setLoading(true);
    try { await api.delete('/auth/me'); logout(); }
    catch (err) { showMsg(err.response?.data?.message || 'Failed to delete account.', 'error'); setLoading(false); }
  };

  const toggleAgent = (agentId) => {
    setEnabledAgents(prev => {
      if (prev.includes(agentId)) {
        if (prev.length <= 1) return prev; // Must keep at least 1
        return prev.filter(a => a !== agentId);
      }
      return [...prev, agentId];
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-darkPanel/80 backdrop-blur-sm border-b border-white/5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
          <SettingsIcon size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Settings</h1>
          <p className="text-xs text-gray-500">Manage preferences, agents, and data</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          {/* Toast */}
          {msg.text && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm border flex items-center gap-3 ${msg.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
              <AlertTriangle size={16} /> {msg.text}
            </motion.div>
          )}

          {/* ─── Appearance ─── */}
          <Section title="Appearance" icon={<Moon size={16} className="text-accentPurple" />}>
            <div className="glass-card rounded-2xl p-5 space-y-1">
              <Toggle label="Dark Mode" description="Switch between dark and light themes" enabled={darkMode} onChange={setDarkMode} />
              <div className="border-t border-white/5" />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Result View</p>
                  <p className="text-xs text-gray-500 mt-0.5">Compact shows summaries, Detailed shows full agent outputs</p>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                  <button
                    onClick={() => setResultView('compact')}
                    className={`px-3 py-1.5 text-xs font-medium transition-all ${resultView === 'compact' ? 'bg-accent/20 text-accent' : 'text-gray-500 hover:text-gray-300'}`}
                  >Compact</button>
                  <button
                    onClick={() => setResultView('detailed')}
                    className={`px-3 py-1.5 text-xs font-medium transition-all ${resultView === 'detailed' ? 'bg-accent/20 text-accent' : 'text-gray-500 hover:text-gray-300'}`}
                  >Detailed</button>
                </div>
              </div>
            </div>
          </Section>

          {/* ─── AI Engine ─── */}
          <Section title="AI Engine" icon={<Zap size={16} className="text-accentAmber" />}>
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-4">Select which AI backend to use for research queries.</p>
              <div className="grid grid-cols-2 gap-3">
                <AIOption
                  active={aiMode === 'fast'}
                  onClick={() => setAiMode('fast')}
                  icon={<Zap size={18} className="text-accentAmber" />}
                  title="Fast Mode"
                  subtitle="OpenRouter / Groq"
                  desc="Quick results, lower latency"
                  color="#fbbf24"
                />
                <AIOption
                  active={aiMode === 'deep'}
                  onClick={() => setAiMode('deep')}
                  icon={<Cpu size={18} className="text-accentPurple" />}
                  title="Deep Mode"
                  subtitle="Gemini Pro"
                  desc="Thorough analysis, higher quality"
                  color="#a855f7"
                />
              </div>
            </div>
          </Section>

          {/* ─── Agent Configuration ─── */}
          <Section title="Agent Configuration" icon={<Network size={16} className="text-accentGreen" />}>
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-4">Enable or disable individual agents for your research pipeline.</p>
              <div className="space-y-1">
                {AGENT_LIST.map((agent, i) => (
                  <React.Fragment key={agent.id}>
                    {i > 0 && <div className="border-t border-white/5" />}
                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}>
                          <agent.icon size={14} style={{ color: agent.color }} />
                        </div>
                        <span className="text-sm text-white font-medium">{agent.name}</span>
                      </div>
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${enabledAgents.includes(agent.id) ? '' : 'bg-white/10'}`}
                        style={enabledAgents.includes(agent.id) ? { background: agent.color } : {}}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${enabledAgents.includes(agent.id) ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Section>

          {/* ─── Graph ─── */}
          <Section title="Knowledge Graph" icon={<Eye size={16} className="text-accentBlue" />}>
            <div className="glass-card rounded-2xl p-5">
              <Toggle label="Show Graph Visualization" description="Display Neo4j knowledge graph connections in research results" enabled={showGraph} onChange={setShowGraph} />
            </div>
          </Section>

          {/* ─── Data Management ─── */}
          <Section title="Data Management" icon={<History size={16} className="text-accentAmber" />}>
            <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Clear Research History</p>
                <p className="text-xs text-gray-500 mt-0.5">Permanently delete all past research queries and results.</p>
              </div>
              <button onClick={handleClearHistory} disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-colors flex items-center gap-2 whitespace-nowrap">
                <History size={14} /> Clear All
              </button>
            </div>
          </Section>

          {/* ─── Danger Zone ─── */}
          <Section title="Danger Zone" icon={<AlertTriangle size={16} className="text-red-400" />} danger>
            <div className="glass-card rounded-2xl p-5 border-red-500/20 bg-red-500/3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and all data. Irreversible.</p>
              </div>
              <button onClick={handleDeleteAccount} disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-2 whitespace-nowrap">
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </Section>

          {/* Account Bar */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Logged in as <span className="text-white font-medium">{user.email}</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent border border-accent/20">{user.subscriptionType}</span>
            </div>
            <button onClick={logout} className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, danger, children }) {
  return (
    <div className="space-y-3">
      <h2 className={`text-sm font-bold flex items-center gap-2 ${danger ? 'text-red-400' : 'text-white'}`}>
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function AIOption({ active, onClick, icon, title, subtitle, desc, color }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all ${active ? 'border-white/20 bg-white/5' : 'border-white/5 hover:border-white/10 hover:bg-white/3'}`}
      style={active ? { borderColor: `${color}40`, background: `${color}08` } : {}}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <p className="text-xs font-medium" style={{ color }}>{subtitle}</p>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </button>
  );
}
