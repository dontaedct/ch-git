#!/usr/bin/env tsx

/**
 * Environment validation script for CI/CD
 * 
 * This script validates that all required environment variables are present
 * and properly configured for the current environment context.
 * 
 * Usage:
 *   npm run check:env                    # Check current environment
 *   npm run check:env -- --ci           # CI mode with dummy placeholders
 *   npm run check:env -- --production   # Production validation
 * 
 * Universal Header: @scripts/check-env
 */

import { validateCriticalEnv } from "../lib/config/requireEnv.js";

interface CheckEnvOptions {
  ci: boolean;
  production: boolean;
  verbose: boolean;
  help: boolean;
}

function parseArgs(): CheckEnvOptions {
  const args = process.argv.slice(2);
  
  return {
    ci: args.includes("--ci"),
    production: args.includes("--production"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    help: args.includes("--help") || args.includes("-h"),
  };
}

function printHelp() {
  console.log(`
Environment Validation Script

Usage:
  npm run check:env [options]

Options:
  --ci           Run in CI mode (uses dummy placeholders)
  --production   Validate for production environment
  --verbose, -v  Show detailed output
  --help, -h     Show this help message

Examples:
  npm run check:env                    # Check current environment
  npm run check:env -- --ci           # CI mode validation
  npm run check:env -- --production   # Production validation
  npm run check:env -- --verbose      # Detailed output
`);
}

function setupCIMode() {
  console.log("🔧 Setting up CI mode with dummy environment variables...");
  
  // Set dummy values for CI validation
  const dummyEnvVars = {
    NODE_ENV: "test",
    NEXT_PUBLIC_SUPABASE_URL: "https://dummy.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "dummy-anon-key-for-ci",
    SENTRY_DSN: "https://dummy@sentry.io/123456",
    RESEND_API_KEY: "dummy-resend-key-for-ci",
    RESEND_FROM: "test@example.com",
  };
  
  for (const [key, value] of Object.entries(dummyEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  
  console.log("✅ CI mode environment variables set");
}

function main() {
  const options = parseArgs();
  
  if (options.help) {
    printHelp();
    process.exit(0);
  }
  
  console.log("🔍 Environment Validation Check");
  console.log("================================\n");
  
  // Show current environment context
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv) {
    console.warn('⚠️  NODE_ENV environment variable is not set');
  }
  console.log(`Environment: ${nodeEnv || "not-set"}`);
  console.log(`CI Mode: ${options.ci ? "enabled" : "disabled"}`);
  console.log(`Production Mode: ${options.production ? "enabled" : "disabled"}`);
  console.log("");
  
  // Setup CI mode if requested
  if (options.ci) {
    setupCIMode();
  }
  
  // Override NODE_ENV for production validation
  if (options.production) {
    process.env.NODE_ENV = "production";
    console.log("🔧 Overriding NODE_ENV to 'production' for validation");
  }
  
  try {
    // Run environment validation
    const result = validateCriticalEnv({
      throwOnError: false,
      skipInTest: !options.ci, // Don't skip in CI mode
    });
    
    console.log("\n📋 Validation Results");
    console.log("=====================");
    
    if (result.isValid) {
      console.log("✅ Environment validation PASSED");
      
      if (result.warnings.length > 0) {
        console.log("\n⚠️  Warnings:");
        result.warnings.forEach(warning => {
          console.log(`   - ${warning}`);
        });
      }
      
      if (options.verbose) {
        console.log("\n📊 Environment Summary:");
        console.log(`   - Node Environment: ${process.env.NODE_ENV}`);
        console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}`);
        console.log(`   - Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}`);
        console.log(`   - Sentry DSN: ${process.env.SENTRY_DSN ? "✅ Set" : "❌ Missing"}`);
        console.log(`   - Resend API: ${process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing"}`);
        console.log(`   - Resend From: ${process.env.RESEND_FROM ? "✅ Set" : "❌ Missing"}`);
      }
      
      console.log("\n🎉 All environment checks passed!");
      process.exit(0);
      
    } else {
      console.log("❌ Environment validation FAILED");
      
      console.log("\n🚨 Errors:");
      result.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
      
      if (result.warnings.length > 0) {
        console.log("\n⚠️  Warnings:");
        result.warnings.forEach(warning => {
          console.log(`   - ${warning}`);
        });
      }
      
      console.log("\n💡 Next Steps:");
      console.log("   1. Copy env.example to .env.local");
      console.log("   2. Fill in the required environment variables");
      console.log("   3. Run this check again");
      
      if (options.ci) {
        console.log("\n🔧 CI Mode: This is expected in CI environments");
        console.log("   Make sure your deployment platform has the required env vars set");
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error("\n💥 Validation script error:", error);
    process.exit(1);
  }
}

// Run the script
main();
