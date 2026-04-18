import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('mars_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('mars_token');
          localStorage.removeItem('mars_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('mars_token', data.token);
    localStorage.setItem('mars_user', JSON.stringify(data));
    setUser(data);
    setLoginModalOpen(false);
    return data;
  };

  const signup = async (email, password) => {
    const { data } = await api.post('/auth/signup', { email, password });
    localStorage.setItem('mars_token', data.token);
    localStorage.setItem('mars_user', JSON.stringify(data));
    setUser(data);
    setLoginModalOpen(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('mars_token');
    localStorage.removeItem('mars_user');
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
      user, loading, loginModalOpen,
      setLoginModalOpen, login, signup, logout, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
