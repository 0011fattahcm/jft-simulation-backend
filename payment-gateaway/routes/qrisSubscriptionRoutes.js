// routes/qrisSubscriptionRoutes.js
import express from "express";
import {
  createQrisPayment,
  handleQrisWebhook,
  getAllSubscriptionHistories,
  getTotalSubscriptionIncome,
  getQrisStatus,
} from "../controllers/qrisSubscriptionController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { protectAdmin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/create-qris", protect, createQrisPayment);
router.post("/webhook/qris", handleQrisWebhook);
router.get("/histories", protectAdmin, getAllSubscriptionHistories);
router.get("/total-income", protectAdmin, getTotalSubscriptionIncome);
router.get("/status/:referenceId", getQrisStatus);

export default router;
