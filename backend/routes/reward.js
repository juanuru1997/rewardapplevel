const express = require("express");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/auth"); // ✅ importamos auth
const Notification = require("../models/Notification"); // ✅ modelo de notificaciones
require("dotenv").config();

const router = express.Router();

// Ruta protegida para procesar canje
router.post("/redeem", authMiddleware, async (req, res) => {
  const { usuario, email, recompensa, precioCanje, puntosDisponibles } = req.body;

  if (puntosDisponibles < precioCanje) {
    return res.status(400).json({ message: "No tienes suficientes puntos." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "admin@tuempresa.com",
    subject: `Solicitud de Canje - ${usuario}`,
    html: `
      <h3>Nuevo Canje de Recompensa</h3>
      <p><strong>Usuario:</strong> ${usuario}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Recompensa:</strong> ${recompensa}</p>
      <p><strong>Precio de Canje:</strong> ${precioCanje} puntos</p>
      <p><strong>Puntos Disponibles:</strong> ${puntosDisponibles} puntos</p>
      <p>Por favor, revisa la solicitud y apruébala si es válida.</p>
    `,
  };

  try {
    // Enviamos el email
    await transporter.sendMail(mailOptions);

    // ✅ Guardamos la notificación para el usuario autenticado
    await Notification.create({
      user: req.user.id,
      message: `🎉 Canjeaste: ${recompensa}`,
    });

    res.status(200).json({ message: "Correo enviado con éxito y notificación guardada." });
  } catch (error) {
    console.error("❌ Error en canje:", error);
    res.status(500).json({ message: "Error al enviar el correo o guardar la notificación.", error });
  }
});

module.exports = router;
