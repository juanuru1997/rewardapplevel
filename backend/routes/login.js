const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { jsonResponse } = require("../lib/jsonResponse");

const JWT_SECRET = "cde6b35cea6d92edc02aed0d98bff52f0788a686eb8bdb17897c976b0b788ac9"; // 🔹 Tu clave fija
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!CLIENT_ID) {
  console.error("❌ ERROR: GOOGLE_CLIENT_ID no está definido en .env");
  process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID);

const loginRoute = () => {
  const router = express.Router();

  // 🔹 Login con email y contraseña
  router.post("/", async (req, res) => {
    const { email, password } = req.body;

    console.log("📌 Intento de login con:", { email });

    if (!email || !password) {
      return res.status(400).json(jsonResponse(400, { error: "El correo y la contraseña son obligatorios." }));
    }

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json(jsonResponse(401, { error: "Correo o contraseña incorrectos." }));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json(jsonResponse(401, { error: "Correo o contraseña incorrectos." }));
      }

      // 🔹 Si el usuario no tiene `name` o `profilePic`, lo actualizamos
      let userHasChanges = false;

      if (!user.name || user.name === "Usuario") { 
        user.name = email.split("@")[0]; // 🔹 Usa el nombre del correo si no tiene un nombre
        userHasChanges = true;
      }
      if (!user.profilePic || user.profilePic === "") { 
        user.profilePic = "https://via.placeholder.com/150"; // 🔹 Imagen por defecto
        userHasChanges = true;
      }

      if (userHasChanges) {
        await user.save();
        console.log("✅ Usuario actualizado con nombre e imagen:", user);
      }

      // ✅ Generar token JWT con `name` y `profilePic`
      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, profilePic: user.profilePic },
        JWT_SECRET,
        { expiresIn: "7d", algorithm: "HS256" }
      );

      console.log("✅ Token JWT generado para usuario:", user.email);

      return res.status(200).json(jsonResponse(200, {
        message: "✅ Inicio de sesión exitoso.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          points: user.points || 0,
          rewardsClaimed: user.rewardsClaimed || [],
        },
      }));
    } catch (error) {
      console.error("❌ Error en el login:", error);
      return res.status(500).json(jsonResponse(500, { error: "Error interno del servidor." }));
    }
  });

  return router;
};

module.exports = loginRoute;
