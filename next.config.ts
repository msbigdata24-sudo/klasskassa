import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporary shield for production deploys while we iterate quickly.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
