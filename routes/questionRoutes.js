import express from "express";
import {
  createJFTQuestion,
  getJFTQuestions,
  getJFTQuestionById,
  updateJFTQuestion,
  deleteJFTQuestion,
} from "../controllers/questionController.js";
import multer from "multer";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });
// ✅ Route untuk ambil semua soal
router.get("/", adminMiddleware, getJFTQuestions);

// ✅ Route tambah soal
router.post("/", adminMiddleware, upload.single("media"), createJFTQuestion);

// ✅ Route ambil soal by ID
router.get("/:id", adminMiddleware, getJFTQuestionById);

router.put(
  "/:id",
  adminMiddleware,
  upload.single("media"), // <--- TAMBAH INI
  updateJFTQuestion
);

// ✅ Route hapus soal
router.delete("/:id", adminMiddleware, deleteJFTQuestion);

router.post(
  "/create",
  adminMiddleware,
  upload.single("media"), // gunakan name="media" di frontend
  createJFTQuestion
);

export default router;
