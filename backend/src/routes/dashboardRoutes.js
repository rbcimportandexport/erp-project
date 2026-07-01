const router = require("express").Router();
const controller = require("../controllers/dashboardController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

router.get("/stats", protect, authorize("masterAdmin", "admin", "user"), controller.stats);
router.get("/upcoming-eta", protect, authorize("masterAdmin", "admin", "user"), controller.upcomingEta);
router.get("/pending-boe", protect, authorize("masterAdmin", "admin", "user"), controller.pendingBoe);
router.get("/pending-line-payment", protect, authorize("masterAdmin", "admin", "user"), controller.pendingLinePayment);

module.exports = router;
