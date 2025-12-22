import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

loadEnvConfig(process.cwd());

export default defineConfig({
    schema: path.join("prisma", "schema", "schema.prisma"),
    migrations: {
        path: path.join("prisma", "schema", "migrations"),
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});
