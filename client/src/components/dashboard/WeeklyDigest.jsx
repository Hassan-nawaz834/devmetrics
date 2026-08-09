import React, { useState } from 'react';
import { apiUrl } from '../../config/api';

export default function WeeklyDigest() {
  const [digest, setDigest] = useState(null);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateDigest = async () => {
    try {
      setLoading(true);
      setError(null);
      setDigest(null);

      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/ai/weekly-digest'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate digest');
      }

      setDigest(data.digest);
      setStats(data.stats || null);
      setPeriod(data.period || null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-[18px] p-6 md:p-8 relative overflow-hidden">
      {/* soft glow */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--violet), transparent 70%)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1 font-mono-ui text-[11px] tracking-widest uppercase text-[var(--violet)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--violet)] shadow-[0_0_8px_#a78bfa]" />
              Powered by AI
            </div>
            <h3 className="font-display text-[17px] font-medium">Weekly Digest</h3>
            <p className="text-muted-aurora text-sm mt-1">
              AI summary of your last 7 days of coding
            </p>
          </div>

          <button
            onClick={generateDigest}
            disabled={loading}
            className="gradient-btn px-5 py-2.5 rounded-full text-[13px] font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Analyzing…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {digest ? 'Regenerate' : 'Generate Digest'}
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-[rgba(251,113,133,0.35)] text-[var(--coral)] text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!digest && !loading && !error && (
          <div className="py-8 text-center">
            <p className="text-muted-aurora text-sm max-w-md mx-auto">
              Click the button above and Claude will read your commits from the past week
              and write a short, human summary of what you focused on.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-11/12" />
            <div className="h-4 bg-white/5 rounded w-4/5" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
        )}

        {/* Result */}
        {digest && !loading && (
          <div>
            {period && (
              <p className="text-[11px] font-mono-ui text-faint-aurora mb-4">
                {period.from} → {period.to}
                {stats?.busiestDay && ` • Busiest: ${stats.busiestDay}`}
                {stats?.peakHour != null && ` • Peak: ${stats.peakHour}:00 UTC`}
              </p>
            )}

            <div className="prose prose-invert max-w-none">
              {digest.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-[var(--text)] mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}