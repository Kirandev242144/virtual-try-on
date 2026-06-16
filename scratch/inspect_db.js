const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse env file
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables in .env.local!", { supabaseUrl, supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking Supabase connection and public.profiles table...");
  
  // Try to select one row from profiles
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Success! Profile columns in database:");
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
      console.log("Sample profile:", data[0]);
    } else {
      console.log("No profiles found in the table yet, but table query succeeded. Let's inspect columns using a test insert.");
      // Try to insert a dummy profile to see columns
      const testId = '00000000-0000-0000-0000-000000000000';
      const { data: testIns, error: insError } = await supabase
        .from('profiles')
        .insert([{ id: testId, email: 'test_inspect@example.com', role: 'vendor' }])
        .select();
      
      if (insError) {
        console.log("Test insert failed (expected if foreign key/primary key constraint fails or columns missing):", insError.message);
      } else {
        console.log("Test insert succeeded! Columns:", Object.keys(testIns[0]));
        // Delete test insert
        await supabase.from('profiles').delete().eq('id', testId);
      }
    }
  }
}

run();
