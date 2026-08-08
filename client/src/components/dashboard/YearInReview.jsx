import React, { useMemo } from 'react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function YearInReview({ commits = [], repositories = [] }) {
  const summary = useMemo(() => {
    if (!commits.length) return null;

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Prefer current calendar year, fall back to last 365 days
    let periodCommits = commits.filter((c) => c.date && new Date(c.date) >= yearStart);
    let periodLabel = `${now.getFullYear()}`;

    if (periodCommits.length < 10) {
      const yearAgo = new Date();
      yearAgo.setDate(yearAgo.getDate() - 365);
      periodCommits = commits.filter((c) => c.date && new Date(c.date) >= yearAgo);
      periodLabel = 'the last 12 months';
    }

    if (!periodCommits.length) periodCommits = commits;

    const totalCommits = periodCommits.length;
    const totalAdditions = periodCommits.reduce((s, c) => s + (c.additions || 0), 0);
    const totalDeletions = periodCommits.reduce((s, c) => s + (c.deletions || 0), 0);

    // Busiest day of week
    const dayCount = Array(7).fill(0);
    periodCommits.forEach((c) => {
      let d = c.dayOfWeek;
      if (d == null && c.date) d = new Date(c.date).getUTCDay();
      if (d != null) dayCount[d]++;
    });
    const busiestDayIdx = dayCount.indexOf(Math.max(...dayCount));
    const busiestDay = DAY_NAMES[busiestDayIdx];

    // Peak hour
    const hourCount = Array(24).fill(0);
    periodCommits.forEach((c) => {
      let h = c.hour;
      if (h == null && c.date) h = new Date(c.date).getUTCHours();
      if (h != null) hourCount[h]++;
    });
    const peakHour = hourCount.indexOf(Math.max(...hourCount));

    // Top repo
    const repoCount = {};
    periodCommits.forEach((c) => {
      const name = c.repoName || 'Unknown';
      repoCount[name] = (repoCount[name] || 0) + 1;
    });
    const topRepoEntry = Object.entries(repoCount).sort((a, b) => b[1] - a[1])[0];
    const topRepo = topRepoEntry ? topRepoEntry[0] : '—';
    const topRepoCommits = topRepoEntry ? topRepoEntry[1] : 0;

    // Unique days
    const uniqueDays = new Set(
      periodCommits.map((c) => new Date(c.date).toDateString())
    ).size;

    // Average per active day
    const avgPerDay = uniqueDays > 0 ? (totalCommits / uniqueDays).toFixed(1) : 0;

    // Most active month
    const monthCount = Array(12).fill(0);
    periodCommits.forEach((c) => {
      if (c.date) monthCount[new Date(c.date).getMonth()]++;
    });
    const busiestMonthIdx = monthCount.indexOf(Math.max(...monthCount));
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const busiestMonth = monthNames[busiestMonthIdx];

    return {
      periodLabel,
      totalCommits,
      totalAdditions,
      totalDeletions,
      busiestDay,
      peakHour,
      topRepo,
      topRepoCommits,
      uniqueDays,
      avgPerDay,
      busiestMonth,
      repoCount: Object.keys(repoCount).length,
    };
  }, [commits, repositories]);

  if (!summary) {
    return (
      <div className="glass rounded-[18px] p-6">
        <h3 className="font-display text-[17px] font-medium mb-2">Your Year in Code</h3>
        <p className="text-muted-aurora text-sm">Ship some commits to unlock your recap.</p>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Commits shipped',
      value: summary.totalCommits.toLocaleString(),
      accent: 'var(--teal)',
    },
    {
      label: 'Lines added',
      value: `+${summary.totalAdditions.toLocaleString()}`,
      accent: 'var(--teal)',
    },
    {
      label: 'Active days',
      value: summary.uniqueDays,
      accent: 'var(--violet)',
    },
    {
      label: 'Avg / active day',
      value: summary.avgPerDay,
      accent: 'var(--gold)',
    },
  ];

  return (
    <div className="glass rounded-[18px] p-6 md:p-8 relative overflow-hidden">
      {/* subtle glow */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--teal), transparent 70%)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1 font-mono-ui text-[11px] tracking-widest uppercase text-[var(--teal)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] shadow-[0_0_8px_#2dd4bf]" />
          Year in Review
        </div>

        <h3 className="font-display text-2xl md:text-3xl font-medium mt-2 mb-1">
          Your code in <span className="gradient-text-cool italic">{summary.periodLabel}</span>
        </h3>
        <p className="text-muted-aurora text-sm mb-7 max-w-lg">
          A quick look at how you shipped this period.
        </p>

        {/* Big numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="rounded-[14px] p-4 border border-[var(--border)]"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p
                className="font-display text-2xl md:text-3xl font-medium"
                style={{ color: item.accent }}
              >
                {item.value}
              </p>
              <p className="text-[12px] text-muted-aurora mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Story lines */}
        <div className="space-y-3.5 text-[15px] leading-relaxed">
          <p>
            Your busiest day was{' '}
            <span className="font-semibold text-[var(--teal)]">{summary.busiestDay}</span>
            {summary.peakHour != null && (
              <>
                , and you were most active around{' '}
                <span className="font-semibold text-[var(--violet)]">
                  {summary.peakHour}:00–{summary.peakHour}:59 UTC
                </span>
              </>
            )}
            .
          </p>

          <p>
            Top repository:{' '}
            <span className="font-semibold text-[var(--gold)]">{summary.topRepo}</span>
            {' '}
            <span className="text-faint-aurora text-sm">
              ({summary.topRepoCommits} commits)
            </span>
          </p>

          <p>
            You were most productive in{' '}
            <span className="font-semibold text-[var(--coral)]">{summary.busiestMonth}</span>
            {' '}across {summary.repoCount} different repositories.
          </p>
        </div>
      </div>
    </div>
  );
}