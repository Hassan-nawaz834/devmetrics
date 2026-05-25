const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const router = express.Router();

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        email: profile.emails?.[0]?.value,
        avatarUrl: profile.photos?.[0]?.value,
        accessToken: accessToken
      });
    } else {
      user.accessToken = accessToken;
      user.lastLogin = new Date();
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Routes
router.get('/github', passport.authenticate('github', { scope: ['repo', 'user:email'] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  });
});

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

module.exports = router;