import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    isVerified: { type: Boolean, default: false },
    verifyToken: String,
    verifyTokenExpiry: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
