const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  avatarUrl: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  invites: [{
    code: { type: String, unique: true },
    expiresAt: { type: Date },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  settings: {
    publicLeaderboard: { type: Boolean, default: true },
    allowMemberInvites: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

teamSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Team', teamSchema);