// client/src/pages/AuthCallback.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthSession } = useAuth();
  const [error, setError] = useState('');
  const processed = useRef(false); // prevents running more than once

  useEffect(() => {
    // Guard against React Strict Mode double-invoke + infinite loops
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setAuthSession(token, user);
        // Small delay so state updates before navigation
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Failed to authenticate');
        setTimeout(() => navigate('/login?error=auth_failed'), 2000);
      }
    } else {
      const errorMsg = params.get('error') || 'Authentication failed';
      setError(errorMsg);
      setTimeout(() => navigate('/login?error=' + encodeURIComponent(errorMsg)), 2000);
    }
  }, [location.search, navigate, setAuthSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h3 className="font-semibold">Authentication Error</h3>
            <p>{error}</p>
            <p className="text-sm mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Authenticating...</h2>
            <p className="mt-2 text-gray-500">Please wait while we verify your GitHub account</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;