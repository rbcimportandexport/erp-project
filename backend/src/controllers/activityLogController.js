const ActivityLog = require("../models/ActivityLog");
const createCrudController = require("./crudFactory");

module.exports = createCrudController({
  Model: ActivityLog,
  moduleName: "ActivityLog",
  searchFields: ["action", "module", "description", "ipAddress"],
  populate: ["user"],
});
