const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  place: {
    type: mongoose.Schema.ObjectId,
    ref: "Project",
    require: [true, "Booking must belong to a Place!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    require: [true, "Booking must belong to a User!"],
  },
  price: {
    type: Number,
    require: [true, "Booking must have a price."],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "place",
    select: "name",
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
