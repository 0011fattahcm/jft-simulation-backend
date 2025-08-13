import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Mendapatkan profil pengguna
router.get("/profile", protect, getUserProfile);

// Memperbarui profil pengguna
router.put("/update-profile", protect, updateUserProfile);

// Memperbarui password pengguna
router.put("/update-password", protect, updateUserPassword);

// Menghapus akun pengguna
router.delete("/delete-account", protect, deleteUserAccount);

// Lupa password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password/:token", resetPassword);

export default router;
