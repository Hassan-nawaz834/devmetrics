// client/src/components/dashboard/PeakHours.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../../dashboardTheme.css'; // adjust path to wherever you saved dashboardTheme.css

function PeakHours({ commits }) {
  if (!commits || commits.length === 0) {
    return (
      <div className="glass rounded-[18px] p-6 text-[var(--text)]">
        <h3 className="font-display text-[17px] font-medium mb-4">Peak Hours</h3>
        <div className="h-64 flex items-center justify-center text-faint-aurora text-sm">
          No commit data available
        </div>
      </div>
    );
  }

  const hours = new Array(24).fill(0);
  commits.forEach((commit) => {
    try {
      const hour = new Date(commit.date).getHours();
      hours[hour] += 1;
    } catch (e) {
      // Handle invalid date
    }
  });

  const topHour = hours.reduce(
    (best, count, index) => (count > best.count ? { hour: index, count } : best),
    { hour: 0, count: 0 }
  );

  const data = hours.map((count, hour) => ({
    hour: hour.toString(),
    commits: count,
    formattedHour: `${hour}:00`
  }));

  const totalCommits = hours.reduce((sum, count) => sum + count, 0);
  const activeHours = hours.filter(h => h > 0).length;
  const peakPercentage = totalCommits > 0 ? ((topHour.count / totalCommits) * 100).toFixed(1) : 0;

  const getTimeOfDay = (hour) => {
    if (hour >= 5 && hour < 12) return '🌅 Morning';
    if (hour >= 12 && hour < 17) return '☀️ Afternoon';
    if (hour >= 17 && hour < 21) return '🌆 Evening';
    return '🌙 Night';
  };

  return (
    <div className="glass rounded-[18px] p-6 text-[var(--text)]">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="font-display text-[17px] font-medium">Peak Hours</h3>
        <div className="flex gap-4 font-mono-ui text-[11.5px]">
          <span className="text-faint-aurora">
            Total: <span className="text-[var(--text)] font-semibold">{totalCommits}</span>
          </span>
          <span className="text-faint-aurora">
            Active Hours: <span className="text-[var(--text)] font-semibold">{activeHours}/24</span>
          </span>
        </div>
      </div>

      {/* Peak Hour Statistics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl p-3 text-center bg-[rgba(45,212,191,0.1)] border border-[rgba(45,212,191,0.2)]">
          <div className="text-[11px] text-faint-aurora">Peak Hour</div>
          <div className="text-lg font-display font-medium text-[var(--teal)] mt-0.5">
            {topHour.count > 0 ? `${topHour.hour}:00` : 'N/A'}
          </div>
        </div>
        <div className="rounded-xl p-3 text-center bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)]">
          <div className="text-[11px] text-faint-aurora">Commits</div>
          <div className="text-lg font-display font-medium text-[var(--violet)] mt-0.5">{topHour.count}</div>
        </div>
        <div className="rounded-xl p-3 text-center bg-[rgba(251,191,103,0.1)] border border-[rgba(251,191,103,0.2)]">
          <div className="text-[11px] text-faint-aurora">Time of Day</div>
          <div className="text-lg font-display font-medium text-[var(--gold)] mt-0.5">
            {topHour.count > 0 ? getTimeOfDay(topHour.hour) : 'N/A'}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="formattedHour"
            tick={{ fontSize: 10, fill: '#a3a1c2' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            interval={2}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#a3a1c2' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
          />
          <Tooltip
            formatter={(value) => [`${value} commits`, 'Commits']}
            labelFormatter={(label) => `Time: ${label}`}
            contentStyle={{
              background: '#12132b',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: '#f1f0f8'
            }}
            labelStyle={{ color: '#a3a1c2' }}
            itemStyle={{ color: '#a78bfa' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar
            dataKey="commits"
            fill="#a78bfa"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {topHour.count > 0 && (
        <div className="mt-4 text-[12.5px] text-muted-aurora text-center bg-white/[0.03] border border-[var(--border)] rounded-xl p-2.5">
          ⚡ Most productive hour: <span className="font-semibold text-[var(--text)]">{topHour.hour}:00</span>
          {' '}with {topHour.count} commits ({peakPercentage}% of total)
        </div>
      )}
    </div>
  );
}

export default PeakHours;