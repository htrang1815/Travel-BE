const mongoose = require("mongoose");
const Guide = require("./guideModel");
const Project = require("./projectModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    guide: {
      type: mongoose.Schema.ObjectId,
      ref: "Guide",
    },
    place: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
    },
    image: {
      type: String,
      default:
        "https://climate.onep.go.th/wp-content/uploads/2020/01/default-image.jpg",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ place: 1, guide: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name avatarUrl",
  })
    .populate({
      path: "place",
      select: "_id name",
    })
    .populate({
      path: "guide",
      select: "_id name avatarUrl",
    });
  next();
});

// Tính số sao trung bình

reviewSchema.statics.calcAverageRatings = async function (placeId) {
  const stats = await this.aggregate([
    {
      $match: { place: placeId },
    },
    {
      $group: {
        _id: "$place",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Project.findByIdAndUpdate(placeId, {
      ratingsQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  } else {
    await Project.findByIdAndUpdate(placeId, {
      ratingsQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};

reviewSchema.statics.calcAverageRatingsGuide = async function (guideId) {
  const stats = await this.aggregate([
    {
      $match: { guide: guideId },
    },
    {
      $group: {
        _id: "$guide",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Guide.findByIdAndUpdate(guideId, {
      ratingsQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  } else {
    await Guide.findByIdAndUpdate(guideId, {
      ratingsQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.place);
  this.constructor.calcAverageRatingsGuide(this.guide);

  // this.constructor: chính là thằng Review
});

// Khi 1 review bị xóa hoặc update cùng phải thay đổi lại rating

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.place?._id);
  await this.r.constructor.calcAverageRatingsGuide(this.r.guide?._id);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
