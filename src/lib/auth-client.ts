import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const createClient = () =>
    createAuthClient({
        plugins: [usernameClient()],
    });

type AuthClient = ReturnType<typeof createClient>;

const globalForAuth = globalThis as unknown as {
    authClient: AuthClient;
};

export const authClient: AuthClient =
    globalForAuth.authClient || createClient();

if (process.env.NODE_ENV !== "production") globalForAuth.authClient = authClient;

export const { useSession, signIn, signOut } = authClient;
