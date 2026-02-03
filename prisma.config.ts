import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

const nodeEnv = process.env.NODE_ENV || "development";
loadEnvConfig(process.cwd(), nodeEnv !== "production");

export default defineConfig({
    schema: path.join("prisma", "schema"),
    migrations: {
        path: path.join("prisma", "schema", "migrations"),
        seed: path.join("prisma", "seed", "data.ts"),
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});
