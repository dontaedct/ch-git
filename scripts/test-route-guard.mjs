#!/usr/bin/env node

/**
 * Test script for Route & Adapter Invariants Guard
 * Simulates the GitHub Actions workflow logic for testing
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

// Test scenarios
const testScenarios = [
  {
    name: "UI-only PR (should pass)",
    changes: ["components/ui/button.tsx", "components/ui/card.tsx"],
    expectedResult: "pass"
  },
  {
    name: "UI + Route changes (should fail)",
    changes: ["components/ui/button.tsx", "app/sessions/page.tsx"],
    expectedResult: "fail"
  },
  {
    name: "UI + Adapter changes (should fail)",
    changes: ["components/ui/button.tsx", "app/adapters/session.ts"],
    expectedResult: "fail"
  },
  {
    name: "UI + Database changes (should fail)",
    changes: ["components/ui/button.tsx", "lib/db/sessions.ts"],
    expectedResult: "fail"
  },
  {
    name: "UI + Supabase changes (should fail)",
    changes: ["components/ui/button.tsx", "supabase/migrations/001.sql"],
    expectedResult: "fail"
  },
  {
    name: "UI + Supabase client changes (should fail)",
    changes: ["components/ui/button.tsx", "lib/supabase/client.ts"],
    expectedResult: "fail"
  },
  {
    name: "Non-UI changes only (should skip)",
    changes: ["app/sessions/page.tsx", "lib/db/sessions.ts"],
    expectedResult: "skip"
  }
];

function simulateGitDiff(changes) {
  // Create a temporary file with the changes
  const tempFile = '.test-changes.txt';
  writeFileSync(tempFile, changes.join('\n'));
  
  try {
    // Simulate the guard logic
    const hasUIChanges = changes.some(change => change.startsWith('components/ui/'));
    
    if (!hasUIChanges) {
      return { result: 'skip', message: 'No UI components changed - skipping route/adapter guard check' };
    }
    
    const protectedChanges = [];
    
    // Check for route segment changes
    if (changes.some(change => change.startsWith('app/'))) {
      protectedChanges.push('- Route segments (app/**)');
    }
    
    // Check for adapter changes
    if (changes.some(change => change.startsWith('app/adapters/'))) {
      protectedChanges.push('- Adapters (app/adapters/**)');
    }
    
    // Check for database layer changes
    if (changes.some(change => change.startsWith('lib/db/'))) {
      protectedChanges.push('- Database layer (lib/db/**)');
    }
    
    // Check for Supabase changes
    if (changes.some(change => change.startsWith('supabase/'))) {
      protectedChanges.push('- Supabase configuration (supabase/**)');
    }
    
    // Check for lib/supabase changes
    if (changes.some(change => change.startsWith('lib/supabase/'))) {
      protectedChanges.push('- Supabase client layer (lib/supabase/**)');
    }
    
    if (protectedChanges.length > 0) {
      return {
        result: 'fail',
        message: `ROUTE & ADAPTER INVARIANTS VIOLATION DETECTED!\n\nUI-only PRs cannot modify the following protected areas:\n${protectedChanges.join('\n')}`
      };
    } else {
      return {
        result: 'pass',
        message: 'Route and adapter invariants check passed - UI-only changes detected'
      };
    }
  } finally {
    // Clean up
    unlinkSync(tempFile);
  }
}

function runTests() {
  console.log('🧪 Testing Route & Adapter Invariants Guard\n');
  
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log(`   Changes: ${scenario.changes.join(', ')}`);
    
    const result = simulateGitDiff(scenario.changes);
    
    if (result.result === scenario.expectedResult) {
      console.log(`   ✅ PASS: ${result.message}`);
      passed++;
    } else if (scenario.expectedResult === 'skip' && result.result === 'skip') {
      console.log(`   ⏭️  SKIP: ${result.message}`);
      skipped++;
    } else {
      console.log(`   ❌ FAIL: Expected ${scenario.expectedResult}, got ${result.result}`);
      console.log(`   Message: ${result.message}`);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

// Run tests if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('test-route-guard.mjs')) {
  runTests();
}

export { simulateGitDiff, runTests };
