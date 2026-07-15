const dotenv = require("dotenv");
const connectDB = require("../config/db");
const HsnCode = require("../models/HsnCode");
const createCrudController = require("../controllers/crudFactory");

dotenv.config();

const hsnController = createCrudController({
  Model: HsnCode,
  moduleName: "HsnCode",
  searchFields: ["code", "description"],
});

const run = async () => {
  try {
    await connectDB();
    
    // Simulate express req and res
    const req = {
      query: {
        page: "1",
        limit: "10",
        sort: "-createdAt",
        source: "ICEGATE",
        chapters: "61"
      }
    };
    
    let responseData = null;
    const res = {
      status: (code) => {
        console.log("HTTP Code:", code);
        return res;
      },
      json: (data) => {
        responseData = data;
        return res;
      }
    };

    console.log("Calling hsnController.list with query:", req.query);
    await hsnController.list(req, res);
    
    console.log("Response Success:", responseData?.success);
    console.log("Response Message:", responseData?.message);
    if (responseData && responseData.data) {
      console.log("Total matched count:", responseData.data.total);
      console.log("Returned items count:", responseData.data.items?.length);
      console.log("Returned items codes & descriptions:");
      responseData.data.items.forEach(item => {
        console.log(`- Code: ${item.code}, Description: ${item.description}, Source: ${item.source}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
