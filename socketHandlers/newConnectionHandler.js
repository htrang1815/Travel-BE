const serverStore = require("../serverStore");

const newConnectionHandler = async (socket, io) => {
  const userDetails = socket.handshake.auth && socket.handshake.auth.user;

  serverStore.addNewConnectedUser({
    // socket.id: id của lượt kết nốt của ng dùng
    socketId: socket.id,
    userId: userDetails && userDetails._id,
  });
};

module.exports = newConnectionHandler;
