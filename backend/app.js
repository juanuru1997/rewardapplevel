const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { connectDB } = require("./db");
const User = require("./models/User");
const userRoutes = require("./routes/userRoutes");

// 🔹 Conectar a MongoDB antes de iniciar el servidor
connectDB();

const app = express();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "valor_por_defecto";
const PORT = process.env.PORT || 5000;

if (!CLIENT_ID) {
    console.error("❌ ERROR: GOOGLE_CLIENT_ID no está definido en .env");
    process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID);

app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

app.use(express.json());

// 🔹 Usar las rutas de usuario
app.use("/api/user", userRoutes);

// ✅ **Ruta para autenticación con Google**
app.post("/auth/google-auth", async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: "Token de Google requerido" });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ message: "Token inválido o expirado" });
        }

        const { email, name, picture, email_verified } = payload;
        let user = await User.findOne({ email });

        if (!user) {
            // 🔹 Crear nuevo usuario si no existe
            user = new User({
                name: name || "Usuario",
                email,
                email_verified,
                picture: picture || "https://via.placeholder.com/150", // Imagen por defecto
                points: 0
            });
            await user.save();
            console.log("✅ Nuevo usuario creado:", user);
        } else {
            // 🔹 Si el usuario ya existe, asegurarse de que los datos estén correctos
            let userHasChanges = false;

            if (!user.name || user.name === "Usuario") { 
                user.name = name;
                userHasChanges = true;
            }
            if (!user.picture || user.picture === "") { 
                user.picture = picture; // Se guarda la imagen de Google
                userHasChanges = true;
            }
            if (!user.email_verified && email_verified) {
                user.email_verified = true;
                userHasChanges = true;
            }

            if (userHasChanges) {
                await user.save();
                console.log("✅ Usuario actualizado con datos de Google:", user);
            }
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, picture: user.picture },
            JWT_SECRET,
            { algorithm: "HS256", expiresIn: "30d" }
        );

        return res.status(200).json({
            message: "✅ Inicio de sesión exitoso",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                email_verified: user.email_verified,
                points: user.points,
            }
        });
    } catch (error) {
        console.error("❌ Error en la autenticación con Google:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});

// ✅ **Ruta para obtener el perfil del usuario**
app.get("/api/user/profile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token no proporcionado." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture || "https://via.placeholder.com/150", // Imagen por defecto si está vacía
            nickname: user.nickname || "",
            points: user.points || 0,
        });
    } catch (error) {
        console.error("❌ Error obteniendo el perfil:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

// ✅ **Ruta para actualizar perfil de usuario**
app.put("/api/user/update-profile", async (req, res) => {
    try {
        const { email, nickname, points, picture } = req.body;

        if (!email) {
            return res.status(400).json({ message: "El correo electrónico es obligatorio." });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        let userHasChanges = false;

        if (user.nickname !== nickname) {
            user.nickname = nickname;
            userHasChanges = true;
        }
        if (user.points !== points) {
            user.points = points;
            userHasChanges = true;
        }
        if (user.picture !== picture) {
            user.picture = picture; 
            userHasChanges = true;
        }

        if (userHasChanges) {
            await user.save();
            return res.status(200).json({ message: "✅ Los cambios han sido guardados correctamente" });
        } else {
            return res.status(200).json({ message: "🔹 No hubo cambios en el perfil." });
        }
    } catch (error) {
        console.error("❌ Error en la actualización del perfil:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
});

// 🔹 Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
