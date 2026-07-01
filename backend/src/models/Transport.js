const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    container: { type: mongoose.Schema.Types.ObjectId, ref: "Container", required: true },
    vehicleNo: { type: String, required: true, trim: true },
    driverName: { type: String, trim: true },
    driverPhone: { type: String, trim: true },
    transporterName: { type: String, trim: true },
    fromLocation: { type: String, trim: true },
    toLocation: { type: String, trim: true },
    dispatchDate: Date,
    deliveryDate: Date,
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

transportSchema.index({ vehicleNo: "text", driverName: "text", driverPhone: "text", transporterName: "text", fromLocation: "text", toLocation: "text" });

module.exports = mongoose.model("Transport", transportSchema);
