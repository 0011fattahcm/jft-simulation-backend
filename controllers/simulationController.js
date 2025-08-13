import JFTQuestion from "../models/JFTQuestion.js";
import User from "../models/Users.js";
import Simulation from "../models/Simulation.js";
import { logActivity } from "../utils/logActivity.js";
import { isLanggananAktif } from "../utils/isLanggananAktif.js";

export const startSimulation = async (req, res) => {
  console.log(">> START SIMULATION");
  console.log("User ID:", req.user._id);

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const existingSimulation = user.currentSimulation;
    const isValidSimulation =
      existingSimulation &&
      existingSimulation.questions &&
      Object.keys(existingSimulation.questions).every(
        (sesi) =>
          Array.isArray(existingSimulation.questions[sesi]) &&
          existingSimulation.questions[sesi].length > 0
      );

    if (isValidSimulation) {
      const questionIds = existingSimulation.questions;
      const allIds = Object.values(questionIds).flat();

      const allQuestions = await JFTQuestion.find({ _id: { $in: allIds } });

      const soal = {};
      for (const sesi in questionIds) {
        const sesiIds = Array.isArray(questionIds[sesi])
          ? questionIds[sesi]
          : [];

        soal[sesi] = allQuestions.filter((q) =>
          sesiIds.some((id) => id.toString() === q._id.toString())
        );
      }

      return res.status(200).json({
        message: "Simulasi sudah berjalan",
        soal,
        startedAt: existingSimulation.startedAt,
      });
    }

    // Validasi langganan aktif
    if (!isLanggananAktif(user)) {
      return res
        .status(403)
        .json({ message: "Langganan tidak aktif atau telah berakhir." });
    }

    const fetchRandomQuestions = async (topic, limit) => {
      const allQuestions = await JFTQuestion.find({ topic });

      const alreadyUsed = new Set(
        user.testHistory
          ?.flatMap((t) => t.questionIds || [])
          ?.map((id) => id.toString()) || []
      );

      const belumPernah = allQuestions.filter(
        (q) => !alreadyUsed.has(q._id.toString())
      );
      const sudahPernah = allQuestions.filter((q) =>
        alreadyUsed.has(q._id.toString())
      );

      const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

      const jumlahBaru = Math.min(limit, belumPernah.length);
      const jumlahLama = limit - jumlahBaru;

      const soalTerpilih = [
        ...shuffle(belumPernah).slice(0, jumlahBaru),
        ...shuffle(sudahPernah).slice(0, jumlahLama),
      ];

      return shuffle(soalTerpilih).slice(0, limit);
    };

    // 🆗 URUTAN BARU: Choukai dulu baru Dokkai
    const S1 = await fetchRandomQuestions("Moj i to goi", 15);
    const S2 = await fetchRandomQuestions("Kaiwa to hyōgen", 15);
    const S3 = await fetchRandomQuestions("Choukai", 10); // <- Diubah jadi sesi 3
    const S4 = await fetchRandomQuestions("Dokkai", 10); // <- Diubah jadi sesi 4

    user.currentSimulation = {
      startedAt: new Date(),
      questions: {
        S1: S1.map((q) => q._id),
        S2: S2.map((q) => q._id),
        S3: S3.map((q) => q._id), // Choukai
        S4: S4.map((q) => q._id), // Dokkai
      },
    };

    await user.save();
    console.log("Questions disimpan:", user.currentSimulation?.questions);

    await logActivity({
      user,
      action: "Mulai Simulasi",
      details: `Langganan berlaku hingga: ${user.subscription?.expiresAt}`,
    });

    res.status(200).json({
      message: "Simulasi dimulai",
      soal: { S1, S2, S3, S4 },
      startedAt: user.currentSimulation.startedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memulai simulasi" });
  }
};

export const submitSimulation = async (req, res) => {
  const userId = req.user._id;
  const { answers } = req.body;

  if (!answers) {
    return res.status(400).json({ message: "Data jawaban tidak dikirim." });
  }

  try {
    const user = await User.findById(userId);
    if (!isLanggananAktif(user)) {
      return res
        .status(403)
        .json({ message: "Langganan tidak aktif atau telah berakhir." });
    }
    if (!user || !user.currentSimulation) {
      return res.status(404).json({ message: "Simulasi tidak ditemukan." });
    }

    const { questions, startedAt } = user.currentSimulation;
    const questionIds = Object.values(questions).flat();
    const allQuestions = await JFTQuestion.find({ _id: { $in: questionIds } });

    let score = 0;
    const detailedResults = [];

    for (const sesi of Object.keys(questions)) {
      questions[sesi].forEach((questionId, index) => {
        const soal = allQuestions.find(
          (q) => q._id.toString() === questionId.toString()
        );
        const userAnswer = answers[sesi]?.[index] ?? null;
        const isCorrect =
          userAnswer !== null && soal && userAnswer === soal.correctAnswer;

        if (isCorrect) score++;

        detailedResults.push({
          questionId: soal?._id,
          selected: userAnswer,
          isCorrect,
        });
      });
    }

    const newSimulation = await Simulation.create({
      userId,
      startTime: startedAt,
      endTime: new Date(),
      score: score * 5,
      correctAnswers: score,
      totalQuestions: questionIds.length,
      questions,
      answers: detailedResults,
    });

    user.testHistory.push({
      score: score * 5,
      date: new Date(),
      questionIds,
      kunciDilihat: false, // Tambahkan ini
    });

    user.currentSimulation = undefined;
    await user.save();

    await logActivity({
      user,
      action: "Submit Simulasi",
      details: `Skor: ${score * 5} | Jawaban benar: ${score}`,
    });

    return res.status(200).json({
      message: "Simulasi disimpan",
      result: detailedResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getSimulationResult = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "testHistory.questionIds"
    );

    if (!user.testHistory || user.testHistory.length === 0) {
      return res.status(404).json({ message: "Belum ada hasil simulasi." });
    }

    const latestResult = user.testHistory[user.testHistory.length - 1];

    await logActivity({
      user,
      action: "Lihat Hasil Simulasi",
    });

    res.status(200).json({ result: latestResult });
  } catch (error) {
    console.error("Error getSimulationResult:", error);
    res.status(500).json({ message: "Gagal mengambil hasil simulasi." });
  }
};

export const getSimulationResultDetail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const latestIndex = user.testHistory.length - 1;
    const latestTest = user.testHistory[latestIndex];

    if (user.type !== "sensei") {
      if (!latestTest.kunciDilihat) {
        user.testHistory[latestIndex].kunciDilihat = true;
        await user.save();
      } else {
        return res.status(403).json({
          message: "Kunci jawaban tidak tersedia lagi",
        });
      }
    }

    const sim = await Simulation.findOne({ userId: user._id }).sort({
      createdAt: -1,
    });
    if (!sim)
      return res.status(404).json({ message: "Simulasi tidak ditemukan" });

    // Ambil semua ID soal
    const allQuestionIds = sim.answers.map((a) => a.questionId);
    const allQuestions = await JFTQuestion.find({
      _id: { $in: allQuestionIds },
    });

    const result = sim.answers.map((ans) => {
      const soal = allQuestions.find(
        (q) => q._id.toString() === ans.questionId.toString()
      );

      return {
        questionText: soal?.questionText || "[Soal tidak ditemukan]",
        options: soal?.options || [],
        correctAnswer: soal?.correctAnswer ?? null,
        userAnswer: ans.selected ?? null,
        mediaImageUrl: soal?.mediaImageUrl || null,
        mediaAudioUrl: soal?.mediaAudioUrl || null,
      };
    });

    await logActivity({
      user,
      action: "Lihat Kunci Jawaban",
    });

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Gagal mengambil kunci jawaban:", error);
    res.status(500).json({ message: "Gagal mengambil kunci jawaban" });
  }
};
