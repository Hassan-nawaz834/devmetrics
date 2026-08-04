const express = require('express');
const Commit = require('../models/Commit');
const { buildProductivitySummary } = require('../services/productivityService');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Get user's overall stats
router.get('/overview', isAuthenticated, async (req, res) => {
  try {
    const commits = await Commit.find({ userId: req.user._id }).sort({ date: 1 });
    const summary = buildProductivitySummary(commits);

    res.json({
      ...summary,
      averageCommitsPerDay: summary.averageDailyCommits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get heatmap data
router.get('/heatmap', isAuthenticated, async (req, res) => {
  try {
    const commits = await Commit.find({ userId: req.user._id });
    const heatmap = new Array(7).fill(0).map(() => new Array(24).fill(0));
    
    commits.forEach(commit => {
      if (commit.dayOfWeek !== undefined && commit.hour !== undefined) {
        heatmap[commit.dayOfWeek][commit.hour]++;
      }
    });
    
    res.json({ heatmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get streak info
router.get('/streak', isAuthenticated, async (req, res) => {
  try {
    const commits = await Commit.find({ userId: req.user._id }).sort({ date: -1 });
    
    const uniqueDates = [...new Set(commits.map(c => c.date?.toDateString()))].sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i > 0) {
        const curr = new Date(uniqueDates[i]);
        const prev = new Date(uniqueDates[i - 1]);
        const diff = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          tempStreak++;
        } else if (diff === 0) {
          continue;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastCommitDate = commits[0]?.date?.toDateString();
    currentStreak = (lastCommitDate === today || lastCommitDate === yesterday) ? tempStreak : 0;
    
    res.json({
      currentStreak,
      longestStreak,
      totalCommitDays: uniqueDates.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
