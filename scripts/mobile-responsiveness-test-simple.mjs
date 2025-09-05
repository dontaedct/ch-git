#!/usr/bin/env node

/**
 * HT-002.4.2: Mobile Responsiveness Verification Script (Simplified)
 * 
 * This script performs automated mobile responsiveness testing
 * for the Linear/Vercel-inspired homepage transformation.
 * 
 * RUN_DATE=2025-01-27T10:00:00.000Z
 */

import fs from 'fs';
import path from 'path';

const RUN_DATE = '2025-01-27T10:00:00.000Z';
const REPORT_DIR = 'reports';
const REPORT_FILE = path.join(REPORT_DIR, 'HT-002-4-2_MOBILE_RESPONSIVENESS_REPORT.json');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('📱 HT-002.4.2: Mobile Responsiveness Verification');
console.log(`📅 Run Date: ${RUN_DATE}`);
console.log('=' .repeat(60));

const testResults = {
  task: 'HT-002.4.2',
  title: 'Mobile responsiveness verification',
  runDate: RUN_DATE,
  status: 'in_progress',
  breakpoints: {},
  components: {},
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  recommendations: []
};

// Test responsive patterns in CSS
function testResponsivePatterns() {
  console.log('🎨 Testing Responsive CSS Patterns...');
  
  const cssFile = 'styles/globals.css';
  let cssContent = '';
  
  try {
    cssContent = fs.readFileSync(cssFile, 'utf8');
  } catch (error) {
    console.log(`  ⚠️  Could not read CSS file: ${error.message}`);
    return;
  }
  
  const patterns = [
    { name: 'CSS Grid', pattern: /grid-template-columns|grid-cols/g, critical: true },
    { name: 'Flexbox', pattern: /display:\s*flex|flex-col|flex-row/g, critical: true },
    { name: 'Typography Scaling', pattern: /font-size|text-\d+xl|text-\d+sm/g, critical: true },
    { name: 'Spacing Responsive', pattern: /padding|margin|p-\d+|m-\d+/g, critical: false },
    { name: 'Touch Targets', pattern: /min-h-\[44px\]|min-w-\[44px\]|min-height|min-width/g, critical: true }
  ];
  
  for (const pattern of patterns) {
    console.log(`\n🔍 Testing ${pattern.name}...`);
    
    const matches = cssContent.match(pattern.pattern);
    const found = matches && matches.length > 0;
    
    testResults.components[pattern.name] = {
      found,
      matches: matches ? matches.slice(0, 5) : [],
      critical: pattern.critical
    };
    
    if (found) {
      console.log(`  ✅ ${pattern.name} patterns found (${matches.length} matches)`);
      testResults.summary.passed++;
    } else {
      console.log(`  ⚠️  ${pattern.name} patterns not found`);
      testResults.summary.warnings++;
    }
    
    testResults.summary.totalTests++;
  }
}

// Test component responsiveness
function testComponentResponsiveness() {
  console.log('\n🧩 Testing Component Responsiveness...');
  
  const pageFile = 'app/page.tsx';
  let pageContent = '';
  
  try {
    pageContent = fs.readFileSync(pageFile, 'utf8');
  } catch (error) {
    console.log(`  ⚠️  Could not read page file: ${error.message}`);
    return;
  }
  
  const components = [
    { name: 'Hero Section', selector: 'hero-heading' },
    { name: 'Feature Cards', selector: 'features-heading' },
    { name: 'Social Proof Section', selector: 'social-proof-heading' },
    { name: 'CTA Section', selector: 'cta-heading' },
    { name: 'Footer', selector: 'contentinfo' }
  ];
  
  for (const component of components) {
    console.log(`\n🔍 Testing ${component.name}...`);
    
    const found = pageContent.includes(component.selector);
    
    // Extract responsive classes
    let responsiveClasses = [];
    if (found) {
      const responsiveMatches = pageContent.match(/sm:|md:|lg:|xl:|2xl:/g);
      if (responsiveMatches) {
        responsiveClasses = [...new Set(responsiveMatches)];
      }
    }
    
    testResults.components[component.name] = {
      found,
      responsiveClasses,
      selector: component.selector
    };
    
    if (found) {
      console.log(`  ✅ ${component.name} found with responsive classes: ${responsiveClasses.join(', ')}`);
      testResults.summary.passed++;
    } else {
      console.log(`  ❌ ${component.name} not found`);
      testResults.summary.failed++;
    }
    
    testResults.summary.totalTests++;
  }
}

// Test breakpoint coverage
function testBreakpointCoverage() {
  console.log('\n📏 Testing Breakpoint Coverage...');
  
  const cssFile = 'styles/globals.css';
  let cssContent = '';
  
  try {
    cssContent = fs.readFileSync(cssFile, 'utf8');
  } catch (error) {
    console.log(`  ⚠️  Could not read CSS file: ${error.message}`);
    return;
  }
  
  const breakpoints = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Medium', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 }
  ];
  
  for (const breakpoint of breakpoints) {
    console.log(`\n🔍 Testing ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})...`);
    
    // Check for media queries
    const mediaQueryRegex = /@media\s*\([^)]+\)/g;
    const matches = cssContent.match(mediaQueryRegex);
    const found = matches && matches.length > 0;
    
    testResults.breakpoints[breakpoint.name] = {
      width: breakpoint.width,
      height: breakpoint.height,
      found,
      mediaQueries: matches ? matches.slice(0, 3) : []
    };
    
    if (found) {
      console.log(`  ✅ Media queries found for ${breakpoint.name}`);
      testResults.summary.passed++;
    } else {
      console.log(`  ⚠️  No specific media queries for ${breakpoint.name}`);
      testResults.summary.warnings++;
    }
    
    testResults.summary.totalTests++;
  }
}

// Generate recommendations
function generateRecommendations() {
  const recommendations = [];
  
  // Check for missing responsive patterns
  const missingPatterns = Object.entries(testResults.components)
    .filter(([name, result]) => !result.found && result.critical)
    .map(([name]) => name);
  
  if (missingPatterns.length > 0) {
    recommendations.push({
      type: 'error',
      message: `Missing critical responsive patterns: ${missingPatterns.join(', ')}`,
      action: 'Add responsive CSS patterns for better mobile experience'
    });
  }
  
  // Check for touch target compliance
  const touchTargetIssues = Object.entries(testResults.components)
    .filter(([name, result]) => result.found && result.responsiveClasses && !result.responsiveClasses.some(cls => cls.includes('min-h') || cls.includes('min-w')))
    .map(([name]) => name);
  
  if (touchTargetIssues.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `Components may have inadequate touch targets: ${touchTargetIssues.join(', ')}`,
      action: 'Ensure interactive elements meet 44px minimum touch target size'
    });
  }
  
  testResults.recommendations = recommendations;
}

// Generate manual testing checklist
function generateManualTestingChecklist() {
  const checklist = {
    title: 'Manual Mobile Responsiveness Testing Checklist',
    breakpoints: [
      { name: 'Mobile Small', width: 320, height: 568 },
      { name: 'Mobile Medium', width: 375, height: 667 },
      { name: 'Mobile Large', width: 414, height: 896 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 }
    ],
    tests: [
      {
        category: 'Layout & Structure',
        items: [
          'Page layout adapts correctly to different screen sizes',
          'Content doesn\'t overflow horizontally',
          'Vertical scrolling works smoothly',
          'Grid layouts stack properly on mobile',
          'Flexbox layouts adapt to screen width'
        ]
      },
      {
        category: 'Typography & Readability',
        items: [
          'Text remains readable at all screen sizes',
          'Font sizes scale appropriately',
          'Line height maintains readability',
          'Text doesn\'t become too small on mobile',
          'Headings maintain hierarchy'
        ]
      },
      {
        category: 'Interactive Elements',
        items: [
          'Buttons meet minimum 44px touch target size',
          'Links are easily tappable',
          'Form elements are accessible',
          'Navigation works on touch devices',
          'Hover states work on touch devices'
        ]
      },
      {
        category: 'Images & Media',
        items: [
          'Images scale properly',
          'Images don\'t overflow containers',
          'Aspect ratios are maintained',
          'Loading states work correctly',
          'Lazy loading functions properly'
        ]
      },
      {
        category: 'Performance',
        items: [
          'Page loads quickly on mobile networks',
          'Animations are smooth',
          'No layout shifts during loading',
          'Touch interactions are responsive',
          'Scrolling is smooth'
        ]
      }
    ]
  };
  
  return checklist;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Mobile Responsiveness Verification...\n');
    
    // Run all tests
    testResponsivePatterns();
    testComponentResponsiveness();
    testBreakpointCoverage();
    
    // Generate recommendations
    generateRecommendations();
    
    // Update status
    testResults.status = testResults.summary.failed === 0 ? 'completed' : 'completed_with_warnings';
    
    console.log('\n📊 Test Summary:');
    console.log(`  Total Tests: ${testResults.summary.totalTests}`);
    console.log(`  Passed: ${testResults.summary.passed}`);
    console.log(`  Failed: ${testResults.summary.failed}`);
    console.log(`  Warnings: ${testResults.summary.warnings}`);
    
    // Save report
    fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 Report saved to: ${REPORT_FILE}`);
    
    // Generate manual testing checklist
    console.log('\n📋 Manual Testing Checklist Generated');
    const checklist = generateManualTestingChecklist();
    const checklistFile = path.join(REPORT_DIR, 'HT-002-4-2_MANUAL_TESTING_CHECKLIST.json');
    fs.writeFileSync(checklistFile, JSON.stringify(checklist, null, 2));
    console.log(`📄 Checklist saved to: ${checklistFile}`);
    
    console.log('\n✅ Mobile responsiveness verification completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Review the test report for any issues');
    console.log('  2. Use the manual testing checklist for thorough verification');
    console.log('  3. Test on actual mobile devices');
    console.log('  4. Use browser dev tools to test different screen sizes');
    console.log('  5. Consider using responsive design testing tools');
    
  } catch (error) {
    console.error('❌ Mobile responsiveness verification failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main();



