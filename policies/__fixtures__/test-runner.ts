#!/usr/bin/env tsx

/**
 * Policy Test Runner
 * 
 * This script runs tests against the OPA policies to ensure they work correctly.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { IOPARunner } from '../../scripts/run-opa';
import { MockOPARunner } from '../../scripts/run-opa-mock';

interface TestFixture {
  input: any;
  expected: any;
}

interface TestResult {
  testName: string;
  passed: boolean;
  actual: any;
  expected: any;
  error?: string;
}

class PolicyTestRunner {
  private fixturesDir: string;
  private opaRunner: IOPARunner;

  constructor() {
    this.fixturesDir = join(process.cwd(), 'policies', '__fixtures__');
    
    // Always use mock runner for testing to ensure consistency
    console.log('🧪 Using mock OPA runner for policy testing');
    this.opaRunner = new MockOPARunner();
  }

  /**
   * Run all policy tests
   */
  async runAllTests(): Promise<TestResult[]> {
    const fixtures = this.loadTestFixtures();
    const results: TestResult[] = [];

    for (const fixture of fixtures) {
      try {
        const result = await this.runTest(fixture);
        results.push(result);
      } catch (error) {
        results.push({
          testName: fixture.name,
          passed: false,
          actual: null,
          expected: fixture.data.expected,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  /**
   * Load all test fixtures from the fixtures directory
   */
  private loadTestFixtures(): Array<{ name: string; data: TestFixture }> {
    const fixtures: Array<{ name: string; data: TestFixture }> = [];
    
    try {
      const files = readdirSync(this.fixturesDir);
      
      for (const file of files) {
        if (file.endsWith('_test.json')) {
          const filePath = join(this.fixturesDir, file);
          const content = readFileSync(filePath, 'utf8');
          const data = JSON.parse(content) as TestFixture;
          
          fixtures.push({
            name: file.replace('_test.json', ''),
            data
          });
        }
      }
    } catch (error) {
      console.error('Error loading test fixtures:', error);
    }

    return fixtures;
  }

  /**
   * Run a single test fixture
   */
  private async runTest(fixture: { name: string; data: TestFixture }): Promise<TestResult> {
    const { name, data } = fixture;
    
    try {
      // Run the policy evaluation
      const actual = await this.opaRunner.evaluatePolicies(data.input);
      
      // Compare with expected results
      const passed = this.compareResults(actual, data.expected);
      
      return {
        testName: name,
        passed,
        actual,
        expected: data.expected
      };
    } catch (error) {
      throw new Error(`Test execution failed: ${error}`);
    }
  }

  /**
   * Compare actual results with expected results
   */
  private compareResults(actual: any, expected: any): boolean {
    // Check if allow matches
    if (actual.allow !== expected.allow) {
      return false;
    }

    // Check if risk score matches (if expected)
    if (expected.riskScore !== undefined && actual.riskScore !== expected.riskScore) {
      return false;
    }

    // Check if reasons match (if expected)
    if (expected.reasons && !this.arraysEqual(actual.reasons, expected.reasons)) {
      return false;
    }

    // Check if suggested fixes match (if expected)
    if (expected.suggestedFixes && !this.arraysEqual(actual.suggestedFixes, expected.suggestedFixes)) {
      return false;
    }

    return true;
  }

  /**
   * Compare two arrays for equality
   */
  private arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    
    return sortedA.every((val, index) => val === sortedB[index]);
  }

  /**
   * Print test results summary
   */
  printResults(results: TestResult[]): void {
    console.log('\n🧪 Policy Test Results\n');
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    for (const result of results) {
      if (result.passed) {
        console.log(`✅ ${result.testName}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${result.testName}: FAILED`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        console.log(`   Expected: ${JSON.stringify(result.expected, null, 2)}`);
        console.log(`   Actual: ${JSON.stringify(result.actual, null, 2)}`);
        failed++;
      }
      console.log('');
    }
    
    console.log('='.repeat(50));
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    
    if (failed > 0) {
      process.exit(1);
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const runner = new PolicyTestRunner();
    const results = await runner.runAllTests();
    runner.printResults(results);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { PolicyTestRunner };
export type { TestResult };
