const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const url = `http://localhost:5000/api/auth/verify/${token}`;

  await transporter.sendMail({
    from: `"Verify your email" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification",
    html: `<h3>Click <a href="${url}">here</a> to verify your email</h3>`
  });
};

module.exports = sendVerificationEmail;
