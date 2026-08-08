// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const fetchUser = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser(token);
  }, [token, fetchUser]);

  const setAuthSession = useCallback((tokenValue, userData) => {
    if (tokenValue) {
      localStorage.setItem('token', tokenValue);
      setToken(tokenValue);
    }
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setAuthSession,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}