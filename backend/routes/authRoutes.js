import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import { loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  await User.create({
    username,
    email,
    password: hash,
    verifyToken: token,
    verifyTokenExpiry: Date.now() + 3600000
  });

  await sendVerificationEmail(email, token);
  res.status(201).json({ message: "Verify your email" });
});

router.post("/login", loginUser);

export default router;
