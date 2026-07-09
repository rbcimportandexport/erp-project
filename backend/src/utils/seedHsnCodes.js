const dotenv = require("dotenv");
const connectDB = require("../config/db");
const HsnCode = require("../models/HsnCode");
const hsnData = require("./unique_hsn.json");

dotenv.config();

const seedHsnCodes = async () => {
  try {
    await connectDB();

    console.log("Cleaning existing HSN codes...");
    await HsnCode.deleteMany({});

    console.log(`Seeding ${hsnData.length} HSN codes...`);
    await HsnCode.insertMany(hsnData);

    console.log("HSN codes seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed HSN codes:", error.message);
    process.exit(1);
  }
};

seedHsnCodes();
