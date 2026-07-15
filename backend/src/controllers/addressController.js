const ImporterAddress = require("../models/ImporterAddress");
const ExporterAddress = require("../models/ExporterAddress");
const createCrudController = require("./crudFactory");

exports.importerAddresses = createCrudController({
  Model: ImporterAddress,
  moduleName: "ImporterAddress",
  searchFields: ["addressLine1"],
  populate: ["importer"],
});

exports.exporterAddresses = createCrudController({
  Model: ExporterAddress,
  moduleName: "ExporterAddress",
  searchFields: ["addressLine1"],
  populate: ["exporter"],
});
