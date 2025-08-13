import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"JFT & SSW Simulation Nichirin" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
