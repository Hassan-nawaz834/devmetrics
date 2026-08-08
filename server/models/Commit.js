// server/models/Commit.js
const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  repoName: { 
    type: String, 
    required: true 
  },
  visibility: { 
    type: String, 
    default: 'public', 
    enum: ['public', 'private'] 
  },
  commitSha: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  hour: { 
    type: Number 
  },
  dayOfWeek: { 
    type: Number 
  },
  message: { 
    type: String, 
    default: '' 
  },
  additions: { 
    type: Number, 
    default: 0 
  },
  deletions: { 
    type: Number, 
    default: 0 
  }
});

// IMPORTANT: For Atlas, use this compound unique index
// This allows same SHA for different users, but not same user+sha
commitSchema.index(
  { userId: 1, commitSha: 1 }, 
  { unique: true, name: 'userId_1_commitSha_1' }
);

// Query indexes for performance
commitSchema.index({ userId: 1, date: -1 });
commitSchema.index({ userId: 1, repoName: 1 });

// Prevent OverwriteModelError
const Commit = mongoose.models.Commit || mongoose.model('Commit', commitSchema);

module.exports = Commit;