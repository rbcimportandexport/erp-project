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

    let decoded;
    try {
      // Try local verify
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Only decode directly if signature is verified with SUPABASE_JWT_SECRET
      if (process.env.SUPABASE_JWT_SECRET) {
        try {
          decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
        } catch (subErr) {
          return errorResponse(res, "Invalid token signature", "Please login again.", 401);
        }
      } else {
        return errorResponse(res, "Invalid token signature", "Please login again.", 401);
      }
    }

    if (!decoded) {
      return errorResponse(res, "Invalid token", "Please login again.", 401);
    }

    const email = (decoded.email || "").toLowerCase();
    if (!email) {
      return errorResponse(res, "Invalid token structure", "Token does not contain an email.", 401);
    }

    let user = await User.findOne({ email });

    // If user does not exist in MongoDB but is authenticated in Supabase, sync/create them
    if (!user) {
      const name = decoded.user_metadata?.name || email.split("@")[0] || "User";
      let role = decoded.user_metadata?.role || "user";
      
      // Sanitize role for MongoDB enum
      if (typeof role === "string") {
        role = role.trim();
        const lower = role.toLowerCase();
        if (lower.includes("master")) {
          role = "masterAdmin";
        } else if (lower.includes("admin")) {
          role = "admin";
        } else {
          role = "user";
        }
      } else {
        role = "user";
      }
      
      user = await User.create({
        name,
        email,
        password: "supabase_synced_user_no_password_required", // dummy password
        role,
        isActive: true,
      });
    }

    if (!user.isActive) {
      return errorResponse(res, "Invalid user", "Your account is inactive or unavailable.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, error.message || "Invalid token", "Please login again.", 401);
  }
};

module.exports = protect;
