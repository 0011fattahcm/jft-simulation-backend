import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Users from "../models/Users.js";
import Announcement from "../models/Announcement.js";
import Simulation from "../models/Simulation.js";
// Login admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari admin berdasarkan email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Verifikasi password yang di-hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Jika berhasil, buat JWT token
    const token = jwt.sign({ id: admin._id }, "secretkey", { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Ambil semua user
export const getUsers = async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Mengambil detail user berdasarkan ID
export const getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const {
      name,
      email,
      accountType,
      mockupQuota,
      subscriptionStart,
      expiresAt,
      address,
      birthdate,
      phone,
      gender,
      languageLevel,
      isActive,
    } = req.body;

    // Set nilai langsung
    if (name) user.name = name;
    if (email) user.email = email;
    if (accountType) user.accountType = accountType;
    if (mockupQuota !== undefined) user.mockupQuota = mockupQuota;
    if (subscriptionStart) user.subscriptionStart = new Date(subscriptionStart);
    if (address) user.address = address;
    if (birthdate) user.birthdate = birthdate;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (languageLevel) user.languageLevel = languageLevel;
    if (isActive !== undefined) user.isActive = isActive;

    // Pastikan field subscription ada
    if (!user.subscription) user.subscription = {};

    // Perbarui expiresAt jika dikirim langsung
    if (expiresAt) {
      user.subscription.expiresAt = new Date(expiresAt);
    }

    // Perbarui expiresAt jika dikirim lewat subscription.expiresAt
    if (req.body.subscription?.expiresAt) {
      user.subscription.expiresAt = new Date(req.body.subscription.expiresAt);
    }

    // Perbarui dailyQuota jika ada
    if (req.body.subscription?.dailyQuota !== undefined) {
      user.subscription.dailyQuota = req.body.subscription.dailyQuota;
    }

    // Hitung expiresAt dari mockupQuota + subscriptionStart jika belum dikirim manual
    if (
      mockupQuota &&
      subscriptionStart &&
      !expiresAt &&
      !req.body.subscription?.expiresAt
    ) {
      const start = new Date(subscriptionStart);
      const days = Number(mockupQuota);
      user.subscription.expiresAt = new Date(start.getTime() + days * 86400000);
    }

    await user.save();
    res.status(200).json({ message: "User berhasil diperbarui", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui user", error: err.message });
  }
};

// Hapus user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await Users.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newAdmin._id }, "secretkey", {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error("Error saat register admin:", error); // <== tambahkan ini
    res.status(500).json({ message: "Gagal membuat admin" });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newAnnouncement = new Announcement({ title, content });
    await newAnnouncement.save();
    res.status(201).json({ message: "Pengumuman berhasil dibuat" });
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat pengumuman" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const data = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil pengumuman" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.status(200).json({ message: "Pengumuman berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus pengumuman" });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updated = await Announcement.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Pengumuman tidak ditemukan" });
    }

    res.status(200).json({
      message: "Pengumuman berhasil diperbarui",
      announcement: updated,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui pengumuman", error: error.message });
  }
};

export const getAllSimulationHistories = async (req, res) => {
  try {
    const simulations = await Simulation.find()
      .populate({
        path: "userId",
        select: "name email",
        strictPopulate: false, // ✅ Menghindari error populate saat user null
      })
      .sort({ endTime: -1 });

    // Filter out simulation tanpa user
    const filteredSimulations = simulations.filter((sim) => sim.userId);

    res.status(200).json(filteredSimulations);
  } catch (err) {
    console.error("Gagal mengambil semua simulasi:", err);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data simulasi." });
  }
};
