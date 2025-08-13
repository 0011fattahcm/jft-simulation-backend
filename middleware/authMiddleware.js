import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export const protect = async (req, res, next) => {
  let token;
  console.log("TOKEN:", req.headers.authorization);

  // Ambil token dari header Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil data user tanpa password
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      return res.status(401).json({ message: "Token tidak valid" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak, tidak ada token" });
  }
};

export default protect;
