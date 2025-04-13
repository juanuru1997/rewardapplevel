const express = require("express");
const router = express.Router();

const Reward = require("../models/Rewards");
const rewards = require("../lib/seedData");
const redeemReward = require("../lib/redeemReward");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// 🔹 GET /api/rewards - Obtener todas las recompensas
router.get("/", async (req, res) => {
  try {
    const data = await Reward.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener recompensas." });
  }
});

// 🔹 POST /api/rewards/seed - Cargar recompensas desde seed
router.post("/seed", async (req, res) => {
  try {
    await Reward.deleteMany();
    await Reward.insertMany(rewards);
    res.json({ message: "Recompensas cargadas correctamente." });
  } catch (err) {
    res.status(500).json({ message: "Error al cargar recompensas." });
  }
});

// 🔹 GET /api/rewards/seed-test - Verificar datos del seed
router.get("/seed-test", (req, res) => {
  res.json({ total: rewards.length, example: rewards[0] });
});

// ✅ POST /api/rewards/redeem - Canjear una recompensa (requiere auth)
router.post("/redeem", auth, async (req, res) => {
  try {
    const { rewardId } = req.body;
    if (!rewardId) {
      return res.status(400).json({ message: "Falta el ID de la recompensa." });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    const result = await redeemReward({ userId, rewardId });
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    await Notification.create({
      user: userId,
      message: `🎁 Canjeaste: ${result.rewardTitle || "una recompensa"}`,
    });

    return res.status(200).json({
      message: result.message,
      updatedPoints: result.updatedPoints,
    });
  } catch (err) {
    console.error("❌ Error en /redeem:", err);
    res.status(500).json({ message: "Error en el servidor al procesar el canje." });
  }
});

// ✅ PUT /api/rewards/:id - Editar una recompensa (solo admin)
router.put("/:id", auth, auth.adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, points, stock, imageUrl } = req.body;

    const reward = await Reward.findById(id);
    if (!reward) {
      return res.status(404).json({ message: "Recompensa no encontrada" });
    }

    reward.title = title;
    reward.description = description;
    reward.category = category;
    reward.points = points;
    reward.stock = stock;
    reward.imageUrl = imageUrl;

    await reward.save();

    res.status(200).json(reward);
  } catch (err) {
    console.error("❌ Error al editar recompensa:", err);
    res.status(500).json({ message: "Error al actualizar recompensa" });
  }
});

// ✅ POST /api/rewards - Crear nueva recompensa (solo admin)
router.post("/", auth, auth.adminOnly, async (req, res) => {
  try {
    const { title, description, category, points, stock, imageUrl } = req.body;

    if (!title || !description || !points || !stock || !imageUrl) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const newReward = new Reward({
      title,
      description,
      category,
      points,
      stock,
      imageUrl
    });

    const saved = await newReward.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error al crear recompensa:", err.message);
    res.status(500).json({ message: "Error al crear la recompensa." });
  }
});

module.exports = router;
