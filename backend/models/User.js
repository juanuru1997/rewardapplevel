const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    nickname: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, index: true, required: true },
    email_verified: { type: Boolean, default: false },
    picture: { type: String },
    points: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
