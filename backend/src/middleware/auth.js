const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { errorResponse } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return errorResponse(res, "Authentication required", "Please login to continue.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return errorResponse(res, "Invalid user", "Your account is inactive or unavailable.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Invalid token", "Please login again.", 401);
  }
};

module.exports = protect;
