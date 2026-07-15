const router = require("express").Router();
const attachCrudRoutes = require("./crudRoutes");
const portController = require("../controllers/portController");

const indiaRouter = require("express").Router();
const chinaRouter = require("express").Router();

attachCrudRoutes(chinaRouter, portController.chinaPorts);
attachCrudRoutes(indiaRouter, portController.indiaPorts);

router.use("/china", chinaRouter);
router.use("/india", indiaRouter);
router.use("/", indiaRouter);

module.exports = router;
