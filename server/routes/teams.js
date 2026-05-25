const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const Commit = require('../models/Commit');

const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Get all teams for current user
router.get('/', isAuthenticated, async (req, res) => {
  const teams = await Team.find({ 'members.userId': req.user._id })
    .populate('members.userId', 'username avatarUrl');
  res.json(teams);
});

// Create team
router.post('/', isAuthenticated, async (req, res) => {
  const { name, description } = req.body;
  
  const team = new Team({
    name,
    description,
    ownerId: req.user._id,
    members: [{ userId: req.user._id, role: 'admin' }]
  });
  
  await team.save();
  res.status(201).json(team);
});

// Get team details
router.get('/:teamId', isAuthenticated, async (req, res) => {
  const team = await Team.findById(req.params.teamId)
    .populate('members.userId', 'username avatarUrl email');
  
  const isMember = team.members.some(m => m.userId._id.toString() === req.user._id.toString());
  if (!isMember) return res.status(403).json({ error: 'Not a member' });
  
  res.json(team);
});

// Update team
router.put('/:teamId', isAuthenticated, async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  
  const isAdmin = team.members.some(m => 
    m.userId.toString() === req.user._id.toString() && m.role === 'admin'
  );
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });
  
  team.name = req.body.name || team.name;
  team.description = req.body.description || team.description;
  team.updatedAt = new Date();
  await team.save();
  
  res.json(team);
});

// Delete team
router.delete('/:teamId', isAuthenticated, async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  
  if (team.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Only owner can delete' });
  }
  
  await team.deleteOne();
  res.json({ message: 'Team deleted' });
});

// Add member
router.post('/:teamId/members', isAuthenticated, async (req, res) => {
  const { email } = req.body;
  const team = await Team.findById(req.params.teamId);
  
  const isAdmin = team.members.some(m => 
    m.userId.toString() === req.user._id.toString() && m.role === 'admin'
  );
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });
  
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) return res.status(404).json({ error: 'User not found' });
  
  const alreadyMember = team.members.some(m => m.userId.toString() === userToAdd._id.toString());
  if (alreadyMember) return res.status(400).json({ error: 'Already a member' });
  
  team.members.push({ userId: userToAdd._id, role: 'member' });
  await team.save();
  
  res.json({ message: 'Member added', member: userToAdd });
});

// Remove member
router.delete('/:teamId/members/:userId', isAuthenticated, async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  
  const isAdmin = team.members.some(m => 
    m.userId.toString() === req.user._id.toString() && m.role === 'admin'
  );
  const isSelf = req.params.userId === req.user._id.toString();
  
  if (!isAdmin && !isSelf) return res.status(403).json({ error: 'Cannot remove' });
  if (req.params.userId === team.ownerId.toString()) {
    return res.status(400).json({ error: 'Cannot remove owner' });
  }
  
  team.members = team.members.filter(m => m.userId.toString() !== req.params.userId);
  await team.save();
  
  res.json({ message: 'Member removed' });
});

// Generate invite
router.post('/:teamId/invite', isAuthenticated, async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  
  const isAdmin = team.members.some(m => 
    m.userId.toString() === req.user._id.toString() && m.role === 'admin'
  );
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });
  
  const inviteCode = Math.random().toString(36).substring(2, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  team.invites.push({ code: inviteCode, expiresAt, invitedBy: req.user._id });
  await team.save();
  
  res.json({ inviteLink: `${process.env.FRONTEND_URL}/join-team/${inviteCode}`, code: inviteCode });
});

// Join team
router.post('/join/:inviteCode', isAuthenticated, async (req, res) => {
  const team = await Team.findOne({ 'invites.code': req.params.inviteCode });
  if (!team) return res.status(404).json({ error: 'Invalid invite' });
  
  const invite = team.invites.find(i => i.code === req.params.inviteCode);
  if (invite.expiresAt < new Date()) return res.status(400).json({ error: 'Invite expired' });
  
  const alreadyMember = team.members.some(m => m.userId.toString() === req.user._id.toString());
  if (alreadyMember) return res.status(400).json({ error: 'Already a member' });
  
  team.members.push({ userId: req.user._id, role: 'member' });
  team.invites = team.invites.filter(i => i.code !== req.params.inviteCode);
  await team.save();
  
  res.json({ message: 'Joined team', team });
});

// Team analytics
router.get('/:teamId/analytics', isAuthenticated, async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  
  const isMember = team.members.some(m => m.userId.toString() === req.user._id.toString());
  if (!isMember) return res.status(403).json({ error: 'Not a member' });
  
  const memberIds = team.members.map(m => m.userId);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  const commits = await Commit.find({
    userId: { $in: memberIds },
    date: { $gte: startDate, $lte: endDate }
  });
  
  const memberStats = {};
  memberIds.forEach(id => { memberStats[id] = { commits: 0, additions: 0, deletions: 0 }; });
  
  commits.forEach(commit => {
    const userIdStr = commit.userId.toString();
    if (memberStats[userIdStr]) {
      memberStats[userIdStr].commits++;
      memberStats[userIdStr].additions += commit.additions || 0;
      memberStats[userIdStr].deletions += commit.deletions || 0;
    }
  });
  
  const analytics = {
    teamName: team.name,
    totalCommits: commits.length,
    totalAdditions: commits.reduce((sum, c) => sum + (c.additions || 0), 0),
    totalDeletions: commits.reduce((sum, c) => sum + (c.deletions || 0), 0),
    memberStats: await Promise.all(team.members.map(async (member) => {
      const user = await User.findById(member.userId);
      return {
        user: { id: user._id, username: user.username, avatarUrl: user.avatarUrl },
        role: member.role,
        stats: memberStats[member.userId.toString()] || { commits: 0, additions: 0, deletions: 0 }
      };
    }))
  };
  
  res.json(analytics);
});

module.exports = router;