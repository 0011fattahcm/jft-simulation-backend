import mongoose from "mongoose";

const paymentSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paket: {
    type: String,
    enum: ["basic-2minggu", "premium-1bulan"],
    required: true,
  },
  externalId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  bank: {
    type: String, // e.g., "QRIS", "BCA", "DANA"
    required: true,
  },
  accountNumber: {
    type: String, // QR ID atau nomor VA
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

paymentSubscriptionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const PaymentSubscription = mongoose.model(
  "PaymentSubscription",
  paymentSubscriptionSchema
);
export default PaymentSubscription;
