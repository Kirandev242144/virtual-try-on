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

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking columns of public.products table in Supabase...");
  
  // Try to insert a dummy product to see columns and verify constraints
  const testId = '00000000-0000-0000-0000-000000000000';
  const testVendorId = '117844876010116906525'; // Numan Ahmed's profile ID we saw earlier
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error querying products:", error);
  } else {
    console.log("Products query successful!");
    if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
      console.log("Sample product:", data[0]);
    } else {
      console.log("Table is empty. Attempting dry-run insert to check columns...");
      const { data: testIns, error: insError } = await supabase
        .from('products')
        .insert([{
          id: testId,
          vendor_id: testVendorId,
          name: 'Test Product',
          price: 19.99,
          category: 'tops',
          image_url: 'http://example.com/test.jpg'
        }])
        .select();

      if (insError) {
        console.error("Insert failed:", insError.message);
      } else {
        console.log("Insert succeeded! Available columns:", Object.keys(testIns[0]));
        // Delete test insert
        await supabase.from('products').delete().eq('id', testId);
      }
    }
  }
}

run();
