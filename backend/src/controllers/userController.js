const User = require("../models/User");
const { writeActivityLog } = require("../middleware/activityLog");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdBy: user.createdBy,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

exports.list = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const query = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      query.$or = [{ name: regex }, { email: regex }, { role: regex }];
    }

    const [items, total] = await Promise.all([
      User.find(query).select("-password").sort("-createdAt").skip((page - 1) * limit).limit(limit),
      User.countDocuments(query),
    ]);

    return successResponse(res, { items, total, page, pages: Math.ceil(total / limit) }, "Users fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch users", 500);
  }
};

exports.create = async (req, res) => {
  try {
    const user = await User.create({ ...req.body, createdBy: req.user._id });
    await writeActivityLog({ req, action: "create", module: "User", recordId: user._id, description: "User created" });
    return successResponse(res, safeUser(user), "User created", 201);
  } catch (error) {
    return errorResponse(res, error.message, "Unable to create user", 400);
  }
};

exports.update = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.password) delete payload.password;

    const user = await User.findById(req.params.id).select("+password");
    if (!user) return errorResponse(res, "User not found", "Record not found", 404);

    Object.assign(user, payload);
    await user.save();

    await writeActivityLog({ req, action: "update", module: "User", recordId: user._id, description: "User updated" });
    return successResponse(res, safeUser(user), "User updated");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to update user", 400);
  }
};

exports.remove = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return errorResponse(res, "You cannot delete your own account", "Delete failed", 400);
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return errorResponse(res, "User not found", "Record not found", 404);

    await writeActivityLog({ req, action: "delete", module: "User", recordId: user._id, description: "User deleted" });
    return successResponse(res, safeUser(user), "User deleted");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to delete user", 400);
  }
};
