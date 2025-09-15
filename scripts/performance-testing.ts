/**
 * @fileoverview HT-008.7.4: Performance Testing Script
 * @description Comprehensive performance testing automation script
 * @version 2.0.0
 * @author OSS Hero System - HT-008 Phase 7
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// Performance testing configuration
const PERFORMANCE_CONFIG = {
  lighthouse: {
    urls: [
      'http://localhost:3000/',
      'http://localhost:3000/intake',
      'http://localhost:3000/dashboard',
      'http://localhost:3000/status',
      'http://localhost:3000/sessions',
      'http://localhost:3000/clients'
    ],
    runs: 3,
    timeout: 30000
  },
  playwright: {
    projects: ['chromium', 'firefox', 'webkit'],
    timeout: 60000
  }
};

// Performance testing utilities
class PerformanceTester {
  private results: any[] = [];
  private errors: string[] = [];

  async runLighthouseTests(): Promise<void> {
    console.log('🔍 Running Lighthouse CI performance tests...');
    
    try {
      // Check if Lighthouse CI is installed
      if (!this.isLighthouseInstalled()) {
        console.log('📦 Installing Lighthouse CI...');
        execSync('npm install -g @lhci/cli', { stdio: 'inherit' });
      }

      // Run Lighthouse CI
      const command = 'lhci autorun --config=lighthouserc.js';
      execSync(command, { 
        stdio: 'inherit',
        timeout: PERFORMANCE_CONFIG.lighthouse.timeout
      });

      console.log('✅ Lighthouse CI tests completed successfully');
    } catch (error) {
      const errorMessage = `Lighthouse CI test failed: ${error}`;
      console.error('❌', errorMessage);
      this.errors.push(errorMessage);
    }
  }

  async runPlaywrightPerformanceTests(): Promise<void> {
    console.log('🎭 Running Playwright performance tests...');
    
    try {
      const command = 'npx playwright test tests/e2e/performance-comprehensive.spec.ts --reporter=json --output-file=performance-results.json';
      execSync(command, { 
        stdio: 'inherit',
        timeout: PERFORMANCE_CONFIG.playwright.timeout
      });

      console.log('✅ Playwright performance tests completed successfully');
    } catch (error) {
      const errorMessage = `Playwright performance test failed: ${error}`;
      console.error('❌', errorMessage);
      this.errors.push(errorMessage);
    }
  }

  async runBundleAnalysis(): Promise<void> {
    console.log('📦 Running bundle size analysis...');
    
    try {
      // Build the application
      execSync('npm run build', { stdio: 'inherit' });

      // Analyze bundle size
      const command = 'npx @next/bundle-analyzer';
      execSync(command, { stdio: 'inherit' });

      console.log('✅ Bundle analysis completed successfully');
    } catch (error) {
      const errorMessage = `Bundle analysis failed: ${error}`;
      console.error('❌', errorMessage);
      this.errors.push(errorMessage);
    }
  }

  async runCoreWebVitalsTest(): Promise<void> {
    console.log('⚡ Running Core Web Vitals test...');
    
    try {
      const command = 'npx web-vitals-cli http://localhost:3000/';
      execSync(command, { 
        stdio: 'inherit',
        timeout: 30000
      });

      console.log('✅ Core Web Vitals test completed successfully');
    } catch (error) {
      const errorMessage = `Core Web Vitals test failed: ${error}`;
      console.error('❌', errorMessage);
      this.errors.push(errorMessage);
    }
  }

  async generatePerformanceReport(): Promise<void> {
    console.log('📊 Generating performance report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      tests: {
        lighthouse: this.results.filter(r => r.type === 'lighthouse'),
        playwright: this.results.filter(r => r.type === 'playwright'),
        bundle: this.results.filter(r => r.type === 'bundle'),
        coreWebVitals: this.results.filter(r => r.type === 'coreWebVitals')
      },
      errors: this.errors,
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.passed).length,
        failedTests: this.results.filter(r => !r.passed).length,
        errorCount: this.errors.length
      }
    };

    // Write report to file
    const fs = await import('fs');
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    
    console.log('📄 Performance report generated: performance-report.json');
  }

  private isLighthouseInstalled(): boolean {
    try {
      execSync('lhci --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting comprehensive performance testing...');
    console.log('=' .repeat(50));

    try {
      // Run all performance tests
      await this.runLighthouseTests();
      await this.runPlaywrightPerformanceTests();
      await this.runBundleAnalysis();
      await this.runCoreWebVitalsTest();

      // Generate report
      await this.generatePerformanceReport();

      console.log('=' .repeat(50));
      console.log('🎉 Performance testing completed!');
      
      if (this.errors.length > 0) {
        console.log(`⚠️  ${this.errors.length} errors encountered:`);
        this.errors.forEach(error => console.log(`   - ${error}`));
        process.exit(1);
      } else {
        console.log('✅ All performance tests passed!');
        process.exit(0);
      }
    } catch (error) {
      console.error('💥 Performance testing failed:', error);
      process.exit(1);
    }
  }
}

// Run performance tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PerformanceTester();
  tester.runAllTests();
}

export default PerformanceTester;
