const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendVerificationEmail = require('../utils/sendVerificationEmail');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ✅ Check if email is verified
    if (!user.isVerified) {
      // Resend verification email if the user exists but is not verified
      await sendVerificationEmail(user.email, user.name, user._id);
      return res.status(401).json({ message: 'Please verify your email. A new verification email has been sent.' });
    }

    // Proceed to login (generate token, session, etc.)
    res.status(200).json({ message: 'Login successful', user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginUser
};
