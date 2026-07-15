const mongoose = require("mongoose");

const invoiceTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    importer: { type: mongoose.Schema.Types.ObjectId, ref: "Importer" },
    exporter: { type: mongoose.Schema.Types.ObjectId, ref: "Exporter" },
    templateContent: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvoiceTemplate", invoiceTemplateSchema);
