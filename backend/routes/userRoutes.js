const express = require("express");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// 🔹 Obtener el perfil del usuario desde la base de datos
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error al obtener el perfil del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// 🔹 Permitir actualizar solo el "nickname" y "points"
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { nickname, points } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          nickname: nickname ? nickname.trim() : "",
          points: points !== undefined ? Number(points) : 0,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    console.log("✅ Usuario actualizado en la base de datos:", updatedUser);

    res.status(200).json({
      message: "Perfil actualizado con éxito",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error al actualizar el perfil:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

module.exports = router;
