import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["web-push"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
