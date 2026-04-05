
const express = require('express');
const app = express(); 
require('dotenv').config();
require('./config/passport');

const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

// Routes
const bookingRoutes = require('./routes/booking');
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/googleAuth');

// Middleware
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Allow CORS from your React app
app.use(cors({
  origin: [
    "https://localhost:5173",
  "https://schedulify-orcin.vercel.app"
],
  credentials: true
}));
app.use(express.json()); // Only one instance needed

// Apply Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', googleAuthRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB successfully connected!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err);
    process.exit(1); // exit if DB fails
  });