class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    // Kế thừa message từ thằng Error

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // trạng thái lỗi ta sẽ dựa vào số đầu tiên
    // vd: 404 => ko thành công
    //     500 => lỗi

    this.isOperational = true;
    // true: là Opperators Error (Lỗi hoạt động)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
