import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, GitCompare, AlertTriangle, ChevronDown,
  ExternalLink, CheckCircle2, Share2, Copy, Check,
  TrendingUp, Network, Search, Cpu, Zap, Lock
} from 'lucide-react';
import api from '../services/api';

const AGENT_TABS = [
  { id: 'search',      label: 'AI Answer',    icon: Search,        color: 'accent' },
  { id: 'planner',     label: 'Planner',       icon: Cpu,           color: 'accentGreen' },
  { id: 'hunter',      label: 'Hunter',        icon: Network,       color: 'accentPurple' },
  { id: 'paperReader', label: 'Paper Reader',  icon: BookOpen,      color: 'accent' },
  { id: 'comparator',  label: 'Comparator',    icon: GitCompare,    color: 'accentPurple' },
  { id: 'contradictions', label: 'Contradictions', icon: AlertTriangle, color: 'accentAmber' },
];

/* ── Markdown-style renderer ────────────────────── */
function MarkdownContent({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-white mt-4 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold text-accent mt-4 mb-1">{line.slice(2)}</h1>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold text-gray-100 mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} className="flex gap-2">
            <span className="text-accent mt-1 flex-shrink-0">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
        if (/^\d+\. /.test(line)) return (
          <div key={i} className="flex gap-2">
            <span className="text-accentPurple flex-shrink-0 font-semibold">{line.match(/^\d+/)[0]}.</span>
            <span>{line.replace(/^\d+\. /, '')}</span>
          </div>
        );
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white">{line.slice(2, -2)}</p>;
        if (line === '') return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

/* ── Confidence Meter ───────────────────────────── */
function ConfidenceMeter({ score }) {
  if (!score) return null;
  const color = score >= 80 ? 'text-accentGreen' : score >= 60 ? 'text-accentAmber' : 'text-red-400';
  const bg = score >= 80 ? 'bg-accentGreen' : score >= 60 ? 'bg-accentAmber' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <TrendingUp size={14} className={color} />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">AI Confidence</span>
        <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${bg}`} />
        </div>
        <span className={`text-xs font-bold ${color}`}>{score}%</span>
      </div>
    </div>
  );
}

/* ── Share Button ───────────────────────────────── */
function ShareButton({ researchId, user, onLoginRequired }) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleShare = async () => {
    if (!user) { onLoginRequired?.(); return; }
    if (!researchId) return;
    setSharing(true);
    try {
      const { data } = await api.post(`/research/${researchId}/share`);
      setShareUrl(data.shareUrl);
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-gray-400 hover:text-white hover:border-accent/30 transition-all"
    >
      {copied ? <Check size={12} className="text-accentGreen" /> : <Share2 size={12} />}
      {copied ? 'Copied!' : sharing ? 'Sharing...' : 'Share'}
    </button>
  );
}

/* ── Agent Result Panels ────────────────────────── */
function SearchPanel({ data }) {
  return (
    <div className="p-1">
      <MarkdownContent text={data} />
    </div>
  );
}

function PlannerPanel({ data }) {
  if (!data) return <EmptyPanel />;
  return (
    <div className="space-y-4">
      {data.objective && <InfoBlock label="Objective" value={data.objective} color="text-accentGreen" />}
      {data.approach && <InfoBlock label="Approach" value={data.approach} color="text-blue-300" />}
      {data.expectedOutcome && <InfoBlock label="Expected Outcome" value={data.expectedOutcome} color="text-accentPurple" />}
      {data.subQuestions?.length > 0 && (
        <div className="p-4 rounded-xl bg-white/3 border border-white/6">
          <p className="text-xs font-semibold text-accentGreen mb-3 uppercase tracking-wider">Sub-Questions</p>
          <ul className="space-y-1.5">
            {data.subQuestions.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-accentGreen font-bold flex-shrink-0">{i + 1}.</span> {q}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.keyAreas?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.keyAreas.map((a, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-accentGreen/10 border border-accentGreen/20 text-accentGreen">{a}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function HunterPanel({ data }) {
  if (!data) return <EmptyPanel />;
  return (
    <div className="space-y-4">
      {data.summary && <InfoBlock label="Summary" value={data.summary} color="text-accentPurple" />}
      {data.papers?.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-accentPurple uppercase tracking-wider">Found Papers</p>
          {data.papers.map((p, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/6">
              <p className="text-sm font-semibold text-white">{p.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.authors} {p.year && `· ${p.year}`}</p>
              <p className="text-xs text-gray-400 mt-2">{p.keyFinding}</p>
              <p className="text-xs text-accentPurple mt-1">{p.relevance}</p>
            </div>
          ))}
        </div>
      )}
      {data.keywords?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.keywords.map((k, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-accentPurple/10 border border-accentPurple/20 text-accentPurple">{k}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function PaperReaderPanel({ data }) {
  if (!data) return <EmptyPanel />;
  const fields = [
    { key: 'summary', label: 'Executive Summary', color: 'text-accent' },
    { key: 'methodology', label: 'Methodology', color: 'text-blue-300' },
    { key: 'dataset', label: 'Dataset & Data', color: 'text-purple-300' },
    { key: 'results', label: 'Key Results', color: 'text-green-300' },
    { key: 'limitations', label: 'Limitations', color: 'text-red-300' },
    { key: 'futureWork', label: 'Future Work', color: 'text-accentAmber' },
  ];
  return (
    <div className="space-y-4">
      {fields.map(({ key, label, color }) => data[key] && (
        <InfoBlock key={key} label={label} value={data[key]} color={color} />
      ))}
      {data.keyContributions?.length > 0 && (
        <div className="p-4 rounded-xl bg-white/3 border border-white/6">
          <p className="text-xs font-semibold text-accent mb-3 uppercase tracking-wider">Key Contributions</p>
          {data.keyContributions.map((c, i) => (
            <div key={i} className="flex gap-2 text-sm text-gray-300 mb-1.5">
              <span className="text-accent flex-shrink-0">✓</span> {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComparatorPanel({ data }) {
  if (!data || !Array.isArray(data)) return <EmptyPanel />;
  const strengthColors = {
    High: 'text-accentGreen bg-accentGreen/10 border-accentGreen/20',
    Medium: 'text-accentAmber bg-accentAmber/10 border-accentAmber/20',
    Low: 'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="result-table">
        <thead>
          <tr>
            <th>Aspect</th>
            <th>Evaluation</th>
            <th>Strength</th>
            <th>Evidence</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <td className="font-semibold text-white whitespace-nowrap">{row.aspect}</td>
              <td>{row.evaluation}</td>
              <td>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${strengthColors[row.strength] || strengthColors.Medium}`}>
                  {row.strength}
                </span>
              </td>
              <td className="text-gray-500 text-xs">{row.evidence}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContradictionsPanel({ data }) {
  if (!data || !Array.isArray(data)) return <EmptyPanel />;
  if (data.length === 0) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-accentGreen/5 border border-accentGreen/15 text-accentGreen">
        <CheckCircle2 size={18} />
        <p className="text-sm font-medium">No contradictions detected in the provided content.</p>
      </div>
    );
  }
  const severityColors = { High: 'border-l-red-500 bg-red-500/5', Medium: 'border-l-accentAmber bg-accentAmber/5', Low: 'border-l-gray-500 bg-white/3' };
  return (
    <div className="space-y-3">
      {data.map((c, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
          className={`p-4 rounded-xl border border-white/8 border-l-2 ${severityColors[c.severity] || severityColors.Medium}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.severity === 'High' ? 'text-red-400 bg-red-400/10' : c.severity === 'Medium' ? 'text-accentAmber bg-accentAmber/10' : 'text-gray-400 bg-white/5'}`}>
              {c.severity} Severity
            </span>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{c.type}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-lg bg-white/4">
              <p className="text-xs text-gray-500 mb-1">Claim A</p>
              <p className="text-xs text-gray-300">{c.claim1}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/4">
              <p className="text-xs text-gray-500 mb-1">Claim B</p>
              <p className="text-xs text-gray-300">{c.claim2}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{c.explanation}</p>
        </motion.div>
      ))}
    </div>
  );
}

function InfoBlock({ label, value, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-white/3 border border-white/6">
      <p className={`text-xs font-semibold ${color} mb-2 uppercase tracking-wider`}>{label}</p>
      <p className="text-sm text-gray-300 leading-relaxed">{value}</p>
    </motion.div>
  );
}

function EmptyPanel() {
  return (
    <div className="flex items-center justify-center py-10 text-gray-600 gap-2 text-sm">
      <Lock size={14} /> No data available for this agent
    </div>
  );
}

/* ── Main Component ─────────────────────────────── */
export default function ResearchResult({ result, onClose, onRunAgents, user, onLoginRequired }) {
  const [activeTab, setActiveTab] = useState('search');
  if (!result) return null;

  const hasAgentData = result.paperReader || result.planner || result.hunter;
  const isGuestResult = result.isGuestResult;

  // Decide which tabs to show
  const visibleTabs = AGENT_TABS.filter(t => {
    if (t.id === 'search') return result.searchResult;
    if (t.id === 'planner') return result.plannerOutput;
    if (t.id === 'hunter') return result.hunterOutput;
    if (t.id === 'paperReader') return result.paperReader;
    if (t.id === 'comparator') return result.comparator;
    if (t.id === 'contradictions') return result.contradictions !== undefined;
    return false;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/8 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">Research Query</p>
          <p className="text-sm font-semibold text-white truncate">{result.query}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ConfidenceMeter score={result.confidenceScore} />
          <ShareButton researchId={result.researchId} user={user} onLoginRequired={onLoginRequired} />
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xs px-2 py-1 rounded-lg hover:bg-white/5">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Upgrade prompt for guests / FREE users */}
      {(isGuestResult || (user && user.subscriptionType === 'FREE')) && onRunAgents && (
        <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between bg-accentAmber/5">
          <p className="text-xs text-accentAmber">🔬 Want deeper analysis? Run all 5 AI agents on this topic.</p>
          <button
            onClick={() => user ? onRunAgents() : onLoginRequired?.()}
            className="text-xs px-3 py-1.5 rounded-lg bg-accentAmber text-dark font-bold hover:bg-accentAmber/90 transition-colors flex-shrink-0 ml-3"
          >
            Run Agents
          </button>
        </div>
      )}

      {/* Tabs */}
      {visibleTabs.length > 1 && (
        <div className="flex border-b border-white/8 px-2 pt-2 overflow-x-auto">
          {visibleTabs.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap relative flex-shrink-0 ${
                activeTab === id
                  ? `text-${color} bg-${color}/8 border-b-2 border-${color}`
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/4'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-5 max-h-[65vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {activeTab === 'search' && <SearchPanel data={result.searchResult} />}
            {activeTab === 'planner' && <PlannerPanel data={result.plannerOutput} />}
            {activeTab === 'hunter' && <HunterPanel data={result.hunterOutput} />}
            {activeTab === 'paperReader' && <PaperReaderPanel data={result.paperReader} />}
            {activeTab === 'comparator' && <ComparatorPanel data={result.comparator} />}
            {activeTab === 'contradictions' && <ContradictionsPanel data={result.contradictions} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
