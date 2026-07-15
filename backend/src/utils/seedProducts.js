const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const HsnCode = require("../models/HsnCode");
const productsData = require("./unique_products.json");

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();

    console.log("Fetching HSN codes mapping...");
    const hsnCodes = await HsnCode.find({});
    const hsnMap = {};
    hsnCodes.forEach((item) => {
      if (!hsnMap[item.code]) {
        hsnMap[item.code] = item._id;
      }
    });

    console.log("Mapping product HSN codes...");
    const productsToInsert = [];
    
    let fallbackHsnId = Object.values(hsnMap)[0];
    if (!fallbackHsnId) {
      const defaultHsn = await HsnCode.create({ code: "000000", description: "DEFAULT HSN", dutyRate: 0, gstRate: 18 });
      fallbackHsnId = defaultHsn._id;
    }

    for (const prod of productsData) {
      let hsnId = hsnMap[prod.hsn];
      if (!hsnId) {
        const dbHsn = await HsnCode.findOne({ code: prod.hsn });
        if (dbHsn) {
          hsnId = dbHsn._id;
          hsnMap[prod.hsn] = hsnId;
        } else {
          const newHsn = await HsnCode.create({
            code: prod.hsn,
            description: prod.name,
            dutyRate: 0,
            gstRate: 18
          });
          hsnId = newHsn._id;
          hsnMap[prod.hsn] = hsnId;
          console.log(`Created missing HSN code: ${prod.hsn}`);
        }
      }

      productsToInsert.push({
        name: prod.name,
        hsnCode: hsnId,
        unit: prod.unit || "PCS",
        description: prod.description || "",
        unitPrice: prod.unitPrice || 0,
        mark: prod.mark || "",
        isActive: true
      });
    }

    console.log("Cleaning existing products...");
    await Product.deleteMany({});

    console.log(`Seeding ${productsToInsert.length} products...`);
    await Product.insertMany(productsToInsert);

    console.log("Products seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed products:", error.message);
    process.exit(1);
  }
};

seedProducts();
