import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            try {
                // Check if user exists in profiles
                const { data: existingUser, error: fetchError } = await supabaseAdmin
                    .from('profiles')
                    .select('*')
                    .eq('email', user.email)
                    .single();

                if (!existingUser) {
                    // Create new profile
                    const { error: insertError } = await supabaseAdmin
                        .from('profiles')
                        .insert([
                            {
                                id: user.id, // Use Google ID as main ID if possible, or generate one. 
                                // Actually, NextAuth user.id is usually the sub from provider. 
                                // Let's use the email as a stable lookup or just insert.
                                // Since we dropped the foreign key, we can use the NextAuth ID.
                                email: user.email,
                                full_name: user.name,
                                avatar_url: user.image,
                                role: 'user', // Default role
                                created_at: new Date().toISOString(),
                            }
                        ]);

                    if (insertError) {
                        console.error("Error creating Supabase profile:", insertError);
                        return true; // Use default flow even if sync fails? Or block? Let's allow.
                    }
                }
                return true;
            } catch (error) {
                console.error("SignIn Callback Error:", error);
                return true;
            }
        },
        async session({ session, token }) {
            // Attach role and onboarding status to session
            if (session.user?.email) {
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('role, onboarding_completed')
                    .eq('email', session.user.email)
                    .single();

                if (profile) {
                    // @ts-ignore
                    session.user.role = profile.role;
                    // @ts-ignore
                    session.user.onboardingCompleted = profile.onboarding_completed;
                }
            }
            return session;
        }
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
