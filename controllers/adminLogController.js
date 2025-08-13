import ActivityLog from "../models/ActivityLog.js";

export const getAllActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(200);
    res.status(200).json(logs);
  } catch (err) {
    console.error("Gagal mengambil log:", err.message);
    res.status(500).json({ message: "Gagal mengambil log aktivitas user" });
  }
};
