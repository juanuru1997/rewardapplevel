const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true }, // 🔒 Bloqueado, no editable
    nickname: { type: String, trim: true, default: "" }, // ✅ Se podrá editar
    email: { type: String, trim: true, index: true, required: true },
    email_verified: { type: Boolean, default: false },
    picture: { type: String },
    points: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
});

// Evita sobreescribir el modelo si ya fue compilado
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
