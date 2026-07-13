const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Container = require("../models/Container");
const Importer = require("../models/Importer");
const Exporter = require("../models/Exporter");
const User = require("../models/User");

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
};

const rawContainers = [
  {
    containerNo: "RBC20260605-198",
    importerName: "SHIVAY ENTERPRISE",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "05/06/2026",
    etaDate: "23/06/2026",
    cblEta: null,
    cblBlNo: "",
    blNo: "SNLGNBDL8840214",
    status: "DONE",
    shippingLine: "SNL",
    portOfChina: "NINGBO",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260607-199",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "07/06/2026",
    etaDate: "04/07/2026",
    cblEta: null,
    cblBlNo: "",
    blNo: "149603761828",
    status: "BOE",
    shippingLine: "FMC",
    portOfChina: "DA CHAN BAY",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260609-200",
    importerName: "SHIVAY ENTERPRISE",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "09/06/2026",
    etaDate: "24/06/2026",
    cblEta: null,
    cblBlNo: "",
    blNo: "SNLGNBDLA190278",
    status: "DONE",
    shippingLine: "SNL",
    portOfChina: "NINGBO",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260610-201",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "10/06/2026",
    etaDate: "28/06/2026",
    cblEta: null,
    cblBlNo: "",
    blNo: "HASLC5626050085",
    status: "DONE",
    shippingLine: "HAL",
    portOfChina: "NINGBO",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260612-202",
    importerName: "SHIVAY ENTERPRISE",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "12/06/2026",
    etaDate: null,
    cblEta: null,
    cblBlNo: "",
    blNo: "",
    status: "DONE",
    shippingLine: "",
    portOfChina: "CHINA AIR",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260616-203",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "16/06/2026",
    etaDate: "07/07/2026",
    cblEta: "07/07/2026",
    cblBlNo: "",
    blNo: "YMJAS232199669",
    status: "CHECKLIST APPROVED",
    shippingLine: "YML",
    portOfChina: "NINGBO",
    cha: ""
  },
  {
    containerNo: "RBC20260616-204",
    importerName: "SHIVAY ENTERPRISE",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "16/06/2026",
    etaDate: "07/07/2026",
    cblEta: "07/07/2026",
    cblBlNo: "",
    blNo: "YMJAS232199565",
    status: "CHECKLIST APPROVED",
    shippingLine: "YML",
    portOfChina: "NINGBO",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260622-205",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "22/06/2026",
    etaDate: "16/07/2026",
    cblEta: null,
    cblBlNo: "",
    blNo: "A78GX34786",
    status: "ECPL",
    shippingLine: "IAL",
    portOfChina: "NANSHA",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260623-206",
    importerName: "SHIVAY ENTERPRISE",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "23/06/2026",
    etaDate: "14/07/2026",
    cblEta: null,
    cblBlNo: "",
    blNo: "YMJAS232199790",
    status: "HOLD AT ME",
    shippingLine: "YML",
    portOfChina: "NINGBO",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260624-207",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "24/06/2026",
    etaDate: "16/07/2026",
    cblEta: null,
    cblBlNo: "",
    blNo: "A9ZGX15965",
    status: "WORK IN PROCESS",
    shippingLine: "YML",
    portOfChina: "NINGBO",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260701-208",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "01/07/2026",
    etaDate: null,
    cblEta: null,
    cblBlNo: "",
    blNo: "",
    status: "DESCRIPTION AND VALUE DONE",
    shippingLine: "",
    portOfChina: "NINGBO",
    cha: ""
  },
  {
    containerNo: "RBC20260704-209",
    importerName: "RAMA SALON FURNITURE",
    exporterName: "YIWU SUPERMEJOR IMPORT AND EXPORT CO.,LIMITED",
    loadingDate: "04/07/2026",
    etaDate: null,
    cblEta: "27/07/2026",
    cblBlNo: "NBOZHES22800",
    blNo: "",
    status: "DESCRIPTION AND VALUE DONE",
    shippingLine: "HMM",
    portOfChina: "NINGBO",
    cha: "Ocenus"
  },
  {
    containerNo: "RBC20260704-210",
    importerName: "RAMA SALON FURNITURE",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "04/07/2026",
    etaDate: null,
    cblEta: "27/07/2026",
    cblBlNo: "NBOZ7RL95000",
    blNo: "",
    status: "DESCRIPTION AND VALUE DONE",
    shippingLine: "YML",
    portOfChina: "NINGBO",
    cha: "Ocenus"
  },
  {
    containerNo: "RBC20260704-211",
    importerName: "RAMA SALON FURNITURE",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "04/07/2026",
    etaDate: null,
    cblEta: "27/07/2026",
    cblBlNo: "ESLCHNSCN158681",
    blNo: "",
    status: "DESCRIPTION AND VALUE DONE",
    shippingLine: "ESL",
    portOfChina: "NANSHA",
    cha: "Ocenus"
  },
  {
    containerNo: "RBC20260707-212",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU SUPERMEJOR IMPORT AND EXPORT CO.,LIMITED",
    loadingDate: "07/07/2026",
    etaDate: null,
    cblEta: "27/07/2026",
    cblBlNo: "NBOZ37P43300",
    blNo: "",
    status: "DESCRIPTION AND VALUE DONE",
    shippingLine: "HMM",
    portOfChina: "NINGBO",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260708-213",
    importerName: "SHIVAY ENTERPRISE",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "08/07/2026",
    etaDate: null,
    cblEta: "27/07/2026",
    cblBlNo: "ESLCHNSCN159351",
    blNo: "",
    status: "WORK NOT STARTED",
    shippingLine: "ESL",
    portOfChina: "NANSHA",
    cha: ""
  },
  {
    containerNo: "RBC20260708-214",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "08/07/2026",
    etaDate: null,
    cblEta: null,
    cblBlNo: "EGLV143652746812",
    blNo: "",
    status: "WORK NOT STARTED",
    shippingLine: "EMC",
    portOfChina: "NINGBO",
    cha: "Mountain"
  },
  {
    containerNo: "RBC20260630-215",
    importerName: "RAMDEV BEAUTY COLLECTION",
    exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
    loadingDate: "30/06/2026",
    etaDate: null,
    cblEta: "13/08/2026",
    cblBlNo: "HLCUNG12606CWVK1",
    blNo: "",
    status: "DESCRIPTION AND VALUE DONE",
    shippingLine: "IIPL",
    portOfChina: "NINGBO",
    cha: "Mountain"
  }
];

const seed = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    // Fetch master user to use as creator
    const creatorUser = await User.findOne({ role: "masterAdmin" }) || await User.findOne({});
    if (!creatorUser) {
      throw new Error("No user found in Database to set as creator");
    }
    console.log(`Using User ID ${creatorUser._id} (${creatorUser.email}) as creator.`);

    for (const raw of rawContainers) {
      // Find or create Importer
      let importer = await Importer.findOne({ name: new RegExp(`^${raw.importerName.trim()}$`, "i") });
      if (!importer) {
        console.log(`Creating Importer: ${raw.importerName}`);
        importer = await Importer.create({ name: raw.importerName.trim() });
      }

      // Find or create Exporter
      let exporter = await Exporter.findOne({ name: new RegExp(`^${raw.exporterName.trim()}$`, "i") });
      if (!exporter) {
        console.log(`Creating Exporter: ${raw.exporterName}`);
        exporter = await Exporter.create({ name: raw.exporterName.trim() });
      }

      // Prepare container doc
      const containerData = {
        containerNo: raw.containerNo,
        importer: importer._id,
        exporter: exporter._id,
        loadingDate: parseDate(raw.loadingDate),
        etaDate: parseDate(raw.etaDate),
        cblEta: parseDate(raw.cblEta),
        cblBlNo: raw.cblBlNo,
        blNo: raw.blNo,
        status: raw.status,
        shippingLine: raw.shippingLine,
        portOfChina: raw.portOfChina,
        cha: raw.cha,
        createdBy: creatorUser._id,
        updatedBy: creatorUser._id
      };

      // Check if container already exists
      let container = await Container.findOne({ containerNo: raw.containerNo });
      if (container) {
        console.log(`Updating Container: ${raw.containerNo}`);
        Object.assign(container, containerData);
        await container.save();
      } else {
        console.log(`Creating Container: ${raw.containerNo}`);
        await Container.create(containerData);
      }
    }

    console.log("=== CONTAINER SEEDING COMPLETED SUCCESSFULLY! ===");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
