const express = require("express");
const bcrypt = require("bcryptjs"); // Para cifrar contraseñas
const User = require("../models/User"); // Importa el modelo de usuario
const { jsonResponse } = require("../lib/jsonResponse"); // Función para formatear respuestas
const router = express.Router();

// Ruta para registrar usuario
router.post("/", async (req, res) => {
  const { email, password, name } = req.body;

  // Validar campos
  if (!email || !password || !name) {
    return res.status(400).json(
      jsonResponse(400, { error: "Todos los campos son obligatorios." })
    );
  }

  try {
    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(
        jsonResponse(409, { error: "El usuario ya está registrado." })
      );
    }

    // Cifrar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario y guardarlo en MongoDB
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Almacena la contraseña cifrada
    });
    await newUser.save();

    // Responder con éxito
    return res.status(201).json(
      jsonResponse(201, { message: "Usuario registrado exitosamente." })
    );
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    return res.status(500).json(
      jsonResponse(500, { error: "Error interno del servidor." })
    );
  }
});

module.exports = router; // Exporta directamente el router
