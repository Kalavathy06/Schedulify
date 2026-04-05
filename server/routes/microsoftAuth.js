const express = require('express');
const passport = require('passport');
const router = express.Router();

// Redirect to Microsoft
router.get('/microsoft',
  passport.authenticate('microsoft', {
    prompt: 'select_account'
  })
);

// Microsoft Callback
router.get('/microsoft/callback', 
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`https://schedulify-orcin.vercel.app/?username=${req.user.username}`);
  }
);

module.exports = router;