import { auth } from "@/lib/auth";
import { execSync } from "child_process";

export const TEST_USER = {
    name: "Test Login",
    username: "testlogin",
    email: "testlogin@example.com",
    password: "testpassword",
};

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export default async function globalSetup() {
    console.log("[Setup] Pushing database schema...");
    execSync("bun prisma db push", { stdio: "pipe" });

    console.log("[Setup] Generating prisma client...");
    execSync("bun prisma generate", { stdio: "pipe" });

    console.log("[Setup] Seeding components data...");
    execSync("bun ./prisma/seed/data.ts", { stdio: "pipe" });

    console.log("[Setup] Creating test user...");
    await auth.api.signUpEmail({
        body: {
            name: TEST_USER.name,
            username: TEST_USER.username,
            email: TEST_USER.email,
            password: TEST_USER.password,
        },
        headers: {
            "Content-Type": "application/json",
            Origin: BASE_URL,
        },
    });

    console.log("[Setup] Test setup complete.");
}
