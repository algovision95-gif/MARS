import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, UploadCloud, History, BarChart3, Loader2, ArrowRight, 
  CheckCircle, FileText, Trash2, Sparkles, Zap, Brain, MessageSquare, 
  ChevronRight, MoreHorizontal, Download, Copy, Share2, Search, LayoutDashboard,
  Folder, ArrowUp, Settings, LogOut, User as UserIcon, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchInput from '../components/SearchInput';
import AgentStatusBar from '../components/AgentStatusBar';
import ResearchResult from '../components/ResearchResult';
import api from '../services/api';
import AlgoVisionLogo from '../components/AlgoVisionLogo';
import AgentLiveOperations from '../components/AgentLiveOperations';
import PremiumPopup from '../components/PremiumPopup';
import ResearchError from '../components/ResearchError';
import AgentSelectionPanel from '../components/AgentSelectionPanel';
import { exportAsPDF, exportAsPPT, exportAsDOCX } from '../services/exportService';

export default function Dashboard({ activeProjectId, history = [], activeHistoryItem, setActiveHistoryItem, onOpenPremium, onAgentsChange }) {
  const { 
    user, loading: authLoading, refreshUser,
    researchDepth, autoSelectAgents, theme, toggleTheme
  } = useAuth();
  const [resLoading, setResLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionFileId, setSessionFileId] = useState(null);
  const [selectedAgents, setSelectedAgents] = useState(['planner', 'hunter', 'paperReader', 'comparator', 'contradictionDetector', 'gapFinder']);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (activeProjectId) {
      api.get(`/projects/${activeProjectId}`).then(r => {
        if (r.data) {
          setActiveProject(r.data);
          setDatasets(r.data.datasets || []);
        }
      }).catch(err => {
        console.error("Failed to load project:", err);
      });
    } else {
      setActiveProject(null);
      setDatasets([]);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeHistoryItem) {
      if (activeHistoryItem.researchId) {
        setResLoading(true);
        api.get(`/research/${activeHistoryItem.researchId}`).then(r => {
          setMessages([
            { role: 'user', content: activeHistoryItem.query || 'Analyze Research' },
            { role: 'assistant', content: activeHistoryItem.response || 'No response available', result: r.data }
          ]);
        }).catch(err => {
          console.error("Failed to fetch research details:", err);
          setMessages([
            { role: 'user', content: activeHistoryItem.query || 'Analyze Research' },
            { role: 'assistant', content: activeHistoryItem.response || 'Failed to load research data.' }
          ]);
        }).finally(() => setResLoading(false));
      } else {
        setMessages([
          { role: 'user', content: activeHistoryItem.query || 'Analyze Research' },
          { role: 'assistant', content: activeHistoryItem.response || 'No response available' }
        ]);
      }
    } else {
      setMessages([]);
    }
  }, [activeHistoryItem]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, resLoading]);

  const runResearch = async ({ query, fileId, mode, model }) => {
    if (!query && !fileId) return;
    const currentFileId = fileId || sessionFileId;
    if (fileId && !sessionFileId) setSessionFileId(fileId);

    const newMessages = [...messages, { role: 'user', content: query || 'Analyze this file', fileAttached: !!currentFileId }];
    setMessages(newMessages);
    setResLoading(true);
    setErrorType(null);
    
    const agentsToRun = (mode === 'deep' || researchDepth === 'deep') ? ['all'] : (autoSelectAgents ? ['auto'] : selectedAgents);
    onAgentsChange?.(agentsToRun);

    try {
      const payload = { 
        query: query || 'Analyze this file',
        projectId: activeProjectId,
        context: newMessages.map(m => ({ role: m.role, content: m.content })).slice(-5),
        agents: agentsToRun,
        subscriptionType: user?.subscriptionType || 'FREE',
        mode: mode || researchDepth || 'standard',
        model: model || 'openai/gpt-4o'
      };
      if (currentFileId) payload.fileIds = [currentFileId];
      
      const endpoint = (user?.subscriptionType !== 'FREE') ? '/research' : '/research/search';
      const { data } = await api.post(endpoint, payload);
      setMessages([...newMessages, { role: 'assistant', content: data.searchResult, result: data, partial: data.isPartial }]);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.type) {
        setErrorType(errorData.type);
      } else if (err.response?.status === 403) {
        setErrorType('quota_limit');
      } else if (err.response?.status === 429) {
        setErrorType('rate_limit');
      } else {
        setErrorType('server_error');
      }
    } finally {
      setResLoading(false);
      onAgentsChange?.([]);
    }
  };

  const handleHistoryClick = (item) => {
    setActiveHistoryItem(item);
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Delete this research item?')) return;
    try {
      await api.delete(`/research/history/${id}`);
      setMessages([]);
      setActiveHistoryItem(null);
    } catch {}
  };

  const handleShare = async (result) => {
    const link = `${window.location.origin}/share/${result._id}`;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard!');
  };

  const handleExport = async (format, resultData) => {
    if (user?.subscriptionType === 'FREE') {
      setShowPremiumPopup(true);
      return;
    }
    
    // Fallback if resultData is missing (shouldn't happen with the new update)
    const reportData = resultData || messages.find(m => m.result)?.result;
    
    if (!reportData) {
      alert("No research data found to export.");
      return;
    }

    try {
      if (format === 'pdf') await exportAsPDF(reportData, user);
      else if (format === 'ppt') await exportAsPPT(reportData);
      else if (format === 'docx') await exportAsDOCX(reportData);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again or use the Print option.");
    }
  };

  const suggestions = [
    "Deep-dive into sustainable energy storage",
    "Compare transformer vs state-space models",
    "Analyze uploaded datasets for anomalies",
    "Find innovation gaps in biotech 2024"
  ];

  if (authLoading) return <div className="flex-1 flex items-center justify-center bg-transparent"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden">
      <AnimatePresence>
        {showPremiumPopup && <PremiumPopup onClose={() => setShowPremiumPopup(false)} />}
      </AnimatePresence>

      {/* Workspace Status Strip */}
      <div className="flex-shrink-0 premium-header glass sticky top-0 z-40 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Neural Engine Active</span>
          </div>
          <div className="h-4 w-[1px] bg-[var(--border)]" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Active Workspace:</span>
            <span className="text-xs font-bold tracking-wide text-[var(--text-main)]">{activeProject?.name || 'Global'}</span>
          </div>
        </div>
      </div>


      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto sidebar-scroll relative" ref={chatContainerRef}>
        <div className="max-w-6xl mx-auto px-6 w-full pt-10 pb-20">
          {messages.length === 0 ? (
            <div className="flex flex-col justify-center py-10 min-h-[80vh]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-center">
                  <span className="text-[var(--text-main)]">AlgoVision </span>
                  <span className="gradient-text">Research OS</span>
                </h1>
                <p className="text-xl text-[var(--text-muted)] font-medium max-w-2xl leading-relaxed mx-auto text-center">
                  {activeProject 
                    ? `Active Workspace: ${activeProject.name}` 
                    : "The world's first multi-agent research operating system."}
                </p>
              </motion.div>

              <div className="w-full max-w-5xl mx-auto mb-16 space-y-8">
                 <div className="relative group">
                    <SearchInput 
                      onSubmit={runResearch} 
                      loading={resLoading} 
                      user={user}
                      onOpenPremium={() => setShowPremiumPopup(true)}
                      placeholder={activeProject ? `Investigate within ${activeProject.name}...` : "What research problem can I solve for you?"}
                      compact={false}
                    />
                  </div>
                  <AgentSelectionPanel 
                    selectedAgents={selectedAgents}
                    onToggleAgent={(id) => {
                      if (id === 'all') {
                        setSelectedAgents(['planner', 'hunter', 'paperReader', 'comparator', 'contradictionDetector', 'gapFinder']);
                      } else if (id === 'none') {
                        setSelectedAgents([]);
                      } else {
                        setSelectedAgents(prev => 
                          prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
                        );
                      }
                    }}
                    onRun={() => {
                      const input = document.getElementById('research-input');
                      const query = input?.value || '';
                      if (query) runResearch({ query });
                    }}
                    loading={resLoading}
                    isPremium={user?.subscriptionType !== 'FREE'}
                    onOpenPremium={() => setShowPremiumPopup(true)}
                    compact={false}
                  />
              </div>

              {activeProject && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <h3 className="text-sm font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">Recent Topics in {activeProject.name}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                       <span className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest">Workspace Sync Active</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(history) && history.filter(h => h.projectId === activeProjectId).slice(0, 6).map((item, i) => (
                      <motion.button
                        key={item._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleHistoryClick(item)}
                        className="flex flex-col gap-3 p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--card-bg)] transition-all group text-left shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-[var(--bg-color)] text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">
                            <History size={14} />
                          </div>
                          <ArrowRight size={14} className="text-[var(--text-dim)] group-hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] line-clamp-2 leading-relaxed">
                          {item.query}
                        </span>
                        <div className="mt-auto pt-2 flex items-center gap-2 text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">
                           <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                           <span>•</span>
                           <span>{item.mode || 'Standard'}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              {!activeProject && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16 max-w-4xl mx-auto w-full">
                  {suggestions.map((text, i) => (
                    <motion.button
                      key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      onClick={() => runResearch({ query: text })}
                      className="flex items-center justify-between p-6 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--card-bg)] transition-all group text-left"
                    >
                      <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{text}</span>
                      <ArrowRight size={16} className="text-[var(--text-dim)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-16">
              {messages.map((m, i) => (
                <div key={i} className="group animate-fade-in">
                  {m.role === 'user' ? (
                    <div className="flex flex-col items-end mb-4">
                      <div className="max-w-[85%] bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-main)] px-8 py-5 rounded-[2.5rem] rounded-tr-none text-lg leading-relaxed shadow-xl backdrop-blur-sm">
                        {m.content}
                        {m.fileAttached && (
                          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] py-2 px-4 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 w-fit uppercase tracking-widest">
                            <FileText size={12}/> Analysis Grounded in Dataset
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-8">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-purple)] flex items-center justify-center flex-shrink-0 mt-1 shadow-2xl shadow-[var(--accent)]/30">
                        <AlgoVisionLogo size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {errorType && i === messages.length - 1 ? (
                          <ResearchError 
                            type={errorType}
                            onRetry={() => { setErrorType(null); runResearch({ query: m.content }); }}
                            onSwitchMode={() => { setErrorType(null); setMessages(messages.slice(0, -1)); }}
                            onUpgrade={() => setShowPremiumPopup(true)}
                          />
                        ) : m.result ? (
                          <ResearchResult 
                            result={m.result} 
                            user={user} 
                            partial={m.partial}
                            onDelete={() => handleDeleteHistory(m.result._id)}
                            onShare={() => handleShare(m.result)}
                            onExport={handleExport}
                            onRunSearch={runResearch}
                          />
                        ) : (
                          <div className="text-lg text-[var(--text-main)] leading-relaxed font-outfit whitespace-pre-wrap pl-4">
                            {m.content}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {resLoading && (
                <div className="flex gap-8">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Loader2 size={24} className="text-[var(--text-dim)] animate-spin" />
                  </div>
                  <div className="flex-1 py-2">
                    <div className="flex-1 space-y-6 pt-2">
                      <AgentLiveOperations 
                        agents={autoSelectAgents ? ['planner', 'hunter', 'paperReader'] : selectedAgents} 
                        loading={resLoading} 
                      />
                      <div className="space-y-3">
                        <div className="h-4 bg-[var(--border)] rounded-full w-full animate-pulse" />
                        <div className="h-4 bg-[var(--border)] rounded-full w-[90%] animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Input Bar - Only shown when chat is active */}
      {messages.length > 0 && (
        <div className="flex-shrink-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/95 to-transparent z-30 relative border-t border-[var(--border)] backdrop-blur-sm pt-2 pb-4 transition-all duration-500">
          <div className="max-w-6xl mx-auto px-6 w-full relative">
            <div className="relative group">
              <SearchInput 
                onSubmit={runResearch} 
                loading={resLoading} 
                user={user}
                onOpenPremium={() => setShowPremiumPopup(true)}
                placeholder={activeProject ? `Investigate within ${activeProject.name}...` : "What research problem can I solve for you?"}
                compact={true}
              />
            </div>

            <div className="mt-4 animate-fade-in">
              <AgentSelectionPanel 
                selectedAgents={selectedAgents}
                onToggleAgent={(id) => {
                  if (id === 'all') {
                    setSelectedAgents(['planner', 'hunter', 'paperReader', 'comparator', 'contradictionDetector', 'gapFinder']);
                  } else if (id === 'none') {
                    setSelectedAgents([]);
                  } else {
                    setSelectedAgents(prev => 
                      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
                    );
                  }
                }}
                onRun={() => {
                  const input = document.getElementById('research-input');
                  const query = input?.value || '';
                  if (query) runResearch({ query });
                }}
                loading={resLoading}
                isPremium={user?.subscriptionType !== 'FREE'}
                onOpenPremium={() => setShowPremiumPopup(true)}
                compact={true}
              />
            </div>
            
            <p className="text-center text-[8px] text-[var(--text-dim)] font-black uppercase tracking-[0.4em] opacity-40 mt-3">
              AlgoVision Research OS v2.4.0 • Neural Engine Persistent
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
