const express = require('express');
const Commit = require('../models/Commit');
const Repository = require('../models/Repository');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Get user's commits
router.get('/', isAuthenticated, async (req, res) => {
  const { limit = 100, repo, visibility } = req.query;
  const query = { userId: req.user._id };
  if (repo) query.repoName = repo;
  if (visibility) query.visibility = visibility;
  
  const commits = await Commit.find(query)
    .sort({ date: -1 })
    .limit(parseInt(limit));
  
  res.json(commits);
});

// Get commit statistics
router.get('/stats', isAuthenticated, async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCommits = await Commit.find({
    userId: req.user._id,
    date: { $gte: thirtyDaysAgo }
  });
  const allCommits = await Commit.find({ userId: req.user._id });
  const repositories = await Repository.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  
  const totalCommits = recentCommits.length;
  const totalAdditions = recentCommits.reduce((sum, c) => sum + (c.additions || 0), 0);
  const totalDeletions = recentCommits.reduce((sum, c) => sum + (c.deletions || 0), 0);
  
  const repoStats = {};
  repositories.forEach((repo) => {
    repoStats[repo.name] = {
      name: repo.name,
      count: 0,
      visibility: repo.visibility || 'public'
    };
  });

  allCommits.forEach(commit => {
    const key = commit.repoName;
    if (!repoStats[key]) {
      repoStats[key] = { name: commit.repoName, count: 0, visibility: commit.visibility || 'public' };
    }
    repoStats[key].count++;
  });
  
  res.json({
    totalCommits,
    totalAdditions,
    totalDeletions,
    repos: Object.values(repoStats)
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