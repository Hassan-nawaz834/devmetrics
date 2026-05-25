const express = require('express');
const User = require('../models/User');
const Commit = require('../models/Commit');
const Team = require('../models/Team');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  const { password, accessToken, ...userWithoutSensitive } = req.user.toObject();
  res.json(userWithoutSensitive);
});

// Update settings
router.put('/settings', isAuthenticated, async (req, res) => {
  const { syncFrequency, privateRepos, emailReports } = req.body;
  
  req.user.settings = {
    ...req.user.settings,
    syncFrequency: syncFrequency || req.user.settings.syncFrequency,
    privateRepos: privateRepos !== undefined ? privateRepos : req.user.settings.privateRepos,
    emailReports: emailReports !== undefined ? emailReports : req.user.settings.emailReports
  };
  
  await req.user.save();
  res.json({ message: 'Settings updated', settings: req.user.settings });
});

// Delete account
router.delete('/account', isAuthenticated, async (req, res) => {
  // Remove user from teams
  await Team.updateMany(
    { 'members.userId': req.user._id },
    { $pull: { members: { userId: req.user._id } } }
  );
  
  // Delete user's commits
  await Commit.deleteMany({ userId: req.user._id });
  
  // Delete user
  await req.user.deleteOne();
  
  req.logout(() => {});
  res.json({ message: 'Account deleted' });
});

module.exports = router;