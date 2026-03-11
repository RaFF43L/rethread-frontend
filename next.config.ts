import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/products/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4566',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
    unoptimized: process.env.NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION === 'false',
  },
  compress: true,
  reactStrictMode: true,
};

export default nextConfig;
