const mongoose = require("mongoose");

const chinaPortSchema = new mongoose.Schema(
  {
    portName: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

chinaPortSchema.index({ portName: "text", city: "text" });

module.exports = mongoose.model("ChinaPort", chinaPortSchema);
