const express = require("express");
const User = require("../models/User"); // Modelo de usuario
const jwt = require("jsonwebtoken");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "12345"; 

router.post("/google-login", async (req, res) => {
  const { googleId, name, email, profilePic } = req.body;

  if (!googleId || !name || !email) {
    return res.status(400).json({ message: "Faltan datos requeridos." });
  }

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ googleId });

    if (!user) {
      // Si no existe, creamos un nuevo usuario
      user = new User({
        googleId,
        name,
        email,
        profilePic,
      });
      await user.save();
    } else {
      // Si existe, actualizamos su información
      user.name = name;
      user.email = email;
      user.profilePic = profilePic;
      await user.save();
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d", // Token válido por 7 días
    });

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user,
    });
  } catch (error) {
    console.error("Error en Google Login:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

module.exports = router;
