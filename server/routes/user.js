const express = require('express');
const User = require('../models/User');
const Commit = require('../models/Commit');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

router.put('/settings', auth, async (req, res) => {
  try {
    const { syncFrequency, privateRepos, emailReports } = req.body;
    req.user.settings = {
      ...(req.user.settings || {}),
      syncFrequency: syncFrequency ?? req.user.settings?.syncFrequency ?? 'daily',
      privateRepos: privateRepos !== undefined ? privateRepos : req.user.settings?.privateRepos ?? true,
      emailReports: emailReports !== undefined ? emailReports : req.user.settings?.emailReports ?? false
    };
    await req.user.save();
    res.json({ message: 'Settings updated', settings: req.user.settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/account', auth, async (req, res) => {
  try {
    await Team.updateMany(
      { 'members.userId': req.user._id },
      { $pull: { members: { userId: req.user._id } } }
    );
    await Commit.deleteMany({ userId: req.user._id });
    await req.user.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;