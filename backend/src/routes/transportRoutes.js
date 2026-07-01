const router = require("express").Router();
const attachCrudRoutes = require("./crudRoutes");
const controller = require("../controllers/transportController");

module.exports = attachCrudRoutes(router, controller);
