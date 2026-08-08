const express = require('express');
const User = require('../models/User');
const Commit = require('../models/Commit');
const Repository = require('../models/Repository');

const router = express.Router();

/**
 * GET /api/public/:username
 * Fully public – no auth required.
 * Returns a safe, shareable profile summary.
 */
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: new RegExp(`^${username}$`, 'i')
    }).select('username avatarUrl githubUsername createdAt settings');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Optional: respect a future "publicProfile" setting
    // if (user.settings?.publicProfile === false) {
    //   return res.status(403).json({ success: false, error: 'Profile is private' });
    // }

    const userId = user._id;

    // ----- Commits -----
    const commits = await Commit.find({ userId })
      .sort({ date: -1 })
      .select('date hour dayOfWeek repoName message additions deletions')
      .lean();

    // ----- Repositories (for language + repo stats) -----
    const repos = await Repository.find({ userId })
      .select('name language fullName private')
      .lean();

    // ----- Basic stats -----
    const totalCommits = commits.length;
    const totalAdditions = commits.reduce((s, c) => s + (c.additions || 0), 0);
    const totalDeletions = commits.reduce((s, c) => s + (c.deletions || 0), 0);

    // Unique active days
    const uniqueDates = [
      ...new Set(
        commits
          .filter((c) => c.date)
          .map((c) => new Date(c.date).toDateString())
      ),
    ].sort();

    // Streak calculation (same logic as your existing /stats/streak)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const curr = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i - 1]);
      const diff = Math.floor((curr - prev) / 86400000);
      if (diff === 1) tempStreak++;
      else if (diff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const last = uniqueDates[uniqueDates.length - 1];
    currentStreak =
      last === today || last === yesterday ? tempStreak : 0;

    // ----- Top languages (from primary language field) -----
    const langMap = {};
    repos.forEach((r) => {
      if (r.language && r.language !== 'N/A') {
        langMap[r.language] = (langMap[r.language] || 0) + 1;
      }
    });
    const topLanguages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // ----- Top repositories by commit count -----
    const repoCommitCount = {};
    commits.forEach((c) => {
      const name = c.repoName || 'Unknown';
      repoCommitCount[name] = (repoCommitCount[name] || 0) + 1;
    });
    const topRepos = Object.entries(repoCommitCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, commits]) => ({ name, commits }));

    // ----- Contribution calendar data (last 365 days) -----
    const contributionMap = {};
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    commits.forEach((c) => {
      if (!c.date) return;
      const d = new Date(c.date);
      if (d < oneYearAgo) return;
      const key = d.toISOString().slice(0, 10);
      contributionMap[key] = (contributionMap[key] || 0) + 1;
    });

    const contributionDays = Object.entries(contributionMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ----- Peak hour & busiest day (nice extras) -----
    const hourCount = Array(24).fill(0);
    const dayCount = Array(7).fill(0);
    commits.forEach((c) => {
      if (c.hour != null) hourCount[c.hour]++;
      if (c.dayOfWeek != null) dayCount[c.dayOfWeek]++;
    });
    const peakHour = hourCount.indexOf(Math.max(...hourCount));
    const busiestDayIdx = dayCount.indexOf(Math.max(...dayCount));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    res.json({
      success: true,
      profile: {
        username: user.username,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        joinedAt: user.createdAt,
      },
      stats: {
        totalCommits,
        totalRepos: repos.length,
        currentStreak,
        longestStreak,
        totalAdditions,
        totalDeletions,
        uniqueDays: uniqueDates.length,
        peakHour,
        busiestDay: dayNames[busiestDayIdx] || null,
      },
      topLanguages,
      topRepos,
      contributionDays,
    });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to load profile' });
  }
});

module.exports = router;