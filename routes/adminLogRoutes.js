import express from "express";
import { getAllActivityLogs } from "../controllers/adminLogController.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET /api/rx78gpo1p6/log
router.get("/", protectAdmin, getAllActivityLogs);

export default router;
