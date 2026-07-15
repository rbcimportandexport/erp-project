const mongoose = require("mongoose");

const containerSchema = new mongoose.Schema(
  {
    containerNo: { type: String, required: true, unique: true, trim: true },
    importer: { type: mongoose.Schema.Types.ObjectId, ref: "Importer", required: true },
    exporter: { type: mongoose.Schema.Types.ObjectId, ref: "Exporter", required: true },
    hsnCode: { type: mongoose.Schema.Types.ObjectId, ref: "HsnCode" },
    loadingDate: Date,
    loadingDays: { type: String, trim: true },
    party: { type: String, trim: true },
    cha: { type: String, trim: true },
    shippingLine: { type: String, trim: true },
    portOfChina: { type: String, trim: true },
    blNo: { type: String, trim: true },
    cblEta: Date,
    cblBlNo: { type: String, trim: true },
    etaDate: Date,
    etaDays: { type: String, trim: true },
    unloadingDate: Date,
    status: {
      type: String,
      enum: [
        "pending", "inTransit", "arrived", "cleared", "done",
        "BL", "BOE", "CBL", "CFS PAYMENT", "CHA PHOTO FILE", "CHECKLIST",
        "CPL", "DONE", "DUTY", "E-WAY BILL", "ECPL", "FECPL", "LINE PAYMENT",
        "MD", "P&I", "HOLD AT CHA", "HOLD AT PARTY", "HOLD AT SIR", "HOLD AT ME",
        "WORK NOT STARTED", "AWATING FOR CHECKLIST", "CHECKLIST APPROVED", "HOLD AT ANSHU",
        "WORK IN PROCESS", "DESCRIPTION AND VALUE DONE"
      ],
      default: "pending"
    },
    documentProcessed: { type: String, trim: true },
    remarks: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    containerSeq: { type: Number, index: true },
  },
  { timestamps: true }
);

containerSchema.pre("save", function(next) {
  if (this.containerNo) {
    const match = this.containerNo.match(/-(\d+)$/);
    this.containerSeq = match ? parseInt(match[1], 10) : 0;
  }
  next();
});

containerSchema.index({ containerNo: "text", remarks: "text", blNo: "text", cblBlNo: "text" });

module.exports = mongoose.model("Container", containerSchema);

