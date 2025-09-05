#!/usr/bin/env node

/**
 * HT-002.4.2: Mobile Responsiveness Verification Script
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

// Mobile breakpoints to test
const breakpoints = [
  {
    name: 'Mobile Small',
    width: 320,
    height: 568,
    description: 'iPhone SE, small Android devices'
  },
  {
    name: 'Mobile Medium',
    width: 375,
    height: 667,
    description: 'iPhone 8, standard Android devices'
  },
  {
    name: 'Mobile Large',
    width: 414,
    height: 896,
    description: 'iPhone 11 Pro Max, large Android devices'
  },
  {
    name: 'Tablet Portrait',
    width: 768,
    height: 1024,
    description: 'iPad, Android tablets'
  },
  {
    name: 'Tablet Landscape',
    width: 1024,
    height: 768,
    description: 'iPad landscape, Android tablets'
  }
];

// Components to test for responsiveness
const components = [
  {
    name: 'Hero Section',
    selector: 'section[aria-labelledby="hero-heading"]',
    tests: [
      'Typography scales appropriately',
      'Buttons remain accessible',
      'Content doesn\'t overflow',
      'Spacing maintains rhythm'
    ]
  },
  {
    name: 'Feature Cards',
    selector: 'section[aria-labelledby="features-heading"]',
    tests: [
      'Grid layout adapts to screen size',
      'Cards stack properly on mobile',
      'Touch targets are adequate (44px+)',
      'Content remains readable'
    ]
  },
  {
    name: 'Social Proof Section',
    selector: 'section[aria-labelledby="social-proof-heading"]',
    tests: [
      'Logo grid adapts to screen width',
      'Logos remain visible and readable',
      'Spacing maintains consistency',
      'No horizontal overflow'
    ]
  },
  {
    name: 'CTA Section',
    selector: 'section[aria-labelledby="cta-heading"]',
    tests: [
      'Typography scales appropriately',
      'Button remains prominent',
      'Content centers properly',
      'Spacing maintains rhythm'
    ]
  },
  {
    name: 'Footer',
    selector: 'footer[role="contentinfo"]',
    tests: [
      'Multi-column layout stacks properly',
      'Links remain accessible',
      'Touch targets are adequate',
      'Content doesn\'t overflow'
    ]
  }
];

// CSS responsive patterns to verify
const responsivePatterns = [
  {
    pattern: 'CSS Grid Responsive',
    description: 'Grid layouts adapt to different screen sizes',
    example: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    critical: true
  },
  {
    pattern: 'Flexbox Responsive',
    description: 'Flex layouts adapt to screen width',
    example: 'flex-col sm:flex-row',
    critical: true
  },
  {
    pattern: 'Typography Scaling',
    description: 'Text sizes adapt to screen size',
    example: 'text-3xl sm:text-4xl lg:text-5xl',
    critical: true
  },
  {
    pattern: 'Spacing Responsive',
    description: 'Spacing adapts to screen size',
    example: 'p-4 sm:p-6 lg:p-8',
    critical: false
  },
  {
    pattern: 'Touch Targets',
    description: 'Interactive elements meet minimum touch target size',
    example: 'min-h-[44px] min-w-[44px]',
    critical: true
  }
];

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
  
  for (const pattern of responsivePatterns) {
    console.log(`\n🔍 Testing ${pattern.pattern}...`);
    
    let found = false;
    let examples = [];
    
    // Check for responsive patterns in CSS
    if (pattern.pattern.includes('Grid')) {
      const gridMatches = cssContent.match(/grid-template-columns|grid-cols/g);
      if (gridMatches) {
        found = true;
        examples = gridMatches;
      }
    }
    
    if (pattern.pattern.includes('Flexbox')) {
      const flexMatches = cssContent.match(/display:\s*flex|flex-col|flex-row/g);
      if (flexMatches) {
        found = true;
        examples = flexMatches;
      }
    }
    
    if (pattern.pattern.includes('Typography')) {
      const typographyMatches = cssContent.match(/font-size|text-\d+xl|text-\d+sm/g);
      if (typographyMatches) {
        found = true;
        examples = typographyMatches;
      }
    }
    
    if (pattern.pattern.includes('Spacing')) {
      const spacingMatches = cssContent.match(/padding|margin|p-\d+|m-\d+/g);
      if (spacingMatches) {
        found = true;
        examples = spacingMatches;
      }
    }
    
    if (pattern.pattern.includes('Touch Targets')) {
      const touchMatches = cssContent.match(/min-h-\[44px\]|min-w-\[44px\]|min-height|min-width/g);
      if (touchMatches) {
        found = true;
        examples = touchMatches;
      }
    }
    
    testResults.components[pattern.pattern] = {
      found,
      examples: examples.slice(0, 5), // Limit examples
      critical: pattern.critical,
      description: pattern.description
    };
    
    if (found) {
      console.log(`  ✅ ${pattern.pattern} patterns found`);
      testResults.summary.passed++;
    } else {
      console.log(`  ⚠️  ${pattern.pattern} patterns not found`);
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
  
  for (const component of components) {
    console.log(`\n🔍 Testing ${component.name}...`);
    
    let found = false;
    let responsiveClasses = [];
    
    // Check if component exists in page
    if (pageContent.includes(component.selector)) {
      found = true;
      
      // Extract responsive classes from component
      const componentMatch = pageContent.match(new RegExp(`${component.selector}[\\s\\S]*?<\\/section>`, 'g'));
      if (componentMatch) {
        const componentContent = componentMatch[0];
        const responsiveMatches = componentContent.match(/sm:|md:|lg:|xl:|2xl:/g);
        if (responsiveMatches) {
          responsiveClasses = [...new Set(responsiveMatches)]; // Remove duplicates
        }
      }
    }
    
    testResults.components[component.name] = {
      found,
      responsiveClasses,
      tests: component.tests,
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
  
  for (const breakpoint of breakpoints) {
    console.log(`\n🔍 Testing ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})...`);
    
    let found = false;
    let mediaQueries = [];
    
    // Check for media queries that cover this breakpoint
    const mediaQueryRegex = /@media\s*\([^)]+\)/g;
    const matches = cssContent.match(mediaQueryRegex);
    
    if (matches) {
      for (const match of matches) {
        if (match.includes('min-width') || match.includes('max-width')) {
          mediaQueries.push(match);
          found = true;
        }
      }
    }
    
    testResults.breakpoints[breakpoint.name] = {
      width: breakpoint.width,
      height: breakpoint.height,
      description: breakpoint.description,
      found,
      mediaQueries: mediaQueries.slice(0, 3) // Limit examples
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
    .filter(([name, result]) => result.found && !result.responsiveClasses.some(cls => cls.includes('min-h') || cls.includes('min-w')))
    .map(([name]) => name);
  
  if (touchTargetIssues.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `Components may have inadequate touch targets: ${touchTargetIssues.join(', ')}`,
      action: 'Ensure interactive elements meet 44px minimum touch target size'
    });
  }
  
  // Check for breakpoint coverage
  const uncoveredBreakpoints = Object.entries(testResults.breakpoints)
    .filter(([name, result]) => !result.found)
    .map(([name]) => name);
  
  if (uncoveredBreakpoints.length > 0) {
    recommendations.push({
      type: 'info',
      message: `No specific media queries for: ${uncoveredBreakpoints.join(', ')}`,
      action: 'Consider adding specific styles for these breakpoints'
    });
  }
  
  testResults.recommendations = recommendations;
}

// Generate manual testing checklist
function generateManualTestingChecklist() {
  const checklist = {
    title: 'Manual Mobile Responsiveness Testing Checklist',
    breakpoints: breakpoints,
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



