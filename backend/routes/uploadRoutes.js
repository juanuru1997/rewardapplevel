const express = require("express");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Middleware de autenticación
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token inválido:", err.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

// ✅ Configuración de GridFS Storage
const { ObjectId } = mongoose.Types;

const storage = new GridFsStorage({
  db: mongoose.connection,
  file: (req, file) => {
    const id = new ObjectId(); // genera un _id válido manualmente

    return {
      _id: id,
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
      metadata: { originalname: file.originalname },
      contentType: file.mimetype, // 👈 importante para servirlo bien
    };
  },
});

const upload = multer({ storage });

// ✅ Ruta para subir una imagen
router.post("/", auth, (req, res) => {
  if (!mongoose.connection.readyState) {
    return res.status(500).json({ message: "❌ DB no conectada" });
  }

  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("❌ Multer error:", err.message);
      return res.status(500).json({ message: "Error al guardar imagen" });
    }

    console.log("📦 Archivo recibido:", req.file); // 👈 Log útil

    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    const publicUrl = `/api/uploads/${req.file.filename}`;
    console.log("✅ Imagen subida:", publicUrl);

    res.status(200).json({
      message: "✅ Imagen subida exitosamente",
      filename: req.file.filename,
      fileId: req.file.id,
      url: publicUrl,
    });
  });
});

module.exports = router;
