const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  githubId: { type: Number, required: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  owner: { type: String, default: '' },
  private: { type: Boolean, default: false },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  language: { type: String },
  defaultBranch: { type: String },
  updatedAt: { type: Date },
  lastSyncedAt: { type: Date, default: Date.now }
});

repositorySchema.index({ userId: 1, githubId: 1 }, { unique: true });

module.exports = mongoose.model('Repository', repositorySchema);
