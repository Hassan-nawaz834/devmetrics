import React, { useMemo, useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getLevel(count, max) {
  if (count === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const LEVEL_COLORS = [
  'rgba(255,255,255,0.04)',
  'rgba(45, 212, 191, 0.28)',
  'rgba(45, 212, 191, 0.55)',
  'rgba(167, 139, 250, 0.75)',
  'rgba(45, 212, 191, 1)',
];

export default function CommitPunchCard({ commits = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const { grid, maxCount, total } = useMemo(() => {
    // grid[dayOfWeek][hour] = count
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    let total = 0;

    commits.forEach((c) => {
      let hour = c.hour;
      let day = c.dayOfWeek;

      // fallback if hour/dayOfWeek not present
      if (hour == null || day == null) {
        if (!c.date) return;
        const d = new Date(c.date);
        hour = d.getUTCHours();
        day = d.getUTCDay();
      }

      if (hour >= 0 && hour <= 23 && day >= 0 && day <= 6) {
        grid[day][hour] += 1;
        total += 1;
      }
    });

    let maxCount = 0;
    grid.forEach((row) => row.forEach((v) => { if (v > maxCount) maxCount = v; }));

    return { grid, maxCount: maxCount || 1, total };
  }, [commits]);

  if (!commits.length) {
    return (
      <div className="glass rounded-[18px] p-6">
        <h3 className="font-display text-[17px] font-medium mb-2">Commit Punch Card</h3>
        <p className="text-muted-aurora text-sm">No commit timing data yet.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-[18px] p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-[17px] font-medium">Commit Punch Card</h3>
          <p className="text-muted-aurora text-sm mt-1">
            When you code • {total.toLocaleString()} timed commits
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-faint-aurora font-mono-ui">
          <span>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-[3px]" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="min-w-[640px]">
        {/* Hour labels */}
        <div className="flex mb-1.5 ml-10">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex-1 text-center text-[9px] text-faint-aurora font-mono-ui"
              style={{ minWidth: 18 }}
            >
              {h % 3 === 0 ? `${h}` : ''}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {DAYS.map((dayLabel, dayIdx) => (
          <div key={dayLabel} className="flex items-center gap-1.5 mb-[3px]">
            <div className="w-8 text-[10px] text-faint-aurora font-mono-ui text-right pr-1">
              {dayLabel}
            </div>
            <div className="flex flex-1 gap-[2px]">
              {HOURS.map((hour) => {
                const count = grid[dayIdx][hour];
                const level = getLevel(count, maxCount);
                return (
                  <div
                    key={hour}
                    className="flex-1 aspect-square rounded-[2px] cursor-pointer transition-transform hover:scale-125"
                    style={{
                      background: LEVEL_COLORS[level],
                      minWidth: 16,
                      minHeight: 16,
                      border: '1px solid rgba(255,255,255,0.03)',
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 6,
                        text: `${count} commit${count !== 1 ? 's' : ''} • ${dayLabel} ${hour}:00–${hour}:59`,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-md text-[11px] font-mono-ui pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(15, 16, 35, 0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--text)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}