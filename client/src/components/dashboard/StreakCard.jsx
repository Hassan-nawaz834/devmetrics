// client/src/components/dashboard/StreakCard.jsx
import React, { useMemo } from 'react';
import '../../dashboardTheme.css'; // adjust path to wherever you saved dashboardTheme.css

function StreakCard({ commits }) {
  const streakData = useMemo(() => {
    if (!commits || commits.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastCommitDate: null };
    }

    // Get unique dates
    const dates = commits
      .map(commit => {
        try {
          return new Date(commit.date).toISOString().split('T')[0];
        } catch (e) {
          return null;
        }
      })
      .filter(date => date !== null)
      .sort();

    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastCommitDate: null };
    }

    // Remove duplicates
    const uniqueDates = [...new Set(dates)];

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastDate = uniqueDates[uniqueDates.length - 1];

    // Check if there's a commit today or yesterday to continue streak
    const hasRecentCommit = lastDate === today || lastDate === yesterday;

    if (hasRecentCommit) {
      // Calculate current streak from most recent date backwards
      currentStreak = 1;
      let currentDate = new Date(lastDate);

      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
          currentDate = prevDate;
        } else if (diffDays > 1) {
          break;
        }
      }
    }

    // Calculate longest streak
    if (uniqueDates.length > 1) {
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      longestStreak = uniqueDates.length > 0 ? 1 : 0;
    }

    return {
      currentStreak,
      longestStreak,
      lastCommitDate: lastDate || null,
      totalCommits: commits.length,
      totalDays: uniqueDates.length
    };
  }, [commits]);

  const getStreakEmoji = (streak) => {
    if (streak === 0) return '😴';
    if (streak < 3) return '💪';
    if (streak < 7) return '🔥';
    if (streak < 14) return '⭐';
    if (streak < 30) return '🚀';
    return '🏆';
  };

  const getStreakColor = (streak) => {
    if (streak === 0) return 'text-faint-aurora';
    if (streak < 3) return 'text-[var(--teal)]';
    if (streak < 7) return 'text-[var(--violet)]';
    if (streak < 14) return 'text-[var(--gold)]';
    if (streak < 30) return 'gradient-text-warm';
    return 'gradient-text-warm';
  };

  const isActiveToday = streakData.lastCommitDate === new Date().toISOString().split('T')[0];

  return (
    <div className="glass rounded-[18px] p-6 text-[var(--text)]">
      <h3 className="font-display text-[17px] font-medium mb-5">Commit Streak</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Current Streak */}
        <div className="rounded-xl p-4 text-center bg-[rgba(45,212,191,0.1)] border border-[rgba(45,212,191,0.2)]">
          <div className="text-[12px] text-faint-aurora">Current Streak</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={`font-display text-4xl font-medium ${getStreakColor(streakData.currentStreak)}`}>
              {streakData.currentStreak}
            </span>
            <span className="text-3xl">{getStreakEmoji(streakData.currentStreak)}</span>
          </div>
          <div className="text-[11px] text-faint-aurora mt-1">
            {streakData.currentStreak === 0 ? 'No activity recently' :
              streakData.currentStreak === 1 ? 'Day' : 'Days'}
          </div>
        </div>

        {/* Longest Streak */}
        <div className="rounded-xl p-4 text-center bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)]">
          <div className="text-[12px] text-faint-aurora">Longest Streak</div>
          <div className="font-display text-4xl font-medium text-[var(--violet)] mt-1">
            {streakData.longestStreak}
          </div>
          <div className="text-[11px] text-faint-aurora mt-1">
            {streakData.longestStreak === 1 ? 'Day' : 'Days'} record
          </div>
        </div>

        {/* Total Commits */}
        <div className="rounded-xl p-4 text-center bg-[rgba(45,212,191,0.1)] border border-[rgba(45,212,191,0.2)]">
          <div className="text-[12px] text-faint-aurora">Total Commits</div>
          <div className="font-display text-4xl font-medium text-[var(--teal)] mt-1">
            {streakData.totalCommits || 0}
          </div>
          <div className="text-[11px] text-faint-aurora mt-1">
            Across {streakData.totalDays || 0} days
          </div>
        </div>

        {/* Last Active */}
        <div className="rounded-xl p-4 text-center bg-[rgba(251,191,103,0.1)] border border-[rgba(251,191,103,0.2)]">
          <div className="text-[12px] text-faint-aurora">Last Active</div>
          <div className="font-display text-xl font-medium text-[var(--gold)] mt-1">
            {streakData.lastCommitDate ?
              new Date(streakData.lastCommitDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) :
              'Never'
            }
          </div>
          <div className="text-[11px] text-faint-aurora mt-1">
            {isActiveToday ? '🎉 Active today!' : streakData.lastCommitDate ? 'Keep going!' : 'Start coding!'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between font-mono-ui text-[11.5px] text-faint-aurora mb-1.5">
          <span>Streak Progress</span>
          <span>{streakData.currentStreak} / 30 days</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((streakData.currentStreak / 30) * 100, 100)}%`,
              background: 'linear-gradient(90deg, #2dd4bf, #a78bfa)'
            }}
          />
        </div>
        {streakData.currentStreak >= 30 && (
          <div className="mt-2.5 text-center text-[12.5px] font-semibold gradient-text-warm">
            🎉 Legendary streak! 30+ days!
          </div>
        )}
      </div>
    </div>
  );
}

export default StreakCard;