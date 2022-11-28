const mongoose = require("mongoose");
const validator = require("validator");

const guideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Guide must have name"],
  },
  summary: {
    type: String,
    required: [true, "Guide must have summary"],
  },
  avatarUrl: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn9ZaICvJMOGSbKmoSCbt08xi2-o-sMqmFuEsqE2M&s",
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
  },
  address: {
    type: String,
    require: [true, "Guide must have country"],
  },
  language: {
    type: String,
    require: [true, "Guide must have language"],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  place: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
    },
  ],
  reason: {
    type: String,
  },
  experience: {
    type: String,
  },
  contact: {
    phone: {
      type: String,
      required: [true, "Guide must have phone"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Guide must have email"],
      unique: true,
      validator: [validator.isEmail, "Please provide a valid email"],
    },
    facebook: {
      type: String,
      default: "https://www.facebook.com/BLACKPINKOFFICIAL",
    },
    instagram: {
      type: String,
      instagram: "https://www.instagram.com/blackpinkofficial/",
    },
  },
});

guideSchema.pre(/^find/, function (next) {
  this.populate({
    path: "place",
    select: "name duration",
  });
  next();
});

const Guide = mongoose.model("Guide", guideSchema);

module.exports = Guide;
