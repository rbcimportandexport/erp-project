const router = require("express").Router();
const attachCrudRoutes = require("./crudRoutes");
const addressController = require("../controllers/addressController");

const importerAddressRouter = require("express").Router();
const exporterAddressRouter = require("express").Router();

attachCrudRoutes(importerAddressRouter, addressController.importerAddresses);
attachCrudRoutes(exporterAddressRouter, addressController.exporterAddresses);

router.use("/importers", importerAddressRouter);
router.use("/exporters", exporterAddressRouter);

module.exports = router;
