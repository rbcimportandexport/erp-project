const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    container: { type: mongoose.Schema.Types.ObjectId, ref: "Container", required: true, unique: true },
    dutyAmount: { type: Number, default: 0, min: 0 },
    cgstAmount: { type: Number, default: 0, min: 0 },
    otherCharges: { type: Number, default: 0, min: 0 },
    shippingLinePayment: { type: Number, default: 0, min: 0 },
    clientPayment: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },
    paymentDate: Date,
    paymentMode: { type: String, trim: true },
    remarks: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

paymentSchema.pre("validate", function calculateTotals(next) {
  this.totalAmount = this.dutyAmount + this.cgstAmount + this.otherCharges + this.shippingLinePayment + this.clientPayment;
  this.pendingAmount = Math.max(this.totalAmount - this.paidAmount, 0);
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
