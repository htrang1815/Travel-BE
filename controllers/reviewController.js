const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};

  if (req.params.placeId) filter = { place: req.params.placeId };
  if (req.params.guideId) filter = { guide: req.params.guideId };

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getAllReviewInAUser = catchAsync(async (req, res) => {
  const { userId } = req.body;

  const myreview = await Review.find({ user: userId });
  res.status(200).json({
    status: "success",
    data: {
      reviews: myreview,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes

  if (!req.body.place) req.body.place = req.params.placeId;
  if (!req.body.guide) req.body.guide = req.params.guideId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReviews = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      reviews: newReviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    // (để nó sẽ trả về document mới nhất)
    runValidators: true,
    // (có chạy trình validate)
  });

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
