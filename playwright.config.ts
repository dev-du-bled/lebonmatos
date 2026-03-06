import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

if (!process.env.CI) {
    dotenv.config({ path: ".env.test", quiet: true });
}

export default defineConfig({
    testDir: "./tests",
    globalSetup: "./tests/global.setup.ts",
    globalTeardown: "./tests/global.teardown.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "bun run dev",
        url: "http://localhost:3000",
        stdout: "pipe",
        stderr: "pipe",
        timeout: 120_000,
        // reuseExistingServer: !process.env.CI,
    },
});
