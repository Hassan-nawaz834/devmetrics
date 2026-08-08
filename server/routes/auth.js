// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const signToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '7d' });

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  githubUsername: user.githubUsername,
  avatarUrl: user.avatarUrl,
  authProvider: user.authProvider,
  settings: user.settings || {}
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User already exists with this email or username' });
    }

    const user = new User({ username, email, password, authProvider: 'local' });
    await user.save();

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or use GitHub login' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -githubToken');
    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email', 'repo'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${FRONTEND_URL}/login?error=github_auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      const token = signToken(req.user);
      const userData = publicUser(req.user);
      const redirectUrl = `${FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
    }
  }
);

module.exports = router;