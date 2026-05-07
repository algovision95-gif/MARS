import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes, Route, Navigate,
} from 'react-router-dom';
import { Plus, LayoutDashboard } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';
import PremiumPopup from './components/PremiumPopup';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import api from './services/api';

import Header from './components/Header';

function MainLayout() {
  const { user, loginModalOpen, setLoginModalOpen, theme } = useAuth();
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeHistoryItem, setActiveHistoryItem] = useState(null);
  const [activeAgents, setActiveAgents] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/research/history');
      setHistory(data);
    } catch (err) {}
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchHistory();
    } else {
      setProjects([]);
      setHistory([]);
    }
  }, [user]);

  const openSettingsAt = (tab) => {
    setSettingsTab(tab || 'general');
    setIsSettingsOpen(true);
  };

  const activeProject = projects.find(p => p._id === activeProjectId);

  return (
    <div className={`flex h-screen bg-[var(--bg-color)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-500`}>
      {/* Sidebar - Only show for logged in users */}
      {user && (
        <div className={`fixed inset-y-0 left-0 z-[60] w-72 h-full bg-[var(--sidebar-bg)] border-r border-[var(--border)] transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar 
            history={history} 
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            activeHistoryItem={activeHistoryItem}
            setActiveHistoryItem={(item) => {
              setActiveHistoryItem(item);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            fetchProjects={fetchProjects}
            fetchHistory={fetchHistory}
            onOpenSettings={() => openSettingsAt('general')}
            onOpenPremium={() => setIsPremiumOpen(true)}
          />
        </div>
      )}

      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative transition-all duration-300 ${user && isSidebarOpen ? 'lg:ml-0' : ''}`}>
        {user && (
          <Header 
            activeProjectId={activeProjectId}
            projects={projects}
            activeAgents={activeAgents}
            onOpenSettings={openSettingsAt}
            onOpenPremium={() => setIsPremiumOpen(true)}
          />
        )}

        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={user ? <Home activeProjectId={activeProjectId} onAgentsChange={setActiveAgents} /> : <LandingPage />} />
            <Route path="/dashboard" element={
              user ? (
                <Dashboard 
                  activeProjectId={activeProjectId} 
                  history={history}
                  activeHistoryItem={activeHistoryItem} 
                  setActiveHistoryItem={setActiveHistoryItem} 
                  onOpenPremium={() => setIsPremiumOpen(true)}
                  onAgentsChange={setActiveAgents}
                />
              ) : <Navigate to="/" />
            } />
            <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} initialTab={settingsTab} />}
        {isPremiumOpen && <PremiumPopup onClose={() => setIsPremiumOpen(false)} />}
        {loginModalOpen && <LoginModal />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}
