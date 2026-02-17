import User from "../models/User.js";
import bcrypt from "bcryptjs";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      await sendVerificationEmail(user.email, user.name, user._id);
      return res.status(401).json({
        message: "Please verify your email. Verification email resent.",
      });
    }

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
