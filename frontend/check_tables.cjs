const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbpiwnjhardciughbgtx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGl3bmpoYXJkY2l1Z2hiZ3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDUxODIsImV4cCI6MjA5ODQ4MTE4Mn0.ebROhoW8dA2Fb-mX4Rt8mKPYJjD_gc4T7sf9C173RKE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
  console.log(`Checking table: ${tableName}`);
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error) {
    console.error(`Error on ${tableName}:`, error.message);
  } else {
    console.log(`Success on ${tableName}. Count:`, data.length, data[0] ? Object.keys(data[0]) : '(empty)');
  }
}

async function run() {
  await checkTable('documents');
  await checkTable('document');
  await checkTable('containers');
  await checkTable('importers');
  await checkTable('exporters');
}

run();
