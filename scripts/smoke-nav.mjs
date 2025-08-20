#!/usr/bin/env node

/**
 * Smoke test script for navigation and auth implementation
 * Validates that public routes are accessible and protected routes are guarded
 */

const BASE_URL = 'https://ch-rgusfgn9u-dontaedct-1785s-projects.vercel.app';

async function smokeTest() {
  console.log('🚀 Starting navigation smoke tests...\n');
  
  const tests = [
    {
      name: 'Public Landing Page (/)',
      url: '/',
      expectedStatus: 200,
      expectedContent: 'Coach Hub'
    },
    {
      name: 'Health Check (/api/health)',
      url: '/api/health',
      expectedStatus: 200,
      expectedContent: 'ok'
    },
    {
      name: 'Probe Endpoint (/probe)',
      url: '/probe',
      expectedStatus: 200,
      expectedContent: '__probe'
    },
    {
      name: 'Public Intake (/intake)',
      url: '/intake',
      expectedStatus: 200,
      expectedContent: 'intake'
    },
    {
      name: 'Protected Client Portal (unauth)',
      url: '/client-portal',
      expectedStatus: 302, // Should redirect to login
      expectedContent: 'redirect'
    },
    {
      name: 'Protected Sessions (unauth)',
      url: '/sessions',
      expectedStatus: 302, // Should redirect to login
      expectedContent: 'redirect'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await fetch(`${BASE_URL}${test.url}`);
      const content = await response.text();
      
      const statusMatch = response.status === test.expectedStatus;
      const contentMatch = content.includes(test.expectedContent);
      
      if (statusMatch && contentMatch) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Expected: Status ${test.expectedStatus}, Content containing "${test.expectedContent}"`);
        console.log(`   Got: Status ${response.status}, Content: ${content.substring(0, 100)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Navigation implementation is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Run the smoke test
smokeTest().catch(error => {
  console.error('💥 Smoke test failed:', error);
  process.exit(1);
});
