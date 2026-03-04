import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { admin, captcha, username } from "better-auth/plugins";

const forbiddenUsernames = [
    "admin",
    "root",
    "super",
    "moderator",
    "user",
    "guest",
    "test",
    "demo",
    "example",
];

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins:
        process.env.NODE_ENV === "development"
            ? (request) => [request?.headers.get("origin") ?? ""]
            : [
                  "http://localhost:3000",
                  ...(process.env.NEXT_PUBLIC_APP_URL
                      ? [process.env.NEXT_PUBLIC_APP_URL]
                      : []),
              ],
    plugins: [
        username({
            minUsernameLength: 5,
            maxUsernameLength: 32,
            usernameValidator: (username) => {
                return (
                    /^[a-zA-Z0-9_.]+$/.test(username) &&
                    !forbiddenUsernames.includes(username)
                );
            },
        }),
        admin(),
        ...(process.env.NODE_ENV === "production" // ReCaptcha en prod seulement
            ? [
                  captcha({
                      provider: "google-recaptcha",
                      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY!,
                      minScore: 0.5,
                  }),
              ]
            : []),
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    advanced: { database: { generateId: () => crypto.randomUUID() } },
    user: {
        deleteUser: {
            enabled: true,
        },
    },
});
