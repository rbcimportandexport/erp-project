const router = require("express").Router();
const controller = require("../controllers/documentController");
const upload = require("../config/multer");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

router.post("/upload/:containerId", protect, authorize("masterAdmin", "admin", "user"), upload.single("file"), controller.upload);
router.post("/parse-invoice-packing-list", protect, authorize("masterAdmin", "admin", "user"), upload.single("file"), controller.parseInvoicePackingList);
router.get("/:containerId", protect, authorize("masterAdmin", "admin", "user"), controller.listByContainer);
router.delete("/:id", protect, authorize("masterAdmin"), controller.remove);

module.exports = router;
