import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ActivityChart({ commits }) {
  // Group commits by date
  const dailyData = new Map();
  commits.forEach(commit => {
    const date = commit.date.split('T')[0];
    dailyData.set(date, (dailyData.get(date) || 0) + 1);
  });

  const data = Array.from(dailyData.entries())
    .map(([date, count]) => ({ date, commits: count }))
    .slice(-30);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="commits" stroke="#3B82F6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ActivityChart;