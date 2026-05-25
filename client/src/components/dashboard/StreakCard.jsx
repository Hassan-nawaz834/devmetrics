import React from 'react';

function StreakCard({ commits }) {
  // Calculate current streak
  const commitDates = new Set(
    commits.map(c => c.date.split('T')[0])
  );
  
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date();
  
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (commitDates.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let current = 0;
  const sortedDates = Array.from(commitDates).sort();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    
    if (i > 0 && (currDate - prevDate) / (1000 * 60 * 60 * 24) === 1) {
      current++;
    } else {
      current = 1;
    }
    longestStreak = Math.max(longestStreak, current);
  }

  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-orange-600 mb-2">{currentStreak}</div>
      <div className="text-gray-600 mb-4">Current Streak</div>
      <div className="border-t pt-4">
        <div className="text-gray-500 text-sm">Longest Streak</div>
        <div className="text-2xl font-semibold">{longestStreak} days</div>
      </div>
    </div>
  );
}

export default StreakCard;