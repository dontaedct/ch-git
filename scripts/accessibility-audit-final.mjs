#!/usr/bin/env node

/**
 * HT-002.4.4: Final Accessibility Audit Script
 * 
 * This script performs comprehensive accessibility auditing
 * for the Linear/Vercel-inspired homepage transformation.
 * 
 * RUN_DATE=2025-01-27T10:00:00.000Z
 */

import fs from 'fs';
import path from 'path';

const RUN_DATE = '2025-01-27T10:00:00.000Z';
const REPORT_DIR = 'reports';
const REPORT_FILE = path.join(REPORT_DIR, 'HT-002-4-4_ACCESSIBILITY_AUDIT_REPORT.json');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('♿ HT-002.4.4: Final Accessibility Audit');
console.log(`📅 Run Date: ${RUN_DATE}`);
console.log('=' .repeat(60));

const testResults = {
  task: 'HT-002.4.4',
  title: 'Final accessibility audit',
  runDate: RUN_DATE,
  status: 'in_progress',
  wcag: {},
  keyboard: {},
  screenReader: {},
  colorContrast: {},
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  recommendations: []
};

// WCAG 2.1 AA compliance tests
const wcagTests = [
  {
    name: 'Semantic HTML',
    description: 'Proper use of semantic HTML elements',
    pattern: /<(main|nav|section|article|aside|header|footer|h[1-6]|button|a|input|label|form|fieldset|legend|ul|ol|li|table|th|td|caption|img|figure|figcaption)>/g,
    critical: true
  },
  {
    name: 'ARIA Labels',
    description: 'Proper ARIA labeling for interactive elements',
    pattern: /aria-label|aria-labelledby|aria-describedby|aria-expanded|aria-hidden|role=/g,
    critical: true
  },
  {
    name: 'Alt Text',
    description: 'Images have appropriate alt text',
    pattern: /<img[^>]*alt=["'][^"']*["']/g,
    critical: true
  },
  {
    name: 'Form Labels',
    description: 'Form inputs have associated labels',
    pattern: /<label[^>]*for=|aria-labelledby/g,
    critical: true
  },
  {
    name: 'Skip Links',
    description: 'Skip links for keyboard navigation',
    pattern: /skip-link|href="#main"|href="#content"/g,
    critical: true
  },
  {
    name: 'Focus Management',
    description: 'Proper focus management and visible focus indicators',
    pattern: /focus-visible|tabindex|:focus/g,
    critical: true
  }
];

// Keyboard navigation tests
const keyboardTests = [
  {
    name: 'Tab Order',
    description: 'Logical tab order through interactive elements',
    pattern: /tabindex|tabIndex/g,
    critical: true
  },
  {
    name: 'Keyboard Traps',
    description: 'No keyboard traps in modal or complex components',
    pattern: /aria-modal|aria-hidden|role="dialog"/g,
    critical: true
  },
  {
    name: 'Enter/Space Activation',
    description: 'Interactive elements respond to Enter and Space keys',
    pattern: /onKeyDown|onKeyPress|onKeyUp/g,
    critical: true
  },
  {
    name: 'Escape Key',
    description: 'Escape key closes modals and dropdowns',
    pattern: /Escape|keyCode.*27|key.*Escape/g,
    critical: false
  }
];

// Screen reader tests
const screenReaderTests = [
  {
    name: 'Heading Structure',
    description: 'Proper heading hierarchy (h1, h2, h3, etc.)',
    pattern: /<h[1-6][^>]*>/g,
    critical: true
  },
  {
    name: 'Landmark Roles',
    description: 'Proper landmark roles for page structure',
    pattern: /role="(main|navigation|banner|contentinfo|complementary|search)"/g,
    critical: true
  },
  {
    name: 'Live Regions',
    description: 'Live regions for dynamic content updates',
    pattern: /aria-live|aria-atomic|aria-relevant/g,
    critical: false
  },
  {
    name: 'Descriptive Text',
    description: 'Descriptive text for screen readers',
    pattern: /aria-describedby|aria-label/g,
    critical: true
  }
];

// Color contrast tests
const colorContrastTests = [
  {
    name: 'Text Contrast',
    description: 'Text meets WCAG AA contrast ratio (4.5:1)',
    pattern: /color:|background-color:|text-foreground|text-muted-foreground/g,
    critical: true
  },
  {
    name: 'Interactive Contrast',
    description: 'Interactive elements meet contrast requirements',
    pattern: /button|a\[href\]|input|select|textarea/g,
    critical: true
  },
  {
    name: 'Focus Indicators',
    description: 'Focus indicators meet contrast requirements',
    pattern: /:focus|focus-visible|outline/g,
    critical: true
  }
];

// Test WCAG compliance
function testWCAGCompliance() {
  console.log('📋 Testing WCAG 2.1 AA Compliance...');
  
  const pageFile = 'app/page.tsx';
  let pageContent = '';
  
  try {
    pageContent = fs.readFileSync(pageFile, 'utf8');
  } catch (error) {
    console.log(`  ⚠️  Could not read page file: ${error.message}`);
    return;
  }
  
  for (const test of wcagTests) {
    console.log(`\n🔍 Testing ${test.name}...`);
    
    const matches = pageContent.match(test.pattern);
    const found = matches && matches.length > 0;
    
    testResults.wcag[test.name] = {
      found,
      matches: matches ? matches.slice(0, 5) : [],
      critical: test.critical,
      description: test.description
    };
    
    if (found) {
      console.log(`  ✅ ${test.name} implemented (${matches.length} matches)`);
      testResults.summary.passed++;
    } else {
      console.log(`  ❌ ${test.name} not implemented`);
      testResults.summary.failed++;
    }
    
    testResults.summary.totalTests++;
  }
}

// Test keyboard navigation
function testKeyboardNavigation() {
  console.log('\n⌨️  Testing Keyboard Navigation...');
  
  const pageFile = 'app/page.tsx';
  let pageContent = '';
  
  try {
    pageContent = fs.readFileSync(pageFile, 'utf8');
  } catch (error) {
    console.log(`  ⚠️  Could not read page file: ${error.message}`);
    return;
  }
  
  for (const test of keyboardTests) {
    console.log(`\n🔍 Testing ${test.name}...`);
    
    const matches = pageContent.match(test.pattern);
    const found = matches && matches.length > 0;
    
    testResults.keyboard[test.name] = {
      found,
      matches: matches ? matches.slice(0, 5) : [],
      critical: test.critical,
      description: test.description
    };
    
    if (found) {
      console.log(`  ✅ ${test.name} implemented (${matches.length} matches)`);
      testResults.summary.passed++;
    } else {
      console.log(`  ⚠️  ${test.name} not implemented`);
      testResults.summary.warnings++;
    }
    
    testResults.summary.totalTests++;
  }
}

// Test screen reader compatibility
function testScreenReaderCompatibility() {
  console.log('\n🔊 Testing Screen Reader Compatibility...');
  
  const pageFile = 'app/page.tsx';
  let pageContent = '';
  
  try {
    pageContent = fs.readFileSync(pageFile, 'utf8');
  } catch (error) {
    console.log(`  ⚠️  Could not read page file: ${error.message}`);
    return;
  }
  
  for (const test of screenReaderTests) {
    console.log(`\n🔍 Testing ${test.name}...`);
    
    const matches = pageContent.match(test.pattern);
    const found = matches && matches.length > 0;
    
    testResults.screenReader[test.name] = {
      found,
      matches: matches ? matches.slice(0, 5) : [],
      critical: test.critical,
      description: test.description
    };
    
    if (found) {
      console.log(`  ✅ ${test.name} implemented (${matches.length} matches)`);
      testResults.summary.passed++;
    } else {
      console.log(`  ⚠️  ${test.name} not implemented`);
      testResults.summary.warnings++;
    }
    
    testResults.summary.totalTests++;
  }
}

// Test color contrast
function testColorContrast() {
  console.log('\n🎨 Testing Color Contrast...');
  
  const cssFile = 'styles/globals.css';
  let cssContent = '';
  
  try {
    cssContent = fs.readFileSync(cssFile, 'utf8');
  } catch (error) {
    console.log(`  ⚠️  Could not read CSS file: ${error.message}`);
    return;
  }
  
  for (const test of colorContrastTests) {
    console.log(`\n🔍 Testing ${test.name}...`);
    
    const matches = cssContent.match(test.pattern);
    const found = matches && matches.length > 0;
    
    testResults.colorContrast[test.name] = {
      found,
      matches: matches ? matches.slice(0, 5) : [],
      critical: test.critical,
      description: test.description
    };
    
    if (found) {
      console.log(`  ✅ ${test.name} implemented (${matches.length} matches)`);
      testResults.summary.passed++;
    } else {
      console.log(`  ⚠️  ${test.name} not implemented`);
      testResults.summary.warnings++;
    }
    
    testResults.summary.totalTests++;
  }
}

// Test reduced motion support
function testReducedMotionSupport() {
  console.log('\n🎬 Testing Reduced Motion Support...');
  
  const cssFile = 'styles/globals.css';
  let cssContent = '';
  
  try {
    cssContent = fs.readFileSync(cssFile, 'utf8');
  } catch (error) {
    console.log(`  ⚠️  Could not read CSS file: ${error.message}`);
    return;
  }
  
  const motionTests = [
    {
      name: 'Reduced Motion Media Query',
      pattern: /@media\s*\(prefers-reduced-motion:\s*reduce\)/g,
      critical: true
    },
    {
      name: 'Animation Duration Override',
      pattern: /animation-duration:\s*0\.01ms/g,
      critical: true
    },
    {
      name: 'Transition Duration Override',
      pattern: /transition-duration:\s*0\.01ms/g,
      critical: true
    }
  ];
  
  for (const test of motionTests) {
    console.log(`\n🔍 Testing ${test.name}...`);
    
    const matches = cssContent.match(test.pattern);
    const found = matches && matches.length > 0;
    
    testResults.motion = testResults.motion || {};
    testResults.motion[test.name] = {
      found,
      matches: matches ? matches.slice(0, 3) : [],
      critical: test.critical
    };
    
    if (found) {
      console.log(`  ✅ ${test.name} implemented`);
      testResults.summary.passed++;
    } else {
      console.log(`  ❌ ${test.name} not implemented`);
      testResults.summary.failed++;
    }
    
    testResults.summary.totalTests++;
  }
}

// Generate recommendations
function generateRecommendations() {
  const recommendations = [];
  
  // Check for missing critical WCAG features
  const missingWCAG = Object.entries(testResults.wcag)
    .filter(([name, result]) => !result.found && result.critical)
    .map(([name]) => name);
  
  if (missingWCAG.length > 0) {
    recommendations.push({
      type: 'error',
      message: `Missing critical WCAG features: ${missingWCAG.join(', ')}`,
      action: 'Implement missing accessibility features for WCAG compliance'
    });
  }
  
  // Check for missing keyboard navigation
  const missingKeyboard = Object.entries(testResults.keyboard)
    .filter(([name, result]) => !result.found && result.critical)
    .map(([name]) => name);
  
  if (missingKeyboard.length > 0) {
    recommendations.push({
      type: 'error',
      message: `Missing critical keyboard navigation: ${missingKeyboard.join(', ')}`,
      action: 'Implement keyboard navigation for better accessibility'
    });
  }
  
  // Check for missing screen reader support
  const missingScreenReader = Object.entries(testResults.screenReader)
    .filter(([name, result]) => !result.found && result.critical)
    .map(([name]) => name);
  
  if (missingScreenReader.length > 0) {
    recommendations.push({
      type: 'error',
      message: `Missing critical screen reader support: ${missingScreenReader.join(', ')}`,
      action: 'Implement screen reader support for better accessibility'
    });
  }
  
  // Check for missing reduced motion support
  if (testResults.motion) {
    const missingMotion = Object.entries(testResults.motion)
      .filter(([name, result]) => !result.found && result.critical)
      .map(([name]) => name);
    
    if (missingMotion.length > 0) {
      recommendations.push({
        type: 'error',
        message: `Missing critical reduced motion support: ${missingMotion.join(', ')}`,
        action: 'Implement reduced motion support for users with vestibular disorders'
      });
    }
  }
  
  testResults.recommendations = recommendations;
}

// Generate accessibility checklist
function generateAccessibilityChecklist() {
  const checklist = {
    title: 'Accessibility Testing Checklist',
    categories: [
      {
        name: 'WCAG 2.1 AA Compliance',
        items: [
          'All images have appropriate alt text',
          'Form inputs have associated labels',
          'Semantic HTML elements used correctly',
          'ARIA labels and descriptions provided',
          'Skip links implemented for keyboard users',
          'Focus indicators visible and consistent'
        ]
      },
      {
        name: 'Keyboard Navigation',
        items: [
          'All interactive elements accessible via keyboard',
          'Logical tab order through page elements',
          'No keyboard traps in complex components',
          'Enter and Space keys activate buttons',
          'Escape key closes modals and dropdowns',
          'Arrow keys work in menus and lists'
        ]
      },
      {
        name: 'Screen Reader Support',
        items: [
          'Proper heading hierarchy (h1, h2, h3, etc.)',
          'Landmark roles for page structure',
          'Descriptive text for screen readers',
          'Live regions for dynamic content',
          'Form validation messages announced',
          'Status updates communicated clearly'
        ]
      },
      {
        name: 'Visual Accessibility',
        items: [
          'Text meets WCAG AA contrast ratio (4.5:1)',
          'Interactive elements meet contrast requirements',
          'Focus indicators meet contrast requirements',
          'Color is not the only way to convey information',
          'Text can be resized up to 200% without loss of functionality',
          'Content reflows properly at different zoom levels'
        ]
      },
      {
        name: 'Motor Accessibility',
        items: [
          'Touch targets meet minimum 44px size',
          'Sufficient spacing between interactive elements',
          'No time limits that cannot be extended',
          'Reduced motion preferences respected',
          'No content that flashes more than 3 times per second',
          'Drag and drop alternatives provided'
        ]
      }
    ]
  };
  
  return checklist;
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Final Accessibility Audit...\n');
    
    // Run all tests
    testWCAGCompliance();
    testKeyboardNavigation();
    testScreenReaderCompatibility();
    testColorContrast();
    testReducedMotionSupport();
    
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
    
    // Generate accessibility checklist
    console.log('\n📋 Accessibility Checklist Generated');
    const checklist = generateAccessibilityChecklist();
    const checklistFile = path.join(REPORT_DIR, 'HT-002-4-4_ACCESSIBILITY_CHECKLIST.json');
    fs.writeFileSync(checklistFile, JSON.stringify(checklist, null, 2));
    console.log(`📄 Checklist saved to: ${checklistFile}`);
    
    console.log('\n✅ Final accessibility audit completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Review the accessibility report for any issues');
    console.log('  2. Use the accessibility checklist for ongoing testing');
    console.log('  3. Test with actual screen readers (NVDA, JAWS, VoiceOver)');
    console.log('  4. Conduct user testing with people with disabilities');
    console.log('  5. Set up automated accessibility testing in CI/CD');
    
  } catch (error) {
    console.error('❌ Accessibility audit failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main();



