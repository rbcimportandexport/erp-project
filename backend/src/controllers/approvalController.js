const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeActivityLog } = require("../middleware/activityLog");
const ApprovalRequest = require("../models/ApprovalRequest");
const mongoose = require("mongoose");

const listRequests = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      ApprovalRequest.find(query)
        .populate("requestedBy", "name email role")
        .populate("approvedBy", "name email role")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      ApprovalRequest.countDocuments(query),
    ]);

    return successResponse(res, { items, total, page, pages: Math.ceil(total / limit) }, "Approval requests fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch approval requests", 500);
  }
};

const approveRequest = async (req, res) => {
  try {
    const request = await ApprovalRequest.findById(req.params.id);
    if (!request) {
      return errorResponse(res, "Request not found", "Approval request not found", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Already processed", "This request is already approved or rejected", 400);
    }

    // Try to resolve the model dynamically
    let Model;
    try {
      Model = mongoose.model(request.moduleName);
    } catch (e) {
      return errorResponse(res, "Model not registered", `Model ${request.moduleName} is not available`, 400);
    }

    let resultRecord;
    const data = request.requestedData instanceof Map ? Object.fromEntries(request.requestedData) : request.requestedData;

    if (request.action === "create") {
      resultRecord = await Model.create(data);
    } else if (request.action === "update") {
      resultRecord = await Model.findByIdAndUpdate(request.recordId, data, { new: true, runValidators: true });
    } else if (request.action === "delete") {
      resultRecord = await Model.findByIdAndDelete(request.recordId);
    }

    request.status = "approved";
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    await writeActivityLog({
      req,
      action: "update",
      module: "ApprovalRequest",
      recordId: request._id,
      description: `Approval request for ${request.moduleName} ${request.action} was APPROVED`,
    });

    return successResponse(res, resultRecord, `Request approved and ${request.action} applied successfully`);
  } catch (error) {
    return errorResponse(res, error.message, "Unable to approve request", 500);
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await ApprovalRequest.findById(req.params.id);
    if (!request) {
      return errorResponse(res, "Request not found", "Approval request not found", 404);
    }

    if (request.status !== "pending") {
      return errorResponse(res, "Already processed", "This request is already approved or rejected", 400);
    }

    request.status = "rejected";
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    if (req.body.comments) {
      request.comments = req.body.comments;
    }
    await request.save();

    await writeActivityLog({
      req,
      action: "update",
      module: "ApprovalRequest",
      recordId: request._id,
      description: `Approval request for ${request.moduleName} ${request.action} was REJECTED`,
    });

    return successResponse(res, request, "Request rejected successfully");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to reject request", 500);
  }
};

module.exports = {
  listRequests,
  approveRequest,
  rejectRequest,
};
