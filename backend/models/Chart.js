import mongoose from "mongoose";

const chartSchema = new mongoose.Schema(
  {
    type: String,
    fileName: String,
  },
  { timestamps: true }
);

export default mongoose.model("Chart", chartSchema);
