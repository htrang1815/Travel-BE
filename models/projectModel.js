const mongoose = require("mongoose");
const slugify = require("slugify");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A project must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        80,
        "A project name must have less or equal than 80 characters",
      ],
      minlength: [
        5,
        "A project name must have more or equal than 5 characters",
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A project must have a duration"],
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
      // 5.6666 => 5.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A project must have a price"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A project must have a description"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A project must have a group size"],
    },
    experience: {
      type: String,
      trim: true,
    },
    include: {
      accomodation: {
        type: String,
      },
      meals: {
        type: String,
      },
      transport: {
        type: String,
      },
    },
    startDates: [Date],
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    guides: {
      type: mongoose.Schema.ObjectId,
      ref: "Guide",
      required: [true, "A project must have a guide"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectSchema.index({ name: 1, guides: 1 });

// Lưu ảo 1 mảng chứa các id của reviews
projectSchema.virtual("reviews", {
  ref: "Review",
  // trường place bên Review
  foreignField: "place",
  localField: "_id",
});

projectSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

projectSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "name avatarUrl",
  });
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
