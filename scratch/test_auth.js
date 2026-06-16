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
  const testEmail = `test_merchant_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';

  console.log(`Attempting to create test user: ${testEmail}...`);
  
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Test Store'
    }
  });

  if (userError) {
    console.error("Error creating user in Supabase auth:", userError.message);
    process.exit(1);
  }

  const userId = userData.user.id;
  console.log(`User created in auth.users. ID: ${userId}`);

  // Wait 1 second for database triggers
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log("Checking if profile trigger worked...");
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error("Error retrieving profile (did trigger run?):", profileError.message);
  } else {
    console.log("Profile successfully created by trigger:", profile);

    console.log("Attempting to update profile to vendor and set store data...");
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'vendor',
        onboarding_completed: false,
        store_name: 'Test Store Boutique',
        store_handle: `teststore_${Date.now()}`
      })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error("Error updating profile:", updateError.message);
    } else {
      console.log("Profile successfully updated to vendor!", updatedProfile[0]);
    }
  }

  // Cleanup test user
  console.log("Cleaning up test user from auth.users...");
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("Error deleting test user:", deleteError.message);
  } else {
    console.log("Test user cleaned up successfully!");
  }
}

run();
