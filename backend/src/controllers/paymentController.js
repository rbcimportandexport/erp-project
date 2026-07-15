const Payment = require("../models/Payment");
const Container = require("../models/Container");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeActivityLog } = require("../middleware/activityLog");

exports.create = async (req, res) => {
  try {
    const container = await Container.findById(req.params.containerId);
    if (!container) return errorResponse(res, "Container not found", "Record not found", 404);
    const payment = await Payment.create({ ...req.body, container: container._id, createdBy: req.user._id });
    await writeActivityLog({ req, action: "create", module: "Payment", recordId: payment._id, description: "Payment created" });
    return successResponse(res, payment, "Payment created", 201);
  } catch (error) {
    return errorResponse(res, error.message, "Unable to save payment", 400);
  }
};

exports.getByContainer = async (req, res) => {
  try {
    const payment = await Payment.findOne({ container: req.params.containerId }).populate("container");
    return successResponse(res, payment, "Payment fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch payment", 500);
  }
};

exports.update = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!payment) return errorResponse(res, "Payment not found", "Record not found", 404);
    await writeActivityLog({ req, action: "update", module: "Payment", recordId: payment._id, description: "Payment updated" });
    return successResponse(res, payment, "Payment updated");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to update payment", 400);
  }
};
