'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pt_token');
    const savedUser = localStorage.getItem('pt_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
      // Revalidate in background
      api.get('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('pt_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          // Token invalid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      // Auto-authenticate with demo user on first visit if no token exists, to give instant out-of-the-box experience
      api.post('/auth/login', { email: 'demo@personaltracker.com', password: 'password123' })
        .then((res) => {
          if (res.success && res.data) {
            setToken(res.data.token);
            setUser(res.data);
            localStorage.setItem('pt_token', res.data.token);
            localStorage.setItem('pt_user', JSON.stringify(res.data));
          }
        })
        .catch((err) => {
          console.log('[Auth notice]: Please sign in or register', err);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data);
      localStorage.setItem('pt_token', res.data.token);
      localStorage.setItem('pt_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data);
      localStorage.setItem('pt_token', res.data.token);
      localStorage.setItem('pt_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pt_token');
    localStorage.removeItem('pt_user');
  };

  const updateProfile = async (updates) => {
    const res = await api.put('/auth/profile', updates);
    if (res.success && res.data) {
      setUser((prev) => ({ ...prev, ...res.data }));
      localStorage.setItem('pt_user', JSON.stringify({ ...user, ...res.data }));
      return res.data;
    }
    throw new Error(res.message || 'Profile update failed');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

