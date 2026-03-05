import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";

const createClient = () =>
    createAuthClient({
        plugins: [usernameClient(), adminClient()],
    });

type AuthClient = ReturnType<typeof createClient> & {
    requestPasswordReset: (params: {
        email: string;
        redirectTo: string;
    }) => Promise<{ data: unknown; error: unknown }>;
};

const globalForAuth = globalThis as unknown as {
    authClient: AuthClient;
};

export const authClient: AuthClient =
    globalForAuth.authClient || createClient();

if (process.env.NODE_ENV !== "production")
    globalForAuth.authClient = authClient;

export const { useSession, signIn, signOut } = authClient;
