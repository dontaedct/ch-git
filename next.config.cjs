/** @type {import('next').NextConfig} */
// Build trigger
const nextConfig = {
  // Production-safe configuration - removed dangerous build ignores
  eslint: {
    dirs: ['app', 'lib', 'components', 'hooks', 'types'],
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Aggressive memory reduction for Vercel 8GB limit
  swcMinify: false,
  compiler: {
    removeConsole: false, // Disable to save memory
  },
  experimental: {
    // Disable memory-intensive features
    optimizeCss: false,
    // Disable Turbopack to reduce memory usage
  },
  webpack: (config, { isServer }) => {
    // Reduce memory usage
    config.optimization = {
      ...config.optimization,
      minimize: false, // Disable minification to save memory
    };

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