const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");

// 🔒 Obtener notificaciones del usuario autenticado
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(15);
    res.json(notifications);
  } catch (err) {
    console.error("❌ Error obteniendo notificaciones:", err);
    res.status(500).json({ message: "Error al cargar notificaciones" });
  }
});

// ✅ Marcar notificaciones como leídas
router.patch("/mark-as-seen", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, seen: false },
      { $set: { seen: true } }
    );
    res.status(200).json({ message: "✅ Notificaciones marcadas como leídas" });
  } catch (err) {
    console.error("❌ Error marcando como leídas:", err);
    res.status(500).json({ message: "Error al actualizar notificaciones" });
  }
});

// ✅ Eliminar una notificación
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notif) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    res.json({ message: "🗑️ Notificación eliminada" });
  } catch (err) {
    console.error("❌ Error eliminando notificación:", err);
    res.status(500).json({ message: "Error al eliminar" });
  }
});

// ✅ Eliminar todas las notificaciones del usuario
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ message: "🧹 Todas las notificaciones eliminadas" });
  } catch (err) {
    console.error("❌ Error al eliminar todas:", err);
    res.status(500).json({ message: "Error al eliminar todas las notificaciones" });
  }
});

// ✅ Eliminar múltiples notificaciones seleccionadas
router.patch("/bulk-delete", authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "⚠️ Lista de IDs requerida" });
    }

    const result = await Notification.deleteMany({
      _id: { $in: ids },
      user: req.user.id,
    });

    res.json({ message: `🗑️ ${result.deletedCount} notificaciones eliminadas` });
  } catch (err) {
    console.error("❌ Error en eliminación múltiple:", err);
    res.status(500).json({ message: "Error al eliminar seleccionadas" });
  }
});

module.exports = router;
