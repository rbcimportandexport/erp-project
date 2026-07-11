const mongoose = require("mongoose");

const approvalRequestSchema = new mongoose.Schema(
  {
    moduleName: { type: String, required: true },
    action: { type: String, enum: ["create", "update", "delete"], required: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, default: null },
    originalData: { type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed, default: {} },
    requestedData: { type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed, default: {} },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date },
    comments: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApprovalRequest", approvalRequestSchema);
