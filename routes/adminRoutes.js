import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
  getAllSimulationHistories,
} from "../controllers/adminController.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.get("/users", adminMiddleware, getUsers);
router.get("/users/:id", adminMiddleware, getUserById);
router.put("/users/:id", adminMiddleware, updateUser);
router.delete("/users/:id", adminMiddleware, deleteUser);
router.post("/announcements", adminMiddleware, createAnnouncement);
router.get("/announcements", getAnnouncements);
router.delete("/announcements/:id", adminMiddleware, deleteAnnouncement);
router.patch("/announcements/:id", adminMiddleware, updateAnnouncement);
router.get("/simulations", adminMiddleware, getAllSimulationHistories);
router.get("/dashboard-stats", adminMiddleware, getDashboardStats);

export default router;
