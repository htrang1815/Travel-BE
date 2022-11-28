const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Guide = require("../models/guideModel");

exports.getAllGuide = catchAsync(async (req, res) => {
    const guides = await Guide.find();
    res.status(200).json({
      status: "success",
      results: guides.length,
      data: {
        guides,
      },
    });
  });

  exports.createGuide = catchAsync(async (req, res) => {
    const newGuide = await Guide.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        guides: newGuide,
      },
    });
  });

  exports.getGuide = catchAsync(async (req, res, next) => {
    const guide = await Guide.findById(req.params.id);
  
    if (!guide) {
      return next(new AppError("No document found with that ID", 404));
    }
  
    res.status(200).json({
      status: "success",
      data: {
        guide,
      },
    });
  });
  exports.updateGuide = catchAsync(async (req, res, next) => {
    const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      // (để nó sẽ trả về document mới nhất)
      runValidators: true,
      // (có chạy trình validate)
    });
  
    if (!guide) {
      return next(new AppError("No guide found with that ID", 404));
    }
  
    res.status(200).json({
      status: "success",
      data: {
        guide,
      },
    });
  });
  exports.deleteGuide = catchAsync(async (req, res, next) => {
    const guide = await Guide.findByIdAndDelete(req.params.id);
    if (!guide) {
      return next(new AppError("No guide found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

  