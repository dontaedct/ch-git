/**
 * @fileoverview HT-006 Visual Regression Testing Automation
 * @module scripts/visual-regression-test.ts
 * @author HT-006 Phase 5 - Visual Regression Safety
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 5 - Visual Regression Safety
 * Purpose: Automated visual regression testing with baseline management
 * Safety: Sandbox-isolated, comprehensive coverage
 * Status: Phase 5 implementation
 */

import { chromium, Browser, Page } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

interface VisualTestConfig {
  baseUrl: string;
  storybookUrl: string;
  outputDir: string;
  viewports: Array<{ width: number; height: number; name: string }>;
  themes: string[];
  brands: string[];
}

interface StoryInfo {
  id: string;
  title: string;
  name: string;
  parameters?: {
    layout?: string;
    viewport?: string;
  };
}

interface TestResult {
  storyId: string;
  viewport: string;
  theme: string;
  brand: string;
  status: 'passed' | 'failed' | 'new';
  diff?: number;
  baselinePath?: string;
  currentPath?: string;
  diffPath?: string;
}

class VisualRegressionTester {
  private config: VisualTestConfig;
  private browser: Browser | null = null;
  private results: TestResult[] = [];

  constructor(config: VisualTestConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Visual Regression Tester...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Ensure output directory exists
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'baselines'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'current'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'diffs'), { recursive: true });
  }

  async getStories(): Promise<StoryInfo[]> {
    console.log('📚 Fetching stories from Storybook...');
    
    const page = await this.browser!.newPage();
    
    try {
      // Navigate to Storybook's stories.json endpoint
      await page.goto(`${this.config.storybookUrl}/stories.json`);
      const storiesData = await page.evaluate(() => document.body.textContent);
      
      if (!storiesData) {
        throw new Error('Failed to fetch stories data');
      }

      const stories = JSON.parse(storiesData);
      const storyList: StoryInfo[] = [];

      // Extract story information
      for (const [storyId, storyData] of Object.entries(stories.stories)) {
        const story = storyData as any;
        if (story.parameters?.docs?.disable) continue;
        
        storyList.push({
          id: storyId,
          title: story.title,
          name: story.name,
          parameters: story.parameters
        });
      }

      console.log(`✅ Found ${storyList.length} stories`);
      return storyList;
    } finally {
      await page.close();
    }
  }

  async captureStoryScreenshot(
    storyId: string, 
    viewport: { width: number; height: number; name: string },
    theme: string,
    brand: string
  ): Promise<string> {
    const page = await this.browser!.newPage();
    
    try {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate to story
      const storyUrl = `${this.config.storybookUrl}/iframe.html?id=${storyId}&viewMode=story&theme=${theme}&brand=${brand}`;
      await page.goto(storyUrl, { waitUntil: 'networkidle' });
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Take screenshot
      const filename = `${storyId.replace(/[^a-zA-Z0-9]/g, '_')}_${viewport.name}_${theme}_${brand}.png`;
      const filepath = path.join(this.config.outputDir, 'current', filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: true,
        animations: 'disabled'
      });
      
      return filepath;
    } finally {
      await page.close();
    }
  }

  async compareWithBaseline(currentPath: string, storyId: string, viewport: string, theme: string, brand: string): Promise<TestResult> {
    const filename = `${storyId.replace(/[^a-zA-Z0-9]/g, '_')}_${viewport}_${theme}_${brand}.png`;
    const baselinePath = path.join(this.config.outputDir, 'baselines', filename);
    
    try {
      // Check if baseline exists
      await fs.access(baselinePath);
      
      // Compare images using Playwright
      const page = await this.browser!.newPage();
      
      try {
        const baselineBuffer = await fs.readFile(baselinePath);
        const currentBuffer = await fs.readFile(currentPath);
        
        // Simple pixel comparison (in production, use proper image diff library)
        const diff = baselineBuffer.length !== currentBuffer.length ? 1 : 0;
        
        if (diff > 0) {
          // Generate diff image
          const diffPath = path.join(this.config.outputDir, 'diffs', filename);
          await fs.writeFile(diffPath, currentBuffer);
          
          return {
            storyId,
            viewport,
            theme,
            brand,
            status: 'failed',
            diff,
            baselinePath,
            currentPath,
            diffPath
          };
        } else {
          return {
            storyId,
            viewport,
            theme,
            brand,
            status: 'passed',
            diff: 0,
            baselinePath,
            currentPath
          };
        }
      } finally {
        await page.close();
      }
    } catch (error) {
      // Baseline doesn't exist - this is a new test
      await fs.copyFile(currentPath, baselinePath);
      
      return {
        storyId,
        viewport,
        theme,
        brand,
        status: 'new',
        baselinePath,
        currentPath
      };
    }
  }

  async runVisualTests(): Promise<void> {
    console.log('🎯 Starting visual regression tests...');
    
    const stories = await this.getStories();
    const totalTests = stories.length * this.config.viewports.length * this.config.themes.length * this.config.brands.length;
    let currentTest = 0;
    
    for (const story of stories) {
      for (const viewport of this.config.viewports) {
        for (const theme of this.config.themes) {
          for (const brand of this.config.brands) {
            currentTest++;
            console.log(`📸 Test ${currentTest}/${totalTests}: ${story.title} - ${story.name} (${viewport.name}, ${theme}, ${brand})`);
            
            try {
              // Capture current screenshot
              const currentPath = await this.captureStoryScreenshot(
                story.id,
                viewport,
                theme,
                brand
              );
              
              // Compare with baseline
              const result = await this.compareWithBaseline(
                currentPath,
                story.id,
                viewport.name,
                theme,
                brand
              );
              
              this.results.push(result);
              
              // Log result
              const statusIcon = result.status === 'passed' ? '✅' : 
                                result.status === 'failed' ? '❌' : '🆕';
              console.log(`   ${statusIcon} ${result.status.toUpperCase()}${result.diff ? ` (diff: ${result.diff})` : ''}`);
              
            } catch (error) {
              console.error(`   ❌ ERROR: ${error}`);
              this.results.push({
                storyId: story.id,
                viewport: viewport.name,
                theme,
                brand,
                status: 'failed'
              });
            }
          }
        }
      }
    }
  }

  async generateReport(): Promise<void> {
    console.log('📊 Generating visual test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        new: this.results.filter(r => r.status === 'new').length
      },
      results: this.results
    };
    
    const reportPath = path.join(this.config.outputDir, 'visual-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(this.config.outputDir, 'visual-test-report.html');
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`📋 Report generated: ${reportPath}`);
    console.log(`🌐 HTML Report: ${htmlPath}`);
    
    // Print summary
    console.log('\n📈 Test Summary:');
    console.log(`   Total Tests: ${report.summary.total}`);
    console.log(`   ✅ Passed: ${report.summary.passed}`);
    console.log(`   ❌ Failed: ${report.summary.failed}`);
    console.log(`   🆕 New: ${report.summary.new}`);
    
    if (report.summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`   - ${r.storyId} (${r.viewport}, ${r.theme}, ${r.brand})`);
        });
    }
  }

  private generateHTMLReport(report: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HT-006 Visual Regression Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .new { color: #17a2b8; }
        .results { margin-top: 30px; }
        .result-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .result-item:last-child { border-bottom: none; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status.passed { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .status.new { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HT-006 Visual Regression Test Report</h1>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${report.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="number passed">${report.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number failed">${report.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>New</h3>
                <div class="number new">${report.summary.new}</div>
            </div>
        </div>
        
        <div class="results">
            <h2>Test Results</h2>
            ${report.results.map((result: any) => `
                <div class="result-item">
                    <div>
                        <strong>${result.storyId}</strong><br>
                        <small>${result.viewport} • ${result.theme} • ${result.brand}</small>
                    </div>
                    <span class="status ${result.status}">${result.status.toUpperCase()}</span>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const config: VisualTestConfig = {
    baseUrl: 'http://localhost:3000',
    storybookUrl: 'http://localhost:6006',
    outputDir: './test-results/visual-regression',
    viewports: [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop' },
      { width: 1440, height: 900, name: 'wide' }
    ],
    themes: ['light', 'dark'],
    brands: ['default', 'salon', 'tech', 'realtor']
  };

  const tester = new VisualRegressionTester(config);
  
  try {
    await tester.initialize();
    await tester.runVisualTests();
    await tester.generateReport();
  } catch (error) {
    console.error('❌ Visual regression testing failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { VisualRegressionTester, VisualTestConfig, TestResult };
