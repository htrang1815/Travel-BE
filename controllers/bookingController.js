const { buffer } = require("micro");

const stripeAPI = require("../stripe");
const Project = require("../models/projectModel");
const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

exports.getCheckoutSession = catchAsync(async (req, res) => {
  const domainUrl = process.env.DOMAIN_URL;
  const { numberItem } = req.body;
  // 1. Lấy thông tin tour đc book
  const project = await Project.findById(req.params.tourId);
  console.log(project);

  const customer = await stripeAPI.customers.create({
    email: req.user.email,
  });
  // 2. Create checkout session
  const session = await stripeAPI.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${domainUrl}/success?place=${req.params.tourId}`,
    cancel_url: `${domainUrl}/project/${req.params.tourId}`,
    // customer_email: req.user.email,
    customer: customer.id,
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
            images: [project.images[0]],
          },
        },
        quantity: numberItem,
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

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email }).id;

  const price = session.line_items[0].amount / 100;
  await Booking.create({ tour, user, price });
  console.log(session);
};

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  // B1: tạo 1 chữ ký để xác thực dữ liệu đến trong body
  const signature = req.headers["stripe-signature"];
  // console.log(signature);
  // console.log(req.body);
  // const reqBuffer = await buffer(req);
  // B2: Tạo event
  let event;
  console.log({
    body: req.body,
    signature,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });
  try {
    event = await stripeAPI.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(event);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // B3:
  if (event.type === "checkout.session.completed") {
    createBookingCheckout(event.data.object);
  }
});

exports.createBooking = catchAsync(async (req, res) => {
  const newBooking = await Booking.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      booking: newBooking,
    },
  });
});

exports.getAllBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find();
  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    // (để nó sẽ trả về document mới nhất)
    runValidators: true,
    // (có chạy trình validate)
  });

  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
