
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
// const MicrosoftStrategy = require('passport-microsoft').Strategy;


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},

async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      user = await User.create({
        username: profile.displayName,
        email: profile.emails[0].value,
        googleRefreshToken: refreshToken
      });
    } else {
      user.googleRefreshToken = refreshToken;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));


// Required for session handling
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
// passport.use(new MicrosoftStrategy({
//     clientID: process.env.MICROSOFT_CLIENT_ID,
//     clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
//     callbackURL: "http://localhost:5000/auth/microsoft/callback",
//     scope: ['user.read', 'calendars.readwrite', 'offline_access'],
//     authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
//     tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ email: profile.emails[0].value });

//       if (!user) {
//         user = await User.create({
//           username: profile.displayName.replace(/\s+/g, ''), // remove spaces
//           email: profile.emails[0].value,
//           microsoftRefreshToken: refreshToken,
//           calendarProvider: 'microsoft'
//         });
//       } else {
//         user.microsoftRefreshToken = refreshToken;
//         user.calendarProvider = 'microsoft';
//         await user.save();
//       }

//       return done(null, user);
//     } catch (err) {
//       return done(err, null);
//     }
//   }
// ));