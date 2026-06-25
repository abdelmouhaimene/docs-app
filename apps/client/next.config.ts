import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@mui/x-data-grid', '@mui/material', '@mui/system', '@mui/icons-material'],
 eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
