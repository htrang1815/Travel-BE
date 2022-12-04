const express = require("express");
const sendEmailController = require("../controllers/sendEmailController");

const router = express.Router();
router.post("/sendwelcome", sendEmailController.sendEmailWelcome);

module.exports = router;
