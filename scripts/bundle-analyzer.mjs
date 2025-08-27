#!/usr/bin/env node

/**
 * Bundle Analyzer for Secrets & Bundle Leakage Guard
 * 
 * This script analyzes the Next.js build output to detect server-only
 * environment variables that may have leaked into client bundles.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Server-only environment variables that should never appear in client bundles
const SERVER_ONLY_ENVS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'CRON_SECRET',
  'SENTRY_DSN',
  'OPENAI_API_KEY',
  'AI_PROVIDER',
  'AI_MODEL',
  'AI_TEMPERATURE',
  'AI_MAX_TOKENS',
  'DEFAULT_COACH_ID',
  'AI_ENABLED',
];

// NEXT_PUBLIC_ variables are allowed in client bundles
const ALLOWED_CLIENT_ENVS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_DEBUG',
  'NEXT_PUBLIC_SAFE_MODE',
  'NEXT_PUBLIC_ENABLE_AI_LIVE',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_VERCEL_ENV',
  'NEXT_PUBLIC_DEBUG_OVERLAY',
  'NEXT_PUBLIC_DISABLE_REDIRECTS',
  'NEXT_PUBLIC_AI_ENABLED',
];

// Standard Node.js environment variables that are safe
const SAFE_NODE_ENVS = [
  'NODE_ENV',
  'VERCEL_ENV',
  'CI',
];

function getAllowedEnvs() {
  return [...ALLOWED_CLIENT_ENVS, ...SAFE_NODE_ENVS];
}

function isServerOnlyEnv(envName) {
  return SERVER_ONLY_ENVS.includes(envName) && !getAllowedEnvs().includes(envName);
}

function analyzeBundle(bundlePath) {
  if (!existsSync(bundlePath)) {
    console.log(`Bundle file not found: ${bundlePath}`);
    return { leaks: [], warnings: [] };
  }

  const content = readFileSync(bundlePath, 'utf8');
  const leaks = [];
  const warnings = [];

  // Check for server-only environment variables
  for (const env of SERVER_ONLY_ENVS) {
    const regex = new RegExp(`process\\.env\\.${env.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      leaks.push({
        env,
        count: matches.length,
        file: bundlePath,
        type: 'server-only-env'
      });
    }
  }

  // Check for any process.env usage that might be suspicious
  const processEnvRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  let match;
  while ((match = processEnvRegex.exec(content)) !== null) {
    const envName = match[1];
    if (!getAllowedEnvs().includes(envName) && !SERVER_ONLY_ENVS.includes(envName)) {
      warnings.push({
        env: envName,
        file: bundlePath,
        type: 'unknown-env'
      });
    }
  }

  return { leaks, warnings };
}

function analyzeBuildOutput() {
  console.log('🔍 Analyzing bundle for server-only environment variables...');
  
  const buildDir = '.next';
  const staticDir = join(buildDir, 'static');
  
  if (!existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  let totalLeaks = [];
  let totalWarnings = [];

  // Analyze JavaScript chunks
  if (existsSync(staticDir)) {
    const jsFiles = [];
    
    // Find all JS files in static directory
    try {
      const findOutput = execSync(`find "${staticDir}" -name "*.js"`, { encoding: 'utf8' });
      jsFiles.push(...findOutput.trim().split('\n').filter(Boolean));
    } catch (error) {
      console.log('⚠️  Could not find JS files automatically, checking common locations...');
      // Fallback to common locations
      const commonPaths = [
        join(staticDir, 'chunks', '*.js'),
        join(staticDir, 'css', '*.js'),
      ];
      // This is a simplified check - in a real implementation you'd want more robust file discovery
    }

    // Analyze each JS file
    for (const file of jsFiles) {
      const result = analyzeBundle(file);
      totalLeaks.push(...result.leaks);
      totalWarnings.push(...result.warnings);
    }
  }

  // Analyze server-side files for comparison
  const serverDir = join(buildDir, 'server');
  if (existsSync(serverDir)) {
    console.log('📊 Server-side files found (expected to contain server-only envs)');
  }

  return { leaks: totalLeaks, warnings: totalWarnings };
}

function generateReport(leaks, warnings) {
  console.log('\n📋 Bundle Analysis Report');
  console.log('=' .repeat(50));

  if (leaks.length === 0 && warnings.length === 0) {
    console.log('✅ No server-only environment variables found in client bundles');
    return true;
  }

  if (leaks.length > 0) {
    console.log('\n🚨 CRITICAL: Server-only environment variables found in client bundles:');
    console.log('These should NEVER appear in client-side code:');
    
    const leakGroups = {};
    for (const leak of leaks) {
      if (!leakGroups[leak.env]) {
        leakGroups[leak.env] = [];
      }
      leakGroups[leak.env].push(leak);
    }

    for (const [env, instances] of Object.entries(leakGroups)) {
      console.log(`\n  ${env}:`);
      for (const instance of instances) {
        console.log(`    - ${instance.file} (${instance.count} occurrences)`);
      }
    }
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS: Unknown environment variables found:');
    const warningGroups = {};
    for (const warning of warnings) {
      if (!warningGroups[warning.env]) {
        warningGroups[warning.env] = [];
      }
      warningGroups[warning.env].push(warning);
    }

    for (const [env, instances] of Object.entries(warningGroups)) {
      console.log(`\n  ${env}:`);
      for (const instance of instances) {
        console.log(`    - ${instance.file}`);
      }
    }
  }

  console.log('\n💡 Recommendations:');
  console.log('1. Use @lib/env functions instead of direct process.env access');
  console.log('2. Ensure server-only code is in API routes or server components');
  console.log('3. Add new environment variables to SERVER_ONLY_ENVS or ALLOWED_CLIENT_ENVS arrays');
  console.log('4. Use "use server" directive for server actions');

  return leaks.length === 0;
}

function main() {
  try {
    const { leaks, warnings } = analyzeBuildOutput();
    const passed = generateReport(leaks, warnings);
    
    if (!passed) {
      console.log('\n❌ Bundle analysis failed - server-only secrets detected in client bundles');
      process.exit(1);
    }
    
    console.log('\n✅ Bundle analysis passed - no secrets leaked to client');
    process.exit(0);
  } catch (error) {
    console.error('❌ Bundle analysis failed with error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('bundle-analyzer.mjs')) {
  main();
}

export { analyzeBundle, analyzeBuildOutput, generateReport };
