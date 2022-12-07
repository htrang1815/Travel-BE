const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Blog = require("../models/blogModel");

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  // const blogs = await Blog.find();
  let query = Blog.find();

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // query = query.sort("-createdAt");
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
  let query = Blog.find({ user: userId });

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // query = query.sort("-createdAt");
  }

  const myblog = await query;
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
