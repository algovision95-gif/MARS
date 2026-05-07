import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, User, Brain, Layout, Moon, Sun, 
  Monitor, Bell, Database, Activity, LogOut, 
  Shield, CreditCard, ChevronRight, Check, Zap,
  Sparkles, Search, Crown, Trash2, Palette, Lock, Key, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsModal({ onClose, initialTab = 'general' }) {
  const { 
    user, logout, 
    theme, setTheme,
    responseMode, setResponseMode,
    researchDepth, setResearchDepth,
    autoSelectAgents, setAutoSelectAgents,
    liveOpsEnabled, setLiveOpsEnabled
  } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'customization', name: 'Customization', icon: Palette },
    { id: 'ai', name: 'AI Preferences', icon: Brain },
    { id: 'appearance', name: 'Appearance', icon: Moon },
    { id: 'billing', name: 'Subscription', icon: CreditCard },
    { id: 'account', name: 'Account & Security', icon: Lock },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Workspace Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">Live Agent Monitoring</p>
                    <p className="text-xs text-[var(--text-muted)]">Show real-time orchestration status during research</p>
                  </div>
                  <button 
                    onClick={() => setLiveOpsEnabled(!liveOpsEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${liveOpsEnabled ? 'bg-accent' : 'bg-[var(--border-strong)]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${liveOpsEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">Interactive Knowledge Graph</p>
                    <p className="text-xs text-[var(--text-muted)]">Visualize research relationships in 3D (Premium)</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-[var(--card-bg)] opacity-50 cursor-not-allowed relative">
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/20" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Research Memory</h3>
              <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Database size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-bold text-[var(--text-main)]">Vector Storage Used</p>
                    <p className="text-xs text-[var(--text-muted)]">1.2GB / 10GB</p>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[12%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-3xl font-bold text-accent shadow-2xl overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.[0] || 'U'
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shadow-lg">
                  <Plus size={14} />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">{user?.fullName || 'Research User'}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-2">{user?.email}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest">
                  {user?.subscriptionType || 'FREE'} PLAN
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest">Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Full Name</p>
                  <input 
                    type="text" 
                    defaultValue={user?.fullName} 
                    className="w-full bg-transparent text-sm font-medium text-[var(--text-main)] outline-none"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Email Address</p>
                  <input 
                    type="email" 
                    defaultValue={user?.email} 
                    disabled
                    className="w-full bg-transparent text-sm font-medium text-[var(--text-muted)] outline-none"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Occupation</p>
                  <input 
                    type="text" 
                    placeholder="e.g. Data Scientist"
                    className="w-full bg-transparent text-sm font-medium text-[var(--text-main)] outline-none placeholder:text-[var(--text-dim)]"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Organization</p>
                  <input 
                    type="text" 
                    placeholder="e.g. AlgoVision Lab"
                    className="w-full bg-transparent text-sm font-medium text-[var(--text-main)] outline-none placeholder:text-[var(--text-dim)]"
                  />
                </div>
              </div>
              <button className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all">
                Save Changes
              </button>
            </div>
            
            <div className="pt-4 border-t border-[var(--border)]">
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-red-500 text-sm font-bold hover:text-red-400 transition-colors"
              >
                <LogOut size={16} /> Logout of Research OS
              </button>
            </div>
          </div>
        );

      case 'customization':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Workspace Aesthetic</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">Glassmorphism Intensity</p>
                    <p className="text-xs text-[var(--text-muted)]">Adjust transparency levels of the UI</p>
                  </div>
                  <input type="range" className="w-24 accent-[var(--accent)]" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">Motion Graphics</p>
                    <p className="text-xs text-[var(--text-muted)]">Enable smooth transitions and floats</p>
                  </div>
                  <button className="w-10 h-5 rounded-full bg-[var(--accent)] relative">
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Research Experience</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">Automatic Citations</p>
                    <p className="text-xs text-[var(--text-muted)]">Always show source links in response</p>
                  </div>
                  <button className="w-10 h-5 rounded-full bg-[var(--accent)] relative">
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">Compact Results View</p>
                    <p className="text-xs text-[var(--text-muted)]">Minimize search output for readability</p>
                  </div>
                  <button className="w-10 h-5 rounded-full bg-[var(--card-bg)] relative">
                    <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-[var(--text-dim)]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Security</h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--card-bg)]/80 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Key size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[var(--text-main)]">Change Password</p>
                      <p className="text-xs text-[var(--text-muted)]">Update your login credentials</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-dim)] group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--card-bg)]/80 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Shield size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[var(--text-main)]">Two-Factor Authentication</p>
                      <p className="text-xs text-[var(--text-muted)]">Add an extra layer of security (Premium)</p>
                    </div>
                  </div>
                  <Crown size={14} className="text-amber-500" />
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-red-500/10">
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
              <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
                <h4 className="text-sm font-bold text-[var(--text-main)] mb-1">Delete Account</h4>
                <p className="text-xs text-[var(--text-muted)] mb-4">Permanently remove your account and all research history. This action cannot be undone.</p>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={14} /> Delete Forever
                </button>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Research Engine Preference</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'standard', name: 'Balanced Engine', desc: 'Optimized for speed and accuracy', icon: Zap },
                  { id: 'analytical', name: 'Analytical Engine', desc: 'Deep logical reasoning chains', icon: Activity },
                  { id: 'creative', name: 'Insight Engine', desc: 'Ideation and gap discovery', icon: Sparkles },
                  { id: 'precise', name: 'Evidence Engine', desc: 'Heavy citation focus', icon: Shield }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setResponseMode(mode.id)}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all text-left ${
                      responseMode === mode.id 
                        ? 'bg-accent/10 border-accent/30 text-[var(--text-main)]' 
                        : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-accent/40'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${responseMode === mode.id ? 'bg-accent/20' : 'bg-[var(--bg-color)]'}`}>
                      <mode.icon size={22} className={responseMode === mode.id ? 'text-accent' : 'text-[var(--text-dim)]'} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{mode.name}</p>
                      <p className="text-[10px] opacity-60 leading-relaxed">{mode.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Research Depth</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'quick', name: 'Quick Scan', desc: 'Surface-level overview (10-20 sources)', icon: Zap },
                  { id: 'standard', name: 'Technical Depth', desc: 'Detailed analysis (50+ sources)', icon: Search },
                  { id: 'deep', name: 'Full Orchestration', desc: 'Recursive agent deep-dive (Unlimited)', icon: Brain, premium: true }
                ].map(depth => (
                  <button
                    key={depth.id}
                    onClick={() => setResearchDepth(depth.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      researchDepth === depth.id 
                        ? 'bg-accent/10 border-accent/30 text-[var(--text-main)]' 
                        : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-accent/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${researchDepth === depth.id ? 'bg-accent/20' : 'bg-[var(--bg-color)]'}`}>
                      <depth.icon size={20} className={researchDepth === depth.id ? 'text-accent' : 'text-[var(--text-dim)]'} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{depth.name}</p>
                      <p className="text-[10px] opacity-60">{depth.desc}</p>
                    </div>
                    {researchDepth === depth.id && <Check size={16} className="text-accent" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Orchestration Settings</h3>
              <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-main)]">Dynamic Agent Selection</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Automatically pick best agents for each query</p>
                </div>
                <button 
                  onClick={() => setAutoSelectAgents(!autoSelectAgents)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${autoSelectAgents ? 'bg-accent' : 'bg-[var(--border-strong)]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoSelectAgents ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-widest mb-4">Interface Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'dark', name: 'Dark', icon: Moon },
                  { id: 'light', name: 'Light', icon: Sun },
                  { id: 'system', name: 'System', icon: Monitor }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                      theme === t.id 
                        ? 'bg-accent/10 border-accent/30 text-[var(--text-main)]' 
                        : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-accent/40'
                    }`}
                  >
                    <t.icon size={24} />
                    <span className="text-xs font-bold uppercase tracking-widest">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <Crown size={40} className="text-amber-500 opacity-20" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">AlgoVision Pro</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">Unlock full multi-agent orchestration, unlimited deep research, and professional export suite.</p>
                
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-bold text-[var(--text-main)]">$49</span>
                  <span className="text-[var(--text-muted)]">/ month</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    'Unlimited Deep Research',
                    'Multi-Agent Collaboration',
                    'Advanced Export (PDF, MD)',
                    'Priority Neural Compute',
                    'Team Workspaces',
                    'Custom AI Instructions'
                  ].map(f => (
                    <div key={f} className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Check size={12} />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>

                <button className="w-full py-4 rounded-2xl btn-gradient text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-accent/20">
                  Upgrade to Pro Workspace
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Billing Cycle</p>
                <p className="text-sm font-bold text-[var(--text-main)]">Monthly</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Next Payment</p>
                <p className="text-sm font-bold text-[var(--text-main)]">May 24, 2024</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-bold text-emerald-500">Active</p>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500 italic text-center py-20">Section coming soon...</div>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl h-[700px] bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-[3rem] overflow-hidden flex transition-colors duration-500"
      >
        {/* Sidebar */}
        <div className="w-72 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col p-8">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 btn-premium flex items-center justify-center p-0">
              <Settings className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Settings</h2>
          </div>

          <div className="flex-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--border)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)]'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-sm font-medium">{tab.name}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t border-[var(--border)]">
            <div className="p-4 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
              <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-1">AlgoVision v2.0</p>
              <p className="text-[10px] text-[var(--text-dim)]">Secure Research OS Environment</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-color)]">
          <div className="flex items-center justify-between p-8 border-b border-[var(--border)]">
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-main)]">{tabs.find(t => t.id === activeTab).name}</h3>
              <p className="text-sm text-[var(--text-muted)]">Configure your professional research workspace.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--card-bg)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border border-[var(--border)]">
              <Zap size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-12 sidebar-scroll">
            {renderTabContent()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
