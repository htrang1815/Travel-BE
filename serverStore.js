const connectedUsers = new Map();

let io = null;

const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

const getSocketServerInstance = () => {
  return io;
};

const addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });

  console.log("new connected users");
  console.log(connectedUsers);
};

const removeConnectedUser = (socketId) => {
  // Xóa ng dùng khỏi Map khi ng dùng mất kết nối
  if (connectedUsers.has(socketId)) {
    connectedUsers.delete(socketId);
    console.log("new connected users");
    console.log(connectedUsers);
  }
};

// Lấy tất cả các ng dùng đang online
const getActiveConnections = (userId) => {
  const activeConnections = [];

  connectedUsers.forEach(function (value, key) {
    if (value.userId === userId) {
      activeConnections.push(key);
    }
  });

  return activeConnections;
};

module.exports = {
  addNewConnectedUser,
  setSocketServerInstance,
  removeConnectedUser,
  getActiveConnections,
  getSocketServerInstance,
};
