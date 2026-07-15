const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hsnCode: { type: mongoose.Schema.Types.ObjectId, ref: "HsnCode", required: true },
    unit: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    unitPrice: { type: Number, default: 0 },
    mark: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", unit: "text", description: "text", mark: "text" });

module.exports = mongoose.model("Product", productSchema);
