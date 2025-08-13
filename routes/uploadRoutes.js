// backend/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// setup folder uploads jika belum ada
const uploadPath = path.join("uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  res.status(200).json({
    filePath: `/uploads/${req.file.filename}`,
  });
});

export default router;
