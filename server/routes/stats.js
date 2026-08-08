const express = require('express');
const Commit = require('../models/Commit');
const Repository = require('../models/Repository');
const auth = require('../middleware/auth');
const { buildProductivitySummary } = require('../services/productivityService');

const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {
  try {
    const commits = await Commit.find({ userId: req.user._id });
    const repos = await Repository.find({ userId: req.user._id });

    res.json({
      totalCommits: commits.length,
      repositories: repos.length,
      contributors: 1,
      lastUpdated: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/overview', auth, async (req, res) => {
  try {
    const commits = await Commit.find({ userId: req.user._id }).sort({ date: 1 });
    const summary = buildProductivitySummary(commits);
    res.json({ ...summary, averageCommitsPerDay: summary.averageDailyCommits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/streak', auth, async (req, res) => {
  try {
    const commits = await Commit.find({ userId: req.user._id }).sort({ date: -1 });
    const uniqueDates = [...new Set(commits.map((c) => c.date?.toDateString()).filter(Boolean))].sort();

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
    const last = commits[0]?.date?.toDateString();
    currentStreak = last === today || last === yesterday ? tempStreak : 0;

    res.json({ currentStreak, longestStreak, totalCommitDays: uniqueDates.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;