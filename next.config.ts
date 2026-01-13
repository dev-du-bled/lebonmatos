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
        ],
    },
    output: "standalone",
};

export default nextConfig;
