import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - added to bypass CORS issues on dev server for local IP
  allowedDevOrigins: ['192.168.0.135'],
};

export default nextConfig;
