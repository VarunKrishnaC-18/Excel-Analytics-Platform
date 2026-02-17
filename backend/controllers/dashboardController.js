import File from "../models/File.js";
import Chart from "../models/Chart.js";
import Insight from "../models/Insight.js";
import Activity from "../models/Activity.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalFiles = await File.countDocuments();
    const chartsCreated = await Chart.countDocuments();
    const aiInsights = await Insight.countDocuments();

    const recentActivity = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalFiles,
      chartsCreated,
      aiInsights,
      recentActivity,
    });
  } catch (err) {
    console.error("❌ DASHBOARD STATS ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

