const mongoose = require("mongoose");

const hsnCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    dutyRate: { type: Number, default: 0, min: 0 },
    gstRate: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hsnCodeSchema.index({ code: "text", description: "text" });

module.exports = mongoose.model("HsnCode", hsnCodeSchema);
