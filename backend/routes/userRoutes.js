const express = require("express");
const router = express.Router();
const User = require("../models/User");
const RewardRedemption = require("../models/RewardRedemption");
const PointGrant = require("../models/PointGrant");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");

// 🔒 Middleware para verificar si es admin
const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Token inválido o no autenticado" });
  }

  const user = await User.findById(req.user.id);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Acceso denegado. Requiere permisos de administrador." });
  }

  next();
};

// 🔹 Obtener perfil del usuario
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select("-password");
    if (!user) {
      const newUser = new User({
        name: req.user.name || "Usuario",
        email: req.user.email,
        email_verified: true,
        picture: req.user.picture || "",
        points: 0,
      });
      await newUser.save();
      return res.status(200).json(newUser);
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error al obtener perfil:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 🔹 Actualizar perfil
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { email, nickname, points, picture, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    let hasChanges = false;
    if (user.nickname !== nickname) { user.nickname = nickname; hasChanges = true; }
    if (user.points !== points) { user.points = points; hasChanges = true; }
    if (user.picture !== picture) { user.picture = picture; hasChanges = true; }
    if (user.role !== role) { user.role = role; hasChanges = true; } // 👈 Asegúrate de incluir esto

    if (hasChanges) {
      await user.save();
      return res.status(200).json({ message: "✅ Cambios guardados correctamente" });
    }

    res.status(200).json({ message: "🔹 No hubo cambios en el perfil" });
  } catch (err) {
    console.error("❌ Error actualizando perfil:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 🔹 Historial de canjes (filtrable por userId)
router.get("/redemptions", authMiddleware, async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
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
      type: "redeem",
    }));

    res.status(200).json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("❌ Error obteniendo redemptions:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 🔹 Historial de asignaciones (filtrable por userId)
router.get("/grants", authMiddleware, async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
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
      type: "grant",
    }));

    res.status(200).json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("❌ Error obteniendo grants:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 🔹 Asignar puntos (solo admin)
router.post("/grant-points", authMiddleware, requireAdmin, async (req, res) => {
  const { userId, points, reason } = req.body;
  if (!userId || !points || !reason) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.points += Number(points);
    await user.save();

    const grant = new PointGrant({
      user: userId,
      points: Number(points),
      reason,
      grantedBy: req.user.email || "admin",
    });

    await grant.save();

    // ✅ Crear notificación para el usuario
    await Notification.create({
      user: userId,
      message: `✨ Has recibido ${points} puntos. Motivo: ${reason}`,
    });

    res.status(200).json({
      message: `✅ ${points} puntos asignados a ${user.email}`,
      userPoints: user.points,
    });
  } catch (err) {
    console.error("❌ Error asignando puntos:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 🔹 Obtener todos los usuarios (solo admin)
router.get("/all", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("_id name email picture points role");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error obteniendo usuarios:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


module.exports = router;
