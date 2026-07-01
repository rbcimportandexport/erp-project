const HsnCode = require("../models/HsnCode");
const createCrudController = require("./crudFactory");

module.exports = createCrudController({
  Model: HsnCode,
  moduleName: "HsnCode",
  searchFields: ["code", "description"],
});
