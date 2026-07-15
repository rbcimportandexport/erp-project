const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://gbpiwnjhardciughbgtx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGl3bmpoYXJkY2l1Z2hiZ3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDUxODIsImV4cCI6MjA5ODQ4MTE4Mn0.ebROhoW8dA2Fb-mX4Rt8mKPYJjD_gc4T7sf9C173RKE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const test = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: "yadavsaurabh9333@gmail.com",
      password: "Password123!"
    });
    console.log("Data:", data);
    console.log("Error:", error);
  } catch (err) {
    console.error("Caught error:", err);
  }
};

test();
