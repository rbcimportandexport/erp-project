const dotenv = require("dotenv");
const connectDB = require("../config/db");
const HsnCode = require("../models/HsnCode");

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    
    // 1. Total HSN codes count
    const totalIcegate = await HsnCode.countDocuments({ source: "ICEGATE" });
    const totalMainExcel = await HsnCode.countDocuments({ source: "MAIN_EXCEL" });
    console.log(`Total HSN Codes in DB:`);
    console.log(`- ICEGATE: ${totalIcegate}`);
    console.log(`- MAIN_EXCEL: ${totalMainExcel}`);

    // 2. Count starting with 61
    const count61Icegate = await HsnCode.countDocuments({ source: "ICEGATE", code: /^61/ });
    const count61MainExcel = await HsnCode.countDocuments({ source: "MAIN_EXCEL", code: /^61/ });
    console.log(`HSN codes starting with 61:`);
    console.log(`- ICEGATE: ${count61Icegate}`);
    console.log(`- MAIN_EXCEL: ${count61MainExcel}`);

    // 3. Count starting with 72
    const count72Icegate = await HsnCode.countDocuments({ source: "ICEGATE", code: /^72/ });
    const count72MainExcel = await HsnCode.countDocuments({ source: "MAIN_EXCEL", code: /^72/ });
    console.log(`HSN codes starting with 72:`);
    console.log(`- ICEGATE: ${count72Icegate}`);
    console.log(`- MAIN_EXCEL: ${count72MainExcel}`);

    // 4. Inspect records matching the chapter filter logic used in crudFactory.js:
    // query: { source: "ICEGATE", $or: [ { code: /^61/i } ] }
    const matchFilter = await HsnCode.find({ source: "ICEGATE", $or: [ { code: /^61/i } ] }).limit(5);
    console.log(`Sample matching query { source: "ICEGATE", $or: [ { code: /^61/i } ] }:`);
    console.log(JSON.stringify(matchFilter, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
