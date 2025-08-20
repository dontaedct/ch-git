#!/usr/bin/env node

/**
 * Navigation/Auth Flow Smoke Test
 * Tests public vs protected routes across environments
 */

import { execSync } from 'child_process';
import https from 'https';
import http from 'http';

// Configuration
const CONFIG = {
  local: {
    base: 'http://localhost:3000',
    fallbacks: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003']
  },
  preview: {
    base: 'https://ch-9yvewqnb5-dontaedct-1785s-projects.vercel.app'
  }
};

// Test results storage
const results = {
  local: {},
  preview: {}
};

// Utility functions
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testEndpoint(env, path, expectedStatus = 200, expectedContent = null) {
  const base = CONFIG[env].base;
  const url = `${base}${path}`;
  
  try {
    const response = await makeRequest(url);
    const statusOk = response.status === expectedStatus;
    let contentOk = true;
    
    if (expectedContent) {
      contentOk = response.data.includes(expectedContent);
    }
    
    const result = statusOk && contentOk ? 'PASS' : 'FAIL';
    
    if (env === 'local') {
      results.local[path] = result;
    } else {
      results.preview[path] = result;
    }
    
    return { result, status: response.status, content: response.data.substring(0, 200) };
  } catch (error) {
    const result = 'FAIL';
    if (env === 'local') {
      results.local[path] = result;
    } else {
      results.preview[path] = result;
    }
    return { result, error: error.message };
  }
}

async function testLocalWithFallbacks() {
  console.log('🔍 Testing local environment...');
  
  // Try main port first
  try {
    await testEndpoint('local', '/api/health', 200, 'ok');
    return true;
  } catch (error) {
    console.log('⚠️  Port 3000 not responding, trying fallbacks...');
  }
  
  // Try fallback ports
  for (const fallback of CONFIG.local.fallbacks) {
    CONFIG.local.base = fallback;
    try {
      await testEndpoint('local', '/api/health', 200, 'ok');
      console.log(`✅ Using fallback port: ${fallback}`);
      return true;
    } catch (error) {
      console.log(`❌ ${fallback} not responding`);
    }
  }
  
  console.log('❌ No local ports responding');
  return false;
}

async function runSmokeTests() {
  console.log('🚀 Navigation/Auth Flow Smoke Test');
  console.log('=====================================\n');
  
  // Test local environment
  const localAvailable = await testLocalWithFallbacks();
  
  if (localAvailable) {
    console.log('\n📋 Testing local endpoints...');
    await testEndpoint('local', '/api/health', 200, 'ok');
    
    // Test probe with fallback logic
    let localProbeResult = await testEndpoint('local', '/probe', 200, '__probe OK');
    if (localProbeResult.result === 'FAIL') {
      console.log('⚠️  Local /probe failed, trying /api/probe fallback...');
      localProbeResult = await testEndpoint('local', '/api/probe', 200, '__probe OK');
    }
    
    await testEndpoint('local', '/', 200);
    await testEndpoint('local', '/intake', 200);
    await testEndpoint('local', '/client-portal', 200);
    await testEndpoint('local', '/sessions', 200);
  }
  
  // Test preview environment
  console.log('\n📋 Testing preview endpoints...');
  await testEndpoint('preview', '/api/health', 200, 'ok');
  
  // Test probe with fallback logic
  let probeResult = await testEndpoint('preview', '/probe', 200, '__probe OK');
  if (probeResult.result === 'FAIL') {
    console.log('⚠️  /probe failed, trying /api/probe fallback...');
    probeResult = await testEndpoint('preview', '/api/probe', 200, '__probe OK');
  }
  
  await testEndpoint('preview', '/', 200);
  await testEndpoint('preview', '/intake', 200);
  await testEndpoint('preview', '/client-portal', 200);
  await testEndpoint('preview', '/sessions', 200);
  
  // Generate report
  console.log('\n📊 SMOKE TEST RESULTS');
  console.log('=====================');
  
  const paths = ['/api/health', '/probe', '/', '/intake', '/client-portal (unauth)', '/sessions (unauth)'];
  
  console.log('Target\t\t/api/health\t/probe\t\t/\t\t/intake\t\t/client-portal (unauth)\t/sessions (unauth)');
  console.log('-------\t\t---------\t------\t\t-\t\t-------\t\t----------------------\t------------------');
  
  // Local results
  const localRow = ['local'];
  paths.forEach(path => {
    const cleanPath = path.replace(' (unauth)', '');
    localRow.push(results.local[cleanPath] || 'N/A');
  });
  console.log(localRow.join('\t\t'));
  
  // Preview results
  const previewRow = ['preview'];
  paths.forEach(path => {
    const cleanPath = path.replace(' (unauth)', '');
    previewRow.push(results.preview[cleanPath] || 'N/A');
  });
  console.log(previewRow.join('\t\t'));
  
  // Summary
  console.log('\n📋 SUMMARY');
  console.log('==========');
  
  const allPass = Object.values(results.local).every(r => r === 'PASS') && 
                  Object.values(results.preview).every(r => r === 'PASS');
  
  if (allPass) {
    console.log('✅ All tests PASSED - Navigation/auth flow is working correctly');
  } else {
    console.log('❌ Some tests FAILED - Review results above');
  }
  
  // Check for Vercel Authentication wall
  console.log('\n🔍 Vercel Authentication Check:');
  console.log('If preview shows "Verifying Access..." wall, this is Vercel Authentication');
  console.log('(Project → Settings → Deployment Protection). App routes are correctly public once inside.');
}

// Run the tests
runSmokeTests().catch(console.error);
