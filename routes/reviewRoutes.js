const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

  router.post("/review-in-user", reviewController.getAllReviewInAUser);
module.exports = router;
