const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const adminEmails = ["vmelloni@applevel.com", "juansantana061997@gmail.com"];

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    let user;

    // 🔍 Si el token es de Google (ID Token)
    if (token.split(".").length === 3 && token.length > 500) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();

      user = await User.findOne({ email: payload.email });

      if (!user) {
        user = await User.create({
          name: payload.name || "Usuario",
          email: payload.email,
          email_verified: payload.email_verified,
          picture: payload.picture || "",
          points: 0,
          isAdmin: adminEmails.includes(payload.email),
        });
      } else {
        let updated = false;
        if (!user.picture && payload.picture) {
          user.picture = payload.picture;
          updated = true;
        }
        if (!user.email_verified && payload.email_verified) {
          user.email_verified = true;
          updated = true;
        }
        if (!user.isAdmin && adminEmails.includes(payload.email)) {
          user.isAdmin = true;
          updated = true;
        }
        if (updated) await user.save();
      }
    } else {
      // 🔍 Token generado por tu servidor
      const decoded = jwt.verify(token, JWT_SECRET);
      user = await User.findById(decoded.id);
      if (!user) throw new Error("Usuario no encontrado");
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isAdmin: user.isAdmin || false,
    };

    next();
  } catch (err) {
    console.error("❌ authMiddleware error:", err.message);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Solo administradores." });
  }
  next();
};

module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
