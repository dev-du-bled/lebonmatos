import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pamnpsd1fq.ufs.sh",
                pathname: "/f/*",
            },
        ],
    },
};

export default nextConfig;
