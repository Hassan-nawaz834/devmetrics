const express = require('express');
const Commit = require('../models/Commit');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { limit = 200, repo, visibility } = req.query;
    const query = { userId: req.user._id };
    if (repo) query.repoName = repo;
    if (visibility) query.visibility = visibility;

    const commits = await Commit.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    res.json(commits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = await Commit.find({ userId: req.user._id, date: { $gte: thirtyDaysAgo } });
    const all = await Commit.find({ userId: req.user._id });

    res.json({
      totalCommits: recent.length,
      totalAdditions: recent.reduce((s, c) => s + (c.additions || 0), 0),
      totalDeletions: recent.reduce((s, c) => s + (c.deletions || 0), 0),
      allTimeCommits: all.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;