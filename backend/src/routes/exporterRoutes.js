const router = require("express").Router();
const attachCrudRoutes = require("./crudRoutes");
const controller = require("../controllers/exporterController");

module.exports = attachCrudRoutes(router, controller);
