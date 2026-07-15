const router = require("express").Router();
const controller = require("../controllers/approvalController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

router.get("/", protect, authorize("masterAdmin"), controller.listRequests);
router.post("/:id/approve", protect, authorize("masterAdmin"), controller.approveRequest);
router.post("/:id/reject", protect, authorize("masterAdmin"), controller.rejectRequest);

module.exports = router;
