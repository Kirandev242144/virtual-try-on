import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import fs from "fs"
import path from "path"

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Supabase Public Client for client-side Auth methods
const supabasePublic = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    } catch (e) {
        console.error("Failed to read local users file", e);
    }
    return [];
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email.toLowerCase();
                const hash = crypto.createHash('sha256').update(credentials.password).digest('hex');

                // 1. Try local file first (ideal for local testing / fallback)
                const localUsers = getLocalUsers();
                const localUser = localUsers.find((u: any) => u.email.toLowerCase() === email);
                if (localUser) {
                    if (localUser.password === hash || localUser.password === credentials.password) {
                        return {
                            id: localUser.id,
                            email: localUser.email,
                            name: localUser.store_name || localUser.full_name || 'Merchant',
                            role: localUser.role || 'vendor',
                            onboardingCompleted: localUser.onboarding_completed ?? false
                        };
                    }
                }

                // 2. Try Supabase Auth
                try {
                    const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
                        email,
                        password: credentials.password
                    });

                    if (authData?.user) {
                        // Retrieve the profile details to get role and onboarding status
                        const { data: profile } = await supabaseAdmin
                            .from('profiles')
                            .select('*')
                            .eq('id', authData.user.id)
                            .single();

                        return {
                            id: authData.user.id,
                            email: authData.user.email,
                            name: profile?.store_name || profile?.full_name || 'Merchant',
                            role: profile?.role || 'vendor',
                            onboardingCompleted: profile?.onboarding_completed || false
                        };
                    } else if (authError) {
                        console.warn("Supabase Auth sign-in failed:", authError.message);
                    }
                } catch (e) {
                    console.warn("Supabase Auth sign-in error during credentials login", e);
                }

                return null;
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            // Google OAuth Sign-in profile sync
            if (account?.provider === 'google') {
                try {
                    const { data: existingUser } = await supabaseAdmin
                        .from('profiles')
                        .select('*')
                        .eq('email', user.email)
                        .single();

                    if (!existingUser) {
                        // Create profile for Google sign-in
                        await supabaseAdmin
                            .from('profiles')
                            .insert([
                                {
                                    id: user.id, 
                                    email: user.email,
                                    full_name: user.name,
                                    avatar_url: user.image,
                                    role: 'user', 
                                    created_at: new Date().toISOString(),
                                }
                            ]);
                    }
                } catch (error) {
                    console.error("SignIn Callback Supabase Sync Error:", error);
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.onboardingCompleted = (user as any).onboardingCompleted;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // @ts-ignore
                session.user.role = token.role || 'user';
                // @ts-ignore
                session.user.onboardingCompleted = token.onboardingCompleted ?? false;
            }

            if (session.user?.email) {
                try {
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
                    } else {
                        // Fallback to local files if Supabase is offline
                        const localUsers = getLocalUsers();
                        const localUser = localUsers.find((u: any) => u.email.toLowerCase() === session.user?.email?.toLowerCase());
                        if (localUser) {
                            // @ts-ignore
                            session.user.role = localUser.role;
                            // @ts-ignore
                            session.user.onboardingCompleted = true;
                        }
                    }
                } catch (e) {
                    // Fallback to local files if Supabase has network issues
                    const localUsers = getLocalUsers();
                    const localUser = localUsers.find((u: any) => u.email.toLowerCase() === session.user?.email?.toLowerCase());
                    if (localUser) {
                        // @ts-ignore
                        session.user.role = localUser.role;
                        // @ts-ignore
                        session.user.onboardingCompleted = true;
                    }
                }
            }
            return session;
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
