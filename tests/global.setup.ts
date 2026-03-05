import { execSync } from "child_process";

export default async function globalSetup() {
    console.log("[Setup] Pushing database schema...");
    execSync("NODE_ENV=development bun prisma db push", { stdio: "pipe" });

    console.log("[Setup] Generate prisma client...");
    execSync("bun prisma generate", { stdio: "pipe" });

    console.log("[Setup] Seeding components data...");
    execSync("bun ./prisma/seed/data.ts", { stdio: "pipe" });

    console.log("[Setup] Seeding mock data...");
    execSync("bun ./prisma/seed/mock-data.ts", { stdio: "pipe" });

    console.log("[Setup] Test setup complete.");
}
