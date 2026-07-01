const mongoose = require("mongoose");

const productRateSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    importer: { type: mongoose.Schema.Types.ObjectId, ref: "Importer", required: true },
    buyRate: { type: Number, default: 0, min: 0 },
    sellRate: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR", trim: true },
    effectiveDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductRate", productRateSchema);
