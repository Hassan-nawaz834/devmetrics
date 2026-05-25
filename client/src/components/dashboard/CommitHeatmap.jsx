import React from 'react';

function CommitHeatmap({ commits }) {
  // Group commits by date
  const commitMap = new Map();
  commits.forEach(commit => {
    const date = commit.date.split('T')[0];
    commitMap.set(date, (commitMap.get(date) || 0) + 1);
  });

  // Generate last 52 weeks of dates
  const today = new Date();
  const weeks = [];
  for (let i = 51; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7));
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      week.push({
        date: dateStr,
        count: commitMap.get(dateStr) || 0
      });
    }
    weeks.push(week);
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-200';
    if (count < 3) return 'bg-green-200';
    if (count < 6) return 'bg-green-400';
    return 'bg-green-600';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-pointer`}
                title={`${day.date}: ${day.count} commits`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommitHeatmap;