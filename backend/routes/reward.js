const router = require("express").Router();

// Endpoint para obtener recompensas
router.get("/", (req, res) => {
    res.json([
        { id: 1, name: "Gift Card", points: 500 },
        { id: 2, name: "Discount Coupon", points: 300 }
    ]);
});

module.exports = router;
