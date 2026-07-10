const dotenv = require("dotenv");
const fs = require("fs");
const connectDB = require("../config/db");
const HsnCode = require("../models/HsnCode");
const Product = require("../models/Product");
const Container = require("../models/Container");

dotenv.config();

const BASE_URL = "https://www.icegate.gov.in/Webappl";
const SOURCE_URL = `${BASE_URL}/ITCHS_ENQ1`;

const decodeHtml = (value) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const textContent = (html) =>
  decodeHtml(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();

const getCookie = (response) => {
  const raw = response.headers.get("set-cookie") || "";
  return raw.split(",").map((part) => part.split(";")[0]).join("; ");
};

const postDirectory = async (path, cookie) => {
  const response = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie,
      referer: `${BASE_URL}/Codes`,
      "user-agent": "RBC-ERP-HSN-Sync/1.0",
    },
    body: new URLSearchParams({ cth: "%%%%", item: "", submitbutton: "Search" }),
  });
  if (!response.ok) throw new Error(`ICEGATE ${path} returned HTTP ${response.status}`);
  return response.text();
};

const fetchOfficialHsn = async () => {
  let itchsHtml;
  let dutyHtml;
  if (process.argv[2] && process.argv[3]) {
    itchsHtml = fs.readFileSync(process.argv[2], "utf8");
    dutyHtml = fs.readFileSync(process.argv[3], "utf8");
  } else {
    const landing = await fetch(`${BASE_URL}/Codes`);
    if (!landing.ok) throw new Error(`ICEGATE returned HTTP ${landing.status}`);
    const cookie = getCookie(landing);

    await fetch(SOURCE_URL, { headers: { cookie, referer: `${BASE_URL}/Codes` } });
    [itchsHtml, dutyHtml] = await Promise.all([
      postDirectory("ITCHS_ENQ1", cookie),
      postDirectory("CTH_ENQ", cookie),
    ]);
  }

  const dutyByCode = new Map();
  for (const row of dutyHtml.match(/<tr\b[\s\S]*?<\/tr>/gi) || []) {
    const cells = row.match(/<td\b[\s\S]*?<\/td>/gi) || [];
    const code = textContent(cells[0] || "").match(/^\d{8}$/)?.[0];
    const duty = Number(textContent(cells[1] || ""));
    if (code && Number.isFinite(duty)) dutyByCode.set(code, duty);
  }

  const records = [];
  const seen = new Set();
  for (const row of itchsHtml.match(/<tr\b[\s\S]*?<\/tr>/gi) || []) {
    const cells = row.match(/<td\b[\s\S]*?<\/td>/gi) || [];
    const code = textContent(cells[0] || "").match(/^\d{8}$/)?.[0];
    const description = textContent(cells[1] || "");
    const unit = textContent(cells[2] || "");
    if (!code || !description || seen.has(code)) continue;
    seen.add(code);
    records.push({ code, description, unit, dutyRate: dutyByCode.get(code) ?? null });
  }

  if (records.length < 10000) {
    throw new Error(`ICEGATE result incomplete: only ${records.length} records parsed`);
  }
  return records;
};

const syncOfficialHsn = async () => {
  try {
    console.log("Downloading current ITC(HS) directory from official ICEGATE...");
    const officialRecords = await fetchOfficialHsn();
    console.log(`Verified ${officialRecords.length} official HSN records.`);

    await connectDB();
    const verifiedAt = new Date();
    // Keep the user's Main Excel list completely separate from the Universal list.
    const allExisting = await HsnCode.find({ source: "ICEGATE" }).sort({ createdAt: 1 });
    const existingByCode = new Map();
    for (const item of allExisting) {
      const group = existingByCode.get(item.code) || [];
      group.push(item);
      existingByCode.set(item.code, group);
    }

    const updates = [];
    const inserts = [];
    const duplicateMigrations = [];
    for (const record of officialRecords) {
      const existing = existingByCode.get(record.code) || [];
      const values = {
        description: record.description,
        dutyRate: record.dutyRate,
        gstRate: null,
        unit: record.unit || undefined,
        source: "ICEGATE",
        sourceUrl: SOURCE_URL,
        lastVerifiedAt: verifiedAt,
        isActive: true,
      };
      if (existing.length) {
        updates.push({ updateOne: { filter: { _id: existing[0]._id }, update: { $set: values } } });
        const duplicateIds = existing.slice(1).map((item) => item._id);
        if (duplicateIds.length) {
          duplicateMigrations.push({ canonicalId: existing[0]._id, duplicateIds });
        }
      } else {
        inserts.push({ code: record.code, ...values });
      }
    }

    if (updates.length) await HsnCode.bulkWrite(updates, { ordered: false });
    if (inserts.length) await HsnCode.insertMany(inserts, { ordered: false });

    const productOps = [];
    const containerOps = [];
    const duplicateIds = [];
    for (const migration of duplicateMigrations) {
      productOps.push({
        updateMany: {
          filter: { hsnCode: { $in: migration.duplicateIds } },
          update: { $set: { hsnCode: migration.canonicalId } },
        },
      });
      containerOps.push({
        updateMany: {
          filter: { hsnCode: { $in: migration.duplicateIds } },
          update: { $set: { hsnCode: migration.canonicalId } },
        },
      });
      duplicateIds.push(...migration.duplicateIds);
    }
    if (productOps.length) await Product.bulkWrite(productOps, { ordered: false });
    if (containerOps.length) await Container.bulkWrite(containerOps, { ordered: false });
    if (duplicateIds.length) await HsnCode.deleteMany({ _id: { $in: duplicateIds } });

    console.log(
      `Official HSN sync complete: ${inserts.length} added, ${updates.length} updated, ${duplicateIds.length} duplicate rows merged.`
    );
    process.exit(0);
  } catch (error) {
    console.error("Official HSN sync failed:", error.message);
    process.exit(1);
  }
};

syncOfficialHsn();
