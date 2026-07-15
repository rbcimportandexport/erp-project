const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  if (error.name === "MulterError" || error.message === "Only PDF and image files are allowed") {
    statusCode = 400;
  }
  const isProduction = process.env.NODE_ENV === "production";
  const message = statusCode === 500 ? "Request failed" : error.message;
  const detail = isProduction && statusCode === 500 ? "Internal server error" : error.message;

  return errorResponse(res, detail, message, statusCode);
};

module.exports = errorHandler;
