require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

// Import routes
const authRoutes = require('./routes/auth');
const commitRoutes = require('./routes/commits');
const teamRoutes = require('./routes/teams');
const userRoutes = require('./routes/user');
const statsRoutes = require('./routes/stats');
const syncRoutes = require('./routes/sync');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devmetrics')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/commits', commitRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DevMetrics API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});