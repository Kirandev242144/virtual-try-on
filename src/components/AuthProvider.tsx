"use client";

import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import OnboardingModal from "./OnboardingModal";

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    // Pathname check logic removed as we are using a modal.

    // @ts-ignore
    const isUser = session?.user?.role === 'user' || !session?.user?.role;
    // @ts-ignore
    const onboardingCompleted = session?.user?.onboardingCompleted;

    const showOnboarding = session && isUser && !onboardingCompleted;

    return (
        <>
            {children}
            {showOnboarding && <OnboardingModal />}
        </>
    );
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthGuard>{children}</AuthGuard>
        </SessionProvider>
    );
}
