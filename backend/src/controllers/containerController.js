const Container = require("../models/Container");
const Document = require("../models/Document");
const Transport = require("../models/Transport");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeActivityLog } = require("../middleware/activityLog");
const ApprovalRequest = require("../models/ApprovalRequest");

const populate = ["importer", "exporter", "hsnCode", "createdBy", "updatedBy"];

const applyPopulate = (query) => {
  populate.forEach((path) => query.populate(path));
  return query;
};

exports.list = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 10000);
    const query = {};

    if (req.query.status) {
      if (req.query.status === "active") {
        query.status = { $nin: ["done", "DONE"] };
      } else if (req.query.status === "done") {
        query.status = { $in: ["done", "DONE"] };
      } else {
        query.status = req.query.status;
      }
    }
    if (req.query.importer) query.importer = req.query.importer;
    if (req.query.exporter) query.exporter = req.query.exporter;
    if (req.query.fromDate || req.query.toDate) {
      query.etaDate = {};
      if (req.query.fromDate) query.etaDate.$gte = new Date(req.query.fromDate);
      if (req.query.toDate) query.etaDate.$lte = new Date(req.query.toDate);
    }
    if (req.query.search) {
      const escapedSearch = String(req.query.search).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(escapedSearch, "i");
      const docs = await Document.find({ $or: [{ fileName: regex }, { docType: regex }] }).select("container");
      const transports = await Transport.find({
        $or: [{ vehicleNo: regex }, { driverName: regex }, { driverPhone: regex }, { transporterName: regex }, { fromLocation: regex }, { toLocation: regex }],
      }).select("container");
      query.$or = [
        { containerNo: regex },
        { remarks: regex },
        { _id: { $in: [...docs.map((doc) => doc.container), ...transports.map((transport) => transport.container)] } },
      ];
    }

    if (req.query.missing) {
      const field = req.query.missing;
      const missingQuery = {
        $or: [
          { [field]: null },
          { [field]: "" },
          { [field]: { $exists: false } }
        ]
      };
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          missingQuery
        ];
        delete query.$or;
      } else {
        query.$or = missingQuery.$or;
      }
    }

    if (req.query.priority) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.status = { $nin: ["done", "DONE"] };

      if (req.query.priority === "red") {
        const maxEta = new Date(today);
        maxEta.setDate(today.getDate() + 7);
        query.etaDate = { $lte: maxEta };
      } else if (req.query.priority === "yellow") {
        const minEta = new Date(today);
        minEta.setDate(today.getDate() + 8);
        const maxEta = new Date(today);
        maxEta.setDate(today.getDate() + 15);
        query.etaDate = { $gte: minEta, $lte: maxEta };
      } else if (req.query.priority === "green") {
        const minEta = new Date(today);
        minEta.setDate(today.getDate() + 16);
        const greenCondition = {
          $or: [
            { etaDate: { $gte: minEta } },
            { etaDate: null },
            { etaDate: { $exists: false } }
          ]
        };
        if (query.$or) {
          query.$and = [
            { $or: query.$or },
            greenCondition
          ];
          delete query.$or;
        } else if (query.$and) {
          query.$and.push(greenCondition);
        } else {
          query.$or = greenCondition.$or;
        }
      }
    }

    const [items, total] = await Promise.all([
      applyPopulate(Container.find(query).sort(req.query.sort || "-createdAt").skip((page - 1) * limit).limit(limit)),
      Container.countDocuments(query),
    ]);

    return successResponse(res, { items, total, page, pages: Math.ceil(total / limit) }, "Containers fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch containers", 500);
  }
};

exports.create = async (req, res) => {
  try {
    if (req.user && req.user.role !== "masterAdmin") {
      const request = await ApprovalRequest.create({
        moduleName: "Container",
        action: "create",
        requestedData: req.body,
        requestedBy: req.user._id,
        status: "pending",
      });
      await writeActivityLog({ req, action: "create", module: "ApprovalRequest", recordId: request._id, description: "Approval request created for Container creation" });
      return successResponse(res, null, "Approval request submitted successfully. It will be active once approved by Master Admin.", 202);
    }

    const container = await Container.create({ ...req.body, createdBy: req.user._id, updatedBy: req.user._id });
    await writeActivityLog({ req, action: "create", module: "Container", recordId: container._id, description: "Container created" });
    return successResponse(res, container, "Container created", 201);
  } catch (error) {
    return errorResponse(res, error.message, "Unable to create container", 400);
  }
};

exports.getById = async (req, res) => {
  try {
    const container = await applyPopulate(Container.findById(req.params.id));
    if (!container) return errorResponse(res, "Container not found", "Record not found", 404);
    const [documents, payment, transports] = await Promise.all([
      Document.find({ container: container._id }).sort("-uploadedAt"),
      require("../models/Payment").findOne({ container: container._id }),
      Transport.find({ container: container._id }).sort("-createdAt"),
    ]);
    return successResponse(res, { container, documents, payment, transports }, "Container fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch container", 500);
  }
};

exports.update = async (req, res) => {
  try {
    if (req.user && req.user.role !== "masterAdmin") {
      const originalRecord = await Container.findById(req.params.id);
      if (!originalRecord) return errorResponse(res, "Container not found", "Record not found", 404);

      const request = await ApprovalRequest.create({
        moduleName: "Container",
        action: "update",
        recordId: req.params.id,
        originalData: originalRecord.toObject(),
        requestedData: req.body,
        requestedBy: req.user._id,
        status: "pending",
      });
      await writeActivityLog({ req, action: "create", module: "ApprovalRequest", recordId: request._id, description: "Approval request created for Container update" });
      return successResponse(res, null, "Approval request submitted successfully. It will be active once approved by Master Admin.", 202);
    }

    const container = await Container.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.user._id }, { new: true, runValidators: true });
    if (!container) return errorResponse(res, "Container not found", "Record not found", 404);
    await writeActivityLog({ req, action: "update", module: "Container", recordId: container._id, description: "Container updated" });
    return successResponse(res, container, "Container updated");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to update container", 400);
  }
};

exports.remove = async (req, res) => {
  try {
    if (req.user && req.user.role !== "masterAdmin") {
      const originalRecord = await Container.findById(req.params.id);
      if (!originalRecord) return errorResponse(res, "Container not found", "Record not found", 404);

      const request = await ApprovalRequest.create({
        moduleName: "Container",
        action: "delete",
        recordId: req.params.id,
        originalData: originalRecord.toObject(),
        requestedData: {},
        requestedBy: req.user._id,
        status: "pending",
      });
      await writeActivityLog({ req, action: "create", module: "ApprovalRequest", recordId: request._id, description: "Approval request created for Container deletion" });
      return successResponse(res, null, "Approval request submitted successfully. It will be active once approved by Master Admin.", 202);
    }

    const container = await Container.findByIdAndDelete(req.params.id);
    if (!container) return errorResponse(res, "Container not found", "Record not found", 404);
    await writeActivityLog({ req, action: "delete", module: "Container", recordId: container._id, description: "Container deleted" });
    return successResponse(res, container, "Container deleted");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to delete container", 400);
  }
};
