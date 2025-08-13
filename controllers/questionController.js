import JFTQuestion from "../models/JFTQuestion.js";

// GET semua soal JFT
export const getJFTQuestions = async (req, res) => {
  try {
    const topic = req.query.topic; // opsional: bisa ?topic=Bahasa

    const query = { type: "JFT" };
    if (topic) {
      query.topic = topic;
    }

    const questions = await JFTQuestion.find(query).sort({ number: 1 });

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil soal JFT" });
  }
};

// POST: Tambah soal JFT
export const createJFTQuestion = async (req, res) => {
  try {
    const {
      topic,
      number,
      questionText,
      options,
      correctAnswer,
      explanation,
      mediaImageUrl,
      mediaAudioUrl,
    } = req.body;

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: "Opsi jawaban harus 4 item" });
    }

    const newQuestion = new JFTQuestion({
      topic,
      number,
      questionText,
      options,
      correctAnswer,
      explanation,
      mediaImageUrl: mediaImageUrl || "",
      mediaAudioUrl: mediaAudioUrl || "",
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat soal." });
  }
};

export const getJFTQuestionById = async (req, res) => {
  try {
    const question = await JFTQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil soal" });
  }
};

export const updateJFTQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      topic,
      questionText,
      options,
      correctAnswer,
      explanation,
      mediaImageUrl,
      mediaAudioUrl,
    } = req.body;

    const question = await JFTQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Soal tidak ditemukan." });
    }

    // Update field utama
    question.topic = topic;
    question.questionText = questionText;
    question.options = options;
    question.correctAnswer = correctAnswer;
    question.explanation = explanation;

    // Update media terpisah
    question.mediaImageUrl = mediaImageUrl || "";
    question.mediaAudioUrl = mediaAudioUrl || "";

    await question.save();
    res.status(200).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui soal." });
  }
};

export const deleteJFTQuestion = async (req, res) => {
  try {
    const question = await JFTQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    await question.deleteOne();
    res.json({ message: "Soal berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus soal" });
  }
};
