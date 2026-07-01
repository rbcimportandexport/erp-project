const Transport = require("../models/Transport");
const createCrudController = require("./crudFactory");

module.exports = createCrudController({
  Model: Transport,
  moduleName: "Transport",
  searchFields: ["vehicleNo", "driverName", "driverPhone", "transporterName", "fromLocation", "toLocation"],
  populate: ["container"],
});
