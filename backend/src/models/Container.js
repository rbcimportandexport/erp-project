const mongoose = require("mongoose");

const containerSchema = new mongoose.Schema(
  {
    containerNo: { type: String, required: true, unique: true, trim: true },
    importer: { type: mongoose.Schema.Types.ObjectId, ref: "Importer", required: true },
    exporter: { type: mongoose.Schema.Types.ObjectId, ref: "Exporter", required: true },
    hsnCode: { type: mongoose.Schema.Types.ObjectId, ref: "HsnCode" },
    loadingDate: Date,
    etaDate: Date,
    unloadingDate: Date,
    status: { type: String, enum: ["pending", "inTransit", "arrived", "cleared", "done"], default: "pending" },
    remarks: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

containerSchema.index({ containerNo: "text", remarks: "text" });

module.exports = mongoose.model("Container", containerSchema);
