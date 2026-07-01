const router = require("express").Router();
const controller = require("../controllers/paymentController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

router.post("/:containerId", protect, authorize("masterAdmin", "admin", "user"), controller.create);
router.get("/:containerId", protect, authorize("masterAdmin", "admin", "user"), controller.getByContainer);
router.put("/:id", protect, authorize("masterAdmin", "admin"), controller.update);

module.exports = router;
