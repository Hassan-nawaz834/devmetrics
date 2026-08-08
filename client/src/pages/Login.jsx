// client/src/pages/Login.jsx
import React from 'react';
import '../dashboardTheme.css';
import { backendOrigin } from '../config/api';

function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </div>
  );
}

function Login() {
  const handleGitHubLogin = () => {
    // Points to your Render backend in production
    window.location.href = `${backendOrigin()}/api/auth/github`;
  };

  return (
    <div className="relative min-h-screen font-body text-[var(--text)]">
      <AuroraBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-5">
        <div className="glass rounded-[18px] p-8 md:p-10 max-w-md w-full">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[rgba(45,212,191,0.14)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>

            <h2 className="font-display text-2xl font-medium">Welcome Back</h2>
            <p className="text-muted-aurora text-sm mt-2">
              Sign in to your account to continue
            </p>

            <div className="mt-8">
              {/* GitHub Sign In Button - Only Option */}
              <button
                onClick={handleGitHubLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full font-semibold text-[15px] border border-[var(--border)] hover:border-[var(--border-hi)] hover:bg-white/[0.04] transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Sign in with GitHub
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-faint-aurora">
                By signing in, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;