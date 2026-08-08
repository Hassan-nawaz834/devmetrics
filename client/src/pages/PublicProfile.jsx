import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiUrl } from '../config/api';
import '../dashboardTheme.css';

const LEVEL_COLORS = [
  'rgba(255,255,255,0.04)',
  'rgba(45, 212, 191, 0.25)',
  'rgba(45, 212, 191, 0.55)',
  'rgba(167, 139, 250, 0.75)',
  'rgba(45, 212, 191, 1)',
];

function getLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function MiniHeatmap({ days = [] }) {
  const { weeks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 370);
    start.setDate(start.getDate() - start.getDay());

    const map = new Map(days.map((d) => [d.date, d.count]));
    const weeks = [];
    let cursor = new Date(start);

    while (cursor <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const key = cursor.toISOString().slice(0, 10);
        const count = map.get(key) || 0;
        week.push({ key, count, level: getLevel(count), isFuture: cursor > today });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    return { weeks };
  }, [days]);

  return (
    <div className="flex gap-[2px] overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[2px]">
          {week.map((day) => (
            <div
              key={day.key}
              title={`${day.count} contributions`}
              className="w-[9px] h-[9px] rounded-[2px]"
              style={{
                background: day.isFuture ? 'transparent' : LEVEL_COLORS[day.level],
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </div>
  );
}

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(apiUrl(`/public/${username}`));
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Profile not found');
        }
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/u/${username}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen font-body text-[var(--text)]">
        <AuroraBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--teal)]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative min-h-screen font-body text-[var(--text)]">
        <AuroraBackground />
        <div className="relative z-10 max-w-md mx-auto pt-32 px-5 text-center">
          <div className="glass rounded-[18px] p-8">
            <h1 className="font-display text-2xl font-medium mb-2">Profile not found</h1>
            <p className="text-muted-aurora text-sm mb-6">{error || 'This developer does not exist.'}</p>
            <Link to="/" className="gradient-btn px-5 py-2.5 rounded-full text-sm font-semibold inline-block">
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { profile, stats, topLanguages, topRepos, contributionDays } = data;

  return (
    <div className="relative min-h-screen font-body text-[var(--text)] pb-20">
      <AuroraBackground />

      <div className="relative z-10 max-w-[720px] mx-auto px-5 pt-12">
        {/* Share bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-sm text-muted-aurora hover:text-[var(--text)] transition-colors">
            ← DevMetrics
          </Link>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-[var(--border)] hover:border-[var(--border-hi)] transition-colors"
          >
            {copied ? 'Copied!' : 'Copy profile link'}
          </button>
        </div>

        {/* Main card */}
        <div className="glass rounded-[22px] p-8 md:p-10">
          {/* Header */}
          <div className="flex items-start gap-5 mb-8">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="w-20 h-20 rounded-full border-2 border-[var(--border)] object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[rgba(45,212,191,0.15)] flex items-center justify-center text-2xl font-display text-[var(--teal)]">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-medium truncate">
                {profile.username}
              </h1>
              {profile.githubUsername && (
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--teal)] hover:underline mt-1 inline-block"
                >
                  @{profile.githubUsername}
                </a>
              )}
              <p className="text-faint-aurora text-xs mt-2 font-mono-ui">
                Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Commits', value: stats.totalCommits.toLocaleString(), color: 'var(--teal)' },
              { label: 'Current streak', value: `${stats.currentStreak}d`, color: 'var(--violet)' },
              { label: 'Longest streak', value: `${stats.longestStreak}d`, color: 'var(--gold)' },
              { label: 'Repos', value: stats.totalRepos, color: 'var(--coral)' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[14px] p-4 border border-[var(--border)]"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <p className="font-display text-2xl font-medium" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-[11px] text-muted-aurora mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Contribution graph */}
          <div className="mb-8">
            <h2 className="font-display text-[15px] font-medium mb-3">Contribution activity</h2>
            <MiniHeatmap days={contributionDays} />
            <p className="text-[11px] text-faint-aurora mt-2 font-mono-ui">
              {contributionDays.reduce((s, d) => s + d.count, 0).toLocaleString()} contributions in the last year
            </p>
          </div>

          {/* Two columns */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Top languages */}
            <div>
              <h2 className="font-display text-[15px] font-medium mb-3">Top languages</h2>
              {topLanguages.length === 0 ? (
                <p className="text-sm text-muted-aurora">No language data</p>
              ) : (
                <div className="space-y-2.5">
                  {topLanguages.map((lang, i) => {
                    const colors = ['#2dd4bf', '#a78bfa', '#fb7185', '#fbbf67', '#60a5fa', '#34d399'];
                    return (
                      <div key={lang.name} className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: colors[i % colors.length] }}
                        />
                        <span className="text-sm flex-1 truncate">{lang.name}</span>
                        <span className="text-[11px] text-faint-aurora font-mono-ui">
                          {lang.count} repo{lang.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top repos */}
            <div>
              <h2 className="font-display text-[15px] font-medium mb-3">Top repositories</h2>
              {topRepos.length === 0 ? (
                <p className="text-sm text-muted-aurora">No repository data</p>
              ) : (
                <div className="space-y-2.5">
                  {topRepos.map((repo) => (
                    <div key={repo.name} className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{repo.name}</span>
                      <span className="text-[11px] text-faint-aurora font-mono-ui flex-shrink-0">
                        {repo.commits} commits
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Extra insight line */}
          {(stats.busiestDay || stats.peakHour != null) && (
            <p className="mt-8 text-sm text-muted-aurora leading-relaxed">
              {stats.busiestDay && (
                <>Most active on <span className="text-[var(--teal)] font-medium">{stats.busiestDay}</span></>
              )}
              {stats.peakHour != null && (
                <>
                  {stats.busiestDay ? ' • ' : ''}
                  Peak hour around{' '}
                  <span className="text-[var(--violet)] font-medium">
                    {stats.peakHour}:00 UTC
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-aurora mb-3">
            Want your own public coding profile?
          </p>
          <Link
            to="/login"
            className="gradient-btn px-6 py-3 rounded-full text-sm font-semibold inline-block"
          >
            Get started free
          </Link>
        </div>
      </div>
    </div>
  );
}