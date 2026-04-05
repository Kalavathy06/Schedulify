
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Step 1: Redirect to Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
    accessType: 'offline', // <--- CRITICAL: Required to get the refresh token
    prompt: 'consent'      // <--- CRITICAL: Forces Google to give the token every time
  })
);

// Step 2: Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Pass the username back to the React frontend in the URL
    res.redirect(`https://schedulify-orcin.vercel.app/?username=${req.user.username}`);
  }
);

module.exports = router;