const express = require('express');
const Commit = require('../models/Commit');
const User = require('../models/User');
const { fetchGitHubUserData } = require('../services/githubService');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Start manual sync
router.post('/start', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.accessToken) {
      return res.status(400).json({ error: 'GitHub access token is not available for this user.' });
    }

    const data = await fetchGitHubUserData(user.accessToken);

    for (const commitData of data.commits) {
      const existing = await Commit.findOne({ userId: user._id, commitSha: commitData.sha });
      if (!existing) {
        await Commit.create({
          userId: user._id,
          repoName: commitData.repoName,
          visibility: commitData.visibility || 'public',
          commitSha: commitData.sha,
          date: new Date(commitData.date),
          message: commitData.message,
          additions: 0,
          deletions: 0
        });
      }
    }

    res.json({
      status: 'sync_completed',
      message: 'GitHub repositories and recent commits were synced successfully.',
      repositories: data.repos.length,
      commitsImported: data.commits.length,
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
