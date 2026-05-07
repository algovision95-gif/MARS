import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, RefreshCw, Zap, Crown, 
  ArrowRight, MessageSquare, ShieldAlert 
} from 'lucide-react';

export default function ResearchError({ type, onRetry, onSwitchMode, onUpgrade }) {
  const configs = {
    quota_limit: {
      icon: Crown,
      title: 'Advanced Research Capacity reached',
      message: 'AlgoVision is currently experiencing high AI research traffic. Your workspace remains active, but deep agent orchestration is temporarily limited for your current tier.',
      color: 'text-amber-500',
      bg: 'bg-[var(--card-bg)]',
      border: 'border-amber-500/20',
      action: { label: 'Upgrade for Priority', icon: Crown, onClick: onUpgrade, primary: true }
    },
    rate_limit: {
      icon: Zap,
      title: 'Deep Research Temporarily Busy',
      message: 'Our primary intelligence nodes are currently at peak capacity. You can retry shortly or switch to a faster research mode.',
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--card-bg)]',
      border: 'border-[var(--accent)]/20',
      action: { label: 'Retry Research', icon: RefreshCw, onClick: onRetry, primary: true }
    },
    partial: {
      icon: ShieldAlert,
      title: 'Synthesized Intelligence Active',
      message: 'Some live external AI sources are temporarily unreachable. We have generated a research synthesis using your local context and cached data.',
      color: 'text-emerald-500',
      bg: 'bg-[var(--card-bg)]',
      border: 'border-emerald-500/20',
      action: { label: 'Try Deep Dive Again', icon: Zap, onClick: onRetry, primary: false }
    },
      server_error: {
      icon: AlertTriangle,
      title: 'Research Synchronization Delay',
      message: 'Our research agents encountered an orchestration hurdle. Your data is safe; please attempt the synthesis again or use Quick Mode.',
      color: 'text-[var(--text-dim)]',
      bg: 'bg-[var(--card-bg)]',
      border: 'border-[var(--border)]',
      action: { label: 'Retry Research', icon: RefreshCw, onClick: onRetry, primary: true }
    },
    default: {
      icon: AlertTriangle,
      title: 'Research Interruption',
      message: 'Our agents encountered an unexpected obstacle. You can try a simplified search or retry the full orchestration.',
      color: 'text-[var(--text-dim)]',
      bg: 'bg-[var(--card-bg)]',
      border: 'border-[var(--border)]',
      action: { label: 'Retry with Quick Mode', icon: MessageSquare, onClick: onSwitchMode, primary: true }
    }
  };

  const config = configs[type] || configs.default;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`w-full max-w-2xl mx-auto p-8 rounded-[2rem] border ${config.border} ${config.bg} backdrop-blur-xl relative overflow-hidden shadow-2xl`}
    >
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 blur-[80px] -mr-32 -mt-32 ${config.color.includes('[var') ? 'bg-[var(--accent)]' : config.color.replace('text', 'bg')}`} />
      
      <div className="relative z-10 text-center">
        <div className={`w-16 h-16 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
          <Icon size={32} className={config.color} />
        </div>

        <h2 className="text-2xl font-bold text-[var(--text-main)] mb-4">{config.title}</h2>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8 max-w-md mx-auto">
          {config.message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={config.action.onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              config.action.primary 
                ? 'btn-gradient text-white shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02]' 
                : 'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--card-bg)]/80'
            }`}
          >
            <config.action.icon size={14} />
            {config.action.label}
          </button>
          
          <button
            onClick={onSwitchMode}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
            Switch to Quick Mode
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Suggested Actions List */}
      <div className="mt-10 pt-8 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="p-4 rounded-xl bg-[var(--card-bg)]/50 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors cursor-pointer group">
          <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">Stability Tip</p>
          <p className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)]">Run fewer agents simultaneously for faster processing.</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card-bg)]/50 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors cursor-pointer group">
          <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-1">Smart Routing</p>
          <p className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)]">Switch to GPT-4o-mini for rapid overview research.</p>
        </div>
      </div>
    </motion.div>
  );
}
