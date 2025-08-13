import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["JFT"],
      default: "JFT",
      required: true,
    },
    topic: {
      type: String,
      required: true,
      enum: ["Moj i to goi", "Kaiwa to hyōgen", "Dokkai", "Choukai"],
    },
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    mediaImageUrl: { type: String, default: "" },
    mediaAudioUrl: { type: String, default: "" },
    options: {
      type: [String],
      validate: [arrayLimit, "Harus berisi tepat 4 opsi"],
      required: true,
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

    correctAnswer: {
      type: Number,
      required: true,
      validate: {
        validator: (val) => val >= 0 && val <= 3,
        message: "Index jawaban benar harus 0–3",
      },
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length === 4;
}

const JFTQuestion = mongoose.model("JFTQuestion", questionSchema);
export default JFTQuestion;
