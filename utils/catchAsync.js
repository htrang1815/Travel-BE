module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
    // catch(next) => nếu lỗi sẽ chạy đến
    // global error handler
  };
};
