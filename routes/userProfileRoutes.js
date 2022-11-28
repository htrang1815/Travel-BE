const express = require("express");
const userProfileController = require("../controllers/userProfileController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(userProfileController.getAllUsers)
  .post(userProfileController.createUser);

router
  .route("/:id")
  .get(userProfileController.getUser)
  .patch(userProfileController.updateUser)
  .delete(userProfileController.deleteUser);

module.exports = router;
