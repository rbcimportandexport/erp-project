const Exporter = require("../models/Exporter");
const createCrudController = require("./crudFactory");

module.exports = createCrudController({
  Model: Exporter,
  moduleName: "Exporter",
  searchFields: ["name"],
});
