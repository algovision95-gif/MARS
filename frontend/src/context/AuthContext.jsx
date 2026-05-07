import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [responseMode, setResponseMode] = useState(localStorage.getItem('algovision_response_mode') || 'simple');
  const [theme, setTheme] = useState(localStorage.getItem('algovision_theme') || 'dark');
  const [researchDepth, setResearchDepth] = useState(localStorage.getItem('algovision_depth') || 'standard');
  const [autoSelectAgents, setAutoSelectAgents] = useState(localStorage.getItem('algovision_auto_agents') !== 'false');
  const [liveOpsEnabled, setLiveOpsEnabled] = useState(localStorage.getItem('algovision_live_ops') !== 'false');
  const [exportFormat, setExportFormat] = useState(localStorage.getItem('algovision_export_format') || 'pdf');

  useEffect(() => {
    localStorage.setItem('algovision_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('algovision_depth', researchDepth);
  }, [researchDepth]);

  useEffect(() => {
    localStorage.setItem('algovision_auto_agents', autoSelectAgents);
  }, [autoSelectAgents]);

  useEffect(() => {
    localStorage.setItem('algovision_live_ops', liveOpsEnabled);
  }, [liveOpsEnabled]);

  useEffect(() => {
    localStorage.setItem('algovision_export_format', exportFormat);
  }, [exportFormat]);
  useEffect(() => {
    const token = localStorage.getItem('algovision_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('algovision_token');
          localStorage.removeItem('algovision_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('algovision_token', data.token);
    localStorage.setItem('algovision_user', JSON.stringify(data));
    setUser(data);
    setLoginModalOpen(false);
    return data;
  };

  const signup = async (dataPayload) => {
    const { data } = await api.post('/auth/signup', dataPayload);
    localStorage.setItem('algovision_token', data.token);
    localStorage.setItem('algovision_user', JSON.stringify(data));
    setUser(data);
    setLoginModalOpen(false);
    return data;
  };

  const googleLogin = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    localStorage.setItem('algovision_token', data.token);
    localStorage.setItem('algovision_user', JSON.stringify(data));
    setUser(data);
    setLoginModalOpen(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('algovision_token');
    localStorage.removeItem('algovision_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{
      user: user ? { ...user, subscriptionType: localStorage.getItem('algovision_sub_override') || user.subscriptionType } : null, 
      loading, loginModalOpen,
      setLoginModalOpen, login, signup, googleLogin, logout, refreshUser,
      responseMode, setResponseMode,
      theme, setTheme, toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
      researchDepth, setResearchDepth,
      autoSelectAgents, setAutoSelectAgents,
      liveOpsEnabled, setLiveOpsEnabled,
      exportFormat, setExportFormat
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
