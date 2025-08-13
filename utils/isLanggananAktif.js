// utils/isLanggananAktif.js
export const isLanggananAktif = (user) => {
  if (!user.subscription?.expiresAt) return false;
  const now = new Date();
  return now <= new Date(user.subscription.expiresAt);
};
