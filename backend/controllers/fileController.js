import File from "../models/File.js";
import Activity from "../models/Activity.js";

export const handleFileUpload = async (req, res) => {
  try {
    const { fileName, rows, columns, fileSize } = req.body;

    // 1️⃣ Save file record
    await File.create({
      fileName,
      rows,
      columns,
      fileSize,
    });

    // 2️⃣ Log activity
    await Activity.create({
      action: "Uploaded",
      name: fileName,
      type: "upload",
    });

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File upload failed" });
  }
};
