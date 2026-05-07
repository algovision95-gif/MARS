import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, Mic, Video, Image, ArrowUp, Loader2, X, Paperclip, 
  Zap, Brain, Microscope, ChevronDown, Lock, ShieldCheck, Sparkles, Globe 
} from 'lucide-react';
import api from '../services/api';

const uploadOptions = [
  { icon: FileText, label: 'Upload Document', accept: '.pdf,.txt,.docx', type: 'document', color: 'text-accent' },
  { icon: Mic,      label: 'Upload Audio',    accept: '.mp3,.wav',       type: 'audio',    color: 'text-accentPurple' },
  { icon: Video,    label: 'Upload Video',    accept: '.mp4',            type: 'video',    color: 'text-accentAmber' },
  { icon: Image,    label: 'Generate Image',  accept: null,              type: 'image',    color: 'text-accentGreen' },
];

const researchModes = [
  { id: 'quick', label: 'Quick', icon: Zap, desc: 'Fast, concise overview', color: 'text-yellow-400', premium: false },
  { id: 'standard', label: 'Standard', icon: Brain, desc: 'Balanced research depth', color: 'text-blue-400', premium: false },
  { id: 'deep', label: 'Deep Research', icon: Microscope, desc: 'Exhaustive agent analysis', color: 'text-purple-400', premium: true },
];

const modelOptions = [
  { id: 'openai/gpt-4o-mini', label: 'Fast Research Engine', provider: 'GPT-4o Mini', premium: false },
  { id: 'openai/gpt-4o', label: 'AlgoVision Synthesizer', provider: 'GPT-4o', premium: false },
  { id: 'google/gemini-pro-1.5', label: 'Gemini-style Deep Research', provider: 'Gemini 1.5 Pro', premium: true },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude-style Reasoning', provider: 'Claude 3.5 Sonnet', premium: true },
  { id: 'multi-agent-hybrid', label: 'Multi-Agent Hybrid', provider: 'Orchestrated', premium: true },
];

export default function SearchInput({ onSubmit, loading, user, onLoginRequired, onOpenPremium, compact = false }) {
  const [query, setQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedMode, setSelectedMode] = useState('standard');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const isPremium = user?.subscriptionType === 'PREMIUM' || user?.subscriptionType === 'PRO';

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim() && !uploadedFile) return;
    
    // Check if selected mode/model is premium
    const mode = researchModes.find(m => m.id === selectedMode);
    const model = modelOptions.find(m => m.id === selectedModel);
    
    if ((mode?.premium || model?.premium) && !isPremium) {
      onOpenPremium?.();
      return;
    }

    onSubmit({ 
      query: query.trim(), 
      fileId: uploadedFile?.fileId,
      mode: selectedMode,
      model: selectedModel
    });
    setQuery('');
    setUploadedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const triggerUpload = (option) => {
    if (!user) { onLoginRequired?.(); setShowUpload(false); return; }
    if (!option.accept) { alert('Image generation coming soon!'); setShowUpload(false); return; }
    fileInputRef.current.accept = option.accept;
    fileInputRef.current.click();
    setShowUpload(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedFile({ fileId: data.fileId, name: data.filename, type: data.type });
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative space-y-4">
      {/* Settings Bar (Mode & Model) - Hidden in compact mode unless specifically needed */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 animate-fade-in">
          <div className="flex items-center gap-1.5 p-1 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
            {researchModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedMode === mode.id 
                    ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)]'
                }`}
              >
                <mode.icon size={14} className={selectedMode === mode.id ? mode.color : 'text-[var(--text-dim)]'} />
                {mode.label}
                {mode.premium && !isPremium && <Lock size={10} className="ml-0.5 opacity-50" />}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)]/80 transition-all"
            >
              <Sparkles size={14} className="text-[var(--accent)]" />
              {modelOptions.find(m => m.id === selectedModel)?.label}
              <ChevronDown size={14} className={showModelSelector ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            <AnimatePresence>
              {showModelSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 glass-strong rounded-2xl p-2 w-64 z-40 border border-[var(--border)] shadow-2xl"
                >
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-bold border-b border-[var(--border)] mb-1">
                    Research Model Selector
                  </div>
                  {modelOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setSelectedModel(opt.id); setShowModelSelector(false); }}
                      className={`w-full flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                        selectedModel === opt.id 
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)]' 
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="font-medium">{opt.label}</span>
                        {opt.premium && !isPremium && <Lock size={12} className="opacity-50" />}
                      </div>
                      <span className="text-[10px] opacity-60 font-mono">{opt.provider}</span>
                    </button>
                  ))}
                  {!isPremium && (
                    <button 
                      onClick={() => { onOpenPremium?.(); setShowModelSelector(false); }}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 text-[var(--accent)] text-[11px] font-bold border border-[var(--accent)]/20"
                    >
                      <ShieldCheck size={12} />
                      Unlock Premium Models
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Upload Dropdown */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-full mb-3 left-0 glass-strong rounded-2xl p-2 w-56 z-30 border border-[var(--border)]"
          >
            {uploadOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => triggerUpload(opt)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)] transition-all text-left"
              >
                <opt.icon size={16} className={opt.color} />
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached File Badge */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full mb-2 left-14 flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-[var(--accent)] border border-[var(--accent)]/20"
          >
            <Paperclip size={12} />
            <span className="max-w-[200px] truncate">{uploadedFile.name}</span>
            <button onClick={() => setUploadedFile(null)} className="text-[var(--text-muted)] hover:text-red-400 ml-1">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Box */}
      <div className={`glass-strong rounded-[2.5rem] border border-[var(--border)] flex items-end gap-3 p-3 focus-within:border-[var(--accent)]/40 transition-all shadow-2xl group ${compact ? 'py-2 px-3 min-h-[56px]' : 'p-4'}`}>
        <button
          id="upload-btn"
          onClick={() => setShowUpload(!showUpload)}
          disabled={uploading}
          className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            showUpload
              ? 'bg-[var(--accent)] text-dark shadow-lg shadow-[var(--accent)]/20'
              : 'bg-[var(--bg-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)] border border-[var(--border)]'
          }`}
        >
          {uploading
            ? <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
            : <Plus size={20} className={showUpload ? 'rotate-45 transition-transform' : 'transition-transform'} />
          }
        </button>

        <textarea
          ref={textareaRef}
          id="research-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={compact ? "Ask a follow-up..." : `Enter research objective or technical query...`}
          rows={1}
          className="flex-1 bg-transparent text-[var(--text-main)] placeholder-[var(--text-dim)] text-base resize-none focus:outline-none min-h-[40px] max-h-60 py-2.5 px-1 font-light"
          style={{ lineHeight: '1.6' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 240) + 'px';
          }}
        />

        <div className="flex items-center gap-2 pb-0.5">
          {query.length > 0 && !compact && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Agent Ready
            </div>
          )}
          <button
            id="send-btn"
            onClick={handleSubmit}
            disabled={loading || (!query.trim() && !uploadedFile)}
            className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              (query.trim() || uploadedFile) && !loading
                ? 'btn-premium text-white hover:scale-105 active:scale-95'
                : 'bg-[var(--card-bg)] text-[var(--text-dim)] cursor-not-allowed border border-[var(--border)]'
            }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} />}
          </button>
        </div>
      </div>
      
      {/* Footer Info - Hidden in compact mode */}
      {!compact && (
        <div className="flex items-center justify-center gap-6 text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-[0.2em] pt-2 animate-fade-in">
          <div className="flex items-center gap-2 group/tip cursor-help">
            <ShieldCheck size={12} className="text-emerald-500/50 group-hover/tip:text-emerald-500 transition-colors" />
            <span>Encrypted Architecture</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
          <div className="flex items-center gap-2 group/tip cursor-help">
            <Brain size={12} className="text-[var(--accent)]/50 group-hover/tip:text-[var(--accent)] transition-colors" />
            <span>Multi-Agent Orchestration</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
          <div className="flex items-center gap-2 group/tip cursor-help">
            <Globe size={12} className="text-blue-500/50 group-hover/tip:text-blue-500 transition-colors" />
            <span>Real-time Literature Index</span>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
