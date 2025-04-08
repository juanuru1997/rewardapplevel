const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "valor_por_defecto";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// ✅ Lista de correos autorizados como administradores
const adminEmails = ["vmelloni@applevel.com", "juansantana061997@gmail.com"];

// ✅ Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    let user;

    if (token.includes(".")) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        user = await User.findOne({ email: payload.email });

        if (!user) {
          user = new User({
            name: payload.name || "Usuario",
            email: payload.email,
            email_verified: payload.email_verified,
            picture: payload.picture || "https://via.placeholder.com/150",
            points: 0,
            isAdmin: adminEmails.includes(payload.email), // ✅ asignar admin si está en lista
          });
          await user.save();
        } else {
          let updated = false;

          if (!user.name || user.name === "Usuario") {
            user.name = payload.name;
            updated = true;
          }

          if (!user.picture || user.picture === "") {
            user.picture = payload.picture;
            updated = true;
          }

          if (!user.email_verified && payload.email_verified) {
            user.email_verified = true;
            updated = true;
          }

          // ✅ asignar admin si no lo tenía
          if (!user.isAdmin && adminEmails.includes(user.email)) {
            user.isAdmin = true;
            updated = true;
          }

          if (updated) await user.save();
        }
      } catch {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        user = await User.findById(decoded.id);
        if (!user) throw new Error("Usuario no encontrado");
      }
    }

    if (!user) return res.status(401).json({ message: "Token inválido." });

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      email_verified: user.email_verified,
      isAdmin: user.isAdmin || false,
    };

    next();
  } catch (err) {
    console.error("❌ authMiddleware error:", err);
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};

// ✅ Middleware exclusivo para administradores
const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
  }
  next();
};

module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
