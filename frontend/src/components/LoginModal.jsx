import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, User as UserIcon, Phone, ArrowRight, Sparkles, Cpu, BookOpen, GitCompare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AlgoVisionLogo from './AlgoVisionLogo';

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, login, signup, googleLogin } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loginModalOpen) { setError(''); setForm({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' }); setMode('login'); }
  }, [loginModalOpen]);

  useEffect(() => {
    if (!loginModalOpen) return;
    window.google?.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (res) => {
        try { await googleLogin(res.credential); } catch (err) { setError('Google login failed'); }
      },
    });
    setTimeout(() => {
      const el = document.getElementById('google-login-btn');
      if (el) window.google?.accounts.id.renderButton(el, { theme: 'filled_black', size: 'large', width: '100%', shape: 'pill' });
    }, 100);
  }, [loginModalOpen, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const features = [
    { icon: Cpu, text: '6 Specialized AI Agents', color: '#34d399' },
    { icon: BookOpen, text: 'Deep Paper Analysis', color: '#ec4899' },
    { icon: GitCompare, text: 'Automated Comparison', color: '#3b82f6' },
  ];

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setLoginModalOpen(false)} />

          {/* Modal — Split Layout */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl mx-4 rounded-3xl overflow-hidden flex bg-[var(--panel-bg)] shadow-2xl shadow-[var(--accent)]/5 border border-[var(--border)]"
            style={{ maxHeight: '90vh' }}
          >
            {/* LEFT — Branding Side */}
            <div className="hidden md:flex flex-col w-[45%] relative overflow-hidden p-10 justify-between border-r border-[var(--border)]">
              {/* Background gradient */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-[var(--accent-purple)]/5 to-transparent opacity-50" />
                <div className="absolute top-1/4 left-1/2 w-[300px] h-[300px] rounded-full bg-[var(--accent)]/5 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[var(--panel-bg)] to-transparent" />
              </div>

              <div className="relative z-10">
                <AlgoVisionLogo size={40} glow />
                <h2 className="text-2xl font-bold text-[var(--text-main)] mt-6 mb-2">AlgoVision AI</h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Multi-Agent Research Intelligence System — Clear Vision Through Algorithms.
                </p>
              </div>

              <div className="relative z-10 space-y-4 mt-8">
                {features.map((f, i) => (
                  <motion.div
                    key={f.text}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}
                    >
                      <f.icon size={16} style={{ color: f.color }} />
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">{f.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 mt-auto pt-10">
                <p className="text-xs text-[var(--text-dim)]">
                  "AlgoVision transformed how our lab handles literature reviews."
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 opacity-50">— Research Team Lead</p>
              </div>
            </div>

            {/* RIGHT — Form Side */}
            <div className="flex-1 p-8 md:p-10 overflow-y-auto relative">
              {/* Close button */}
              <button
                onClick={() => setLoginModalOpen(false)}
                className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors p-1 rounded-lg hover:bg-[var(--card-bg)]"
              >
                <X size={18} />
              </button>

              {/* Mobile Logo */}
              <div className="flex justify-center mb-6 md:hidden">
                <AlgoVisionLogo size={48} glow />
              </div>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-main)]">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {mode === 'login' ? 'Sign in to continue your research' : 'Start your AI research journey'}
                </p>
              </div>

              {/* Google Sign-In */}
              <div id="google-login-btn" className="w-full mb-5" />

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-dim)] uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3 mb-5"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Full Name</label>
                      <div className="relative">
                        <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                        <input
                          type="text" required placeholder="Your full name"
                          value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border)] text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]/40 focus:bg-[var(--card-bg)] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Phone</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                        <input
                          type="tel" placeholder="Optional"
                          value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border)] text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]/40 focus:bg-[var(--card-bg)] transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                    <input
                      type="email" required placeholder="you@example.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border)] text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]/40 focus:bg-[var(--card-bg)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                    <input
                      type="password" required placeholder="••••••••"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border)] text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]/40 focus:bg-[var(--card-bg)] transition-all"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                      <input
                        type="password" required placeholder="••••••••"
                        value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border)] text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]/40 focus:bg-[var(--card-bg)] transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-premium py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2 text-white shadow-xl shadow-[var(--accent)]/10"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-[var(--text-dim)] mt-6">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                  className="text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors font-medium"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
