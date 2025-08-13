import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({ user, action, details = "" }) => {
  if (!user) return;
  try {
    await ActivityLog.create({
      userId: user._id,
      email: user.email,
      action,
      details,
    });
  } catch (err) {
    console.error("Gagal mencatat aktivitas:", err.message);
  }
};
