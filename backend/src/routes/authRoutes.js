const router = require("express").Router();
const authController = require("../controllers/authController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", protect, authorize("masterAdmin", "admin", "user"), authController.me);
router.put("/change-password", protect, authorize("masterAdmin", "admin", "user"), authController.changePassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-all", authController.resetAll);

module.exports = router;
