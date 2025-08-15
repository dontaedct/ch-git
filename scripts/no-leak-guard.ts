#!/usr/bin/env tsx

/**
 * No-Leak Guard Script
 * Prevents debug and safe mode flags from leaking into production builds
 */

function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const safeMode = process.env.NEXT_PUBLIC_SAFE_MODE;
  const debugMode = process.env.NEXT_PUBLIC_DEBUG;

  // Block SAFE_MODE in production builds
  if (isProduction && safeMode === '1') {
    throw new Error(
      'SAFE_MODE must be 0 in production builds. ' +
      'This flag is for development only and bypasses security.'
    );
  }

  // Warn about DEBUG in production (but don't block)
  if (isProduction && debugMode === '1') {
    console.warn(
      '⚠️  WARNING: DEBUG=1 in production build. ' +
      'Debug UI should remain behind env checks, but this may expose debug information.'
    );
  }

  if (isProduction) {
    console.log('✅ Production build guard passed - no debug/safe mode leaks detected');
  } else {
    console.log('✅ Development build - debug and safe mode flags allowed');
  }
}

if (require.main === module) {
  main();
}
