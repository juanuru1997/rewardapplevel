const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Cargar variables de entorno
const { connectDB } = require("./db"); // Importar la conexión a la base de datos
const googleAuthRoute = require("./routes/googleAuth");
const userRoute = require("./routes/user"); // Ruta para manejar usuarios

const app = express();
const port = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

// Middlewares básicos
app.use(cors());
app.use(express.json()); // Habilitar JSON para solicitudes y respuestas

// Importar otras rutas
const signupRoute = require("./routes/signup");
const loginRoute = require("./routes/login");
const rewardRoute = require("./routes/reward");
const refreshTokenRoute = require("./routes/refreshToken");
const signoutRoute = require("./routes/signout");

// Configurar rutas en el servidor
app.use("/api/auth", googleAuthRoute); // Autenticación con Google
app.use("/api/signup", signupRoute);
app.use("/api/login", loginRoute);
app.use("/api/user", userRoute); // Configuración para manejar usuarios
app.use("/api/reward", rewardRoute);
app.use("/api/refresh-token", refreshTokenRoute);
app.use("/api/signout", signoutRoute);

// Endpoint básico para verificar que el servidor funciona
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente.");
});

// Endpoint de prueba para verificar conexión a MongoDB
app.get("/health-check", (req, res) => {
  res.status(200).json({
    message: "La API está funcionando correctamente.",
    dbStatus: "Conexión establecida con MongoDB",
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto: ${port}`);
});
