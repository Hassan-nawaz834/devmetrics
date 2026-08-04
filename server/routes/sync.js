const express = require('express');
const Commit = require('../models/Commit');
const User = require('../models/User');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Start manual sync
router.post('/start', isAuthenticated, async (req, res) => {
  try {
    // Placeholder for GitHub sync logic
    // In a real implementation, this would:
    // 1. Fetch user's repos from GitHub
    // 2. Fetch commits from each repo
    // 3. Parse and store commits in DB
    
    res.json({
      status: 'sync_started',
      message: 'Sync job initiated. GitHub API sync would run here.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sync status
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    const commits = await Commit.find({ userId: req.user._id });
    
    res.json({
      status: 'idle',
      lastSync: commits.length > 0 ? commits[0].date : null,
      totalCommitsSynced: commits.length,
      message: 'Ready for manual sync'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
