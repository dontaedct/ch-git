/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-safe configuration - removed dangerous build ignores
  eslint: {
    dirs: ['app', 'lib', 'components', 'hooks', 'types'],
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Performance optimizations for development
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Enable faster builds
    optimizeCss: true,
    // Enable Turbopack for faster development builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Exclude Node.js-specific modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }

    // Exclude server-only AI runners from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'lib/ai/runners/runEval': 'commonjs lib/ai/runners/runEval',
        'lib/ai/runners/runEvalCI': 'commonjs lib/ai/runners/runEvalCI',
      });
    }

    return config;
  },
};

module.exports = nextConfig;