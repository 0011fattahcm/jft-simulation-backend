import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    accountType: {
      type: String,
      enum: ["free", "basic-2minggu", "premium-1bulan"],
      default: "free",
    },
    mockupQuota: {
      type: Number,
      default: 0, // Sekarang berarti jumlah hari langganan
    },
    subscriptionStart: {
      type: Date,
      default: null, // Tanggal mulai langganan
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentSimulation: {
      startedAt: { type: Date },
      questions: {
        S1: [{ type: mongoose.Schema.Types.ObjectId, ref: "JFTQuestion" }],
        S2: [{ type: mongoose.Schema.Types.ObjectId, ref: "JFTQuestion" }],
        S3: [{ type: mongoose.Schema.Types.ObjectId, ref: "JFTQuestion" }],
        S4: [{ type: mongoose.Schema.Types.ObjectId, ref: "JFTQuestion" }],
      },
    },
    testHistory: [
      {
        score: Number,
        date: Date,
        questionIds: [ObjectId],
      },
    ],
    lastResultSeen: { type: Boolean, default: false },

    subscription: {
      type: {
        type: String,
        enum: ["basic-2minggu", "premium-1bulan"],
      },
      expiresAt: { type: Date, default: null },
      dailyQuota: { type: Number, default: 1 },
    },

    languageLevel: {
      type: String,
      enum: [
        "JLPT N1",
        "JLPT N2",
        "JLPT N3",
        "JLPT N4",
        "JLPT N5",
        "JFT Basic A2",
      ],
    },
    phone: { type: String }, // Menambahkan nomor telepon
    address: { type: String }, // Menambahkan alamat
    birthdate: { type: String }, // Menambahkan tanggal lahir
    gender: { type: String }, // Menambahkan jenis kelamin
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
  },
  {
    timestamps: true, // Menyimpan informasi waktu pembuatan dan update
  }
);

const User = mongoose.model("User", userSchema);
export default User;
