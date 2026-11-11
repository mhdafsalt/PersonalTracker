'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize on mount and handle token refresh
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem('pt_token');
      const savedUser = localStorage.getItem('pt_user');

      if (savedToken && savedToken !== 'null' && savedToken !== 'undefined') {
        setToken(savedToken);
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            setUser(null);
          }
        }

        // Validate token with backend /api/auth/me
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('pt_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('[Auth Session Notice]: Session validation returned:', err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // No token present. Attempt auto-authentication with demo user for zero-config onboarding
        try {
          const res = await api.post('/auth/login', {
            email: 'demo@personaltracker.com',
            password: 'password123',
          });
          if (res.success && res.data) {
            setToken(res.data.token);
            setUser(res.data);
            localStorage.setItem('pt_token', res.data.token);
            localStorage.setItem('pt_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.log('[Auth Info]: No active session. Please sign in or register.');
        } finally {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for 401 token expiration events broadcasted by api.js
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('pt_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('pt_auth_expired', handleAuthExpired);
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pt_token');
      localStorage.removeItem('pt_user');
    }
  };

  const updateProfile = async (updates) => {
    const res = await api.put('/auth/profile', updates);
    if (res.success && res.data) {
      setUser((prev) => ({ ...prev, ...res.data }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('pt_user', JSON.stringify({ ...user, ...res.data }));
      }
      return res.data;
    }
    throw new Error(res.message || 'Profile update failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
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
