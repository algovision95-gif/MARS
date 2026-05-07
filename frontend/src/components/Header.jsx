import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Crown, Moon, Sun, 
  Search, ChevronRight, LayoutDashboard,
  Brain, FileText, GitCompare, Sparkles, Activity, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AlgoVisionLogo from './AlgoVisionLogo';

export default function Header({ 
  activeAgents = [], 
  activeProjectId, 
  projects = [],
  onOpenSettings,
  onOpenPremium 
}) {
  const { user, theme, toggleTheme } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeProject = projects.find(p => p._id === activeProjectId);

  return (
    <header className={`sticky top-0 w-full z-[100] transition-all duration-500 ${
      scrolled ? 'h-14 glass-strong shadow-2xl' : 'h-20 premium-header'
    }`}>
      <div className="h-full w-full mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand + Project Context */}
        <div className="flex items-center gap-4 flex-shrink-0 min-w-0 max-w-[30%]">
          <div className={`flex items-center gap-3 cursor-pointer group ${user ? 'lg:hidden' : ''}`} onClick={() => window.location.href = '/'}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
              <AlgoVisionLogo size={20} />
            </div>
            <div className="hidden sm:block truncate">
              <h1 className="text-sm font-black tracking-tighter text-[var(--text-main)] uppercase leading-none">AlgoVision</h1>
            </div>
          </div>

          <div className="h-6 w-px bg-[var(--border)] hidden lg:block" />

          <div className="hidden sm:flex items-center gap-2 min-w-0">
            {activeProject ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--border)] max-w-full">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: activeProject.color || 'var(--accent-blue)', color: activeProject.color || 'var(--accent-blue)' }} />
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest truncate">{activeProject.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--border)]">
                <LayoutDashboard size={10} className="text-[var(--text-dim)]" />
                <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-widest">Global</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Agent Orchestration */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          <AnimatePresence mode="wait">
            {activeAgents.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center w-full max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[7px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] whitespace-nowrap animate-pulse">
                    Orchestrating {activeAgents.length} Agents
                  </span>
                </div>
                <div className="w-full h-0.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    style={{ width: '100%' }}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center opacity-40">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={10} className="text-[var(--text-dim)]" />
                  <span className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em] whitespace-nowrap">Neural Engine Idle</span>
                </div>
                <div className="w-20 h-px bg-[var(--border)] rounded-full" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: User Profile */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 max-w-[40%] justify-end">
          {user && (
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
              <div className="hidden lg:block text-right max-w-[100px]">
                <p className="text-[10px] font-bold text-[var(--text-main)] leading-none truncate uppercase">{user.fullName || user.name}</p>
                <p className="text-[7px] font-black text-[var(--accent)] uppercase tracking-widest mt-1">
                  Verified Agent
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--border)] to-transparent border border-[var(--border)] p-0.5 shadow-xl flex-shrink-0">
                 <div className="w-full h-full rounded-[0.5rem] bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] font-bold text-xs">
                        {user.fullName?.[0] || 'U'}
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

  );
}

function AgentMiniIcon({ id }) {
  const icons = {
    planner: Brain,
    hunter: Search,
    paperReader: FileText,
    comparator: GitCompare,
    contradictionDetector: Zap,
    gapFinder: Sparkles
  };
  const Icon = icons[id] || Brain;
  return <Icon size={12} className="text-accent" />;
}
