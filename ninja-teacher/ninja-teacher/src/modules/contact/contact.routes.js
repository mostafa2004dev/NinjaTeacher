const express = require("express");
const router  = express.Router();
const ctrl    = require("./contact.controller");

router.post("/", ctrl.sendMessage);

module.exports = router;
