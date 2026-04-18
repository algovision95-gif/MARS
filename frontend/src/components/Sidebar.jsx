import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Home, LayoutDashboard, Settings,
  History, LogOut, Crown, ChevronRight, Zap, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', auth: true },
  { to: '/admin', icon: Shield, label: 'Admin', role: 'ADMIN' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ history = [], onNewResearch }) {
  const { user, logout, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState('');

  const filtered = history.filter((h) =>
    h.query?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const handleNew = () => {
    if (!user) { setLoginModalOpen(true); return; }
    if (onNewResearch) onNewResearch();
    navigate('/dashboard');
  };

  return (
    <aside className="flex flex-col h-full w-64 glass border-r border-white/5 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accentPurple flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-dark font-bold" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">MARS OS</h1>
          <p className="text-xs text-gray-500">Research Synthesizer</p>
        </div>
      </div>

      {/* New Research Button */}
      <div className="px-3 pt-4 pb-2">
        <button
          id="new-research-btn"
          onClick={handleNew}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent/20 to-accentPurple/20 border border-accent/20 text-accent text-sm font-semibold hover:from-accent/30 hover:to-accentPurple/30 transition-all group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
          New Research
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-accent/30 transition-colors"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-0.5">
        {navLinks.map(({ to, icon: Icon, label, auth, role }) => {
          if (role && user?.role !== role) return null;
          if (auth && !user) return null;
          return (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* History */}
      <div className="flex-1 sidebar-scroll px-3 py-2 mt-1">
        <p className="text-xs font-semibold text-gray-600 px-2 mb-2 uppercase tracking-widest flex items-center gap-2">
          <History size={11} /> Recent
        </p>
        {user ? (
          filtered.length > 0 ? (
            <div className="space-y-0.5">
              {filtered.slice(0, 20).map((h, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all truncate flex items-center gap-2 group"
                >
                  <ChevronRight size={10} className="flex-shrink-0 text-gray-600 group-hover:text-accent transition-colors" />
                  <span className="truncate">{h.query}</span>
                </motion.button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600 px-2 py-4 text-center">No history yet</p>
          )
        ) : (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="w-full text-xs text-gray-600 hover:text-accent px-2 py-4 text-center transition-colors"
          >
            Sign in to see history
          </button>
        )}
      </div>

      {/* User Footer */}
      <div className="border-t border-white/5 p-3">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accentPurple/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent border border-accent/20">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.email}</p>
              <div className="flex items-center gap-1">
                {user.subscriptionType === 'PREMIUM' ? (
                  <span className="text-xs text-accentAmber flex items-center gap-0.5">
                    <Crown size={10} /> Premium
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Free plan</span>
                )}
              </div>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-dark bg-gradient-to-r from-accent to-accentPurple hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
