require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');

// ---------- Routes ----------
const authRoutes = require('./routes/auth');
const commitRoutes = require('./routes/commits');
const repositoryRoutes = require('./routes/repositories');
const statsRoutes = require('./routes/stats');
const syncRoutes = require('./routes/sync');
const teamRoutes = require('./routes/teams');
const teamAnalyticsRoutes = require('./routes/teamAnalytics');
const userRoutes = require('./routes/user');
const publicRoutes = require('./routes/public');
const aiRoutes = require('./routes/ai');               // ← AI Weekly Digest

const app = express();

// ---------- Middleware ----------
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport
app.use(passport.initialize());

// ---------- API Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/commits', commitRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-analytics', teamAnalyticsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ai', aiRoutes);                          // ← AI route

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- Database + Start Server ----------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/devmetrics';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;