import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminLogRoutes from "./routes/adminLogRoutes.js";
import qrisSubscriptionRoutes from "./payment-gateaway/routes/qrisSubscriptionRoutes.js";
import path from "path";

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL, // dari .env
      "https://simulasijft.com", // fallback manual
      "https://api.simulasijft.com", // fallback manual
    ],
    credentials: true,
  })
);

app.use(express.json());
// 🆕 Proxy route untuk media dengan header ngrok
app.get("/media/:filename", (req, res) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  const filePath = path.join(path.resolve(), "uploads", req.params.filename);
  res.sendFile(filePath);
});

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/api/upload", uploadRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/rx78gpo1p6", adminRoutes); // Use admin routes
app.use("/api/simulations", simulationRoutes); // Use auth routes
app.use("/api/rx78gpo1p6/log", adminLogRoutes); // Use admin log routes
app.use("/api/subscription", qrisSubscriptionRoutes);
// Routes Placeholder
app.get("/", (req, res) => {
  res.send("✅ Backend JFT Simulation API is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
