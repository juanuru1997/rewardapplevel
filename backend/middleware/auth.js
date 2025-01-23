const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "12345"; 

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};

module.exports = authMiddleware;
