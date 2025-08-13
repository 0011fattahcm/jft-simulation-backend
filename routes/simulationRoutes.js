import express from "express";
import {
  startSimulation,
  submitSimulation,
  getSimulationResult,
  getSimulationResultDetail,
} from "../controllers/simulationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkLanggananAktif } from "../middleware/checkLanggananAktif.js";

const router = express.Router();

router.post("/start", protect, checkLanggananAktif, startSimulation);
router.post("/submit", protect, submitSimulation);
router.get("/result", protect, getSimulationResult);
router.get("/result-detail", protect, getSimulationResultDetail);

// ✅ tambahkan route ini

export default router;
