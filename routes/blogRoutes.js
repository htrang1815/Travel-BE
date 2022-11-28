const express = require("express");
const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");

const router = express.Router();

// router.use(authController.protect);

router
  .route("/")
  .get(blogController.getAllBlogs)
  .post(blogController.createBlog);

router
  .route("/:id")
  .get(blogController.getBlog)
  .patch(blogController.updateBlog)
  .delete(blogController.deleteBlog);

router.post("/blog-in-user", blogController.getAllBlogInAUser);

module.exports = router;
