const express = require("express");
const router = express.Router();

const Reward = require("../models/Rewards");
const rewards = require("../lib/seedData");
const redeemReward = require("../lib/redeemReward");
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

    return res.status(200).json({
      message: result.message,
      updatedPoints: result.updatedPoints,
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor al procesar el canje." });
  }
});

module.exports = router;
