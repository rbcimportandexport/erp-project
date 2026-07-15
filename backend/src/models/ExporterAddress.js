const mongoose = require("mongoose");

const exporterAddressSchema = new mongoose.Schema(
  {
    exporter: { type: mongoose.Schema.Types.ObjectId, ref: "Exporter", required: true },
    addressLine1: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExporterAddress", exporterAddressSchema);
