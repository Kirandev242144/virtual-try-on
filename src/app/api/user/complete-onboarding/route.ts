import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { style_preferences, size_preferences, username, bio, goals } = body;

        // 1. Check if profile exists
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        let error;

        if (!existingProfile) {
            // 2. Profile missing? Create it! (Handling stale sessions)
            const { error: insertError } = await supabaseAdmin
                .from('profiles')
                .insert([
                    {
                        id: crypto.randomUUID(), // Generate a new ID since we don't have the Auth Provider ID here
                        email: session.user.email,
                        full_name: session.user.name,
                        avatar_url: session.user.image,
                        role: 'user',
                        onboarding_completed: true,
                        style_preferences,
                        size_preferences,
                        username,
                        bio,
                        goals,
                        created_at: new Date().toISOString()
                    }
                ]);
            error = insertError;
        } else {
            // 3. Profile exists? Update it.
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    onboarding_completed: true,
                    style_preferences,
                    size_preferences,
                    username,
                    bio,
                    goals
                })
                .eq('email', session.user.email);
            error = updateError;
        }

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding update failed. Request Body:', await req.clone().text());
        console.error('Error Details:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
    }
}
