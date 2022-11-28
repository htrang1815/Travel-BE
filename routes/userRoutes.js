const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/favourite", userController.favouritePlace);
router.post("/remove-favourite", userController.removeFavouritePlace);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/signInWithGoogle", authController.signInWithGoogle);
router.get("/logout", authController.logout);

router.get("/isLogin", authController.onAuthStateChanged);

module.exports = router;
