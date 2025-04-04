const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  points: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: String,
  imageUrl: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Reward", rewardSchema);

