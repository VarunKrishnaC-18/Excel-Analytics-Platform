import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: String,
    name: String,
    type: String,
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
