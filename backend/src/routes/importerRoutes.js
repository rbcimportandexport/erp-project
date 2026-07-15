const router = require("express").Router();
const attachCrudRoutes = require("./crudRoutes");
const controller = require("../controllers/importerController");

module.exports = attachCrudRoutes(router, controller);
