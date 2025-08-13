import mongoose from "mongoose";

const simulationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["JFT"],
      default: "JFT",
    },
    score: Number,
    correctAnswers: Number,
    totalQuestions: Number,
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "JFTQuestion",
        },
        selected: Number,
        isCorrect: Boolean,
      },
    ],
    startTime: Date,
    endTime: Date,
  },
  {
    timestamps: true,
  }
);

const Simulation = mongoose.model("Simulation", simulationSchema);
export default Simulation;
