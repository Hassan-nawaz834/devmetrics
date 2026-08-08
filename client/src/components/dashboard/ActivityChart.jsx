// client/src/components/dashboard/ActivityChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../../dashboardTheme.css'; // adjust path to wherever you saved dashboardTheme.css

function ActivityChart({ commits, title = "Commit Activity" }) {
  // Group commits by date
  const dailyData = new Map();

  if (!commits || commits.length === 0) {
    return (
      <div className="glass rounded-[18px] p-6 text-[var(--text)]">
        <h3 className="font-display text-[17px] font-medium mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-faint-aurora text-sm">
          No commit data available
        </div>
      </div>
    );
  }

  commits.forEach(commit => {
    const date = commit.date ? commit.date.split('T')[0] : new Date().toISOString().split('T')[0];
    dailyData.set(date, (dailyData.get(date) || 0) + 1);
  });

  // Sort dates and get last 30 days
  const data = Array.from(dailyData.entries())
    .map(([date, count]) => ({ date, commits: count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30);

  // Calculate stats
  const totalCommits = data.reduce((sum, d) => sum + d.commits, 0);
  const avgCommits = data.length > 0 ? (totalCommits / data.length).toFixed(1) : 0;
  const maxCommits = data.length > 0 ? Math.max(...data.map(d => d.commits)) : 0;

  return (
    <div className="glass rounded-[18px] p-6 text-[var(--text)]">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="font-display text-[17px] font-medium">{title}</h3>
        <div className="flex gap-4 font-mono-ui text-[11.5px]">
          <span className="text-faint-aurora">
            Total: <span className="text-[var(--text)] font-semibold">{totalCommits}</span>
          </span>
          <span className="text-faint-aurora">
            Avg: <span className="text-[var(--text)] font-semibold">{avgCommits}</span>
          </span>
          <span className="text-faint-aurora">
            Peak: <span className="text-[var(--text)] font-semibold">{maxCommits}</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#a3a1c2' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            tickFormatter={(date) => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#a3a1c2' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
          />
          <Tooltip
            formatter={(value) => [`${value} commits`, 'Commits']}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              background: '#12132b',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: '#f1f0f8'
            }}
            labelStyle={{ color: '#a3a1c2' }}
            itemStyle={{ color: '#2dd4bf' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#a3a1c2' }} />
          <Line
            type="monotone"
            dataKey="commits"
            stroke="#2dd4bf"
            strokeWidth={2}
            dot={{ fill: '#2dd4bf', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 7, fill: '#a78bfa', stroke: '#0a0a18', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ActivityChart;