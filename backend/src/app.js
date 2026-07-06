const path = require("path");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many requests",
      message: "Please wait before sending more requests.",
    },
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: "Import-Export Container Tracking ERP API",
      status: "healthy",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    },
    message: "API is healthy",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/containers", require("./routes/containerRoutes"));
app.use("/api/importers", require("./routes/importerRoutes"));
app.use("/api/exporters", require("./routes/exporterRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/ports", require("./routes/portRoutes"));
app.use("/api/hsn", require("./routes/hsnRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/transport", require("./routes/transportRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/activity-logs", require("./routes/activityLogRoutes"));

app.use(
  "/uploads/documents",
  express.static(path.join(__dirname, "uploads", "documents"))
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `${req.method} ${req.originalUrl} is not available.`,
  });
});

app.use(errorHandler);

module.exports = app;
