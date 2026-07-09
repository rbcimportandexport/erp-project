const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeActivityLog } = require("../middleware/activityLog");

const buildQuery = (search, fields = []) => {
  if (!search || fields.length === 0) return {};
  const escapedSearch = String(search).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(escapedSearch, "i");
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

const createCrudController = ({ Model, moduleName, searchFields = [], populate = [] }) => ({
  list: async (req, res) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 5000);
      const skip = (page - 1) * limit;
      const query = buildQuery(req.query.search, searchFields);

      Object.entries(req.query).forEach(([key, value]) => {
        if (!["page", "limit", "search", "sort"].includes(key) && value !== "") query[key] = value;
      });

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
