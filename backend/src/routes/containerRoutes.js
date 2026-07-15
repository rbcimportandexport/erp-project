const router = require("express").Router();
const controller = require("../controllers/containerController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

router.get("/", protect, authorize("masterAdmin", "admin", "user"), controller.list);
router.post("/", protect, authorize("masterAdmin", "admin", "user"), controller.create);
router.get("/:id", protect, authorize("masterAdmin", "admin", "user"), controller.getById);
router.put("/:id", protect, authorize("masterAdmin", "admin"), controller.update);
router.delete("/:id", protect, authorize("masterAdmin", "admin"), controller.remove);

module.exports = router;
