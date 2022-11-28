const jwt = require("jsonwebtoken");
const { promisify } = require("util");

// 1. Hàm đăng ký tài khoản

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  // 1. Tạo mã JWT
  const token = signToken(user._id);

  // 2. Gửi 1 cookie đến client
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // (cookie sẽ hết hạn trong)
    // secure: true,
    // (cookie sẽ chỉ dc gửi trên 1 kết nối dc mã hóa (https)),
    httpOnly: true,
    // (trình duyệt ko thể truy cập hoặc sửa đổi cookie)
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // 3. Xóa mkhau khỏi DB
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// 1. Hàm Đăng ký

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

// 2. Hàm Đăng nhập

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // B1: Check if email và password tồn tại
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // B2: Check if user exists
  const user = await User.findOne({ email }).select("+password");

  // B3:Ktra xem mkau của ng dùng gửi = vs mkau trg CSDL k
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }
  // B4: Send token to client
  createSendToken(user, 200, res);
});

// 3. Ktra xem ng dùng login chưa phía frontend
exports.onAuthStateChanged = async (req, res) => {
  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    console.log("token", token);
    if (!token) {
      return res.json({
        isLogin: false,
        message: "You are not logged in! Please log in to get access.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // Lấy thông tin ng dùng hiện tại

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.json({
        isLogin: false,
        message: "The user belonging to this token does no longer exist.",
      });
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.json({
        isLogin: false,
        message: "User recently changed password! Please log in again.",
      });
    }

    res.json({
      isLogin: true,
      user: currentUser,
    });
  } catch (err) {
    res.json({
      isLogin: false,
    });
  }
};

// 4. Hàm bảo vệ các route (yêu cầu ng dùng đăng nhập thì ms có quyền truy cập)
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Nhận token từ headers của req
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2. Ktra xem mã token hợp lệ k
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3. Ktra xem ng dùng có tồn tại hay k
  // (ta sẽ ktra dựa vào id vì trg phần payload của token có chứa id)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does no longer exist.")
    );
  }
  // 4. Ktra xem sau khi mã JWT dc phát hành thì ng dùng có thay đổi mkhau k
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }
  // (decoded.iat : thời gian mã token đc tạo ra)

  // 5. Truyền thông tin user cho những middleware đằng sau
  // thằng này
  req.user = currentUser;
  next();
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

exports.signInWithGoogle = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
  } else {
    createSendToken(user, 200, res);
  }
});
