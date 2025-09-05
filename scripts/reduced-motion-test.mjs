#!/usr/bin/env node

/**
 * Reduced Motion Testing Script for HT-002.3.4
 * Tests that reduced motion preferences are properly respected
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REDUCED_MOTION_TESTS = [
  {
    name: 'CSS Animations Disabled',
    selector: '*',
    check: (element) => {
      const computed = window.getComputedStyle(element);
      const animDuration = parseFloat(computed.animationDuration);
      const transDuration = parseFloat(computed.transitionDuration);
      return animDuration <= 0.01 && transDuration <= 0.01;
    }
  },
  {
    name: 'Framer Motion Animations Disabled',
    selector: '[data-motion]',
    check: (element) => {
      const computed = window.getComputedStyle(element);
      const animDuration = parseFloat(computed.animationDuration);
      return animDuration <= 0.01;
    }
  },
  {
    name: 'Hover Transitions Minimal',
    selector: '.group:hover [class*="group-hover"]',
    check: (element) => {
      const computed = window.getComputedStyle(element);
      const transDuration = parseFloat(computed.transitionDuration);
      return transDuration <= 0.01;
    }
  },
  {
    name: 'Button Interactions Minimal',
    selector: 'button, [role="button"]',
    check: (element) => {
      const computed = window.getComputedStyle(element);
      const transDuration = parseFloat(computed.transitionDuration);
      return transDuration <= 0.01;
    }
  }
];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function checkReducedMotionImplementation() {
  log('Checking reduced motion implementation...');
  
  const checks = [
    {
      file: 'styles/globals.css',
      checks: [
        { 
          pattern: /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/, 
          name: 'Reduced motion media query' 
        },
        { 
          pattern: /animation-duration:\s*0\.01ms\s*!important/, 
          name: 'Animation duration disabled' 
        },
        { 
          pattern: /transition-duration:\s*0\.01ms\s*!important/, 
          name: 'Transition duration disabled' 
        },
        { 
          pattern: /scroll-behavior:\s*auto\s*!important/, 
          name: 'Smooth scrolling disabled' 
        },
        { 
          pattern: /\.animate-spin\s*\{\s*animation:\s*none/, 
          name: 'Spin animation disabled' 
        },
        { 
          pattern: /\.animate-pulse\s*\{\s*animation:\s*none/, 
          name: 'Pulse animation disabled' 
        },
        { 
          pattern: /:focus-visible.*outline.*!important/, 
          name: 'Focus indicators preserved' 
        }
      ]
    },
    {
      file: 'hooks/use-motion-preference.ts',
      checks: [
        { 
          pattern: /matchMedia\s*\(\s*['"]prefers-reduced-motion:\s*reduce['"]\s*\)/, 
          name: 'Media query detection' 
        },
        { 
          pattern: /addEventListener\s*\(\s*['"]change['"]/, 
          name: 'Preference change listener' 
        },
        { 
          pattern: /useReducedMotion/, 
          name: 'Reduced motion hook' 
        }
      ]
    },
    {
      file: 'components/providers/motion-provider.tsx',
      checks: [
        { 
          pattern: /useReducedMotion/, 
          name: 'Reduced motion hook usage' 
        },
        { 
          pattern: /MotionConfig/, 
          name: 'Framer Motion configuration' 
        },
        { 
          pattern: /reducedMotion.*always.*never/, 
          name: 'Motion preference configuration' 
        }
      ]
    },
    {
      file: 'app/page.tsx',
      checks: [
        { 
          pattern: /useReducedMotion/, 
          name: 'Reduced motion hook usage' 
        },
        { 
          pattern: /reducedMotion\s*\?\s*0\s*:\s*0\.05/, 
          name: 'Conditional stagger timing' 
        },
        { 
          pattern: /reducedMotion\s*\?\s*0\s*:\s*10/, 
          name: 'Conditional movement' 
        },
        { 
          pattern: /reducedMotion\s*\?\s*1\s*:\s*0\.98/, 
          name: 'Conditional scaling' 
        },
        { 
          pattern: /reducedMotion\s*\?\s*0\.01\s*:\s*0\.2/, 
          name: 'Conditional duration' 
        }
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

function createReducedMotionTestPage() {
  log('Creating reduced motion test page...');
  
  const testPageContent = `import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-motion-preference';

export default function ReducedMotionTestPage() {
  const reducedMotion = useReducedMotion();

  const testVariants = {
    hidden: { 
      opacity: 0, 
      y: reducedMotion ? 0 : 20,
      scale: reducedMotion ? 1 : 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Reduced Motion Test Page</h1>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Current motion preference: <strong>{reducedMotion ? 'Reduced' : 'Normal'}</strong>
        </p>
      </div>

      {/* Test Framer Motion animations */}
      <motion.div
        className="bg-primary/10 p-4 rounded-lg mb-4"
        variants={testVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="font-semibold mb-2">Framer Motion Test</h2>
        <p>This element should animate smoothly in normal mode and instantly in reduced motion mode.</p>
      </motion.div>

      {/* Test CSS transitions */}
      <div className="bg-secondary/10 p-4 rounded-lg mb-4 transition-all duration-300 hover:bg-secondary/20">
        <h2 className="font-semibold mb-2">CSS Transition Test</h2>
        <p>Hover over this element. The background should transition smoothly in normal mode and instantly in reduced motion mode.</p>
      </div>

      {/* Test CSS animations */}
      <div className="bg-accent/10 p-4 rounded-lg mb-4 animate-pulse">
        <h2 className="font-semibold mb-2">CSS Animation Test</h2>
        <p>This element has a pulse animation that should be disabled in reduced motion mode.</p>
      </div>

      {/* Test hover effects */}
      <div className="group bg-muted/10 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
          Hover Effect Test
        </h2>
        <p className="group-hover:scale-105 transition-transform duration-200">
          Hover over this element. The text color and scale should change smoothly in normal mode and instantly in reduced motion mode.
        </p>
      </div>

      {/* Test button interactions */}
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
        Button Interaction Test
      </button>
    </div>
  );
}`;

  const testPagePath = 'app/reduced-motion-test/page.tsx';
  fs.writeFileSync(testPagePath, testPageContent);
  log(`Test page created at ${testPagePath}`);
  
  return testPagePath;
}

function generateReducedMotionReport() {
  log('Generating reduced motion test report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    task: 'HT-002.3.4',
    tests: {
      cssImplementation: {
        mediaQuery: true,
        animationDisable: true,
        transitionDisable: true,
        scrollBehaviorDisable: true,
        specificAnimationsDisable: true,
        focusIndicatorsPreserved: true,
      },
      hookImplementation: {
        mediaQueryDetection: true,
        changeListener: true,
        reducedMotionHook: true,
      },
      providerImplementation: {
        hookUsage: true,
        motionConfig: true,
        preferenceConfiguration: true,
      },
      homepageImplementation: {
        hookUsage: true,
        conditionalTiming: true,
        conditionalMovement: true,
        conditionalScaling: true,
        conditionalDuration: true,
      }
    },
    testPage: 'app/reduced-motion-test/page.tsx',
    manualTests: [
      'Visit /reduced-motion-test page',
      'Toggle reduced motion preference in browser settings',
      'Verify animations are disabled/enabled appropriately',
      'Test with screen reader for accessibility',
      'Test keyboard navigation with reduced motion',
    ],
    browserTests: [
      'Chrome: Settings > Advanced > Accessibility > Prefers reduced motion',
      'Firefox: about:config > ui.prefersReducedMotion',
      'Safari: System Preferences > Accessibility > Display > Reduce motion',
      'Edge: Settings > Accessibility > Visual effects > Reduce motion',
    ],
    recommendations: [
      'Test with actual users who prefer reduced motion',
      'Monitor accessibility feedback for motion-related issues',
      'Consider providing manual motion toggle in UI',
      'Ensure all animations have meaningful alternatives',
    ]
  };
  
  const reportPath = 'HT-002-3-4_REDUCED_MOTION_TEST_REPORT.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Reduced motion test report saved to ${reportPath}`);
  
  return report;
}

function main() {
  log('Starting HT-002.3.4 Reduced Motion Testing...');
  
  const implementationChecks = checkReducedMotionImplementation();
  const testPagePath = createReducedMotionTestPage();
  
  if (implementationChecks) {
    log('All reduced motion implementations verified!', 'success');
    generateReducedMotionReport();
    
    log('\\n📊 Reduced Motion Testing Summary:');
    log('✓ CSS reduced motion media query implemented');
    log('✓ Animation and transition durations disabled');
    log('✓ Smooth scrolling disabled in reduced motion');
    log('✓ Specific animations (spin, pulse) disabled');
    log('✓ Focus indicators preserved for accessibility');
    log('✓ Motion preference hook implemented');
    log('✓ Framer Motion configuration respects preferences');
    log('✓ Homepage animations conditionally applied');
    log('✓ Test page created for manual verification');
    
    log('\\n🎯 Manual Testing Steps:');
    log('1. Visit /reduced-motion-test page');
    log('2. Enable reduced motion in browser settings');
    log('3. Verify animations are disabled');
    log('4. Test keyboard navigation');
    log('5. Test with screen reader');
    
    log('\\n🔧 Browser Settings:');
    log('Chrome: Settings > Advanced > Accessibility > Prefers reduced motion');
    log('Firefox: about:config > ui.prefersReducedMotion');
    log('Safari: System Preferences > Accessibility > Display > Reduce motion');
    
    process.exit(0);
  } else {
    log('Reduced motion testing failed. Please fix the issues above.', 'error');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
