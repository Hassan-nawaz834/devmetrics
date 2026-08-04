const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repoName: { type: String, required: true },
  visibility: { type: String, default: 'public', enum: ['public', 'private'] },
  commitSha: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  hour: { type: Number },
  dayOfWeek: { type: Number },
  message: { type: String },
  additions: { type: Number, default: 0 },
  deletions: { type: Number, default: 0 }
});

commitSchema.index({ userId: 1, date: -1 });
commitSchema.index({ userId: 1, repoName: 1 });

module.exports = mongoose.model('Commit', commitSchema);