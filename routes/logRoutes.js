import express from "express";
import { addLog, getAllLogs } from "../controllers/logController.js";
import { protectAdmin } from "../middlewares/adminMiddleware.js";
import { protectUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protectUser, addLog);
router.get("/", protectAdmin, getAllLogs); // hanya admin yang bisa melihat semua log

export default router;
