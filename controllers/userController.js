const User = require("../models/userModel");

exports.favouritePlace = async (req, res) => {
  // B1: Nhan request
  const { userId, placeId } = req.body;
  // B2: Truy cap CSDL
  const user = await User.findById(userId);
  user.bookmark = [...user.bookmark, placeId];
  //Tat validate user trc khi luw
  user.save({ validateBeforeSave: false });

  // B3: Tra ve response
  res.status(200).json({
    status: "success",
    isFavorite: true,
  });
};

exports.removeFavouritePlace = async (req, res) => {
  const { userId, placeId } = req.body;
  const user = await User.findById(userId);
  user.bookmark = user.bookmark.filter((place) => place["id"] !== placeId);
  user.save({ validateBeforeSave: false });
  console.log(user);
  res.status(200).json({
    status: "success",
    isFavorite: false,
  });
};
