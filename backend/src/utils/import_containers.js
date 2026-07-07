const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Importer = require("../models/Importer");
const Exporter = require("../models/Exporter");
const Container = require("../models/Container");
const User = require("../models/User");

const run = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await connectDB();
    console.log("Connected successfully!");

    // Load parsed JSON
    const parsedDataPath = path.join(__dirname, "parsed_containers_perfect.json");
    if (!fs.existsSync(parsedDataPath)) {
      throw new Error(`Parsed data file not found at ${parsedDataPath}`);
    }
    const containers = JSON.parse(fs.readFileSync(parsedDataPath, "utf-8"));
    console.log(`Loaded ${containers.length} containers to ingest.`);

    // Find default admin user for createdBy/updatedBy
    const defaultAdmin = await User.findOne({ 
      email: { $in: ["yadavsaurabh9333@gmail.com", "inquiryrbcimport@gmail.com", "admin@rbc.com"] } 
    });
    const adminId = defaultAdmin ? defaultAdmin._id : null;
    if (adminId) {
      console.log(`Using admin user ID: ${adminId} (${defaultAdmin.email}) for createdBy/updatedBy.`);
    } else {
      console.log("No default admin user found. createdBy/updatedBy will not be set.");
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const record of containers) {
      const {
        containerNo,
        blNo,
        etaDate,
        loadingDate,
        unloadingDate,
        status,
        portOfChina,
        shippingLine,
        exporterName,
        importerName,
        cha,
        party,
        remarks
      } = record;

      // Skip records without container number
      if (!containerNo || containerNo.trim() === "") {
        skippedCount++;
        continue;
      }

      // 1. Get or Create Importer
      let importerId = null;
      if (importerName && importerName.trim() !== "") {
        const nameTrimmed = importerName.trim();
        let importerObj = await Importer.findOne({ name: new RegExp(`^${nameTrimmed}$`, "i") });
        if (!importerObj) {
          importerObj = new Importer({ name: nameTrimmed });
          await importerObj.save();
          console.log(`Created new Importer: ${nameTrimmed}`);
        }
        importerId = importerObj._id;
      } else {
        // Default fallback if importer name is empty
        const fallbackName = "UNKNOWN IMPORTER";
        let importerObj = await Importer.findOne({ name: fallbackName });
        if (!importerObj) {
          importerObj = new Importer({ name: fallbackName });
          await importerObj.save();
        }
        importerId = importerObj._id;
      }

      // 2. Get or Create Exporter
      let exporterId = null;
      if (exporterName && exporterName.trim() !== "") {
        const nameTrimmed = exporterName.trim();
        let exporterObj = await Exporter.findOne({ name: new RegExp(`^${nameTrimmed}$`, "i") });
        if (!exporterObj) {
          exporterObj = new Exporter({ name: nameTrimmed });
          await exporterObj.save();
          console.log(`Created new Exporter: ${nameTrimmed}`);
        }
        exporterId = exporterObj._id;
      } else {
        // Default fallback if exporter name is empty
        const fallbackName = "UNKNOWN EXPORTER";
        let exporterObj = await Exporter.findOne({ name: fallbackName });
        if (!exporterObj) {
          exporterObj = new Exporter({ name: fallbackName });
          await exporterObj.save();
        }
        exporterId = exporterObj._id;
      }

      // Assemble Container Document Data
      const containerData = {
        containerNo: containerNo.trim(),
        importer: importerId,
        exporter: exporterId,
        blNo: blNo || undefined,
        etaDate: etaDate ? new Date(etaDate) : undefined,
        loadingDate: loadingDate ? new Date(loadingDate) : undefined,
        unloadingDate: unloadingDate ? new Date(unloadingDate) : undefined,
        status: status,
        portOfChina: portOfChina || undefined,
        shippingLine: shippingLine || undefined,
        cha: cha || undefined,
        party: party || undefined,
        remarks: remarks || undefined,
        updatedBy: adminId || undefined
      };

      // 3. Find if container exists
      const existingContainer = await Container.findOne({ containerNo: containerNo.trim() });
      if (existingContainer) {
        // Update existing
        Object.assign(existingContainer, containerData);
        await existingContainer.save();
        updatedCount++;
      } else {
        // Create new
        const newContainer = new Container({
          ...containerData,
          createdBy: adminId || undefined
        });
        await newContainer.save();
        createdCount++;
      }
    }

    console.log("\nIngestion completed successfully!");
    console.log(`Created: ${createdCount} containers`);
    console.log(`Updated: ${updatedCount} containers`);
    console.log(`Skipped: ${skippedCount} containers`);

  } catch (error) {
    console.error("Error during container ingestion:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

run();
