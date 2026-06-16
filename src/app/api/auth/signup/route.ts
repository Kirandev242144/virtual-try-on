import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const USERS_FILE_PATH = path.join(process.cwd(), 'scratch', 'users.json');

function getLocalUsers() {
    try {
        if (!fs.existsSync(path.dirname(USERS_FILE_PATH))) {
            fs.mkdirSync(path.dirname(USERS_FILE_PATH), { recursive: true });
        }
        if (fs.existsSync(USERS_FILE_PATH)) {
            const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {}
    return [];
}

function saveLocalUsers(users: any[]) {
    try {
        if (!fs.existsSync(path.dirname(USERS_FILE_PATH))) {
            fs.mkdirSync(path.dirname(USERS_FILE_PATH), { recursive: true });
        }
        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
    } catch (e) {
        console.error("Failed to save local users file", e);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email,
            password,
            storeName,
            storeHandle,
            storeCategory,
            targetAudience,
            location,
            bio
        } = body;

        if (!email || !password || !storeName || !storeHandle) {
            return NextResponse.json({ error: 'Missing required fields (email, password, storeName, storeHandle)' }, { status: 400 });
        }

        const lowercaseEmail = email.toLowerCase();
        const hash = crypto.createHash('sha256').update(password).digest('hex');

        // 1. Check if user already exists locally
        const localUsers = getLocalUsers();
        if (localUsers.some((u: any) => u.email.toLowerCase() === lowercaseEmail)) {
            return NextResponse.json({ error: 'User already exists with this email address' }, { status: 400 });
        }

        let userId = '';
        let savedToSupabase = false;

        // 2. Attempt to create the user in Supabase Auth
        try {
            console.log(`Creating user in Supabase auth: ${lowercaseEmail}`);
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: lowercaseEmail,
                password: password,
                email_confirm: true,
                user_metadata: {
                    full_name: storeName,
                    role: 'vendor'
                }
            });

            if (authError) {
                console.error("Supabase Auth createUser error:", authError.message);
                return NextResponse.json({ error: `Supabase Auth error: ${authError.message}` }, { status: 400 });
            }

            if (!authData?.user) {
                throw new Error("No user data returned from Supabase Auth");
            }

            userId = authData.user.id;
            console.log(`Created Supabase user with ID: ${userId}`);

            // Let's wait a moment for the database trigger to create the public.profiles row
            await new Promise(resolve => setTimeout(resolve, 800));

            // 3. Update the profile with merchant metadata
            console.log(`Updating public.profiles for user ${userId}`);
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    role: 'vendor',
                    onboarding_completed: false, // Must go through onboarding wizard first!
                    store_name: storeName,
                    store_handle: storeHandle.toLowerCase().replace(/\s+/g, ''),
                    store_category: storeCategory || 'Casual',
                    target_audience: targetAudience || ['Unisex'],
                    location: location || '',
                    store_description: bio || '',
                    vendor_status: 'approved' // Set vendor status to approved directly for verification
                })
                .eq('id', userId);

            if (profileError) {
                console.error("Error updating merchant profile in Supabase:", profileError.message);
                // Try inserting a profile if the trigger failed to run
                const { error: insertError } = await supabaseAdmin
                    .from('profiles')
                    .insert([{
                        id: userId,
                        email: lowercaseEmail,
                        full_name: storeName,
                        username: storeHandle.toLowerCase().replace(/\s+/g, ''),
                        role: 'vendor',
                        onboarding_completed: false,
                        store_name: storeName,
                        store_handle: storeHandle.toLowerCase().replace(/\s+/g, ''),
                        store_category: storeCategory || 'Casual',
                        target_audience: targetAudience || ['Unisex'],
                        location: location || '',
                        store_description: bio || '',
                        vendor_status: 'approved',
                        created_at: new Date().toISOString()
                    }]);

                if (insertError) {
                    console.error("Failed to insert backup profile in Supabase:", insertError.message);
                } else {
                    savedToSupabase = true;
                }
            } else {
                savedToSupabase = true;
                console.log("Supabase profiles table updated successfully.");
            }

        } catch (supabaseErr: any) {
            console.warn("Supabase operations failed. Storing user locally only.", supabaseErr);
            // Generate a local UUID if Supabase was completely unreachable
            userId = crypto.randomUUID();
        }

        // 4. Save to local JSON file (active backup & offline fallback)
        const newMerchant = {
            id: userId,
            email: lowercaseEmail,
            password: hash, // Stored hash for local NextAuth credentials login
            role: 'vendor',
            onboarding_completed: false, // Starts as false
            store_name: storeName,
            store_handle: storeHandle.toLowerCase().replace(/\s+/g, ''),
            store_category: storeCategory || 'Casual',
            target_audience: targetAudience || ['Unisex'],
            location: location || '',
            store_description: bio || '',
            created_at: new Date().toISOString()
        };

        localUsers.push(newMerchant);
        saveLocalUsers(localUsers);

        return NextResponse.json({ 
            success: true, 
            message: 'Merchant registered successfully.', 
            user: { id: userId, email: lowercaseEmail, role: 'vendor' },
            savedToSupabase 
        });

    } catch (err: any) {
        console.error('Merchant registration failed:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
