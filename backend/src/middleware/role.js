const { errorResponse } = require("../utils/apiResponse");

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return errorResponse(res, "Permission denied", "You do not have access to this action.", 403);
  }

  next();
};

module.exports = authorize;
