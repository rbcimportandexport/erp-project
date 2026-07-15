const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true, trim: true },
  module: { type: String, required: true, trim: true },
  recordId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String, trim: true },
  ipAddress: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
