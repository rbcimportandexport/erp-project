const mongoose = require("mongoose");

const standardizeName = (name) => {
  if (!name) return "";
  return name
    .toUpperCase()
    .replace(/CO\s*\.?\s*,\s*LTD\s*\.?/g, "CO., LTD")
    .replace(/CO\s*\.\s*LTD\s*\.?/g, "CO., LTD")
    .replace(/CO\s*\.?\s*,\s*LIMITED\s*/g, "CO., LIMITED")
    .replace(/CO\s*\.\s*LIMITED\s*/g, "CO., LIMITED")
    .replace(/\s+/g, " ")
    .trim();
};

const exporterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

exporterSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.name = standardizeName(this.name);
  }
  next();
});

exporterSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update && update.name) {
    update.name = standardizeName(update.name);
  } else if (update && update.$set && update.$set.name) {
    update.$set.name = standardizeName(update.$set.name);
  }
  next();
});

exporterSchema.index({ name: "text" });

module.exports = mongoose.model("Exporter", exporterSchema);
