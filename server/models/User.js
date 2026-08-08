// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false,
    minlength: 6
  },
  githubUsername: {
    type: String,
    trim: true
  },
  githubToken: {
    type: String
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatarUrl: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'github'],
    default: 'local'
  },
  settings: {
    syncFrequency: { type: String, default: 'daily' },
    emailReports: { type: Boolean, default: false },
    privateRepos: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (only if password is provided)
// IMPORTANT: do NOT call next() inside an async pre-hook
UserSchema.pre('save', async function () {
  // Always update the updatedAt field
  this.updatedAt = new Date();

  // Only hash if password was modified and exists
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Keep updatedAt in sync on findOneAndUpdate
UserSchema.pre('findOneAndUpdate', function () {
  this.set({ updatedAt: new Date() });
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// Never return password or githubToken in JSON
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.githubToken;
    return ret;
  }
});

// Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;