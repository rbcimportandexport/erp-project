const mongoose = require("mongoose");

const exporterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

exporterSchema.index({ name: "text" });

module.exports = mongoose.model("Exporter", exporterSchema);
