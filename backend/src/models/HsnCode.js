const mongoose = require("mongoose");

const hsnCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    dutyRate: { type: Number, default: null, min: 0 },
    gstRate: { type: Number, default: null, min: 0 },
    unit: { type: String, trim: true },
    source: { type: String, trim: true },
    sourceUrl: { type: String, trim: true },
    lastVerifiedAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hsnCodeSchema.index({ code: "text", description: "text" });

module.exports = mongoose.model("HsnCode", hsnCodeSchema);
