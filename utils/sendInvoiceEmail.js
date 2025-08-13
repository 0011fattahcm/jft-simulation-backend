import nodemailer from "nodemailer";

export const sendInvoice = async ({
  to,
  name,
  paket,
  amount,
  invoiceId,
  tanggal,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const html = `
    <h2>Invoice Pembayaran Langganan</h2>
    <p>Halo <strong>${name}</strong>,</p>
    <p>Terima kasih telah melakukan pembayaran langganan <strong>${paket}</strong>.</p>
    <p><strong>ID Invoice:</strong> ${invoiceId}</p>
    <p><strong>Tanggal:</strong> ${tanggal}</p>
    <p><strong>Total:</strong> Rp ${amount.toLocaleString("id-ID")}</p>
    <br/>
    <p>Langganan Anda telah aktif. Selamat menggunakan fitur-fitur simulasi kami!</p>
    <hr/>
    <p>JFT Simulation by PT Giken Kaizen Educenter</p>
  `;

  await transporter.sendMail({
    from: `"JFT Simulation" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Invoice Pembayaran - ${paket}`,
    html,
  });
};
