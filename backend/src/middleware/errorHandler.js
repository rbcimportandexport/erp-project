const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message = statusCode === 500 ? "Request failed" : error.message;
  const detail = isProduction && statusCode === 500 ? "Internal server error" : error.message;

  return errorResponse(res, detail, message, statusCode);
};

module.exports = errorHandler;
