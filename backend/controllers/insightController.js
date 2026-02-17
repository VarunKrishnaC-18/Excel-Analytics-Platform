import Insight from "../models/Insight.js";
import Activity from "../models/Activity.js";

export const logInsight = async (req, res) => {
  try {
    const { title, description, fileName } = req.body;

    await Insight.create({ title, description, fileName });

    await Activity.create({
      action: "AI Analysis",
      name: fileName,
      type: "ai",
    });

    res.status(200).json({ message: "Insight logged" });
  } catch (error) {
    res.status(500).json({ message: "Insight logging failed" });
  }
};
