const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { connectDB } = require("./db");
const User = require("./models/User");
const userRoutes = require("./routes/userRoutes");
const rewardRoutes = require("./routes/rewardRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "valor_por_defecto";

if (!CLIENT_ID) {
  console.error("❌ GOOGLE_CLIENT_ID no definido en .env");
  process.exit(1);
}

connectDB();
const client = new OAuth2Client(CLIENT_ID);

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/rewards", rewardRoutes);

// ✅ Función para validar URLs de imagen
const isValidUrl = (url) => typeof url === "string" && url.startsWith("http");

// ✅ Google Auth
app.post("/auth/google-auth", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Token requerido" });

    const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ message: "Token inválido o expirado" });

    const { email, name, picture, email_verified } = payload;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name || "Usuario",
        email,
        email_verified: !!email_verified,
        picture: isValidUrl(picture) ? picture : "https://via.placeholder.com/150",
        points: 0
      });
      await user.save();
    } else {
      let changes = false;
      if (!user.name || user.name === "Usuario") { user.name = name; changes = true; }
      if ((!user.picture || user.picture.includes("placeholder")) && isValidUrl(picture)) { user.picture = picture; changes = true; }
      if (!user.email_verified && email_verified) { user.email_verified = true; changes = true; }
      if (changes) await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, picture: user.picture },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "30d" }
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        email_verified: user.email_verified,
        points: user.points
      }
    });
  } catch (err) {
    console.error("❌ Error en login Google:", err);
    res.status(500).json({ message: "Error interno del servidor", error: err.message });
  }
});

// ✅ Obtener perfil
app.get("/api/user/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || "https://via.placeholder.com/150",
      nickname: user.nickname || "",
      points: user.points || 0
    });
  } catch (err) {
    console.error("❌ Error obteniendo perfil:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ✅ Actualizar perfil
app.put("/api/user/update-profile", async (req, res) => {
  try {
    const { email, nickname, points, picture } = req.body;
    if (!email) return res.status(400).json({ message: "El correo electrónico es obligatorio." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    let hasChanges = false;

    if (user.nickname !== nickname) { user.nickname = nickname; hasChanges = true; }
    if (user.points !== points) { user.points = points; hasChanges = true; }
    if (user.picture !== picture) { user.picture = picture; hasChanges = true; }

    if (hasChanges) {
      await user.save();
      return res.status(200).json({ message: "✅ Cambios guardados correctamente" });
    }

    res.status(200).json({ message: "🔹 No hubo cambios" });
  } catch (err) {
    console.error("❌ Error actualizando perfil:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
