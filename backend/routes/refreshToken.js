const router = require("express").Router();

// Endpoint para refrescar el token
router.post("/", (req, res) => {
    const { refreshToken } = req.body;

    // Simulación de lógica para generar un nuevo token
    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token requerido." });
    }

    res.json({ accessToken: "nuevoAccessToken" });
});

module.exports = router;
