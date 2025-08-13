import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: String,
  action: String, // contoh: "Mulai Tes", "Selesai Tes", "Download Hasil", dll
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Log", logSchema);
