const mongoose = require("mongoose");

const importerAddressSchema = new mongoose.Schema(
  {
    importer: { type: mongoose.Schema.Types.ObjectId, ref: "Importer", required: true },
    addressLine1: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImporterAddress", importerAddressSchema);
