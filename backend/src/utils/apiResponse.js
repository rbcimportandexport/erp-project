const successResponse = (res, data = {}, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({ success: true, data, message });
};

const errorResponse = (res, error = "Request failed", message = "Request failed", statusCode = 500) => {
  res.status(statusCode).json({ success: false, error, message });
};

module.exports = { successResponse, errorResponse };
