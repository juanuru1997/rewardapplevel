const express = require("express");
const User = require("../models/User");
const RewardRedemption = require("../models/RewardRedemption"); // ✅ Nuevo
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// 🔹 Obtener el perfil del usuario autenticado
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        console.log("🔹 [PROFILE] Token decodificado:", req.user);

        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: "Token inválido o usuario no autenticado." });
        }

        let user = await User.findOne({ email: req.user.email }).select("-password");

        if (!user) {
            console.log("❌ Usuario no encontrado en la base de datos. Creando usuario...");

            user = new User({
                name: req.user.name || "Usuario",
                email: req.user.email,
                email_verified: true,
                picture: req.user.picture || "",
                points: 0,
            });

            await user.save();
        }

        console.log("✅ Usuario encontrado:", user);
        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Error en la obtención del perfil del usuario:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

// 🔹 Actualizar perfil del usuario autenticado
router.put("/update-profile", authMiddleware, async (req, res) => {
    try {
        const { email, nickname, points, picture } = req.body;

        if (!email) {
            return res.status(400).json({ message: "El correo electrónico es obligatorio." });
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        let userHasChanges = false;

        if (user.nickname !== nickname) {
            user.nickname = nickname;
            userHasChanges = true;
        }
        if (user.points !== points) {
            user.points = points;
            userHasChanges = true;
        }
        if (user.picture !== picture) {
            user.picture = picture;
            userHasChanges = true;
        }

        if (userHasChanges) {
            await user.save();
            res.status(200).json({ message: "✅ Los cambios han sido guardados correctamente" });
        } else {
            res.status(200).json({ message: "🔹 No hubo cambios en el perfil." });
        }
    } catch (error) {
        console.error("❌ Error en la actualización del perfil:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

// ✅ 🔹 Obtener historial de canjes del usuario autenticado
router.get("/redemptions", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const redemptions = await RewardRedemption.find({ user: userId })
            .populate("reward", "title points imageUrl")
            .sort({ createdAt: -1 });

        res.status(200).json(redemptions);
    } catch (error) {
        console.error("❌ Error obteniendo historial de canjes:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

module.exports = router;
