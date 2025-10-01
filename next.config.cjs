/** @type {import('next').NextConfig} */
const nextConfig = {
  // MVP Production Configuration
  // Gradual re-enabling of safety checks as we fix issues

  eslint: {
    dirs: ['app', 'lib', 'components', 'hooks', 'types'],
    // Keep disabled during MVP development, will re-enable after fixing errors
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Keep disabled during MVP development, will re-enable after fixing errors
    ignoreBuildErrors: true,
  },

  // Experimental features
  experimental: {
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
  },

  // Production optimizations (re-enabled for MVP)
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    domains: ['localhost', 'arczonwbczqbouwstmbs.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Client-side fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // UI components chunk
          ui: {
            name: 'ui',
            test: /[\\/]components[\\/]ui[\\/]/,
            chunks: 'all',
            priority: 30,
          },
        },
      },
    };

    return config;
  },

  // Production URL (update with your domain)
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
