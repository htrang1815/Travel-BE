const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const http = require("http");
const { resgisterSocketServer } = require("./socketServer");

const server = http.createServer(app);

// A. Xử lý uncaught exception

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// E. Kết nối socket.io
resgisterSocketServer(server);

// B. KẾT NỐI VỚI MONGODB
mongoose.connect(process.env.MONGO).then(() => {
  console.log("DB connection successful!");
});
// C. START SERVER
const port = process.env.PORT || 3002;

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// D. Xử lý các promise bị reject (từ chối)
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLER REJECTION! Shutting down...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
