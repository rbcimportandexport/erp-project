const axios = require('axios');

async function run() {
  const url = 'https://gbpiwnjhardciughbgtx.supabase.co/rest/v1/';
  const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGl3bmpoYXJkY2l1Z2hiZ3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDUxODIsImV4cCI6MjA5ODQ4MTE4Mn0.ebROhoW8dA2Fb-mX4Rt8mKPYJjD_gc4T7sf9C173RKE'
  };

  try {
    const res = await axios.get(url, { headers });
    console.log("Paths available:");
    console.log(Object.keys(res.data.paths));
    console.log("Definitions available:");
    console.log(Object.keys(res.data.definitions));
  } catch (err) {
    console.error("Error fetching OpenAPI spec:", err.message);
  }
}

run();
