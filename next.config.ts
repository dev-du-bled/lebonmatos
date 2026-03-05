import type { NextConfig } from "next";

const nodeEnv = process.env.NODE_ENV || "development";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    images: {
        remotePatterns: [
            // used by seeded test data from prisma/seed/mock-data.ts
            nodeEnv != "production"
                ? {
                      protocol: "https",
                      hostname: "**",
                  }
                : {
                      protocol: "https",
                      hostname: "pamnpsd1fq.ufs.sh",
                      pathname: "/f/*",
                  },
        ],
    },
    output: "standalone",
};

export default nextConfig;
