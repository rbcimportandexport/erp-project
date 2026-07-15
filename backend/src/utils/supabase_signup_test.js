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
    const email = `temp_admin_${Date.now()}@rbc.com`;
    const password = "Password123!";
    console.log(`Trying to sign up user: ${email}...`);

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: "Temp Admin",
          role: "masterAdmin"
        }
      }
    });

    if (signUpErr) {
      throw signUpErr;
    }

    console.log("Sign up response user ID:", signUpData.user?.id);
    console.log("Session exists:", !!signUpData.session);

    if (signUpData.session) {
      console.log("No email confirmation needed. Trying to insert importer...");
      const { data: imp, error: impErr } = await supabase
        .from("importers")
        .insert([{ name: "TEST IMPORTER TEMP" }])
        .select();

      if (impErr) {
        console.error("Importer insert failed:", impErr);
      } else {
        console.log("Importer insert succeeded:", imp);
      }
    } else {
      console.log("Email confirmation is required. We cannot use this new user without confirming email.");
    }

  } catch (err) {
    console.error("Error:", err.message || err);
  }
};

run();
