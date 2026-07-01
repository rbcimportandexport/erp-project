const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeActivityLog } = require("../middleware/activityLog");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, "Invalid credentials", "Email or password is incorrect.", 401);
    }
    if (!user.isActive) {
      return errorResponse(res, "Account inactive", "Your account is inactive.", 403);
    }

    const token = generateToken(user);
    return successResponse(res, { user: sanitizeUser(user), token }, "Login successful");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to login", 500);
  }
};

exports.register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body, createdBy: req.user?._id });
    await writeActivityLog({ req, action: "create", module: "User", recordId: user._id, description: "User registered" });
    return successResponse(res, sanitizeUser(user), "User registered", 201);
  } catch (error) {
    return errorResponse(res, error.message, "Unable to register user", 400);
  }
};

exports.me = async (req, res) => {
  try {
    return successResponse(res, sanitizeUser(req.user), "Profile fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch profile", 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return errorResponse(res, "Invalid current password", "Password change failed", 400);
    }

    user.password = newPassword;
    await user.save();
    await writeActivityLog({ req, action: "update", module: "User", recordId: user._id, description: "Password changed" });

    return successResponse(res, {}, "Password changed successfully");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to change password", 400);
  }
};
