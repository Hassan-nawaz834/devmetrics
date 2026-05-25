const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String },
  avatarUrl: { type: String },
  accessToken: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  settings: {
    syncFrequency: { type: String, default: 'daily', enum: ['daily', 'weekly', 'manual'] },
    privateRepos: { type: Boolean, default: false },
    emailReports: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('User', userSchema);