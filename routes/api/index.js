const express = require("express");
const router = express.Router();

router.use("/users", require("./users"));
router.use("/followers", require("./follow"));

module.exports = router;
