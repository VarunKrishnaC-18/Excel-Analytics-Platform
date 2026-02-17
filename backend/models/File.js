import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: String,
    rows: Number,
    columns: Number,
    fileSize: Number,
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
