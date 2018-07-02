var express = require('express'),
    router  = express.Router();

// root route
router.get("/", (req, res) => {
    res.redirect("/landing");
})

router.get("/landing", (req, res) => {
    res.render("landing");
})

module.exports = router;