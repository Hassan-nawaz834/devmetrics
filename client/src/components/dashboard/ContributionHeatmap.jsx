import React, { useMemo, useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const LEVEL_COLORS = [
  'rgba(255,255,255,0.04)',           // 0
  'rgba(45, 212, 191, 0.25)',         // 1 - soft teal
  'rgba(45, 212, 191, 0.55)',         // 2
  'rgba(167, 139, 250, 0.75)',        // 3 - violet
  'rgba(45, 212, 191, 1)',            // 4 - bright teal
];

export default function ContributionHeatmap({ commits = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const { weeks, total, maxCount, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Last 371 days so we always have full weeks
    const start = new Date(today);
    start.setDate(start.getDate() - 370);
    // Align to previous Sunday
    start.setDate(start.getDate() - start.getDay());

    const countMap = new Map();
    commits.forEach((c) => {
      if (!c.date) return;
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    const weeks = [];
    let cursor = new Date(start);
    let maxCount = 0;
    let total = 0;

    while (cursor <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const key = cursor.toISOString().slice(0, 10);
        const count = countMap.get(key) || 0;
        if (count > maxCount) maxCount = count;
        total += count;
        week.push({
          date: new Date(cursor),
          key,
          count,
          level: getLevel(count),
          isFuture: cursor > today,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    // Month labels (approximate position)
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const month = week[0].date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ index: wi, label: MONTHS[month] });
        lastMonth = month;
      }
    });

    return { weeks, total, maxCount, monthLabels };
  }, [commits]);

  if (!commits.length) {
    return (
      <div className="glass rounded-[18px] p-6">
        <h3 className="font-display text-[17px] font-medium mb-4">Contribution Activity</h3>
        <p className="text-muted-aurora text-sm">No commits yet — sync to see your heatmap.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-[18px] p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-[17px] font-medium">Contribution Activity</h3>
          <p className="text-muted-aurora text-sm mt-1">
            {total.toLocaleString()} contributions in the last year
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-faint-aurora font-mono-ui">
          <span>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-[3px]"
              style={{ background: c }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-1 ml-8 text-[10px] text-faint-aurora font-mono-ui">
          {monthLabels.map((m) => (
            <div
              key={m.index}
              className="absolute"
              style={{ left: `${m.index * 14 + 32}px` }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-[3px] mt-5">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-2 text-[10px] text-faint-aurora font-mono-ui">
            {DAYS.map((d, i) => (
              <div key={d} className="h-[12px] leading-[12px]" style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.key}
                    className="w-[12px] h-[12px] rounded-[3px] cursor-pointer transition-transform hover:scale-125"
                    style={{
                      background: day.isFuture ? 'transparent' : LEVEL_COLORS[day.level],
                      border: day.isFuture ? 'none' : '1px solid rgba(255,255,255,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                        text: `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}`,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
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