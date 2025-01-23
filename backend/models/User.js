const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePic: {
    type: String, // Base64 o URL de la imagen
    default: "",
  },
  points: {
    type: Number,
    default: 0,
  },
  googleId: {
    type: String,
    unique: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
