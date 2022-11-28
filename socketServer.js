const Review = require("./models/reviewModel");
const User = require("./models/userModel");
const Blog = require("./models/blogModel");
const serverStore = require("./serverStore");
const disconnectHandler = require("./socketHandlers/disconnectHandler");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");

const resgisterSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  serverStore.setSocketServerInstance(io);

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Thêm ng dùng vảo mảng những ng dùng đang online
    newConnectionHandler(socket, io);

    socket.on("join-place", (placeId) => {
      socket.join(placeId);
    });

    socket.on("join-user", (userId) => {
      socket.join(userId);
    });

    socket.on("join-guide", (guideId) => {
      socket.join(guideId);
    });

    socket.on("create-comment-place", async (review) => {
      // console.log(review.reviews);
      const reviewList = await Review.find({ place: review.reviews.place });

      socket.to(review.reviews.place).emit("sendReviewToClient", reviewList);
    });

    socket.on("create-comment-guide", async (review) => {
      // console.log(review.reviews);
      const reviewList = await Review.find({ guide: review.reviews.guide });

      socket
        .to(review.reviews.guide)
        .emit("sendReviewGuideToClient", reviewList);
    });

    socket.on("remove-favourite", async (data) => {
      const { userId, placeId } = data;
      const user = await User.findById(userId);
      user.bookmark = user.bookmark.filter((place) => place["id"] !== placeId);
      user.save({ validateBeforeSave: false });

      socket.to(userId).emit("sendRemoveFavouriteToClient", user);
    });

    socket.on(
      "update-user",
      async (values, userId, imageCover, dateOfBirth) => {
        const user = await User.findByIdAndUpdate(userId, {
          name: values.name,
          avatarUrl: imageCover,
          phone: values.phone,
          dateOfBirth: new Date(dateOfBirth).toISOString(),
          address: values.address,
        });
        socket.to(userId).emit("sendUpdateUser", user);
      }
    );

    socket.on("update-review", async (data) => {
      const { values, reviewId, rating, userId } = data;
      await Review.findByIdAndUpdate(reviewId, {
        name: values.review,
        rating: rating,
      });
      const review = Review.find({ user: userId });
      // console.log(review);
      socket.to(userId).emit("sendUpdateReview", review);
    });

    socket.on("remove-myblog", async (data) => {
      // const { userId, blogId } = data;
      // await Blog.findByIdAndDelete(blogId);
      // const blogUserAfterDelete = await Blog.find({ user: userId });
      // socket.to(userId).emit("sendRemoveMyBlogToClient", blogUserAfterDelete);
    });

    socket.on("remove-myreview", async (data) => {
      const { userId, reviewId } = data;

      await Review.findByIdAndDelete(reviewId);
      const reviewUserAfterDelete = await Review.find({ user: userId });

      socket
        .to(userId)
        .emit("sendRemoveMyReviewToClient", reviewUserAfterDelete);
    });

    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });
};

module.exports = {
  resgisterSocketServer,
};
