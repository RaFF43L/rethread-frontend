import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
  // NOTE: /api/backend/* is intentionally NOT a rewrite. It is served by the
  // route handler at src/app/api/backend/[...path]/route.ts, which injects the
  // Bearer token from the HttpOnly session cookie before forwarding to the
  // backend. A plain rewrite could not read HttpOnly cookies to authenticate.
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
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
