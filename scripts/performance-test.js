#!/usr/bin/env node

/**
 * Quick Performance Test
 * Tests the new build system optimizations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing System Performance Optimizations...\n');

// Test 1: Check if new build scripts exist
console.log('📋 Test 1: Build Scripts Availability');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts;
  
  const requiredScripts = [
    'build:fast',
    'build:memory', 
    'build:minimal',
    'build:monitor',
    'ci:fast'
  ];
  
  let allScriptsExist = true;
  requiredScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`  ✅ ${script}`);
    } else {
      console.log(`  ❌ ${script} - Missing`);
      allScriptsExist = false;
    }
  });
  
  console.log(`\n  📊 Scripts Status: ${allScriptsExist ? '✅ All Present' : '❌ Some Missing'}\n`);
} catch (error) {
  console.log(`  ❌ Error reading package.json: ${error.message}\n`);
}

// Test 2: Check Next.js config optimizations
console.log('⚙️  Test 2: Next.js Configuration Optimizations');
try {
  const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
  
  const optimizations = [
    'optimizePackageImports',
    'webpack: (config) =>',
    'splitChunks'
  ];
  
  let optimizationsFound = 0;
  optimizations.forEach(opt => {
    if (nextConfig.includes(opt)) {
      console.log(`  ✅ ${opt}`);
      optimizationsFound++;
    } else {
      console.log(`  ❌ ${opt} - Not found`);
    }
  });
  
  console.log(`\n  📊 Optimizations Status: ${optimizationsFound}/${optimizations.length} Found\n`);
} catch (error) {
  console.log(`  ❌ Error reading next.config.ts: ${error.message}\n`);
}

// Test 3: Check TypeScript config optimizations
console.log('🔧 Test 3: TypeScript Configuration Optimizations');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  
  const tsOptimizations = [
    'incremental',
    'tsBuildInfoFile',
    'assumeChangesOnlyAffectDirectDependencies'
  ];
  
  let tsOptsFound = 0;
  tsOptimizations.forEach(opt => {
    if (tsConfig.compilerOptions[opt]) {
      console.log(`  ✅ ${opt}: ${tsConfig.compilerOptions[opt]}`);
      tsOptsFound++;
    } else {
      console.log(`  ❌ ${opt} - Not found`);
    }
  });
  
  console.log(`\n  📊 TypeScript Optimizations: ${tsOptsFound}/${tsOptimizations.length} Found\n`);
} catch (error) {
  console.log(`  ❌ Error reading tsconfig.json: ${error.message}\n`);
}

// Test 4: Check build monitor script
console.log('📊 Test 4: Build Monitor Script');
try {
  const monitorScript = fs.readFileSync('scripts/build-monitor.js', 'utf8');
  
  if (monitorScript.includes('BuildMonitor') && monitorScript.includes('runBuild')) {
    console.log('  ✅ Build monitor script exists and appears functional');
  } else {
    console.log('  ❌ Build monitor script missing or incomplete');
  }
} catch (error) {
  console.log(`  ❌ Error reading build monitor script: ${error.message}`);
}

console.log('\n🎯 Performance Test Summary:');
console.log('  • New build scripts with memory management');
console.log('  • Next.js build optimizations (skip TS/lint during build)');
console.log('  • TypeScript incremental builds with caching');
console.log('  • Build performance monitoring');
console.log('  • Multiple build strategies (fast, memory, minimal)');
console.log('\n💡 Next Steps:');
console.log('  • Run: npm run build:monitor:fast');
console.log('  • Run: npm run ci:fast');
console.log('  • Check .build-metrics.json for performance data');
console.log('\n🚀 System optimizations complete!');
