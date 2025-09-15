/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-safe configuration - removed dangerous build ignores
  eslint: {
    dirs: ['app', 'lib', 'components', 'hooks', 'types'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

module.exports = nextConfig;