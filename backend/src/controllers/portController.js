const IndiaPort = require("../models/IndiaPort");
const ChinaPort = require("../models/ChinaPort");
const createCrudController = require("./crudFactory");

exports.indiaPorts = createCrudController({
  Model: IndiaPort,
  moduleName: "IndiaPort",
  searchFields: ["portName", "state"],
});

exports.chinaPorts = createCrudController({
  Model: ChinaPort,
  moduleName: "ChinaPort",
  searchFields: ["portName", "city"],
});
