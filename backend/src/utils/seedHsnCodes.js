const dotenv = require("dotenv");
const connectDB = require("../config/db");
const HsnCode = require("../models/HsnCode");
const hsnData = require("./unique_hsn.json");

dotenv.config();

const seedHsnCodes = async () => {
  try {
    await connectDB();

    try {
      await HsnCode.collection.dropIndex("code_1");
      console.log("Unique index code_1 dropped successfully");
    } catch (err) {
      console.log("Index code_1 not found or already dropped");
    }

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
