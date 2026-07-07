const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads", "documents");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDir);
  },
  filename(req, file, callback) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    callback(null, `${Date.now()}-${safeName}`);
  },
});

const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const fileFilter = (req, file, callback) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error("Only PDF and image files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024,
  },
});

module.exports = upload;
