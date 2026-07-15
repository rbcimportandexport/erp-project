const router = require("express").Router();
const attachCrudRoutes = require("./crudRoutes");
const controller = require("../controllers/activityLogController");

module.exports = attachCrudRoutes(router, controller);
