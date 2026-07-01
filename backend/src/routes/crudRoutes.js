const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

const attachCrudRoutes = (router, controller) => {
  router.get("/", protect, authorize("masterAdmin", "admin", "user"), controller.list);
  router.post("/", protect, authorize("masterAdmin", "admin", "user"), controller.create);
  router.get("/:id", protect, authorize("masterAdmin", "admin", "user"), controller.getById);
  router.put("/:id", protect, authorize("masterAdmin", "admin"), controller.update);
  router.delete("/:id", protect, authorize("masterAdmin"), controller.remove);
  return router;
};

module.exports = attachCrudRoutes;
