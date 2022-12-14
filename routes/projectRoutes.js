const express = require("express");
const projectController = require("../controllers/projectController");
const reviewRoutes = require("./reviewRoutes");
const authController = require("../controllers/authController");

const router = express.Router();

// nested route
router.use("/:placeId/reviews", reviewRoutes);

router.get("/", projectController.getAllProjects);
router.post("/filter", projectController.getProjectsByFilter);
router.post("/", projectController.createProject);

router.get("/:id", projectController.getProject);
router.patch("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

module.exports = router;
