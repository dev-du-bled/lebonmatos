import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { captcha, username } from "better-auth/plugins";

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
  emailAndPassword: {
    enabled: true,
  },
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
    captcha({
      provider: "google-recaptcha",
      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY!,
      minScore: 0.5, // Minimum score for reCAPTCHA v3 (0.0 to 1.0)
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
