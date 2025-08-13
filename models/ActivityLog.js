import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: String,
  action: String,
  details: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("ActivityLog", activityLogSchema);
