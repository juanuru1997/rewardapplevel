const router = require("express").Router();

router.post("/", (req, res) => {
    const { username, name, password } = req.body;
    if (!!username || !!name || !!password) {
        return res.status(400).json(
            jsonResponse(400, {
                error: "fields are required"
            })
        );
    } 

    //crear

    res.send("signout")
});

module.exports = router;
