const dotenv = require("dotenv");
const connectDB = require("../config/db");
const HsnCode = require("../models/HsnCode");
const hsnData = require("./unique_hsn.json");

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    console.log("Connected to database. Starting rate synchronization...");

    // Create a map of code -> { dutyRate, gstRate }
    // Since unique_hsn.json might have multiple entries for the same HSN code (with different descriptions),
    // we want to get the most filled rates.
    const rateMap = new Map();
    for (const item of hsnData) {
      const code = String(item.code || "").trim();
      if (!code) continue;
      
      const duty = Number(item.dutyRate);
      const gst = Number(item.gstRate);
      
      const hasDuty = Number.isFinite(duty);
      const hasGst = Number.isFinite(gst);
      
      if (hasDuty || hasGst) {
        const existing = rateMap.get(code) || { dutyRate: null, gstRate: null };
        if (hasDuty && existing.dutyRate === null) existing.dutyRate = duty;
        if (hasGst && existing.gstRate === null) existing.gstRate = gst;
        rateMap.set(code, existing);
      }
    }

    console.log(`Parsed ${rateMap.size} unique HSN codes with rates from unique_hsn.json.`);

    // Perform bulk updates
    const bulkOps = [];
    for (const [code, rates] of rateMap.entries()) {
      const updateData = {};
      if (rates.dutyRate !== null) updateData.dutyRate = rates.dutyRate;
      if (rates.gstRate !== null) updateData.gstRate = rates.gstRate;

      if (Object.keys(updateData).length > 0) {
        bulkOps.push({
          updateMany: {
            filter: { code: code },
            update: { $set: updateData }
          }
        });
      }
    }

    console.log(`Prepared ${bulkOps.length} bulk update operations.`);

    let modifiedCount = 0;
    if (bulkOps.length > 0) {
      // Chunk bulk operations to avoid MongoDB command size limits
      const chunkSize = 500;
      for (let i = 0; i < bulkOps.length; i += chunkSize) {
        const chunk = bulkOps.slice(i, i + chunkSize);
        const result = await HsnCode.bulkWrite(chunk, { ordered: false });
        modifiedCount += result.modifiedCount || 0;
      }
    }

    console.log(`Synchronization finished! Updated ${modifiedCount} records in HSN database.`);

    console.log("Setting default rates (Duty: 10%, GST: 18%) for remaining empty records...");
    const dutyDefaults = await HsnCode.updateMany({ dutyRate: null }, { $set: { dutyRate: 10 } });
    const gstDefaults = await HsnCode.updateMany({ gstRate: null }, { $set: { gstRate: 18 } });
    console.log(`Defaults applied: Set default Duty on ${dutyDefaults.modifiedCount} records, default GST on ${gstDefaults.modifiedCount} records.`);
    
    // Check remaining missing rates
    const totalCount = await HsnCode.countDocuments({});
    const missingDuty = await HsnCode.countDocuments({ dutyRate: null });
    const missingGst = await HsnCode.countDocuments({ gstRate: null });
    
    console.log(`Database Status:`);
    console.log(`- Total HSN Codes: ${totalCount}`);
    console.log(`- Missing Duty Rate: ${missingDuty}`);
    console.log(`- Missing GST Rate: ${missingGst}`);

    process.exit(0);
  } catch (err) {
    console.error("Error syncing rates:", err);
    process.exit(1);
  }
};

run();
