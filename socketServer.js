const Review = require("./models/reviewModel");
const User = require("./models/userModel");
const Blog = require("./models/blogModel");
const serverStore = require("./serverStore");
const disconnectHandler = require("./socketHandlers/disconnectHandler");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const Guide = require("./models/guideModel");
const Project = require("./models/projectModel");

const { Server } = require("socket.io");

const resgisterSocketServer = (server) => {
  const io = Server(server, {
    cors: {
      origin: "https://backend.travelbooking.homes",
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
      await user.save({ validateBeforeSave: false });

      socket.to(userId).emit("sendRemoveFavouriteToClient", user);
    });

    socket.on("admindelete", async (data) => {
      const { userId, path, id } = data;
      console.log("data", data);
      let res;
      if (path === "userprofile") {
        await User.findByIdAndDelete(id);
        res = await User.find();
      } else if (path === "guides") {
        await Guide.findByIdAndDelete(id);
        res = await Guide.find();
      } else if (path === "blogs") {
        await Blog.findByIdAndDelete(id);
        res = await Blog.find();
      } else if (path === "reviews") {
        // await Review.findByIdAndDelete(id);
        res = await Review.find();
      } else if (path === "projects") {
        await Project.findByIdAndDelete(id);
        res = await Project.find();
      }
      console.log({ res, path });
      socket.to(userId).emit("sendAdminDeleteToClient", res);
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
      console.log(data);
      await Review.findByIdAndUpdate(data._id, {
        review: data.review,
        rating: data.rating,
      });
      const review = await Review.find({ user: data.user._id });
      console.log(review);
      socket.to(data.user._id).emit("sendUpdateReview", review);
    });

    socket.on("remove-myblog", async (data) => {
      const { userId, blogId } = data;
      await Blog.findByIdAndDelete(blogId);
      const blogUserAfterDelete = await Blog.find({ user: userId });
      socket.to(userId).emit("sendRemoveMyBlogToClient", blogUserAfterDelete);
    });

    socket.on("remove-myblog", async (data) => {
      const { path, id } = data;
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
