const mongoose = require("mongoose");

const importerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

importerSchema.index({ name: "text" });

module.exports = mongoose.model("Importer", importerSchema);
