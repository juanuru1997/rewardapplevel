const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { connectDB } = require("./db");  
const User = require("./models/user");
const userRoutes = require("./routes/userRoutes"); // 🔹 Importar userRoutes

// 🔹 Conectar a MongoDB antes de iniciar el servidor
connectDB();

const app = express();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "secreto";

// 🔹 Habilitar CORS
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

// 🔹 Middleware para procesar JSON
app.use(express.json());

// 🔹 Usar las rutas de usuario
app.use("/api/user", userRoutes); // 🔹 Agregar el prefijo '/api/user'

// 🔹 Verificar que CLIENT_ID está definido
if (!CLIENT_ID) {
    console.error("❌ ERROR: GOOGLE_CLIENT_ID no está definido en .env");
    process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID);

// 🔹 Función para verificar el token con Google
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: [CLIENT_ID],
        });
        return ticket.getPayload();
    } catch (error) {
        console.error("❌ Error al verificar token de Google:", error.message);
        return null;
    }
}

// 🔹 Ruta para autenticación con Google
app.post("/auth/google-auth", async (req, res) => {
    try {
        console.log("📌 Solicitud recibida en /auth/google-auth");
        console.log("🔹 Cuerpo de la petición:", req.body);

        const { credential } = req.body;

        if (!credential) {
            console.error("❌ No se recibió un token en la solicitud.");
            return res.status(400).json({ message: "Token de Google requerido" });
        }

        console.log("🔹 Token recibido:", credential);

        const payload = await verifyGoogleToken(credential);

        if (!payload) {
            console.error("❌ Token inválido o expirado.");
            return res.status(401).json({ message: "Token inválido o expirado" });
        }

        console.log("✅ Token verificado correctamente:", payload);

        const { email, name, picture, email_verified } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            console.log("🔹 Usuario no encontrado, creando nuevo usuario...");
            user = new User({
                name,
                email,
                email_verified,
                picture,
            });
            await user.save();
            console.log("✅ Usuario creado con éxito:", user);
        } else {
            console.log("🔹 Usuario ya existente, actualizando datos...");
            user.name = name;
            user.picture = picture;
            if (!user.email_verified && email_verified) {
                user.email_verified = true;
            }
            await user.save();
            console.log("✅ Usuario actualizado:", user);
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log("✅ Token JWT generado:", token);

        return res.status(200).json({
            message: "✅ Inicio de sesión exitoso",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                email_verified: user.email_verified,
            },
        });
    } catch (error) {
        console.error("❌ Error en Google Login:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

// 🔹 Iniciar el servidor en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
