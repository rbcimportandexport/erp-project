const mongoose = require("mongoose");

const indiaPortSchema = new mongoose.Schema(
  {
    portName: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

indiaPortSchema.index({ portName: "text", state: "text" });

module.exports = mongoose.model("IndiaPort", indiaPortSchema);
