const express = require('express');
const Team = require('../models/Team');
const Commit = require('../models/Commit');
const User = require('../models/User');
const { calculateTeamAnalytics } = require('../services/teamAnalyticsService');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

router.get('/:teamId', isAuthenticated, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('members.userId', 'username avatarUrl email');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const isMember = team.members.some((member) => member.userId._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member' });
    }

    const memberIds = team.members.map((member) => member.userId._id);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const commits = await Commit.find({
      userId: { $in: memberIds },
      date: { $gte: startDate, $lte: endDate }
    });

    const analytics = calculateTeamAnalytics(team, commits);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
