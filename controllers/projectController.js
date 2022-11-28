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

    // D. Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 4;
    // const skip = (page - 1) * limit;

    // if (req.query.page) {
    //   query = query.skip(skip).limit(limit);
    //   const numPlaces = await Project.countDocuments();
    //   console.log("numPlaces", numPlaces);
    //   console.log("skip", skip);
    //   if (skip >= numPlaces) {
    //     next(new AppError("This page does not exist", 404));
    //   }
    // }

    // console.log(query);

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
  const { name, limit = 20 } = req.query;
  const { ratingAverageSort = -1, priceSort = -1 } = req.query;
  const match = {};
  const sort = {};

  if (name) {
    match.name = name;
  }

  if (ratingAverageSort) {
    sort.ratingAverage = ratingAverageSort;
  }
  if (priceSort) {
    sort.price = priceSort;
  }

  const projects = await Project.aggregate()
    .match({ ...match })
    .sort({ ...sort })
    .limit(+limit);

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
