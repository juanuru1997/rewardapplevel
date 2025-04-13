const mongoose = require("mongoose");
const User = require("../models/User");
const Reward = require("../models/Rewards");
const RewardRedemption = require("../models/RewardRedemption");
const sendRedemptionEmails = require("./sendRedemptionEmails");

const redeemReward = async ({ userId, rewardId }) => {
  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    const [user, reward] = await Promise.all([
      User.findById(userId).session(session),
      Reward.findById(rewardId).session(session),
    ]);

    if (!user || !reward) throw new Error("Usuario o recompensa no encontrada.");
    if (!reward.active || reward.stock <= 0) throw new Error("La recompensa no está disponible.");
    if (user.points < reward.points) throw new Error("Puntos insuficientes.");

    const stockBefore = reward.stock;

    reward.stock -= 1;
    user.points -= reward.points;

    await Promise.all([
      reward.save({ session }),
      user.save({ session }),
    ]);

    const redemption = new RewardRedemption({
      user: user._id,
      reward: reward._id,
      pointsUsed: reward.points,
      status: "completed",
      stockBefore,
      stockAfter: reward.stock,
    });

    await redemption.save({ session });

    // ✅ Finalizar la transacción
    await session.commitTransaction();
    sendRedemptionEmails(user, reward);
    await session.endSession();
    
    return {
      success: true,
      message: "Canje realizado con éxito.",
      updatedPoints: user.points,
      rewardTitle: reward.title, // ✅ Agregado: título para usar en la notificación
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return {
      success: false,
      message: error.message || "Error en el proceso de canje.",
    };
  }
};

module.exports = redeemReward;
