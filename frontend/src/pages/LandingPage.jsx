import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Cpu, Network, BookOpen, GitCompare,
  AlertTriangle, Search, Zap, ChevronRight, Play, Shield, Target, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AlgoVisionLogo from '../components/AlgoVisionLogo';

/* ─── Particles Background ─── */
function ParticleField() {
  return (
    <div className="particles">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 8}s`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            background: i % 3 === 0
              ? 'rgba(236,72,153,0.3)'
              : i % 3 === 1
              ? 'rgba(168,85,247,0.25)'
              : 'rgba(59,130,246,0.2)',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated Section Wrapper ─── */
function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Navbar ─── */
function LandingNav() {
  const { setLoginModalOpen } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('landing-scroll');
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 50);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlgoVisionLogo size={28} glow />
          <span className="text-base font-bold text-[var(--text-main)] tracking-tight">AlgoVision</span>
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-medium">AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-dim)]">
          <a href="#features" className="hover:text-[var(--text-main)] transition-colors">Features</a>
          <a href="#agents" className="hover:text-[var(--text-main)] transition-colors">Agents</a>
          <a href="#demo" className="hover:text-[var(--text-main)] transition-colors">Demo</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoginModalOpen(true)}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors px-4 py-2"
          >
            Login
          </button>
          <button
            onClick={() => setLoginModalOpen(true)}
            className="btn-gradient text-sm px-5 py-2.5 rounded-xl text-white"
          >
            Start Research
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const { setLoginModalOpen } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Ambient gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--accent)]/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--accent)]/5 blur-[100px] opacity-50" />
      </div>

      <ParticleField />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="animate-pulse-glow">
            <AlgoVisionLogo size={80} glow />
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--accent)]/20 text-xs text-[var(--accent)] mb-8"
        >
          <Sparkles size={12} className="animate-pulse" />
          Multi-Agent Research Intelligence System
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-5xl md:text-7xl font-extrabold text-[var(--text-main)] mb-6 leading-[1.1] tracking-tight"
        >
          Clear Vision Through{' '}
          <span className="gradient-text">Algorithms</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Deploy 6 specialized AI agents to analyze research papers, detect contradictions,
          and uncover hidden insights — all in one intelligent platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => setLoginModalOpen(true)}
            className="btn-gradient text-base px-8 py-3.5 rounded-xl flex items-center gap-2 group text-white shadow-xl shadow-[var(--accent)]/20"
          >
            Start Research
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#demo"
            className="px-8 py-3.5 rounded-xl flex items-center gap-2 bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--border)] hover:bg-[var(--card-bg)]/80 transition-all"
          >
            <Play size={16} />
            Watch Demo
          </a>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-[var(--border)]"
        >
          {[
            { value: '6', label: 'AI Agents' },
            { value: '50+', label: 'Models Supported' },
            { value: '10x', label: 'Faster Analysis' },
            { value: '99%', label: 'Accuracy Rate' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold gradient-text">{value}</p>
              <p className="text-xs text-[var(--text-dim)] mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Features / Agents Section ─── */
const agents = [
  {
    icon: Cpu,
    title: 'Research Planner',
    desc: 'Breaks down complex queries into structured research plans with objectives and sub-questions.',
    color: '#34d399',
    tag: 'Agent 01',
  },
  {
    icon: Network,
    title: 'Literature Hunter',
    desc: 'Hunts and gathers relevant papers, sources, and evidence from vast academic databases.',
    color: '#a855f7',
    tag: 'Agent 02',
  },
  {
    icon: BookOpen,
    title: 'Paper Analyzer',
    desc: 'Extracts methodology, datasets, key results, limitations, and future work from papers.',
    color: '#ec4899',
    tag: 'Agent 03',
  },
  {
    icon: GitCompare,
    title: 'Comparison Engine',
    desc: 'Generates structured comparison tables across methodology, accuracy, and datasets.',
    color: '#3b82f6',
    tag: 'Agent 04',
  },
  {
    icon: AlertTriangle,
    title: 'Contradiction Detector',
    desc: 'Identifies conflicting claims, logical inconsistencies, and data conflicts between papers.',
    color: '#fbbf24',
    tag: 'Agent 05',
  },
  {
    icon: Target,
    title: 'Research Gap Finder',
    desc: 'Discovers unexplored areas, missing methodologies, and potential research opportunities.',
    color: '#06b6d4',
    tag: 'Agent 06',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-widest mb-3">Intelligent Agents</p>
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
            Six Agents. One Mission.
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            Each agent is specialized to handle a different aspect of research analysis, working together in a coordinated pipeline.
          </p>
        </RevealSection>

        <div id="agents" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent, i) => (
            <RevealSection key={agent.title} delay={i * 0.08}>
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 h-full group cursor-default hover:border-[var(--accent)]/30 transition-all shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="feature-icon w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
                  >
                    <agent.icon size={22} style={{ color: agent.color }} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ color: agent.color, background: `${agent.color}12`, border: `1px solid ${agent.color}20` }}
                  >
                    {agent.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[var(--text-main)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                  {agent.title}
                </h3>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">{agent.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Demo Preview Section ─── */
function DemoSection() {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Analyzing "Transformer architectures in NLP"...';
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [isInView]);

  const fakeAgentStatus = [
    { name: 'Planner Agent', status: 'Complete', color: '#34d399' },
    { name: 'Hunter Agent', status: 'Complete', color: '#a855f7' },
    { name: 'Paper Reader', status: 'Active', color: '#ec4899' },
    { name: 'Comparator', status: 'Queued', color: '#3b82f6' },
  ];

  const fakePapers = [
    { title: 'Attention Is All You Need', year: '2017', method: 'Transformer', acc: '41.0 BLEU' },
    { title: 'BERT: Pre-training of Deep Bidirectional Transformers', year: '2019', method: 'Masked LM', acc: '93.5 F1' },
    { title: 'GPT-4 Technical Report', year: '2023', method: 'Autoregressive', acc: '86.4 MMLU' },
  ];

  return (
    <section id="demo" ref={ref} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <RevealSection className="text-center mb-14">
          <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-widest mb-3">Live Preview</p>
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
            See It In Action
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">
            Watch how AlgoVision agents collaborate to deliver structured research insights.
          </p>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div className="bg-[var(--bg-color)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl shadow-[var(--accent)]/5">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--card-bg)]/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 h-7 rounded-lg bg-[var(--bg-color)] flex items-center px-3">
                <span className="text-xs text-[var(--text-dim)]">algovision.ai/research</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Query input */}
              <div className="bg-[var(--card-bg)] rounded-xl p-4 flex items-center gap-3 border border-[var(--border)]">
                <Search size={16} className="text-[var(--text-dim)]" />
                <span className="text-sm text-[var(--text-main)]">
                  {typedText}
                  <span className="typing-cursor" />
                </span>
              </div>

              {/* Agent Status */}
              <div className="flex flex-wrap gap-2">
                {fakeAgentStatus.map((a) => (
                  <div key={a.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)] text-xs border border-[var(--border)]">
                    <span
                      className={`w-2 h-2 rounded-full ${a.status === 'Active' ? 'animate-pulse-dot' : ''}`}
                      style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }}
                    />
                    <span className="text-[var(--text-muted)]">{a.name}</span>
                    <span style={{ color: a.color }} className="font-semibold">{a.status}</span>
                  </div>
                ))}
              </div>

              {/* Fake results */}
              <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--card-bg)]/30">
                      <th className="text-left px-4 py-2.5 text-[var(--accent)] font-semibold uppercase tracking-wider">Paper</th>
                      <th className="text-left px-4 py-2.5 text-[var(--accent)] font-semibold uppercase tracking-wider">Year</th>
                      <th className="text-left px-4 py-2.5 text-[var(--accent)] font-semibold uppercase tracking-wider">Method</th>
                      <th className="text-left px-4 py-2.5 text-[var(--accent)] font-semibold uppercase tracking-wider">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fakePapers.map((p, i) => (
                      <motion.tr
                        key={p.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 1.5 + i * 0.3 }}
                        className="border-b border-[var(--border)] last:border-none"
                      >
                        <td className="px-4 py-3 text-[var(--text-main)] font-medium">{p.title}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{p.year}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{p.method}</td>
                        <td className="px-4 py-3">
                          <span className="text-emerald-500 font-semibold">{p.acc}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Key Finding', text: 'Self-attention mechanisms outperform recurrent architectures by 12x on parallelization.', color: '#34d399', icon: Eye },
                  { label: 'Contradiction', text: 'GPT-4 claims superiority while BERT shows higher F1 on specific NLU benchmarks.', color: '#fbbf24', icon: AlertTriangle },
                  { label: 'Research Gap', text: 'No study compares efficiency of sparse vs. dense attention on low-resource languages.', color: '#3b82f6', icon: Target },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 2.5 + i * 0.2 }}
                    className="rounded-xl p-4 border border-[var(--border)]"
                    style={{ background: `${card.color}08` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <card.icon size={14} style={{ color: card.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: card.color }}>
                        {card.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Enter Your Topic', desc: 'Type any research question, topic, or upload papers for analysis.', icon: Search },
    { num: '02', title: 'Agents Activate', desc: 'Six specialized AI agents analyze, compare, and cross-reference automatically.', icon: Zap },
    { num: '03', title: 'Get Insights', desc: 'Receive structured findings, contradiction alerts, and research gap analysis.', icon: Eye },
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <RevealSection className="text-center mb-16">
          <p className="text-sm font-semibold text-[var(--accent)] uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-main)]">Three Simple Steps</h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <RevealSection key={step.num} delay={i * 0.15}>
              <div className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[var(--accent)]/5">
                  <step.icon size={24} className="text-[var(--accent)]" />
                </div>
                <p className="text-xs font-bold text-[var(--accent)]/60 tracking-widest mb-2">{step.num}</p>
                <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <ChevronRight size={20} className="hidden md:block text-[var(--text-dim)]/20 absolute top-8 -right-6" />
                )}
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  const { setLoginModalOpen } = useAuth();
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto text-center relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--accent)]/8 via-[var(--accent)]/5 to-[var(--accent)]/8 blur-3xl" />
        <div className="relative bg-[var(--card-bg)] rounded-3xl p-12 md:p-16 border border-[var(--border)] shadow-2xl">
          <AlgoVisionLogo size={48} glow className="mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4">
            Ready to Accelerate Your Research?
          </h2>
          <p className="text-[var(--text-muted)] text-lg mb-8 max-w-lg mx-auto">
            Join researchers using AlgoVision to analyze papers 10x faster with AI-powered multi-agent intelligence.
          </p>
          <button
            onClick={() => setLoginModalOpen(true)}
            className="btn-gradient text-base px-10 py-4 rounded-xl inline-flex items-center gap-2 group text-white shadow-xl shadow-[var(--accent)]/20"
          >
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlgoVisionLogo size={20} />
          <span className="text-sm text-[var(--text-dim)]">AlgoVision AI</span>
        </div>
        <p className="text-xs text-[var(--text-dim)]">
          © {new Date().getFullYear()} AlgoVision. Clear Vision Through Algorithms.
        </p>
        <div className="flex items-center gap-6 text-xs text-[var(--text-dim)]">
          <span className="hover:text-[var(--text-muted)] cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-[var(--text-muted)] cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-[var(--text-muted)] cursor-pointer transition-colors">Contact</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  return (
    <div id="landing-scroll" className="h-screen overflow-y-auto bg-[var(--bg-color)] noise">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
}
