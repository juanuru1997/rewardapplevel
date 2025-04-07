const express = require("express");
const User = require("../models/User");
const RewardRedemption = require("../models/RewardRedemption");
const PointGrant = require("../models/PointGrant");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// 🔹 Obtener perfil del usuario autenticado
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Token inválido o usuario no autenticado." });
    }

    let user = await User.findOne({ email: req.user.email }).select("-password");

    if (!user) {
      user = new User({
        name: req.user.name || "Usuario",
        email: req.user.email,
        email_verified: true,
        picture: req.user.picture || "",
        points: 0,
      });

      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// 🔹 Actualizar perfil
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { email, nickname, points, picture } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El correo electrónico es obligatorio." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    let changed = false;

    if (user.nickname !== nickname) {
      user.nickname = nickname;
      changed = true;
    }

    if (user.points !== points) {
      user.points = points;
      changed = true;
    }

    if (user.picture !== picture) {
      user.picture = picture;
      changed = true;
    }

    if (changed) {
      await user.save();
      return res.status(200).json({ message: "✅ Cambios guardados correctamente" });
    } else {
      return res.status(200).json({ message: "🔹 No hubo cambios en el perfil." });
    }
  } catch (error) {
    console.error("❌ Error actualizando perfil:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// 🔹 Historial de canjes paginado con type
router.get("/redemptions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const [redemptions, count] = await Promise.all([
      RewardRedemption.find({ user: userId })
        .populate("reward", "title points imageUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RewardRedemption.countDocuments({ user: userId }),
    ]);

    const data = redemptions.map((r) => ({
      ...r.toObject(),
      type: "redeem", // 🟢 Agregado
    }));

    res.status(200).json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("❌ Error obteniendo historial de canjes:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// 🔹 Asignar puntos (admin)
router.post("/grant-points", authMiddleware, async (req, res) => {
  const { userId, points, reason } = req.body;

  if (!userId || !points || !reason) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    user.points += Number(points);
    await user.save();

    const grant = new PointGrant({
      user: userId,
      points: Number(points),
      reason,
      grantedBy: req.user.email || "admin",
    });

    await grant.save();

    res.status(200).json({
      message: `✅ ${points} puntos asignados a ${user.email}`,
      userPoints: user.points,
    });
  } catch (error) {
    console.error("❌ Error asignando puntos:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// 🔹 Obtener todos los usuarios (admin)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("_id name email");
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// 🔹 Historial de puntos asignados (admin)
router.get("/grants", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [grants, count] = await Promise.all([
      PointGrant.find({ user: userId })
        .select("points reason createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PointGrant.countDocuments({ user: userId }),
    ]);

    const data = grants.map((g) => ({
      ...g.toObject(),
      type: "grant", // 🟢 También importante para los filtros
    }));

    res.status(200).json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("❌ Error obteniendo puntos asignados:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

module.exports = router;
