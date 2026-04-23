/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: false,

  // Fix workspace root detection
  outputFileTracingRoot: path.join(__dirname, '..'),

  // Don't fail production builds on lint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Don't fail on TypeScript errors in production
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: 'hankgamgdgodxtpwflpn.supabase.co' },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Webpack configuration
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },

  // Optimize chunk loading
  experimental: {
    optimizePackageImports: ['@/components', '@/services', '@/utils'],
  },

  // Increase chunk timeout for slow networks
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Allow cross-origin chunk loading for network IPs
  // This fixes "Loading chunk failed" errors when accessing from different origins
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',

  // Ensure chunks are properly generated
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;