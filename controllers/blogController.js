const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Blog = require("../models/blogModel");

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  // const blogs = await Blog.find();
  let query = Blog.find();
  const excludedFields = ["page", "limit"];
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 4;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    query = query.skip(skip).limit(limit);
    const numPlaces = await Blog.countDocuments();
    console.log("numPlaces", numPlaces);
    console.log("skip", skip);
    if (skip >= numPlaces) {
      next(new AppError("This page does not exist", 404));
    }
  } else {
    // const limit = req.query.limit * 1 || 3;
    query = Blog.find();
  }
  const blogs = await query;

  res.status(200).json({
    status: "success",
    results: blogs.length,
    data: {
      blogs,
    },
  });
});

exports.getAllBlogInAUser = catchAsync(async (req, res) => {
  const { userId } = req.body;
  // console.log(userId);
  const myblog = await Blog.find({ user: userId });
  // console.log("myblog", myblog);
  res.status(200).json({
    status: "success",
    data: {
      blogs: myblog,
    },
  });
});

exports.createBlog = catchAsync(async (req, res) => {
  const newBlog = await Blog.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      blogs: newBlog,
    },
  });
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      blog,
    },
  });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    // (để nó sẽ trả về document mới nhất)
    runValidators: true,
    // (có chạy trình validate)
  });

  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      blog,
    },
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
