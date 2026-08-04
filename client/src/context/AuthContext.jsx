import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
export const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true
      });
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout', {
        withCredentials: true
      });
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}