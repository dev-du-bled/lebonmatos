import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

loadEnvConfig(process.cwd());

export default defineConfig({
    schema: path.join("prisma", "schema"),
    migrations: {
        path: path.join("prisma", "schema", "migrations"),
    },
    engine: "classic",
    datasource: {
        url: env("DATABASE_URL"),
    },
});
