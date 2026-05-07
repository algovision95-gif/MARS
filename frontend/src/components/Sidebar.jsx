import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Home, LayoutDashboard, Settings,
  History, LogOut, Crown, ChevronRight, Shield, Trash2, 
  Folder, FolderOpen, MoreVertical, MoreHorizontal, Share2, Pin, Edit3, 
  Download, Archive, User, Bell, AppWindow
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AlgoVisionLogo from './AlgoVisionLogo';
import api from '../services/api';

export default function Sidebar({
  history = [], projects = [], activeProjectId, setActiveProjectId,
  activeHistoryItem, setActiveHistoryItem, fetchProjects, fetchHistory,
  onOpenSettings, onOpenPremium
}) {
  const { user, setLoginModalOpen, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Popups
  const [menuOpen, setMenuOpen] = useState(null); 
  const [profileOpen, setProfileOpen] = useState(false);
  const [moveModal, setMoveModal] = useState(null); // { chatId: string }
  const [renameModal, setRenameModal] = useState(null); // { type: 'chat'|'project', id: string, name: string }
  const [createProjectModal, setCreateProjectModal] = useState(false);
  
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- ACTIONS ---
  const handleNewResearch = () => {
    if (!user) { setLoginModalOpen(true); return; }
    setActiveHistoryItem?.(null);
    navigate('/dashboard');
  };

  const togglePinChat = async (id) => {
    try { await api.patch(`/research/history/${id}/pin`); fetchHistory?.(); } catch {}
    setMenuOpen(null);
  };

  const toggleArchiveChat = async (id) => {
    try { await api.patch(`/research/history/${id}/archive`); fetchHistory?.(); } catch {}
    setMenuOpen(null);
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this research session?')) return;
    try { await api.delete(`/research/history/${id}`); fetchHistory?.(); } catch {}
    setMenuOpen(null);
  };

  const handleMoveChat = async (chatId, projectId) => {
    try { 
      await api.patch(`/research/history/${chatId}/move`, { projectId: projectId || null }); 
      fetchHistory?.(); 
    } catch {}
    setMoveModal(null);
    setMenuOpen(null);
  };

  const handleCreateProject = async (name) => {
    if (!name) return;
    try { await api.post('/projects', { name }); fetchProjects?.(); } catch {}
    setCreateProjectModal(false);
  };

  const handleRename = async (type, id, name) => {
    try {
      if (type === 'project') await api.patch(`/projects/${id}`, { name });
      else await api.patch(`/research/${id}/rename`, { title: name });
      fetchProjects?.();
      fetchHistory?.();
    } catch {}
    setRenameModal(null);
    setMenuOpen(null);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('This will permanently delete the project and all associated research. Continue?')) return;
    try { await api.delete(`/projects/${id}`); fetchProjects?.(); fetchHistory?.(); } catch {}
    setMenuOpen(null);
  };

  // --- FILTERING ---
  const filteredHistory = history.filter(h =>
    (h.query || h.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeChats = filteredHistory.filter(h => !h.isPinned && !h.isArchived);
  const pinnedChats = filteredHistory.filter(h => h.isPinned && !h.isArchived);
  
  const projectGroups = projects.reduce((acc, p) => {
    acc[p._id] = activeChats.filter(h => h.projectId === p._id);
    return acc;
  }, {});

  const ActionMenu = ({ type, item }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: 20 }}
      className="fixed z-[100] w-56 py-2 rounded-2xl glass-strong shadow-2xl border border-white/10 overflow-hidden"
      style={{ left: menuOpen?.x, top: menuOpen?.y }}
    >
      {type === 'chat' ? (
        <>
          <button onClick={() => togglePinChat(item._id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 transition-colors">
            <Pin size={14} className={item.isPinned ? 'text-accent fill-accent/20' : ''} /> {item.isPinned ? 'Unpin Chat' : 'Pin Chat'}
          </button>
          <button onClick={() => setRenameModal({ type: 'chat', id: item._id, name: item.title || item.query })} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 transition-colors">
            <Edit3 size={14} /> Rename Chat
          </button>
          <button onClick={() => setMoveModal({ chatId: item._id })} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 transition-colors">
            <Folder size={14} /> Move to Project
          </button>
          <button onClick={() => toggleArchiveChat(item._id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 transition-colors">
            <Archive size={14} /> {item.isArchived ? 'Unarchive' : 'Archive Chat'}
          </button>
          <div className="my-1 border-t border-white/5" />
          <button onClick={() => handleDeleteHistory(item._id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-400/10 transition-colors">
            <Trash2 size={14} /> Delete Permanent
          </button>
        </>
      ) : (
        <>
          <button onClick={() => setRenameModal({ type: 'project', id: item._id, name: item.name })} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 transition-colors">
            <Edit3 size={14} /> Rename Project
          </button>
          <div className="my-1 border-t border-white/5" />
          <button onClick={() => handleDeleteProject(item._id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-400/10 transition-colors">
            <Trash2 size={14} /> Delete Project
          </button>
        </>
      )}
    </motion.div>
  );

  return (
    <aside className="flex flex-col h-full w-72 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex-shrink-0 z-40 relative">
      <AnimatePresence>
        {moveModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xs glass-strong p-6 rounded-[2rem] border border-[var(--border)] shadow-2xl">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-4 uppercase tracking-widest">Move Research</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar mb-4">
                <button onClick={() => handleMoveChat(moveModal.chatId, null)} className="w-full text-left px-4 py-2.5 rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--text-main)] border border-transparent hover:border-[var(--border)]">No Project</button>
                {projects.map(p => (
                  <button key={p._id} onClick={() => handleMoveChat(moveModal.chatId, p._id)} className="w-full text-left px-4 py-2.5 rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--text-main)] border border-transparent hover:border-[var(--border)] flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || 'var(--accent-blue)' }} /> {p.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setMoveModal(null)} className="w-full py-2.5 rounded-xl text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">Cancel</button>
            </motion.div>
          </div>
        )}

        {renameModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xs glass-strong p-6 rounded-[2rem] border border-[var(--border)] shadow-2xl">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-4 uppercase tracking-widest">Rename {renameModal.type}</h3>
              <input 
                autoFocus defaultValue={renameModal.name}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(renameModal.type, renameModal.id, e.target.value); }}
                className="w-full bg-[var(--bg-color)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setRenameModal(null)} className="flex-1 py-3 rounded-xl text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text-main)]">Cancel</button>
                <button 
                  onClick={() => handleRename(renameModal.type, renameModal.id, document.querySelector('input').value)}
                  className="flex-1 py-3 rounded-xl btn-premium text-xs font-bold shadow-lg"
                >Save</button>
              </div>
            </motion.div>
          </div>
        )}

        {createProjectModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xs glass-strong p-6 rounded-[2rem] border border-[var(--border)] shadow-2xl">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-4 uppercase tracking-widest">New Research Workspace</h3>
              <input 
                autoFocus placeholder="Ex: AI Safety Research"
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateProject(e.target.value); }}
                className="w-full bg-[var(--bg-color)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] mb-4"
              />
              <button 
                onClick={() => handleCreateProject(document.querySelector('input').value)}
                className="w-full py-3 rounded-xl btn-premium text-xs font-bold shadow-lg"
              >Create Project</button>
              <button onClick={() => setCreateProjectModal(false)} className="w-full py-3 mt-2 rounded-xl text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text-main)]">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <button
          onClick={handleNewResearch}
          className="w-full group flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all duration-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Plus size={20} className="text-white" />
            </div>
            <span className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">New Search</span>
          </div>
        </button>
      </div>

      <div className="px-6 mb-6">
        <div className="relative group">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--accent)] transition-colors" />
          <input 
            type="text" placeholder="Search archive..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-[var(--bg-color)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]/30 transition-all text-[var(--text-main)] placeholder-[var(--text-dim)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8 sidebar-scroll">
        {pinnedChats.length > 0 && (
          <div className="space-y-2">
            <div className="px-3">
              <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] flex items-center gap-2">
                <Pin size={10} className="text-[var(--accent)]" /> Pinned Research
              </span>
            </div>
            {pinnedChats.map(c => (
              <div key={c._id} className="relative group/item animate-fade-in">
                <button
                  onClick={() => { setActiveHistoryItem(c); navigate('/dashboard'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                    activeHistoryItem?._id === c._id ? 'bg-[var(--card-bg)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)]/50'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${activeHistoryItem?._id === c._id ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]' : 'bg-gray-800'} group-hover/item:bg-[var(--accent)] transition-colors`} />
                  <span className="flex-1 text-left truncate font-medium max-w-[160px]">{c.title || c.query}</span>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <MoreHorizontal 
                      size={14} 
                      className="cursor-pointer hover:text-[var(--text-main)]"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setMenuOpen({ type: 'chat', id: c._id, x: e.clientX, y: e.clientY, item: c }); 
                      }}
                    />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}

        {user && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em]">Workspaces</span>
              <button onClick={() => setCreateProjectModal(true)} className="p-1.5 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"><Plus size={14} /></button>
            </div>
            
            {projects.map(p => {
              const isActive = activeProjectId === p._id;
              return (
                <div key={p._id} className="space-y-1">
                  <div className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
                    isActive ? 'bg-[var(--card-bg)] border border-[var(--border)] shadow-lg' : 'hover:bg-[var(--card-bg)]/50'
                  }`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCollapsedProjects(prev => ({ ...prev, [p._id]: !prev[p._id] })); }}
                      className={`p-1 rounded-lg hover:bg-[var(--card-bg)] transition-transform ${collapsedProjects[p._id] ? '' : 'rotate-90'}`}
                    >
                      <ChevronRight size={14} className="text-[var(--text-dim)]" />
                    </button>
                    
                    <div 
                      onClick={() => {
                        setActiveProjectId(p._id);
                        setActiveHistoryItem?.(null);
                        navigate('/dashboard');
                      }}
                      className="flex-1 flex items-center gap-3 cursor-pointer overflow-hidden"
                    >
                      <Folder size={18} style={{ color: p.color || 'var(--accent-blue)' }} className={isActive ? 'opacity-100' : 'opacity-40'} />
                      <span className={`text-left truncate text-[11px] font-black uppercase tracking-[0.1em] transition-colors flex-1 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}>
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal 
                        size={14} 
                        className="cursor-pointer text-[var(--text-dim)] hover:text-[var(--text-main)]"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setMenuOpen({ type: 'project', id: p._id, x: e.clientX, y: e.clientY, item: p }); 
                        }}
                      />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {!collapsedProjects[p._id] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="ml-6 border-l border-[var(--border)] pl-4 space-y-0.5 overflow-hidden"
                      >
                        {projectGroups[p._id]?.length > 0 ? (
                          projectGroups[p._id].map(h => (
                            <button
                              key={h._id}
                              onClick={() => { setActiveHistoryItem(h); navigate('/dashboard'); }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] transition-all ${
                                activeHistoryItem?._id === h._id ? 'bg-[var(--card-bg)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg)]/50'
                              }`}
                            >
                              <span className="truncate">{h.title || h.query}</span>
                            </button>
                          ))
                        ) : (
                          <div className="py-3 px-3 text-[10px] text-[var(--text-dim)] italic font-medium">Empty workspace</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6 mt-auto border-t border-[var(--border)] relative bg-[var(--sidebar-bg)]/80 backdrop-blur-xl">
        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-4 flex-1 p-2 rounded-2xl hover:bg-[var(--card-bg)] transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 shadow-inner overflow-hidden group-hover:scale-105 transition-transform">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg">{(user.fullName || user.name || 'U')[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-bold text-[var(--text-main)] truncate">{user.fullName || user.name || 'User'}</p>
                <div className="flex items-center gap-2 mt-1">
                   {user.subscriptionType !== 'FREE' ? (
                     <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                       <Crown size={8} className="text-amber-500 fill-amber-500" />
                       <p className="text-[8px] text-amber-500 font-black uppercase tracking-[0.1em]">PREMIUM</p>
                     </div>
                   ) : (
                     <>
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                       <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest">Free Access</p>
                     </>
                   )}
                </div>
              </div>
            </button>
          </div>
        ) : (
          <button onClick={() => setLoginModalOpen(true)} className="w-full py-4 rounded-[1.5rem] btn-premium text-sm uppercase tracking-widest">Init Session</button>
        )}

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="absolute bottom-full left-4 right-4 mb-4 z-[100] p-3 rounded-[2.2rem] bg-[var(--bg-secondary)] border border-[var(--border)] shadow-premium"
            >
              <div className="px-4 py-3 mb-2 border-b border-[var(--border)]">
                <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] mb-1">Intelligence ID</p>
                <p className="text-xs text-[var(--text-main)] font-black truncate">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => { setProfileOpen(false); onOpenPremium(); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-center gap-2.5"><Crown size={14} /> Upgrade Plan</div>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => { setProfileOpen(false); onOpenSettings(); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-[var(--text-main)] transition-all uppercase tracking-widest">
                  <Settings size={14} /> Settings
                </button>
                <div className="h-px bg-[var(--border)] my-2 mx-2" />
                <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-bold text-red-500 hover:bg-red-500/5 transition-all uppercase tracking-widest">
                  <LogOut size={14} /> Terminate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <div ref={menuRef}>
            <ActionMenu type={menuOpen.type} item={menuOpen.item} />
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
