const path = require('path');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Resolve Supabase realtime-js dependency warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Handle websocket factory import issues
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'ws': false,
        'encoding': false,
      };
    }

    // Optimize Supabase bundle
    config.optimization.splitChunks.cacheGroups.supabase = {
      test: /[\\/]node_modules[\\/](@supabase|supabase)[\\/]/,
      name: 'supabase',
      chunks: 'all',
      priority: 20,
    };

    // Handle critical dependency warnings
    config.module.rules.push({
      test: /node_modules[\\/]@supabase[\\/]realtime-js/,
      use: 'null-loader',
    });

    return config;
  },
  // Other Next.js config options...
  experimental: {
    // Enable modern features
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

module.exports = nextConfig;
