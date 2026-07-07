const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://gbpiwnjhardciughbgtx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGl3bmpoYXJkY2l1Z2hiZ3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDUxODIsImV4cCI6MjA5ODQ4MTE4Mn0.ebROhoW8dA2Fb-mX4Rt8mKPYJjD_gc4T7sf9C173RKE";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const run = async () => {
  try {
    console.log("Creating/authenticating a temporary admin user...");
    const email = `uploader_admin_${Date.now()}@rbc.com`;
    const password = "UploadPassword123!";

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: "Uploader Admin",
          role: "masterAdmin"
        }
      }
    });

    if (authErr) {
      throw new Error(`Failed to sign up temporary uploader: ${authErr.message}`);
    }

    console.log("Successfully authenticated as:", email);

    // Clean up temporary importer from test
    await supabase.from("importers").delete().eq("name", "TEST IMPORTER TEMP");

    console.log("Loading parsed containers JSON...");
    const parsedDataPath = path.join(__dirname, "parsed_containers_perfect.json");
    if (!fs.existsSync(parsedDataPath)) {
      throw new Error(`Parsed data file not found at ${parsedDataPath}`);
    }
    const containers = JSON.parse(fs.readFileSync(parsedDataPath, "utf-8"));
    console.log(`Loaded ${containers.length} containers to ingest into Supabase.`);

    let createdCount = 0;
    let updatedCount = 0;

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

      if (!containerNo || containerNo.trim() === "") {
        continue;
      }

      // 1. Importer lookup/create
      let importerId = null;
      const impNameTrimmed = (importerName || "UNKNOWN IMPORTER").trim();
      const { data: existingImps, error: impFetchErr } = await supabase
        .from("importers")
        .select("id")
        .ilike("name", impNameTrimmed)
        .limit(1);

      if (impFetchErr) throw impFetchErr;

      if (existingImps && existingImps.length > 0) {
        importerId = existingImps[0].id;
      } else {
        const { data: newImp, error: impCreateErr } = await supabase
          .from("importers")
          .insert([{ name: impNameTrimmed }])
          .select("id")
          .single();
        if (impCreateErr) throw impCreateErr;
        importerId = newImp.id;
        console.log(`Supabase: Created Importer: ${impNameTrimmed}`);
      }

      // 2. Exporter lookup/create
      let exporterId = null;
      const expNameTrimmed = (exporterName || "UNKNOWN EXPORTER").trim();
      const { data: existingExps, error: expFetchErr } = await supabase
        .from("exporters")
        .select("id")
        .ilike("name", expNameTrimmed)
        .limit(1);

      if (expFetchErr) throw expFetchErr;

      if (existingExps && existingExps.length > 0) {
        exporterId = existingExps[0].id;
      } else {
        const { data: newExp, error: expCreateErr } = await supabase
          .from("exporters")
          .insert([{ name: expNameTrimmed }])
          .select("id")
          .single();
        if (expCreateErr) throw expCreateErr;
        exporterId = newExp.id;
        console.log(`Supabase: Created Exporter: ${expNameTrimmed}`);
      }

      // 3. Assemble container payload
      const containerPayload = {
        container_no: containerNo.trim(),
        importer_id: importerId,
        exporter_id: exporterId,
        bl_no: blNo || null,
        eta_date: etaDate || null,
        loading_date: loadingDate || null,
        unloading_date: unloadingDate || null,
        status: status,
        port_of_china: portOfChina || null,
        shipping_line: shippingLine || null,
        cha: cha || null,
        party: party || null,
        remarks: remarks || null
      };

      // Check if container already exists in Supabase
      const { data: existingConts, error: contFetchErr } = await supabase
        .from("containers")
        .select("id")
        .eq("container_no", containerNo.trim())
        .limit(1);

      if (contFetchErr) throw contFetchErr;

      if (existingConts && existingConts.length > 0) {
        // Update
        const { error: updateErr } = await supabase
          .from("containers")
          .update(containerPayload)
          .eq("id", existingConts[0].id);
        if (updateErr) throw updateErr;
        updatedCount++;
      } else {
        // Insert
        const { error: insertErr } = await supabase
          .from("containers")
          .insert([containerPayload]);
        if (insertErr) throw insertErr;
        createdCount++;
      }
    }

    console.log("\nSupabase Ingestion Completed!");
    console.log(`Created: ${createdCount} containers`);
    console.log(`Updated: ${updatedCount} containers`);

  } catch (err) {
    console.error("Supabase ingestion failed:", err.message || err);
  }
};

run();
