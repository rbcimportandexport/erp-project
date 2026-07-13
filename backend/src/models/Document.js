const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    container: { type: mongoose.Schema.Types.ObjectId, ref: "Container", required: true },
    docType: {
      type: String,
      enum: ["CPL", "CBL", "MD", "ECPL", "FECPL", "P&I", "BL", "HBL", "CHECKLIST", "LINE INVOICE", "BOE", "EWayBill", "E-WAY BILL", "CHA PHOTO FILE", "LinePayment", "Other"],
      required: true,
    },
    fileName: { type: String, required: true, trim: true },
    filePath: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

documentSchema.index({ fileName: "text", docType: "text" });

module.exports = mongoose.model("Document", documentSchema);
