// backend/lib/sendRedemptionEmails.js

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM;

const sendRedemptionEmails = async (user, reward) => {
  if (!user?.email || !reward?.title) return;

  const subject = `🎉 ¡Has canjeado una recompensa!`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Hola ${user.name || user.email} 👋</h2>
      <p>Gracias por canjear tu recompensa <strong>${reward.title}</strong>.</p>
      <p><strong>Puntos usados:</strong> ${reward.points}</p>
      <p>📩 Te contactaremos pronto para coordinar la entrega.</p>
      <hr/>
      <small>Este correo fue generado automáticamente. No respondas a este mensaje.</small>
    </div>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: user.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ Error al enviar email con Resend:", err);
  }
};

module.exports = sendRedemptionEmails;
