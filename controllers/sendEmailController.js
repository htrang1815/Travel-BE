const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

exports.sendEmailWelcome = catchAsync(async (req, res) => {
  const { email } = req.body;

  console.log(req.body);
  await new Email(null, null, email).sendWelcomeEmail();
  res.status(200).json({
    status: "success",
    message: "Send email successfully",
  });
});
