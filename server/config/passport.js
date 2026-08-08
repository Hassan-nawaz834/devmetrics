// server/config/passport.js
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
  scope: ['user:email', 'repo']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub Profile:', profile);
    
    // Check if user exists with this GitHub ID
    let user = await User.findOne({ githubId: profile.id });

    if (user) {
      // Update tokens
      user.githubToken = accessToken;
      user.githubUsername = profile.username;
      user.avatarUrl = profile.photos?.[0]?.value || '';
      user.updatedAt = new Date();
      await user.save();
      return done(null, user);
    }

    // Get primary email from GitHub
    const emails = profile.emails || [];
    const primaryEmail = emails.find(e => e.primary)?.value || emails[0]?.value;

    // Check if user exists with the same email (for existing users)
    if (primaryEmail) {
      user = await User.findOne({ email: primaryEmail });
      if (user) {
        // Connect GitHub to existing account
        user.githubId = profile.id;
        user.githubToken = accessToken;
        user.githubUsername = profile.username;
        user.avatarUrl = profile.photos?.[0]?.value || '';
        user.authProvider = 'github';
        user.updatedAt = new Date();
        await user.save();
        return done(null, user);
      }
    }

    // Create new user
    const username = profile.username || profile.displayName || `github_${profile.id}`;
    let uniqueUsername = username;
    let counter = 1;
    
    // Make sure username is unique
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${username}_${counter}`;
      counter++;
    }

    const newUser = new User({
      username: uniqueUsername,
      email: primaryEmail || `github_${profile.id}@temp.user`, // Temporary email if none provided
      password: undefined, // No password for GitHub users
      githubId: profile.id,
      githubToken: accessToken,
      githubUsername: profile.username,
      avatarUrl: profile.photos?.[0]?.value || '',
      authProvider: 'github'
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));
module.exports = passport;