const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Blog must have title"],
  },
  article: {
    type: String,
    required: [true, "Blog must have article"],
  },
  publishedAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },
  bannerImage: {
    type: String,
  },
});
blogSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name avatarUrl" });
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
