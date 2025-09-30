/**
 * Development Configuration
 * Optimizations for faster development server startup
 */

// Set development optimizations
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.SKIP_TOKENS = 'true';
process.env.FAST_REFRESH = 'true';
process.env.NEXT_PRIVATE_SKIP_SIZE_LIMIT = '1';

// Performance optimizations
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

export default {
  // Development-specific settings
  skipTokenBuilding: true,
  fastRefresh: true,
  telemetryDisabled: true,
};
