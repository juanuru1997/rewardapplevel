const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // 🔹 Importamos el modelo de usuario

const JWT_SECRET = process.env.JWT_SECRET || "valor_por_defecto";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(CLIENT_ID);

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];

    try {
        if (token.includes(".")) {  // 🔹 Si es un JWT (de Google o interno)
            try {
                // 🔹 Verificar si es un Token de Google
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: CLIENT_ID,
                });

                const payload = ticket.getPayload();

                // ✅ Buscar usuario en la base de datos
                let user = await User.findOne({ email: payload.email });

                if (!user) {
                    // 🔹 Crear nuevo usuario si no existe
                    user = new User({
                        name: payload.name,
                        email: payload.email,
                        email_verified: payload.email_verified,
                        picture: payload.picture || "https://via.placeholder.com/150",
                        points: 0,
                    });
                } else {
                    // 🔹 Si ya existe, asegurarse de actualizar la imagen y el nombre si están vacíos
                    let userHasChanges = false;

                    if (!user.name || user.name === "Usuario") {
                        user.name = payload.name;
                        userHasChanges = true;
                    }
                    if (!user.picture || user.picture === "") {
                        user.picture = payload.picture;
                        userHasChanges = true;
                    }
                    if (!user.email_verified && payload.email_verified) {
                        user.email_verified = true;
                        userHasChanges = true;
                    }

                    if (userHasChanges) {
                        await user.save();
                    }
                }

                req.user = {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture,
                    email_verified: user.email_verified,
                };

                console.log("✅ Usuario autenticado y actualizado en MongoDB:", req.user);
                return next();
            } catch (googleError) {
                // 🔹 Si falla la verificación con Google, intentamos con nuestro JWT interno
                const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });

                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    name: decoded.name || "Usuario",
                    picture: decoded.picture || "",
                };

                return next();
            }
        }

        return res.status(401).json({ message: "Token inválido." });
    } catch (error) {
        console.error("❌ Error en la autenticación:", error);
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

module.exports = authMiddleware;
