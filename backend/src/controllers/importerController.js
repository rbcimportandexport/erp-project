const Importer = require("../models/Importer");
const createCrudController = require("./crudFactory");

module.exports = createCrudController({
  Model: Importer,
  moduleName: "Importer",
  searchFields: ["name"],
});
