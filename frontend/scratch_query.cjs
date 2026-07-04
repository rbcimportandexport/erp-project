const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbpiwnjhardciughbgtx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGl3bmpoYXJkY2l1Z2hiZ3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDUxODIsImV4cCI6MjA5ODQ4MTE4Mn0.ebROhoW8dA2Fb-mX4Rt8mKPYJjD_gc4T7sf9C173RKE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Querying documents...");
  const { data, error } = await supabase
    .from('documents')
    .select('*, containers(container_no)');
  if (error) {
    console.error("Error querying documents:", error);
  } else {
    console.log("Documents count:", data.length);
    console.log("Documents:", JSON.stringify(data, null, 2));
  }

  console.log("\nQuerying containers...");
  const { data: containers, error: cError } = await supabase
    .from('containers')
    .select('*')
    .limit(5);
  if (cError) {
    console.error("Error querying containers:", cError);
  } else {
    console.log("Containers count:", containers.length);
  }
}

run();
