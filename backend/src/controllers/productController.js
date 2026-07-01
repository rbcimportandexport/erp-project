const Product = require("../models/Product");
const ProductRate = require("../models/ProductRate");
const InvoiceTemplate = require("../models/InvoiceTemplate");
const createCrudController = require("./crudFactory");

exports.products = createCrudController({
  Model: Product,
  moduleName: "Product",
  searchFields: ["name", "unit", "description", "mark"],
  populate: ["hsnCode"],
});

exports.productRates = createCrudController({
  Model: ProductRate,
  moduleName: "ProductRate",
  populate: ["product", "importer"],
});

exports.invoiceTemplates = createCrudController({
  Model: InvoiceTemplate,
  moduleName: "InvoiceTemplate",
  searchFields: ["name", "templateContent"],
  populate: ["importer", "exporter"],
});
