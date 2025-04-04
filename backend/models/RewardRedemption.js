const mongoose = require("mongoose");

const rewardRedemptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reward: { type: mongoose.Schema.Types.ObjectId, ref: "Reward", required: true },
  pointsUsed: { type: Number, required: true },
  status: { type: String, default: "completed" }, // "completed", "failed", etc.
  stockBefore: Number,
  stockAfter: Number
}, { timestamps: true });

module.exports = mongoose.model("RewardRedemption", rewardRedemptionSchema);
