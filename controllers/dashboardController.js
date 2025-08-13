import User from "../models/Users.js";
import JFTQuestion from "../models/JFTQuestion.js";
import Simulation from "../models/Simulation.js";
import Log from "../models/ActivityLog.js";
import PaymentSubscription from "../payment-gateaway/models/PaymentSubscription.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await JFTQuestion.countDocuments();
    const totalSimulations = await Simulation.countDocuments();
    // Di dalam getDashboardStats:
    const totalIncomeData = await PaymentSubscription.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome = totalIncomeData[0]?.total || 0;
    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          user: "$count",
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const monthlyUsersFixed = monthNames.map((name, idx) => {
      const found = monthlyUsers.find((m) => m.month === idx + 1);
      return { month: name, user: found?.user || 0 };
    });

    const recentActivities = await Log.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select("email action timestamp");

    res.status(200).json({
      totalUsers,
      totalQuestions,
      totalSimulations,
      totalIncome,
      monthlyUsers: monthlyUsersFixed,
      recentActivities,
    });
  } catch (err) {
    res.status(500).json({
      message: "Gagal mengambil data dashboard",
      error: err.message,
    });
  }
};
