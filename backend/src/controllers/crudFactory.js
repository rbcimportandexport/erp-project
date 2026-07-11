const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeActivityLog } = require("../middleware/activityLog");
const ApprovalRequest = require("../models/ApprovalRequest");

const buildQuery = (search, fields = []) => {
  if (!search) return {};
  const trimmed = String(search).trim();
  if (!trimmed || fields.length === 0) return {};

  const escapedSearch = trimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  return {
    $or: fields.map((field) => {
      if (field === "code") {
        return { [field]: new RegExp("^" + escapedSearch, "i") };
      }
      return { [field]: new RegExp(escapedSearch, "i") };
    })
  };
};

const createCrudController = ({ Model, moduleName, searchFields = [], populate = [] }) => ({
  list: async (req, res) => {
    try {
      console.log(`[CRUD LIST] ${moduleName} incoming query:`, req.query);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 5000);
      const skip = (page - 1) * limit;
      const query = buildQuery(req.query.search, searchFields);

      Object.entries(req.query).forEach(([key, value]) => {
        if (!["page", "limit", "search", "sort", "chapters"].includes(key) && value !== "") query[key] = value;
      });

      if (req.query.chapters) {
        const chapterList = req.query.chapters
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        if (chapterList.length > 0) {
          const chapterQueries = chapterList.map((chap) => ({
            code: new RegExp("^" + chap, "i"),
          }));

          if (query.$or) {
            const originalOr = query.$or;
            delete query.$or;
            query.$and = [
              { $or: originalOr },
              { $or: chapterQueries }
            ];
          } else {
            query.$or = chapterQueries;
          }
        }
      }
      console.log(`[CRUD LIST] ${moduleName} final database query:`, JSON.stringify(query));

      let request = Model.find(query).sort(req.query.sort || "-createdAt").skip(skip).limit(limit);
      populate.forEach((path) => {
        request = request.populate(path);
      });

      const [items, total] = await Promise.all([request, Model.countDocuments(query)]);

      return successResponse(res, { items, total, page, pages: Math.ceil(total / limit) }, `${moduleName} list fetched`);
    } catch (error) {
      return errorResponse(res, error.message, `Unable to fetch ${moduleName}`, 500);
    }
  },

  create: async (req, res) => {
    try {
      if (req.user && req.user.role !== "masterAdmin") {
        const request = await ApprovalRequest.create({
          moduleName,
          action: "create",
          requestedData: req.body,
          requestedBy: req.user._id,
          status: "pending",
        });
        await writeActivityLog({ req, action: "create", module: "ApprovalRequest", recordId: request._id, description: `Approval request created for ${moduleName} creation` });
        return successResponse(res, null, "Approval request submitted successfully. It will be active once approved by Master Admin.", 202);
      }

      const item = await Model.create(req.body);
      await writeActivityLog({ req, action: "create", module: moduleName, recordId: item._id, description: `${moduleName} created` });
      return successResponse(res, item, `${moduleName} created`, 201);
    } catch (error) {
      return errorResponse(res, error.message, `Unable to create ${moduleName}`, 400);
    }
  },

  getById: async (req, res) => {
    try {
      let request = Model.findById(req.params.id);
      populate.forEach((path) => {
        request = request.populate(path);
      });
      const item = await request;
      if (!item) return errorResponse(res, `${moduleName} not found`, "Record not found", 404);
      return successResponse(res, item, `${moduleName} fetched`);
    } catch (error) {
      return errorResponse(res, error.message, `Unable to fetch ${moduleName}`, 500);
    }
  },

  update: async (req, res) => {
    try {
      if (req.user && req.user.role !== "masterAdmin") {
        const originalRecord = await Model.findById(req.params.id);
        if (!originalRecord) return errorResponse(res, `${moduleName} not found`, "Record not found", 404);

        const request = await ApprovalRequest.create({
          moduleName,
          action: "update",
          recordId: req.params.id,
          originalData: originalRecord.toObject(),
          requestedData: req.body,
          requestedBy: req.user._id,
          status: "pending",
        });
        await writeActivityLog({ req, action: "create", module: "ApprovalRequest", recordId: request._id, description: `Approval request created for ${moduleName} update` });
        return successResponse(res, null, "Approval request submitted successfully. It will be active once approved by Master Admin.", 202);
      }

      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return errorResponse(res, `${moduleName} not found`, "Record not found", 404);
      await writeActivityLog({ req, action: "update", module: moduleName, recordId: item._id, description: `${moduleName} updated` });
      return successResponse(res, item, `${moduleName} updated`);
    } catch (error) {
      return errorResponse(res, error.message, `Unable to update ${moduleName}`, 400);
    }
  },

  remove: async (req, res) => {
    try {
      if (req.user && req.user.role !== "masterAdmin") {
        const originalRecord = await Model.findById(req.params.id);
        if (!originalRecord) return errorResponse(res, `${moduleName} not found`, "Record not found", 404);

        const request = await ApprovalRequest.create({
          moduleName,
          action: "delete",
          recordId: req.params.id,
          originalData: originalRecord.toObject(),
          requestedData: {},
          requestedBy: req.user._id,
          status: "pending",
        });
        await writeActivityLog({ req, action: "create", module: "ApprovalRequest", recordId: request._id, description: `Approval request created for ${moduleName} deletion` });
        return successResponse(res, null, "Approval request submitted successfully. It will be active once approved by Master Admin.", 202);
      }

      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return errorResponse(res, `${moduleName} not found`, "Record not found", 404);
      await writeActivityLog({ req, action: "delete", module: moduleName, recordId: item._id, description: `${moduleName} deleted` });
      return successResponse(res, item, `${moduleName} deleted`);
    } catch (error) {
      return errorResponse(res, error.message, `Unable to delete ${moduleName}`, 400);
    }
  },
});

module.exports = createCrudController;
