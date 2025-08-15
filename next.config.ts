import type { NextConfig } from "next";
import createBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';

const withAnalyzer = createBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

// Build-time environment validation
if (process.env.NODE_ENV === 'production') {
  if (process.env.NEXT_PUBLIC_SAFE_MODE === '1') {
    throw new Error('SAFE_MODE must be 0 in production builds');
  }
}

const nextConfig: NextConfig = {
  // Build performance optimizations
  compress: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Enable webpack 5 persistent caching
    webpackBuildWorker: true,
    
    // Optimize package imports
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react']
  },

  // Webpack optimizations for build performance
  webpack: (config, { dev, isServer, webpack }) => {
    // Enable webpack 5 persistent caching
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(process.cwd(), '.next/cache/webpack'),
      maxAge: 172800000, // 2 days
      compression: 'gzip',
      hashAlgorithm: 'xxhash64'
    };

    // Parallel processing optimizations
    config.parallelism = Math.max(1, (require('os').cpus().length || 1) - 1);
    
    // Module resolution optimizations
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      },
      // Cache module resolution
      cacheWithContext: false,
      // Optimize module resolution
      symlinks: false
    };

    // Build performance optimizations
    if (!dev) {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        // Enable tree shaking
        usedExports: true,
        sideEffects: false,
        // Split chunks optimization
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'initial'
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              chunks: 'initial',
              reuseExistingChunk: true
            }
          }
        },
        // Minimizer optimizations
        minimize: true,
        minimizer: [
          new webpack.optimize.ModuleConcatenationPlugin(),
          new webpack.optimize.AggressiveMergingPlugin()
        ]
      };
    }

    // Fix for Next.js 15 module compatibility
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'exports': 'commonjs exports',
        'module': 'commonjs module',
        'require': 'commonjs require'
      });
    }
    
    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ],
      },
    ];
  },

  // Remove Supabase from transpilePackages to prevent server bundling
  transpilePackages: [],
};

export default withAnalyzer(nextConfig);
