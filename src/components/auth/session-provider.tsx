"use client";

import { authClient } from "@/lib/auth-client";
import { createContext, useContext, ReactNode } from "react";

type Session = typeof authClient.$Infer.Session;

interface SessionContextType {
    session: Session | null | undefined;
    isPending: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({
    children,
    initialSession,
}: {
    children: ReactNode;
    initialSession?: Session | null;
}) {
    const { data: session, isPending, error, refetch } = authClient.useSession();

    return (
        <SessionContext.Provider
            value={{
                session: isPending ? initialSession : session,
                isPending,
                error,
                refetch,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        // Fallback to the direct hook if not wrapped in provider
        const { data: session, isPending, error, refetch } = authClient.useSession();
        return { session, isPending, error, refetch };
    }
    return context;
}
