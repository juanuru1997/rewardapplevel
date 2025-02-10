const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// Ruta para procesar el canje de recompensas
router.post('/redeem', async (req, res) => {
    const { usuario, email, recompensa, precioCanje, puntosDisponibles } = req.body;

    if (puntosDisponibles < precioCanje) {
        return res.status(400).json({ message: "No tienes suficientes puntos." });
    }

    // Configurar el servicio de correo
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Configurar el contenido del correo
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'admin@tuempresa.com',
        subject: `Solicitud de Canje - ${usuario}`,
        html: `
            <h3>Nuevo Canje de Recompensa</h3>
            <p><strong>Usuario:</strong> ${usuario}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Recompensa:</strong> ${recompensa}</p>
            <p><strong>Precio de Canje:</strong> ${precioCanje} puntos</p>
            <p><strong>Puntos Disponibles:</strong> ${puntosDisponibles} puntos</p>
            <p>Por favor, revisa la solicitud y apruébala si es válida.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Correo enviado con éxito." });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el correo.", error });
    }
});

module.exports = router;
