import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lastfm.freetls.fastly.net",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
    ],
  },
  allowedDevOrigins: ['192.168.68.51']
};

export default nextConfig;
