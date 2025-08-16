import type { NextConfig } from "next";
import createBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const withAnalyzer = createBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

// Build-time environment validation
if (process.env.NODE_ENV === 'production') {
  if (process.env.NEXT_PUBLIC_SAFE_MODE === '1') {
    throw new Error('SAFE_MODE must be 0 in production builds');
  }
}

// Performance budget configuration
const PERFORMANCE_BUDGETS = {
  maxEntrypointSize: 500 * 1024, // 500KB
  maxAssetSize: 300 * 1024, // 300KB
  hints: 'warning' as const
};

const nextConfig: NextConfig = {
  // Build performance optimizations
  compress: true,
  


  // Webpack optimizations for build performance
  webpack: (config, { dev, isServer, webpack }) => {
    // Enable webpack 5 persistent caching with enhanced settings
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(process.cwd(), '.next/cache/webpack'),
      maxAge: 172800000, // 2 days
      compression: 'gzip',
      hashAlgorithm: 'xxhash64',
      // Enhanced cache settings
      allowCollectingMemory: true,
      memoryCacheUnaffected: true,
      store: 'pack',
      maxMemoryGenerations: 1
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
      symlinks: false,
      // Enhanced module resolution
      preferRelative: true,
      mainFields: ['browser', 'module', 'main']
    };

    // Build performance optimizations
    if (!dev) {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        // Enable tree shaking
        usedExports: true,
        sideEffects: false,
        // Enhanced split chunks optimization
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          automaticNameDelimiter: '~',
          enforceSizeThreshold: 50000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
              name(module: any) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `vendor.${packageName.replace('@', '')}`;
              }
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: -20,
              chunks: 'initial',
              reuseExistingChunk: true
            },
            // React specific optimizations
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-vendor',
              priority: 10,
              chunks: 'all'
            },
            // UI library optimizations
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: 'ui-vendor',
              priority: 5,
              chunks: 'all'
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

      // Remove console statements in production
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          'console.log': '(() => {})',
          'console.debug': '(() => {})',
          'console.info': '(() => {})',
          'console.warn': '(() => {})',
          'console.error': '(() => {})'
        })
      );

      // Add bundle analyzer in production when ANALYZE is true
      if (process.env.ANALYZE === 'true') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-analysis.html',
            generateStatsFile: true,
            statsFilename: 'bundle-stats.json'
          })
        );
      }
    }

    // Development optimizations
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
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
      
      // Exclude client-side packages from server builds
      config.externals.push({
        '@supabase/realtime-js': 'commonjs @supabase/realtime-js',
        '@supabase/realtime-js/dist/module/lib/websocket-factory': 'commonjs @supabase/realtime-js/dist/module/lib/websocket-factory'
      });
      
      // Add polyfill for self global in server builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'self': false
      };
      
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'globalThis'
        })
      );
    }

    // Add build performance monitoring
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.ProgressPlugin((percentage, message, ...args) => {
        if (process.env.BUILD_VERBOSE === 'true') {
          console.log(`${Math.round(percentage * 100)}% ${message} ${args.join(' ')}`);
        }
      })
    );
    
    // Add performance budgets at webpack config level
    config.performance = PERFORMANCE_BUDGETS;
    
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

  // Output configuration for better performance
  output: 'standalone',
  
  // Enable SWC for faster builds
  swcMinify: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental optimizations
  experimental: {
    // Enable webpack 5 persistent caching
    webpackBuildWorker: true,
    
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip'
    ]
  }
};

export default withAnalyzer(nextConfig);
