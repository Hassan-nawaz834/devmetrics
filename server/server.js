const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());

require('./config/passport');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/commits', require('./routes/commits'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/repositories', require('./routes/repositories'));
app.use('/api/user', require('./routes/user'));
// Keep the other route files if you still use teams/sync – apply the same `auth` middleware pattern to them.

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devmetrics')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));