import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
  {
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Insight", insightSchema);
