// middleware/checkLanggananAktif.js
export const checkLanggananAktif = (req, res, next) => {
  const user = req.user;
  if (!user || !user.subscription?.expiresAt) {
    return res.status(403).json({ message: "Langganan tidak aktif." });
  }

  const now = new Date();
  const expiresAt = new Date(user.subscription.expiresAt);

  if (now > expiresAt) {
    return res.status(403).json({ message: "Langganan telah berakhir." });
  }

  next();
};
