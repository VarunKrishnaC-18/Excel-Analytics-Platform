import Chart from "../models/Chart.js";
import Activity from "../models/Activity.js";

export const logChartCreation = async (req, res) => {
  try {
    const { type, fileName } = req.body;

    await Chart.create({ type, fileName });

    await Activity.create({
      action: "Generated",
      name: `${type} chart`,
      type: "chart",
    });

    res.status(200).json({ message: "Chart logged" });
  } catch (error) {
    res.status(500).json({ message: "Chart log failed" });
  }
};
