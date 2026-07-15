const dotenv = require("dotenv");
const connectDB = require("../config/db");
const HsnCode = require("../models/HsnCode");
const excelHsnData = require("../../../frontend/src/data/hsnMaster.json");

dotenv.config();

const syncMainExcelHsn = async () => {
  try {
    await connectDB();

    const seen = new Set();
    const records = [];
    for (const item of excelHsnData) {
      const code = String(item.hsn || "").trim();
      const description = String(item.description || "").trim();
      const key = `${code}|${description.toUpperCase()}`;
      if (!/^\d{4,8}$/.test(code) || !description || seen.has(key)) continue;
      seen.add(key);
      records.push({
        code,
        description,
        dutyRate: Number(item.bcd) || 0,
        gstRate: Number.isFinite(Number(item.gst)) ? Number(item.gst) : null,
        unit: String(item.unit || "").trim() || undefined,
        source: "MAIN_EXCEL",
        sourceUrl: "MAIN HSN MASTER.xlsx",
        lastVerifiedAt: new Date(),
        isActive: true,
      });
    }

    const operations = records.map((record) => ({
      updateOne: {
        filter: { code: record.code, description: record.description, source: "MAIN_EXCEL" },
        update: { $set: record },
        upsert: true,
      },
    }));
    const result = await HsnCode.bulkWrite(operations, { ordered: false });
    console.log(
      `Main Excel HSN sync complete: ${records.length} records, ${result.upsertedCount} added, ${result.modifiedCount} updated.`
    );
    process.exit(0);
  } catch (error) {
    console.error("Main Excel HSN sync failed:", error.message);
    process.exit(1);
  }
};

syncMainExcelHsn();
