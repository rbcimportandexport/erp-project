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

    // Role-based filtering:
    // If logged-in user is 'admin', they can only see 'user' role
    if (req.user.role === "admin") {
      query.role = "user";
    } else if (req.user.role === "masterAdmin") {
      // masterAdmin can see admin and user (we can allow seeing masterAdmin too or just admin/user as specified)
      query.role = { $in: ["admin", "user", "masterAdmin"] };
    } else {
      return errorResponse(res, "Unauthorized access", "Access denied", 403);
    }

    if (req.query.search) {
      const escapedSearch = String(req.query.search).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(escapedSearch, "i");
      query.$or = [{ name: regex }, { email: regex }];
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
    const payload = { ...req.body };

    // Admin can only create 'user' role
    if (req.user.role === "admin") {
      payload.role = "user";
    } else if (req.user.role !== "masterAdmin") {
      return errorResponse(res, "Unauthorized access", "Access denied", 403);
    }

    const user = await User.create({ ...payload, createdBy: req.user._id });
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

    // If logged in as admin:
    if (req.user.role === "admin") {
      // Admin can only update users who have the 'user' role
      if (user.role !== "user") {
        return errorResponse(res, "You are only authorized to update regular users", "Access denied", 403);
      }
      // Admin cannot elevate user's role
      payload.role = "user";
    } else if (req.user.role !== "masterAdmin") {
      return errorResponse(res, "Unauthorized access", "Access denied", 403);
    }

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

    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found", "Record not found", 404);

    // If logged in as admin:
    if (req.user.role === "admin") {
      // Admin can only delete users who have the 'user' role
      if (user.role !== "user") {
        return errorResponse(res, "You are only authorized to delete regular users", "Access denied", 403);
      }
    } else if (req.user.role !== "masterAdmin") {
      return errorResponse(res, "Unauthorized access", "Access denied", 403);
    }

    await User.findByIdAndDelete(req.params.id);

    await writeActivityLog({ req, action: "delete", module: "User", recordId: user._id, description: "User deleted" });
    return successResponse(res, safeUser(user), "User deleted");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to delete user", 400);
  }
};
