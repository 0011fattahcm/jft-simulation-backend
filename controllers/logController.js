import Log from "../models/Log.js";

export const addLog = async (req, res) => {
  try {
    const { action } = req.body;
    const newLog = new Log({
      userId: req.user._id,
      email: req.user.email,
      action,
    });
    await newLog.save();
    res.status(201).json({ message: "Log ditambahkan" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan log" });
  }
};

export const getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil log" });
  }
};
