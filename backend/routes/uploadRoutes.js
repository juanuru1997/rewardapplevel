const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { GridFSBucket } = require("mongodb");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 🛡️ Autenticación
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log("🔐 Usuario autenticado:", decoded.email);
    next();
  } catch (err) {
    console.error("❌ Token inválido:", err.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

// 📁 Multer básico en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🖼️ Subida de imagen
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.warn("⚠️ No se recibió archivo");
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    const filename = `${Date.now()}-${req.file.originalname}`;
    const contentType = req.file.mimetype;

    console.log("📦 Subiendo imagen a GridFS:", filename);

    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: { originalname: req.file.originalname },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      console.log("✅ Imagen subida con éxito:", filename);
      res.status(200).json({
        message: "✅ Imagen subida exitosamente",
        filename,
        url: `/api/uploads/${filename}`,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("❌ Error al subir imagen a GridFS:", err);
      res.status(500).json({ message: "Error al guardar imagen", error: err.message });
    });
  } catch (err) {
    console.error("❌ Error en /api/uploads:", err);
    res.status(500).json({ message: "Error inesperado", error: err.message });
  }
});

module.exports = router;
