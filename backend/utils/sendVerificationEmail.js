import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, name, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify/${userId}`;

    await transporter.sendMail({
      from: `"Excel Analytics" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Hello ${name},</h2>
        <p>Please verify your email to continue.</p>
        <a href="${verificationLink}">Verify Email</a>
      `,
    });

    console.log("📧 Verification email sent");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

export default sendVerificationEmail;
