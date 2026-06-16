import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            style_preferences,
            size_preferences,
            username,
            bio,
            goals,
            role = 'user',
            store_name,
            store_handle,
            store_description,
            store_category,
            target_audience,
            website_url,
            instagram_handle,
            twitter_handle,
            location
        } = body;

        const email = session.user.email.toLowerCase();

        // 1. Update local users file if email exists
        try {
            const localUsers = getLocalUsers();
            const userIndex = localUsers.findIndex((u: any) => u.email.toLowerCase() === email);
            if (userIndex !== -1) {
                console.log(`Updating local user profile for ${email}`);
                localUsers[userIndex] = {
                    ...localUsers[userIndex],
                    role,
                    onboarding_completed: true,
                    store_name: store_name || localUsers[userIndex].store_name,
                    store_handle: store_handle ? store_handle.toLowerCase().replace(/\s+/g, '') : localUsers[userIndex].store_handle,
                    store_category: store_category || localUsers[userIndex].store_category || 'Casual',
                    target_audience: target_audience || localUsers[userIndex].target_audience || ['Unisex'],
                    location: location || localUsers[userIndex].location || '',
                    store_description: store_description || bio || localUsers[userIndex].store_description || '',
                    updated_at: new Date().toISOString()
                };
                saveLocalUsers(localUsers);
            }
        } catch (localErr) {
            console.error("Failed to update local user in complete-onboarding:", localErr);
        }

        // 2. Check if profile exists in database
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, username, bio')
            .eq('email', session.user.email)
            .single();

        let error;

        if (!existingProfile) {
            // 3. Profile missing? Create it!
            const { error: insertError } = await supabaseAdmin
                .from('profiles')
                .insert([
                    {
                        id: crypto.randomUUID(),
                        email: session.user.email,
                        full_name: session.user.name,
                        avatar_url: session.user.image,
                        role,
                        onboarding_completed: true,
                        style_preferences,
                        size_preferences,
                        username: role === 'vendor' ? store_handle : username,
                        bio: role === 'vendor' ? store_description : bio,
                        goals,
                        store_name,
                        store_handle,
                        store_description,
                        store_category,
                        target_audience,
                        website_url,
                        instagram_handle,
                        twitter_handle,
                        location,
                        vendor_status: 'approved', // Auto-approve
                        created_at: new Date().toISOString()
                    }
                ]);
            error = insertError;
        } else {
            // 4. Profile exists? Update it.
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    onboarding_completed: true,
                    role,
                    style_preferences,
                    size_preferences,
                    username: role === 'vendor' ? store_handle : (username || existingProfile.username),
                    bio: role === 'vendor' ? store_description : (bio || existingProfile.bio),
                    goals,
                    store_name,
                    store_handle,
                    store_description,
                    store_category,
                    target_audience,
                    website_url,
                    instagram_handle,
                    twitter_handle,
                    location,
                    vendor_status: 'approved' // Ensure they are approved upon completion
                })
                .eq('email', session.user.email);
            error = updateError;
        }

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding update failed.');
        console.error('Error Details:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}
