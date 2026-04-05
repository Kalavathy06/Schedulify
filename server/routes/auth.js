//C:\schedulify-app\server\routes\auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// REGISTER

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ email });
  if(existing) return res.status(400).json({ error: "User exists" });

  const user = await User.create({ username, email, password });

  res.json({ message: "User registered" });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token, username: user.username });

  } catch (err) {
    console.error("LOGIN ERROR:", err);   // 👈 VERY IMPORTANT
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;