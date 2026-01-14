import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pamnpsd1fq.ufs.sh",
                pathname: "/f/*",
            },
            // source.unsplash re-implementation as the main thing is dead, used
            // by seeded test data from prisma/seed/mock-data.ts
            {
                protocol: "https",
                hostname:
                    "pinjasaur-unsplashsourcereimplementation.web.val.run",
            },
        ],
    },
    output: "standalone",
};

export default nextConfig;
