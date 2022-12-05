const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Project = require("../models/projectModel");

exports.getAllProjects = catchAsync(async (req, res, next) => {
  let queryObj = { ...req.query };
  const { name } = req.query;

  if (name && name.length !== 0) {
    const projects = await Project.find({
      name: new RegExp(name, "i"),
    });

    // console.log("1", projects);

    res.status(200).json({
      status: "success",
      results: projects.length,
      data: {
        projects,
      },
    });
  } else {
    const excludedFields = ["page", "sort", "limit", "fields"];

    // Loại các thằng page, ... ra khỏi chuỗi truy vấn
    excludedFields.forEach((el) => delete queryObj[el]);

    // A. Filter
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Project.find(JSON.parse(queryStr));

    // B. Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      // query = query.sort("-createdAt");
    }

    // C. Fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const projects = await query;

    // console.log("2", projects);

    res.status(200).json({
      status: "success",
      results: projects.length,
      data: {
        projects,
      },
    });
  }
});

exports.getProjectsByFilter = catchAsync(async (req, res) => {
  const { lenght, price, date, name } = req.body;
  // const { ratingAverageSort = -1, priceSort = -1 } = req.query;
  const start = new Date("02".concat(" ", date));
  const end = new Date("31".concat(" ", date));

  // console.log(lenght, price, date, name);
  // console.log(start, end);
  // console.log(date);

  const match = {};
  // const month = {};

  if (name) {
    match.name = { $regex: name, $options: "i" };
  }

  if (lenght) {
    match.duration = { $gt: lenght[0], $lt: lenght[1] };
  }

  if (price) {
    match.price = { $gt: price[0], $lt: price[1] };
  }

  if (date) {
    match.createdAt = { $gte: new Date(start), $lte: new Date(end) };
  }

  console.log(match);

  const projects = await Project.aggregate().match({ ...match });
  //   .sort({ ...sort })
  //   .limit(+limit);
  // console.log(projects);

  res.status(200).json({
    status: "success",
    results: projects.length,
    data: {
      projects,
    },
  });
});

exports.createProject = catchAsync(async (req, res) => {
  const newProject = await Project.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      projects: newProject,
    },
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id).populate("reviews");

  if (!project) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      project,
    },
  });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      project,
    },
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
