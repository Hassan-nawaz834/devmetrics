const express = require('express');
const Commit = require('../models/Commit');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Get user's commits
router.get('/', isAuthenticated, async (req, res) => {
  const { limit = 100, repo } = req.query;
  const query = { userId: req.user._id };
  if (repo) query.repoName = repo;
  
  const commits = await Commit.find(query)
    .sort({ date: -1 })
    .limit(parseInt(limit));
  
  res.json(commits);
});

// Get commit statistics
router.get('/stats', isAuthenticated, async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const commits = await Commit.find({
    userId: req.user._id,
    date: { $gte: thirtyDaysAgo }
  });
  
  const totalCommits = commits.length;
  const totalAdditions = commits.reduce((sum, c) => sum + (c.additions || 0), 0);
  const totalDeletions = commits.reduce((sum, c) => sum + (c.deletions || 0), 0);
  
  const repoStats = {};
  commits.forEach(commit => {
    if (!repoStats[commit.repoName]) repoStats[commit.repoName] = 0;
    repoStats[commit.repoName]++;
  });
  
  res.json({
    totalCommits,
    totalAdditions,
    totalDeletions,
    repos: Object.entries(repoStats).map(([name, count]) => ({ name, count }))
  });
});

// Get heatmap data
router.get('/heatmap', isAuthenticated, async (req, res) => {
  const commits = await Commit.find({ userId: req.user._id });
  
  const heatmapData = {};
  commits.forEach(commit => {
    const dateKey = commit.date.toISOString().split('T')[0];
    heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;
  });
  
  res.json(heatmapData);
});

module.exports = router;