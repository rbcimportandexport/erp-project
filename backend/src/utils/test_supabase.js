const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://gbpiwnjhardciughbgtx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGl3bmpoYXJkY2l1Z2hiZ3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDUxODIsImV4cCI6MjA5ODQ4MTE4Mn0.ebROhoW8dA2Fb-mX4Rt8mKPYJjD_gc4T7sf9C173RKE";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const test = async () => {
  try {
    console.log("Logging in...");
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: "uploader_admin_1783402636355@rbc.com",
      password: "UploadPassword123!"
    });
    if (loginErr) throw loginErr;

    console.log("Logged in successfully. Querying count...");
    const { count, error } = await supabase
      .from("containers")
      .select("*", { count: "exact", head: true });
    
    if (error) throw error;
    console.log("Supabase Containers count (authenticated):", count);
  } catch (err) {
    console.error("Test error:", err.message || err);
  }
};

test();
