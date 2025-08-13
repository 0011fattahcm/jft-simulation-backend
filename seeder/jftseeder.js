import mongoose from 'mongoose'
import dotenv from 'dotenv'
import JFTQuestion from '../models/JFTQuestion.js'
import connectDB from '../config/db.js'

dotenv.config()
connectDB()

const seedJFTQuestions = async () => {
  try {
    // Hapus semua soal lama (jika perlu)
    await JFTQuestion.deleteMany({})

    const sampleQuestions = [
      {
        type: 'JFT',
        topic: 'Bahasa',
        number: 1,
        questionText: 'この前 の 意味 は なんですか？',
        mediaType: 'none',
        mediaUrl: '',
        options: ['Baru saja', 'Kemarin', 'Besok', 'Tadi pagi'],
        correctAnswer: 1,
        explanation: 'この前 berarti “kemarin” atau waktu yang lalu.',
      },
      {
        type: 'JFT',
        topic: 'Bahasa',
        number: 2,
        questionText: 'しばらく の 意味 は？',
        mediaType: 'none',
        mediaUrl: '',
        options: ['Sebentar', 'Lama sekali', 'Segera', 'Terus-menerus'],
        correctAnswer: 0,
        explanation: 'しばらく berarti “sebentar”.',
      },
    ]

    await JFTQuestion.insertMany(sampleQuestions)
    console.log('✅ Seeder soal JFT berhasil dimasukkan!')
    process.exit()
  } catch (error) {
    console.error('❌ Gagal seed soal JFT:', error)
    process.exit(1)
  }
}

seedJFTQuestions()
