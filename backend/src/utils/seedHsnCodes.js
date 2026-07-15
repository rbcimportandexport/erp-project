const dotenv = require("dotenv");
const connectDB = require("../config/db");
const HsnCode = require("../models/HsnCode");
const hsnData = require("./unique_hsn.json");

dotenv.config();

const seedHsnCodes = async () => {
  try {
    await connectDB();

    const seen = new Set();
    const validHsnData = hsnData.filter((item) => {
      const code = String(item.code || "").trim();
      const description = String(item.description || "").trim();
      const key = `${code}|${description.toUpperCase()}`;
      if (!/^\d{4,8}$/.test(code) || !description || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Adding/updating ${validHsnData.length} HSN records one by one...`);
    let added = 0;
    let updated = 0;

    for (const item of validHsnData) {
      const code = String(item.code).trim();
      const description = String(item.description).trim();
      const result = await HsnCode.updateOne(
        { code, description },
        {
          $set: {
            dutyRate: Number(item.dutyRate) || 0,
            gstRate: Number(item.gstRate) || 0,
            isActive: item.isActive !== false,
          },
          $setOnInsert: { code, description },
        },
        { upsert: true }
      );
      if (result.upsertedCount) added += 1;
      else updated += 1;
    }

    console.log(`HSN import complete: ${added} added, ${updated} updated.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed HSN codes:", error.message);
    process.exit(1);
  }
};

seedHsnCodes();
