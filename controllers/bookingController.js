const stripeAPI = require("../stripe");
const Project = require("../models/projectModel");
const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/bookingModel");

exports.getCheckoutSession = catchAsync(async (req, res) => {
  const domainUrl = process.env.DOMAIN_URL;

  // 1. Lấy thông tin tour đc book
  const project = await Project.findById(req.params.tourId);
  //   console.log(project);
  // 2. Create checkout session
  const session = await stripeAPI.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${domainUrl}/success?place=${req.params.tourId}&user=${req.user.id}&price=${project.price}`,
    cancel_url: `${domainUrl}/project/${req.params.tourId}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    //-- Dữ liệu tour truyền vào Booking Page
    line_items: [
      {
        price_data: {
          unit_amount: project.price * 100,
          // (đổi tiền thành xu 1$ = 100xu)
          currency: "usd",
          // Đơn vị tiền tệ
          product_data: {
            name: `${project.name}`,
            description: project.summary,
            images: [
              "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });
  // 3. Create response session
  res.status(200).json({
    status: "success",
    session,
  });
});
