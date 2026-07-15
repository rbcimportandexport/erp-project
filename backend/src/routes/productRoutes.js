const router = require("express").Router();
const attachCrudRoutes = require("./crudRoutes");
const productController = require("../controllers/productController");

attachCrudRoutes(router, productController.products);

const rateRouter = require("express").Router();
attachCrudRoutes(rateRouter, productController.productRates);
router.use("/rates", rateRouter);

const templateRouter = require("express").Router();
attachCrudRoutes(templateRouter, productController.invoiceTemplates);
router.use("/invoice-templates", templateRouter);

module.exports = router;
