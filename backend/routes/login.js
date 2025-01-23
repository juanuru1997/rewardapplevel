const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Modelo de usuario
const { jsonResponse } = require("../lib/jsonResponse");

const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta"; // Cambia esto en producción

const loginRoute = () => {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { email, password } = req.body;

    console.log("Intento de login con:", { email, password });

    // Validar campos
    if (!email || !password) {
      return res.status(400).json(
        jsonResponse(400, { error: "El correo y la contraseña son obligatorios." })
      );
    }

    try {
      // Buscar usuario por email
      const user = await User.findOne({ email });
      if (!user) {
        console.log("Usuario no encontrado");
        return res.status(401).json(
          jsonResponse(401, { error: "Correo o contraseña incorrectos." })
        );
      }

      // Comparar contraseña ingresada con la almacenada
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Contraseña incorrecta");
        return res.status(401).json(
          jsonResponse(401, { error: "Correo o contraseña incorrectos." })
        );
      }

      // Generar token JWT
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "7d", // Token válido por 7 días
      });

      // Devuelve los datos adicionales del usuario junto con el token
      return res.status(200).json(
        jsonResponse(200, {
          message: "Inicio de sesión exitoso.",
          token, // Token de acceso
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic || "", // Devuelve la foto si está disponible
            points: user.points || 0, // Devuelve los puntos (0 por defecto si no existen)
            rewardsClaimed: user.rewardsClaimed || [], // Devuelve las recompensas reclamadas (vacío por defecto)
          },
        })
      );
    } catch (error) {
      console.error("Error en el login:", error);
      return res.status(500).json(
        jsonResponse(500, { error: "Error interno del servidor." })
      );
    }
  });

  return router;
};

module.exports = loginRoute;
