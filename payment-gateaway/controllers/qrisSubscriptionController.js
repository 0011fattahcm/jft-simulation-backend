import axios from "axios";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler";
import User from "../../models/Users.js";
import PaymentSubscription from "../models/PaymentSubscription.js";
import { sendInvoice } from "../../utils/sendInvoiceEmail.js";

dotenv.config();

export const createQrisPayment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { paket } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

  const externalId = `jft-qris-${userId}-${Date.now()}`;
  const amount =
    paket === "basic-2minggu" ? 1000 : paket === "premium-1bulan" ? 1000 : null;

  if (!amount) return res.status(400).json({ message: "Paket tidak valid" });

  try {
    const { data } = await axios.post(
      "https://api.xendit.co/qr_codes",
      {
        external_id: externalId,
        type: "DYNAMIC",
        amount,
        currency: "IDR",
        callback_url: `${process.env.BASE_URL}/api/subscription/webhook/qris`,
      },
      {
        auth: {
          username: process.env.XENDIT_SECRET_KEY_TEST,
          password: "",
        },
      }
    );

    await PaymentSubscription.create({
      userId,
      paket,
      externalId,
      amount,
      status: "PENDING",
      bank: "QRIS",
      accountNumber: data.id,
    });

    console.log(">> RESPONSE DARI XENDIT:", data);

    res.status(200).json({
      message: "Silakan scan QR untuk pembayaran",
      qrString: data.qr_string,
      qrImage: data.qr_code_url,
      externalId,
    });
  } catch (err) {
    console.error("❌ XENDIT QRIS ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Gagal membuat QRIS" });
  }
});

export const handleQrisWebhook = asyncHandler(async (req, res) => {
  const payload = req.body;

  const referenceId =
    payload?.qr_code?.external_id || payload?.data?.reference_id;
  const status = payload?.status || payload?.data?.status;

  if (!referenceId || !status) {
    console.log("❌ Payload webhook tidak lengkap", payload);
    return res.status(400).json({ message: "Payload tidak lengkap" });
  }

  if (
    (!referenceId.startsWith("jft-qris-") &&
      referenceId !== "testing_id_123") ||
    (status !== "COMPLETED" && status !== "SUCCEEDED")
  ) {
    return res.status(200).json({ message: "Lewati webhook QRIS lain" });
  }

  const parts = referenceId.split("-");
  const userId = parts[2];
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

  const record = await PaymentSubscription.findOne({ externalId: referenceId });
  if (!record || record.status === "PAID") {
    return res.status(200).json({ message: "Sudah diproses" });
  }

  const days =
    record.paket === "basic-2minggu"
      ? 14
      : record.paket === "premium-1bulan"
      ? 30
      : 0;
  if (!days) {
    return res.status(400).json({ message: "Jumlah tidak cocok paket" });
  }

  const expiresAt = new Date(Date.now() + days * 86400000);
  user.subscription = {
    type: record.paket,
    expiresAt,
    dailyQuota: 1,
  };
  await user.save();

  record.status = "PAID";
  await record.save();
  await sendInvoice({
    to: user.email,
    name: user.name || "User",
    paket: record.paket,
    amount: record.amount,
    invoiceId: referenceId,
    tanggal: new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  });

  res.status(200).json({ message: "✅ Langganan diaktifkan via QRIS" });
  console.log("🎯 Webhook diterima:", JSON.stringify(payload, null, 2));
});

// [ADMIN] Ambil semua riwayat subscription
export const getAllSubscriptionHistories = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = 50;
  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await PaymentSubscription.countDocuments(query);
  const data = await PaymentSubscription.find(query)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalRecords: total,
    data,
  });
});

export const getTotalSubscriptionIncome = asyncHandler(async (req, res) => {
  const result = await PaymentSubscription.aggregate([
    { $match: { status: "PAID" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const total = result[0]?.total || 0;
  res.json({ totalIncome: total });
});

// qrisSubscriptionController.js
export const getQrisStatus = asyncHandler(async (req, res) => {
  const record = await PaymentSubscription.findOne({
    externalId: req.params.referenceId,
  });

  if (!record) {
    return res.status(404).json({ message: "Transaksi tidak ditemukan" });
  }

  res.json({ status: record.status });
});
