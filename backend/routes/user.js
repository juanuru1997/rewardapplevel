const express = require("express");
const User = require("../models/User"); // Modelo de usuario
const authMiddleware = require("../middleware/auth"); // Middleware para autenticación

const router = express.Router();

// Ruta para obtener el perfil del usuario
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Excluir contraseña
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Ruta para actualizar la foto de perfil
router.put("/profile-pic", authMiddleware, async (req, res) => {
  const { profilePic } = req.body;

  if (!profilePic) {
    return res.status(400).json({ message: "La foto de perfil es obligatoria." });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    user.profilePic = profilePic; // Actualizar la foto de perfil
    await user.save();

    res.status(200).json({
      message: "Foto de perfil actualizada correctamente.",
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error al actualizar la foto de perfil:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

module.exports = router;
