// backend/scripts/seedRewards.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Reward = require("../models/Rewards");
const rewards = require("../lib/seedData");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Reward.deleteMany();
    await Reward.insertMany(rewards);
    console.log("✅ Recompensas cargadas correctamente");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al cargar recompensas:", err);
    process.exit(1);
  }
};

seed();
