const router = require("express").Router();
const controller = require("../controllers/userController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

router.get("/", protect, authorize("masterAdmin"), controller.list);
router.post("/", protect, authorize("masterAdmin"), controller.create);
router.put("/:id", protect, authorize("masterAdmin"), controller.update);
router.delete("/:id", protect, authorize("masterAdmin"), controller.remove);

module.exports = router;
