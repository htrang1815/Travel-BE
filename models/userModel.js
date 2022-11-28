const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const types = ["default", "google", "facebook"];
const typesForUnrequired = ["google", "facebook"];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name."],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: String,
    lowercase: true,
    match: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
  },
  address: {
    type: String,
  },
  dateOfBirth: { type: Date, default: Date.now },

  bookmark: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
      default: [],
    },
  ],
  password: {
    type: String,
    required: [isUnRequired, "Please provide a password"],
    minLength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [isUnRequired, "Please confirm your password"],
    // !! LƯU Ý: Khi dùng custom validate thì nó chỉ hoạt
    // động khi dùng SAVE or CREATE
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password a not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  typeAccount: {
    type: String,
    default: "default",
    enum: types,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  avatarUrl: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn9ZaICvJMOGSbKmoSCbt08xi2-o-sMqmFuEsqE2M&s",
  },
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "bookmark",
    select:
      "name images ratingAverage ratingsQuantity maxGroupSize startLocation price",
  });
  next();
});

// 0. Các thằng có typeAccount là facebook và google sẽ ko
// phải validate
function isUnRequired() {
  if (typesForUnrequired.indexOf(this.typeAccount) > -1) {
    return false;
  }
  return true;
}

// 1. Trc khi lưu User vào CSDL ta sẽ mã hóa Password
userSchema.pre("save", async function (next) {
  // a. save: đổi khi còn để update User (trong trường hợp ng dùng chỉ update
  // email ko update password => ta phải ktra xem password có thay đổi k thì ta ms mã hóa)
  if (!this.isModified("password")) return next();

  // b. Mã hóa thành 12 ký tự bất kỳ
  this.password = await bcrypt.hash(this.password, 12);

  // c. Xóa passwordConfirm khỏi DB
  this.passwordConfirm = undefined;

  next();
});

// 2. Hàm so sánh mkhau ng dùng đăng nhập vs mkhau trong CSDL
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 3. Hàm update passwordChangedAt (thời gian update Mkhau)
userSchema.pre("save", function (next) {
  // Nếu mkhau chưa dc sửa thì sang middleware khác
  // hoặc ng dùng mới đc tạo ra
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// 4. Hàm ktra xem nga dùng đã thay đổi mkhau chưa

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // (nếu thuộc tính passwordChangedAt tồn tại thì có nghĩa là
  // ng dùng đã thay đổi mkhau)
  // (JWTTimestamp: thời gian token đc tạo ra)
  return false;
};

// 5. Tạo mã để Reset password

userSchema.methods.createPasswordResetToken = function () {
  // Tạo 1 mã token ngẫu nhiên
  const resetToken = crypto.randomBytes(32).toString("hex");
  // Mã hóa token này
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // (mã token chỉ tồn tại trong 10 phút)

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
