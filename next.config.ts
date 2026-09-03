import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "16mb",
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "**.localhost",
    "**.cursor.com",
    "**.cursor.sh",
    "**.cursorusercontent.com",
  ],
};

export default nextConfig;
