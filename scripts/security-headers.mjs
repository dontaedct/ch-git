#!/usr/bin/env node

/**
 * Security Headers Validation Script
 * 
 * Validates security headers for key routes to ensure CSP and other security
 * headers are properly configured in production vs preview environments.
 * 
 * Usage: npm run security:headers
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const ROUTES_TO_TEST = [
  '/',
  '/operability', 
  '/sessions',
  '/api/env-check',
  '/api/weekly-recap'
];

const REQUIRED_HEADERS = [
  'x-content-type-options',
  'x-frame-options', 
  'x-xss-protection',
  'referrer-policy',
  'permissions-policy'
];

const CSP_HEADERS = [
  'content-security-policy',
  'content-security-policy-report-only'
];

async function startDevServer() {
  console.log('🚀 Starting development server...');
  
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true
    });
    
    let resolved = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') && !resolved) {
        resolved = true;
        console.log('✅ Development server ready');
        resolve(server);
      }
    });
    
    server.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Error') && !resolved) {
        resolved = true;
        reject(new Error(`Server error: ${output}`));
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(30000).then(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Server startup timeout'));
      }
    });
  });
}

async function testRouteHeaders(route) {
  const url = `http://localhost:3000${route}`;
  console.log(`\n🔍 Testing ${route}...`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Security-Headers-Test/1.0'
      }
    });
    
    const headers = Object.fromEntries(
      Array.from(response.headers.entries()).map(([key, value]) => [key.toLowerCase(), value])
    );
    
    console.log(`   Status: ${response.status}`);
    
    // Check required security headers
    const missingHeaders = [];
    for (const header of REQUIRED_HEADERS) {
      if (headers[header]) {
        console.log(`   ✅ ${header}: ${headers[header]}`);
      } else {
        console.log(`   ❌ ${header}: MISSING`);
        missingHeaders.push(header);
      }
    }
    
    // Check CSP headers
    const cspHeader = headers['content-security-policy'] || headers['content-security-policy-report-only'];
    if (cspHeader) {
      console.log(`   ✅ CSP: ${cspHeader.substring(0, 100)}...`);
      
      // Validate CSP content
      const hasUnsafeInline = cspHeader.includes("'unsafe-inline'");
      const hasUnsafeEval = cspHeader.includes("'unsafe-eval'");
      const isReportOnly = headers['content-security-policy-report-only'];
      
      if (isReportOnly) {
        console.log(`   📊 CSP Report-Only mode (preview environment)`);
      } else {
        console.log(`   🔒 CSP Enforcement mode (production environment)`);
      }
      
      if (hasUnsafeInline && !isReportOnly) {
        console.log(`   ⚠️  WARNING: Production CSP contains 'unsafe-inline'`);
      }
      if (hasUnsafeEval && !isReportOnly) {
        console.log(`   ⚠️  WARNING: Production CSP contains 'unsafe-eval'`);
      }
    } else {
      console.log(`   ❌ CSP: MISSING`);
    }
    
    return {
      route,
      status: response.status,
      missingHeaders,
      hasCsp: !!cspHeader,
      cspContent: cspHeader
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      route,
      error: error.message
    };
  }
}

async function main() {
  console.log('🔐 Security Headers Validation');
  console.log('================================');
  
  let server;
  
  try {
    // Start development server
    server = await startDevServer();
    
    // Wait a bit for server to be fully ready
    await setTimeout(2000);
    
    // Test each route
    const results = [];
    for (const route of ROUTES_TO_TEST) {
      const result = await testRouteHeaders(route);
      results.push(result);
    }
    
    // Summary
    console.log('\n📊 Summary');
    console.log('==========');
    
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    const withMissingHeaders = results.filter(r => r.missingHeaders && r.missingHeaders.length > 0);
    const withoutCsp = results.filter(r => !r.hasCsp);
    
    console.log(`✅ Successful requests: ${successful.length}/${results.length}`);
    console.log(`❌ Failed requests: ${failed.length}`);
    console.log(`⚠️  Missing headers: ${withMissingHeaders.length}`);
    console.log(`🔒 CSP coverage: ${results.length - withoutCsp.length}/${results.length}`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed routes:');
      failed.forEach(r => console.log(`   ${r.route}: ${r.error}`));
    }
    
    if (withMissingHeaders.length > 0) {
      console.log('\n⚠️  Routes with missing headers:');
      withMissingHeaders.forEach(r => {
        console.log(`   ${r.route}: ${r.missingHeaders.join(', ')}`);
      });
    }
    
    if (withoutCsp.length > 0) {
      console.log('\n🔒 Routes without CSP:');
      withoutCsp.forEach(r => console.log(`   ${r.route}`));
    }
    
    // Exit with error code if there are issues
    if (failed.length > 0 || withMissingHeaders.length > 0 || withoutCsp.length > 0) {
      console.log('\n❌ Security headers validation failed');
      process.exit(1);
    } else {
      console.log('\n✅ All security headers validation passed');
      process.exit(0);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    if (server) {
      console.log('\n🛑 Stopping development server...');
      server.kill();
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminated');
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
