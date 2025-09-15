/**
 * HT-004.6.1: Automated Test Suite - Test Runner Script
 * Created: 2025-09-08T18:45:00.000Z
 */

// Hero Tasks Test Runner Script

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = (message: string, color: keyof typeof colors = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command: string, description: string) => {
  log(`\n${colors.bold}${colors.blue}Running: ${description}${colors.reset}`);
  log(`${colors.yellow}Command: ${command}${colors.reset}\n`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    console.error(error);
    return false;
  }
};

const ensureDirectoryExists = (path: string) => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
    log(`📁 Created directory: ${path}`, 'blue');
  }
};

const main = async () => {
  log(`${colors.bold}${colors.blue}🚀 HT-004.6.1: Automated Test Suite Runner${colors.reset}`);
  log(`${colors.yellow}Starting comprehensive test execution...${colors.reset}\n`);

  // Ensure test directories exist
  const testDirs = [
    'tests/hero-tasks/unit',
    'tests/hero-tasks/integration',
    'tests/hero-tasks/e2e',
    'tests/hero-tasks/setup',
    'coverage/hero-tasks'
  ];

  testDirs.forEach(dir => ensureDirectoryExists(dir));

  let allTestsPassed = true;
  const testResults = [];

  // 1. Unit Tests
  log(`${colors.bold}${colors.blue}📋 Phase 1: Unit Tests${colors.reset}`);
  const unitTestsPassed = runCommand(
    'npm run test:unit -- --testPathPattern="tests/hero-tasks/unit" --coverage --coverageDirectory=coverage/hero-tasks/unit',
    'Unit Tests for Hero Tasks Components and Utilities'
  );
  testResults.push({ name: 'Unit Tests', passed: unitTestsPassed });

  // 2. Integration Tests
  log(`${colors.bold}${colors.blue}🔗 Phase 2: Integration Tests${colors.reset}`);
  const integrationTestsPassed = runCommand(
    'npm run test:integration -- --testPathPattern="tests/hero-tasks/integration" --coverage --coverageDirectory=coverage/hero-tasks/integration',
    'Integration Tests for Hero Tasks API Endpoints'
  );
  testResults.push({ name: 'Integration Tests', passed: integrationTestsPassed });

  // 3. E2E Tests
  log(`${colors.bold}${colors.blue}🎭 Phase 3: End-to-End Tests${colors.reset}`);
  const e2eTestsPassed = runCommand(
    'npm run test:e2e -- --grep="Hero Tasks"',
    'End-to-End Tests for Complete User Workflows'
  );
  testResults.push({ name: 'E2E Tests', passed: e2eTestsPassed });

  // 4. Performance Tests
  log(`${colors.bold}${colors.blue}⚡ Phase 4: Performance Tests${colors.reset}`);
  const performanceTestsPassed = runCommand(
    'npm run test:performance -- --testPathPattern="tests/hero-tasks/performance"',
    'Performance Tests for Hero Tasks System'
  );
  testResults.push({ name: 'Performance Tests', passed: performanceTestsPassed });

  // 5. Accessibility Tests
  log(`${colors.bold}${colors.blue}♿ Phase 5: Accessibility Tests${colors.reset}`);
  const a11yTestsPassed = runCommand(
    'npm run test:a11y -- --testPathPattern="tests/hero-tasks/accessibility"',
    'Accessibility Tests for Hero Tasks Components'
  );
  testResults.push({ name: 'Accessibility Tests', passed: a11yTestsPassed });

  // 6. Security Tests
  log(`${colors.bold}${colors.blue}🔒 Phase 6: Security Tests${colors.reset}`);
  const securityTestsPassed = runCommand(
    'npm run test:security -- --testPathPattern="tests/hero-tasks/security"',
    'Security Tests for Hero Tasks API and Components'
  );
  testResults.push({ name: 'Security Tests', passed: securityTestsPassed });

  // Generate comprehensive coverage report
  log(`${colors.bold}${colors.blue}📊 Generating Coverage Report${colors.reset}`);
  runCommand(
    'npm run test:coverage -- --coverageDirectory=coverage/hero-tasks --coverageReporters=html,text,lcov,json',
    'Comprehensive Coverage Report Generation'
  );

  // Generate test report
  log(`${colors.bold}${colors.blue}📋 Generating Test Report${colors.reset}`);
  const reportData = {
    timestamp: new Date().toISOString(),
    testResults,
    summary: {
      total: testResults.length,
      passed: testResults.filter(r => r.passed).length,
      failed: testResults.filter(r => !r.passed).length,
      successRate: (testResults.filter(r => r.passed).length / testResults.length) * 100
    }
  };

  // Write test report
  const fs = require('fs');
  fs.writeFileSync(
    'coverage/hero-tasks/test-report.json',
    JSON.stringify(reportData, null, 2)
  );

  // Display final results
  log(`\n${colors.bold}${colors.blue}📊 Test Execution Summary${colors.reset}`);
  log(`${colors.yellow}================================${colors.reset}`);
  
  testResults.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${status} ${result.name}`, color);
  });

  log(`\n${colors.yellow}Overall Success Rate: ${reportData.summary.successRate.toFixed(1)}%${colors.reset}`);
  log(`${colors.yellow}Tests Passed: ${reportData.summary.passed}/${reportData.summary.total}${colors.reset}`);

  if (reportData.summary.failed > 0) {
    log(`\n${colors.red}❌ Some tests failed. Please review the output above.${colors.reset}`);
    allTestsPassed = false;
  } else {
    log(`\n${colors.green}🎉 All tests passed successfully!${colors.reset}`);
  }

  // Display coverage information
  log(`\n${colors.bold}${colors.blue}📈 Coverage Information${colors.reset}`);
  log(`${colors.yellow}Coverage reports generated in: coverage/hero-tasks/${colors.reset}`);
  log(`${colors.yellow}HTML report: coverage/hero-tasks/lcov-report/index.html${colors.reset}`);
  log(`${colors.yellow}JSON report: coverage/hero-tasks/test-report.json${colors.reset}`);

  // Exit with appropriate code
  process.exit(allTestsPassed ? 0 : 1);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled error: ${error}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Uncaught exception: ${error}`, 'red');
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  log(`❌ Test runner failed: ${error}`, 'red');
  process.exit(1);
});
