import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logActivity } from "../utils/logActivity.js";

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password, accountType } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Logika kuota dan tanggal
    let mockupQuota = 0;
    if (accountType === "2minggu") mockupQuota = 14;
    if (accountType === "1bulan") mockupQuota = 30;

    const subscriptionStart = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(subscriptionStart.getDate() + mockupQuota);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      accountType,
      mockupQuota,
      subscriptionStart,
      subscription: {
        expiresAt,
      },
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await logActivity({ user, action: "Registrasi" });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      mockupQuota: user.mockupQuota,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Password salah" });

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Akun Anda telah dinonaktifkan oleh admin." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await logActivity({ user, action: "Login" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      mockupQuota: user.mockupQuota,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    console.log("USER DARI TOKEN:", req.user);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      mockupQuota: user.mockupQuota,
      subscriptionStart: user.subscriptionStart,
      subscription: user.subscription, // includes expiresAt
      testHistory: user.testHistory || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data profil user" });
  }
};
