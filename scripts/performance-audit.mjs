#!/usr/bin/env node

/**
 * Performance Audit Script for HT-002.3.3
 * Verifies Core Web Vitals optimizations
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PERFORMANCE_THRESHOLDS = {
  LCP: 2.5, // Largest Contentful Paint (seconds)
  CLS: 0.1, // Cumulative Layout Shift
  FID: 100, // First Input Delay (milliseconds)
  FCP: 1.8, // First Contentful Paint (seconds)
  TTFB: 600, // Time to First Byte (milliseconds)
  PERFORMANCE_SCORE: 90, // Lighthouse Performance Score
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function checkFileOptimizations() {
  log('Checking file optimizations...');
  
  const checks = [
    {
      file: 'next.config.cjs',
      checks: [
        { pattern: /optimizeCss:\s*true/, name: 'CSS optimization enabled' },
        { pattern: /optimizePackageImports/, name: 'Package imports optimization' },
        { pattern: /compress:\s*true/, name: 'Compression enabled' },
        { pattern: /splitChunks/, name: 'Bundle splitting configured' },
        { pattern: /Cache-Control.*max-age=31536000/, name: 'Static asset caching' },
      ]
    },
    {
      file: 'app/layout.tsx',
      checks: [
        { pattern: /rel="preload".*Inter.*wght@600/, name: 'Critical font preloading' },
        { pattern: /onLoad.*this\.onload=null/, name: 'Async font loading' },
        { pattern: /dns-prefetch/, name: 'DNS prefetching' },
        { pattern: /preconnect/, name: 'Resource preconnection' },
      ]
    },
    {
      file: 'app/page.tsx',
      checks: [
        { pattern: /minHeight.*420px/, name: 'Hero section CLS prevention' },
        { pattern: /contain.*layout style paint/, name: 'CSS containment' },
        { pattern: /willChange.*transform.*opacity/, name: 'Performance hints' },
        { pattern: /transform.*translateZ\(0\)/, name: 'Hardware acceleration' },
        { pattern: /duration.*0\.2/, name: 'Optimized animation duration' },
      ]
    },
    {
      file: 'styles/globals.css',
      checks: [
        { pattern: /will-change.*transform.*opacity/, name: 'Animation performance hints' },
        { pattern: /text-rendering.*optimizeLegibility/, name: 'Text rendering optimization' },
        { pattern: /-webkit-font-smoothing.*antialiased/, name: 'Font smoothing' },
        { pattern: /@media.*prefers-reduced-motion/, name: 'Reduced motion support' },
      ]
    }
  ];

  let allPassed = true;
  
  for (const { file, checks } of checks) {
    if (!fs.existsSync(file)) {
      log(`File not found: ${file}`, 'error');
      allPassed = false;
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    for (const { pattern, name } of checks) {
      if (pattern.test(content)) {
        log(`✓ ${name} in ${file}`);
      } else {
        log(`✗ Missing ${name} in ${file}`, 'error');
        allPassed = false;
      }
    }
  }
  
  return allPassed;
}

function checkBundleOptimizations() {
  log('Checking bundle optimizations...');
  
  try {
    // Check if build produces optimized bundles
    log('Running production build...');
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check bundle analysis
    const buildDir = '.next/static/chunks';
    if (fs.existsSync(buildDir)) {
      const chunks = fs.readdirSync(buildDir);
      const vendorChunks = chunks.filter(chunk => 
        chunk.includes('vendors') || 
        chunk.includes('framer-motion') || 
        chunk.includes('radix-ui')
      );
      
      if (vendorChunks.length > 0) {
        log(`✓ Bundle splitting working: ${vendorChunks.length} vendor chunks found`);
      } else {
        log('✗ Bundle splitting may not be working', 'error');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    log(`Build failed: ${error.message}`, 'error');
    return false;
  }
}

function generatePerformanceReport() {
  log('Generating performance report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    task: 'HT-002.3.3',
    optimizations: {
      nextConfig: {
        cssOptimization: true,
        packageImportsOptimization: true,
        compression: true,
        bundleSplitting: true,
        caching: true,
      },
      layout: {
        fontPreloading: true,
        asyncFontLoading: true,
        dnsPrefetch: true,
        preconnect: true,
      },
      homepage: {
        clsPrevention: true,
        cssContainment: true,
        performanceHints: true,
        hardwareAcceleration: true,
        optimizedAnimations: true,
      },
      styles: {
        animationPerformance: true,
        textRendering: true,
        fontSmoothing: true,
        reducedMotion: true,
      }
    },
    thresholds: PERFORMANCE_THRESHOLDS,
    recommendations: [
      'Monitor Core Web Vitals in production',
      'Set up Lighthouse CI for continuous monitoring',
      'Consider implementing service worker for caching',
      'Add performance budgets to CI/CD pipeline',
    ]
  };
  
  const reportPath = 'HT-002-3-3_PERFORMANCE_AUDIT.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Performance report saved to ${reportPath}`);
  
  return report;
}

function main() {
  log('Starting HT-002.3.3 Performance Audit...');
  
  const fileChecks = checkFileOptimizations();
  const bundleChecks = checkBundleOptimizations();
  
  if (fileChecks && bundleChecks) {
    log('All performance optimizations verified!', 'success');
    generatePerformanceReport();
    
    log('\n📊 Performance Optimization Summary:');
    log('✓ Next.js configuration optimized');
    log('✓ Font loading optimized for LCP');
    log('✓ CLS prevention measures implemented');
    log('✓ Animation performance optimized');
    log('✓ Bundle splitting configured');
    log('✓ CSS performance hints added');
    log('✓ Hardware acceleration enabled');
    
    log('\n🎯 Next Steps:');
    log('1. Run Lighthouse audit: npm run tool:ui:perf');
    log('2. Monitor Core Web Vitals in production');
    log('3. Set up continuous performance monitoring');
    
    process.exit(0);
  } else {
    log('Performance audit failed. Please fix the issues above.', 'error');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
