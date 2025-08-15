const path = require('path');
const webpack = require('webpack');

module.exports = {
  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  // Optimization settings
  optimization: {
    // Enable tree shaking
    usedExports: true,
    sideEffects: false,
    
    // Split chunks optimization
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        // React specific optimizations
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        // UI library optimizations
        ui: {
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority)[\\/]/,
          name: 'ui-libs',
          chunks: 'all',
          priority: 15,
        }
      }
    },

    // Minimizer optimizations
    minimize: true,
    minimizer: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
    ]
  },

  // Resolve optimizations
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      // Path aliases for faster resolution
      '@': path.resolve(__dirname),
      '@app': path.resolve(__dirname, 'app'),
      '@components': path.resolve(__dirname, 'components'),
      '@lib': path.resolve(__dirname, 'lib'),
      '@ui': path.resolve(__dirname, 'components/ui')
    },
    // Cache module resolution
    cacheWithContext: false,
    symlinks: false
  },

  // Plugin optimizations
  plugins: [
    // Environment optimization
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    
    // Ignore warnings about size
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    })
  ],

  // Cache configuration
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    },
    cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
    maxAge: 172800000, // 2 days
    compression: 'gzip',
    hashAlgorithm: 'xxhash64'
  }
};
