const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const authController = require('../controllers/authController');
const crypto = require('crypto');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      username,
      email,
      password: hash,
      verifyToken: token,
      verifyTokenExpiry: Date.now() + 3600000,
    });

    await sendVerificationEmail(email, token);
    res.status(201).json({ message: "Registered! Please check your email." });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Email verification
router.get('/verify/:token', async (req, res) => {
  const user = await User.findOne({
    verifyToken: req.params.token,
    verifyTokenExpiry: { $gt: Date.now() }
  });

  if (!user) return res.status(400).send("Invalid or expired token");

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  res.send("Email verified successfully!");
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(401).json({ message: 'Please verify your email first.' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;
