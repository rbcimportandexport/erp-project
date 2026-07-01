const router = require("express").Router();
const attachCrudRoutes = require("./crudRoutes");
const controller = require("../controllers/hsnController");

module.exports = attachCrudRoutes(router, controller);
