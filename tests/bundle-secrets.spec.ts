/**
 * Bundle Secrets Test
 * 
 * Tests that ensure server-only environment variables do not leak into client bundles.
 * This is a critical security test for preventing secrets from being exposed to users.
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
  '__NEXT_TURBOPACK_PERSISTENT_CACHE',
];

function getAllowedEnvs() {
  return [...ALLOWED_CLIENT_ENVS, ...SAFE_NODE_ENVS];
}

function analyzeBundleForSecrets(bundlePath: string) {
  if (!existsSync(bundlePath)) {
    return { leaks: [], warnings: [] };
  }

  const content = readFileSync(bundlePath, 'utf8');
  const leaks: Array<{ env: string; count: number; file: string; type: string }> = [];
  const warnings: Array<{ env: string; file: string; type: string }> = [];

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

function findClientBundles() {
  const buildDir = '.next';
  const staticDir = join(buildDir, 'static');
  
  if (!existsSync(buildDir)) {
    throw new Error('Build directory not found. Run "npm run build" first.');
  }

  const jsFiles: string[] = [];
  
  // Find all JS files in static directory (client bundles)
  if (existsSync(staticDir)) {
    try {
      // Use Node.js fs to recursively find JS files
      function findJsFiles(dir: string): string[] {
        const fs = require('fs');
        const path = require('path');
        const files: string[] = [];
        
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            files.push(...findJsFiles(fullPath));
          } else if (item.endsWith('.js')) {
            files.push(fullPath);
          }
        }
        
        return files;
      }
      
      jsFiles.push(...findJsFiles(staticDir));
    } catch (error) {
      console.warn('Could not find JS files automatically:', error);
    }
  }

  return jsFiles;
}

describe('Bundle Secrets Guard', () => {
  beforeAll(() => {
    // Ensure we have a build to analyze
    if (!existsSync('.next')) {
      console.log('Building project for bundle analysis...');
      execSync('npm run build', { stdio: 'inherit' });
    }
  });

  describe('Client Bundle Analysis', () => {
    it('should not contain server-only environment variables', () => {
      const clientBundles = findClientBundles();
      
      if (clientBundles.length === 0) {
        console.warn('No client bundles found to analyze');
        return;
      }

      let totalLeaks: Array<{ env: string; count: number; file: string; type: string }> = [];
      let totalWarnings: Array<{ env: string; file: string; type: string }> = [];

      // Analyze each client bundle
      for (const bundle of clientBundles) {
        const result = analyzeBundleForSecrets(bundle);
        totalLeaks.push(...result.leaks);
        totalWarnings.push(...result.warnings);
      }

      // Generate detailed report for failures
      if (totalLeaks.length > 0) {
        const leakGroups: Record<string, Array<{ env: string; count: number; file: string; type: string }>> = {};
        for (const leak of totalLeaks) {
          if (!leakGroups[leak.env]) {
            leakGroups[leak.env] = [];
          }
          leakGroups[leak.env].push(leak);
        }

        let report = '\n🚨 CRITICAL: Server-only environment variables found in client bundles:\n';
        for (const [env, instances] of Object.entries(leakGroups)) {
          report += `\n  ${env}:\n`;
          for (const instance of instances) {
            report += `    - ${instance.file} (${instance.count} occurrences)\n`;
          }
        }
        
        report += '\n💡 Fix by:\n';
        report += '1. Using @lib/env functions instead of direct process.env access\n';
        report += '2. Moving server-only code to API routes or server components\n';
        report += '3. Adding "use server" directive for server actions\n';
        
        throw new Error(report);
      }

      // Log warnings but don't fail the test
      if (totalWarnings.length > 0) {
        const warningGroups: Record<string, Array<{ env: string; file: string; type: string }>> = {};
        for (const warning of totalWarnings) {
          if (!warningGroups[warning.env]) {
            warningGroups[warning.env] = [];
          }
          warningGroups[warning.env].push(warning);
        }

        console.warn('\n⚠️  WARNINGS: Unknown environment variables found:');
        for (const [env, instances] of Object.entries(warningGroups)) {
          console.warn(`\n  ${env}:`);
          for (const instance of instances) {
            console.warn(`    - ${instance.file}`);
          }
        }
      }

      expect(totalLeaks).toHaveLength(0);
    });

    it('should only contain allowed environment variables', () => {
      const clientBundles = findClientBundles();
      
      if (clientBundles.length === 0) {
        console.warn('No client bundles found to analyze');
        return;
      }

      const allowedEnvs = getAllowedEnvs();
      const foundEnvs = new Set<string>();

      // Collect all environment variables found in client bundles
      for (const bundle of clientBundles) {
        const content = readFileSync(bundle, 'utf8');
        const processEnvRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
        let match;
        
        while ((match = processEnvRegex.exec(content)) !== null) {
          foundEnvs.add(match[1]);
        }
      }

      // Check that all found envs are allowed
      const unauthorizedEnvs = Array.from(foundEnvs).filter(env => !allowedEnvs.includes(env));
      
      if (unauthorizedEnvs.length > 0) {
        throw new Error(
          `Unauthorized environment variables found in client bundles: ${unauthorizedEnvs.join(', ')}\n` +
          'Add them to ALLOWED_CLIENT_ENVS or SERVER_ONLY_ENVS arrays in this test.'
        );
      }

      expect(unauthorizedEnvs).toHaveLength(0);
    });
  });

  describe('Environment Variable Classification', () => {
    it('should have all server-only envs properly classified', () => {
      // This test ensures our classification is complete
      const allEnvs = [...SERVER_ONLY_ENVS, ...ALLOWED_CLIENT_ENVS, ...SAFE_NODE_ENVS];
      const uniqueEnvs = new Set(allEnvs);
      
      // Check for duplicates
      expect(allEnvs.length).toBe(uniqueEnvs.size);
      
      // Check for overlaps between server-only and allowed client
      const overlap = SERVER_ONLY_ENVS.filter(env => ALLOWED_CLIENT_ENVS.includes(env));
      expect(overlap).toHaveLength(0);
    });

    it('should have comprehensive coverage of known envs', () => {
      // Add any new environment variables found in the codebase to the appropriate arrays
      const knownEnvs = [
        // Server-only (should be in SERVER_ONLY_ENVS)
        'SUPABASE_SERVICE_ROLE_KEY',
        'RESEND_API_KEY',
        'CRON_SECRET',
        'SENTRY_DSN',
        'OPENAI_API_KEY',
        'AI_PROVIDER',
        'AI_MODEL',
        'AI_TEMPERATURE',
        'AI_MAX_TOKENS',

        'AI_ENABLED',
        
        // Client-allowed (should be in ALLOWED_CLIENT_ENVS)
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
        
        // Safe Node (should be in SAFE_NODE_ENVS)
        'NODE_ENV',
        'VERCEL_ENV',
        'CI',
      ];

      const classifiedEnvs = [...SERVER_ONLY_ENVS, ...ALLOWED_CLIENT_ENVS, ...SAFE_NODE_ENVS];
      
      for (const env of knownEnvs) {
        expect(classifiedEnvs).toContain(env);
      }
    });
  });
});
