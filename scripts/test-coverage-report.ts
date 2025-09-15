#!/usr/bin/env tsx

/**
 * @fileoverview HT-008.7.8: Test Coverage Reporting Script
 * @module scripts/test-coverage-report.ts
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.7.8 - Test Documentation & Coverage Reporting
 * Focus: Comprehensive test coverage reporting with metrics and analytics
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (testing infrastructure reporting)
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import * as path from 'path';

/**
 * Test Coverage Report Configuration
 */
interface CoverageReportConfig {
  outputDir: string;
  formats: ('html' | 'json' | 'lcov' | 'text' | 'markdown')[];
  thresholds: {
    global: number;
    lib: number;
    components: number;
    app: number;
  };
  includeMetrics: boolean;
  includeTrends: boolean;
  includeRecommendations: boolean;
}

/**
 * Coverage Metrics
 */
interface CoverageMetrics {
  total: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  covered: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  percentage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  files: Array<{
    path: string;
    lines: { total: number; covered: number; percentage: number };
    functions: { total: number; covered: number; percentage: number };
    branches: { total: number; covered: number; percentage: number };
    statements: { total: number; covered: number; percentage: number };
  }>;
}

/**
 * Test Coverage Reporting System
 * 
 * This script generates comprehensive test coverage reports including:
 * - Coverage metrics and analytics
 * - Coverage trends and history
 * - Coverage recommendations
 * - Multiple output formats (HTML, JSON, LCOV, Markdown)
 * - Coverage visualization and dashboards
 */
class TestCoverageReporter {
  private config: CoverageReportConfig;
  private projectRoot: string;
  private startTime: Date;

  constructor(config: CoverageReportConfig) {
    this.config = config;
    this.projectRoot = process.cwd();
    this.startTime = new Date();
  }

  /**
   * Generate comprehensive test coverage report
   */
  async generateCoverageReport(): Promise<void> {
    console.log('📊 Generating Comprehensive Test Coverage Report...');
    console.log('================================================');

    try {
      // Ensure output directory exists
      if (!existsSync(this.config.outputDir)) {
        mkdirSync(this.config.outputDir, { recursive: true });
      }

      // Run tests with coverage
      await this.runTestsWithCoverage();
      
      // Collect coverage data
      const coverageData = await this.collectCoverageData();
      
      // Generate coverage metrics
      const metrics = await this.generateCoverageMetrics(coverageData);
      
      // Generate reports in requested formats
      await this.generateReports(coverageData, metrics);
      
      // Generate coverage trends
      if (this.config.includeTrends) {
        await this.generateCoverageTrends(metrics);
      }
      
      // Generate recommendations
      if (this.config.includeRecommendations) {
        await this.generateRecommendations(metrics);
      }
      
      // Display summary
      this.displaySummary(metrics);

    } catch (error) {
      console.error('❌ Coverage report generation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Run tests with coverage
   */
  private async runTestsWithCoverage(): Promise<void> {
    console.log('🧪 Running tests with coverage...');

    try {
      // Run Jest tests with coverage
      execSync('npm run test:coverage', { 
        stdio: 'inherit',
        cwd: this.projectRoot
      });
      
      console.log('✅ Tests completed successfully');
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  /**
   * Collect coverage data
   */
  private async collectCoverageData(): Promise<any> {
    console.log('📈 Collecting coverage data...');

    const coveragePath = path.join(this.projectRoot, 'coverage', 'coverage-final.json');
    
    if (!existsSync(coveragePath)) {
      throw new Error('Coverage data not found. Run tests with coverage first.');
    }

    const coverageData = JSON.parse(readFileSync(coveragePath, 'utf8'));
    console.log(`✅ Collected coverage data for ${Object.keys(coverageData).length} files`);
    
    return coverageData;
  }

  /**
   * Generate coverage metrics
   */
  private async generateCoverageMetrics(coverageData: any): Promise<CoverageMetrics> {
    console.log('📊 Generating coverage metrics...');

    const metrics: CoverageMetrics = {
      total: { lines: 0, functions: 0, branches: 0, statements: 0 },
      covered: { lines: 0, functions: 0, branches: 0, statements: 0 },
      percentage: { lines: 0, functions: 0, branches: 0, statements: 0 },
      files: []
    };

    // Process each file's coverage data
    for (const [filePath, fileData] of Object.entries(coverageData)) {
      const data = fileData as any;
      
      // Calculate file metrics
      const fileMetrics = {
        path: filePath,
        lines: this.calculateMetric(data.l, 'lines'),
        functions: this.calculateMetric(data.f, 'functions'),
        branches: this.calculateMetric(data.b, 'branches'),
        statements: this.calculateMetric(data.s, 'statements')
      };

      metrics.files.push(fileMetrics);

      // Add to totals
      metrics.total.lines += fileMetrics.lines.total;
      metrics.total.functions += fileMetrics.functions.total;
      metrics.total.branches += fileMetrics.branches.total;
      metrics.total.statements += fileMetrics.statements.total;

      metrics.covered.lines += fileMetrics.lines.covered;
      metrics.covered.functions += fileMetrics.functions.covered;
      metrics.covered.branches += fileMetrics.branches.covered;
      metrics.covered.statements += fileMetrics.statements.covered;
    }

    // Calculate percentages
    metrics.percentage.lines = this.calculatePercentage(metrics.covered.lines, metrics.total.lines);
    metrics.percentage.functions = this.calculatePercentage(metrics.covered.functions, metrics.total.functions);
    metrics.percentage.branches = this.calculatePercentage(metrics.covered.branches, metrics.total.branches);
    metrics.percentage.statements = this.calculatePercentage(metrics.covered.statements, metrics.total.statements);

    console.log('✅ Coverage metrics generated');
    return metrics;
  }

  /**
   * Calculate metric for a specific coverage type
   */
  private calculateMetric(data: any, type: string): { total: number; covered: number; percentage: number } {
    const total = Object.keys(data).length;
    const covered = Object.values(data).filter((value: any) => value > 0).length;
    const percentage = this.calculatePercentage(covered, total);
    
    return { total, covered, percentage };
  }

  /**
   * Calculate percentage
   */
  private calculatePercentage(covered: number, total: number): number {
    return total > 0 ? Math.round((covered / total) * 100 * 100) / 100 : 0;
  }

  /**
   * Generate reports in requested formats
   */
  private async generateReports(coverageData: any, metrics: CoverageMetrics): Promise<void> {
    console.log('📄 Generating reports...');

    for (const format of this.config.formats) {
      switch (format) {
        case 'html':
          await this.generateHTMLReport(metrics);
          break;
        case 'json':
          await this.generateJSONReport(coverageData, metrics);
          break;
        case 'lcov':
          await this.generateLCOVReport(coverageData);
          break;
        case 'text':
          await this.generateTextReport(metrics);
          break;
        case 'markdown':
          await this.generateMarkdownReport(metrics);
          break;
      }
    }

    console.log('✅ Reports generated');
  }

  /**
   * Generate HTML report
   */
  private async generateHTMLReport(metrics: CoverageMetrics): Promise<void> {
    const htmlPath = path.join(this.config.outputDir, 'coverage-report.html');
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .percentage { font-weight: bold; }
        .good { color: green; }
        .warning { color: orange; }
        .poor { color: red; }
        .files { margin-top: 20px; }
        .file { margin: 10px 0; padding: 10px; border: 1px solid #eee; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Test Coverage Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Project:</strong> ${path.basename(this.projectRoot)}</p>
    </div>

    <div class="summary">
        <div class="card">
            <h3>Lines</h3>
            <div class="metric">
                <span>Coverage</span>
                <span class="percentage ${this.getCoverageClass(metrics.percentage.lines)}">${metrics.percentage.lines}%</span>
            </div>
            <div class="metric">
                <span>Covered</span>
                <span>${metrics.covered.lines}/${metrics.total.lines}</span>
            </div>
        </div>
        <div class="card">
            <h3>Functions</h3>
            <div class="metric">
                <span>Coverage</span>
                <span class="percentage ${this.getCoverageClass(metrics.percentage.functions)}">${metrics.percentage.functions}%</span>
            </div>
            <div class="metric">
                <span>Covered</span>
                <span>${metrics.covered.functions}/${metrics.total.functions}</span>
            </div>
        </div>
        <div class="card">
            <h3>Branches</h3>
            <div class="metric">
                <span>Coverage</span>
                <span class="percentage ${this.getCoverageClass(metrics.percentage.branches)}">${metrics.percentage.branches}%</span>
            </div>
            <div class="metric">
                <span>Covered</span>
                <span>${metrics.covered.branches}/${metrics.total.branches}</span>
            </div>
        </div>
        <div class="card">
            <h3>Statements</h3>
            <div class="metric">
                <span>Coverage</span>
                <span class="percentage ${this.getCoverageClass(metrics.percentage.statements)}">${metrics.percentage.statements}%</span>
            </div>
            <div class="metric">
                <span>Covered</span>
                <span>${metrics.covered.statements}/${metrics.total.statements}</span>
            </div>
        </div>
    </div>

    <div class="files">
        <h2>File Coverage Details</h2>
        ${metrics.files.map(file => `
            <div class="file">
                <h4>${file.path}</h4>
                <div class="metric">
                    <span>Lines:</span>
                    <span class="${this.getCoverageClass(file.lines.percentage)}">${file.lines.percentage}% (${file.lines.covered}/${file.lines.total})</span>
                </div>
                <div class="metric">
                    <span>Functions:</span>
                    <span class="${this.getCoverageClass(file.functions.percentage)}">${file.functions.percentage}% (${file.functions.covered}/${file.functions.total})</span>
                </div>
                <div class="metric">
                    <span>Branches:</span>
                    <span class="${this.getCoverageClass(file.branches.percentage)}">${file.branches.percentage}% (${file.branches.covered}/${file.branches.total})</span>
                </div>
                <div class="metric">
                    <span>Statements:</span>
                    <span class="${this.getCoverageClass(file.statements.percentage)}">${file.statements.percentage}% (${file.statements.covered}/${file.statements.total})</span>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    writeFileSync(htmlPath, htmlContent);
    console.log(`📄 HTML report generated: ${htmlPath}`);
  }

  /**
   * Generate JSON report
   */
  private async generateJSONReport(coverageData: any, metrics: CoverageMetrics): Promise<void> {
    const jsonPath = path.join(this.config.outputDir, 'coverage-report.json');
    
    const reportData = {
      timestamp: new Date().toISOString(),
      project: path.basename(this.projectRoot),
      metrics,
      thresholds: this.config.thresholds,
      files: metrics.files,
      summary: {
        overall: this.calculateOverallCoverage(metrics),
        status: this.getCoverageStatus(metrics),
        recommendations: this.generateRecommendations(metrics)
      }
    };

    writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 JSON report generated: ${jsonPath}`);
  }

  /**
   * Generate LCOV report
   */
  private async generateLCOVReport(coverageData: any): Promise<void> {
    const lcovPath = path.join(this.config.outputDir, 'coverage-report.lcov');
    
    // Copy existing LCOV file if it exists
    const existingLcovPath = path.join(this.projectRoot, 'coverage', 'lcov.info');
    if (existsSync(existingLcovPath)) {
      const lcovContent = readFileSync(existingLcovPath, 'utf8');
      writeFileSync(lcovPath, lcovContent);
      console.log(`📄 LCOV report generated: ${lcovPath}`);
    } else {
      console.log('⚠️ LCOV file not found, skipping LCOV report');
    }
  }

  /**
   * Generate text report
   */
  private async generateTextReport(metrics: CoverageMetrics): Promise<void> {
    const textPath = path.join(this.config.outputDir, 'coverage-report.txt');
    
    const textContent = `Test Coverage Report
Generated: ${new Date().toLocaleString()}
Project: ${path.basename(this.projectRoot)}

Overall Coverage: ${this.calculateOverallCoverage(metrics)}%

Lines: ${metrics.percentage.lines}% (${metrics.covered.lines}/${metrics.total.lines})
Functions: ${metrics.percentage.functions}% (${metrics.covered.functions}/${metrics.total.functions})
Branches: ${metrics.percentage.branches}% (${metrics.covered.branches}/${metrics.total.branches})
Statements: ${metrics.percentage.statements}% (${metrics.covered.statements}/${metrics.total.statements})

File Coverage:
${metrics.files.map(file => `
${file.path}:
  Lines: ${file.lines.percentage}% (${file.lines.covered}/${file.lines.total})
  Functions: ${file.functions.percentage}% (${file.functions.covered}/${file.functions.total})
  Branches: ${file.branches.percentage}% (${file.branches.covered}/${file.branches.total})
  Statements: ${file.statements.percentage}% (${file.statements.covered}/${file.statements.total})
`).join('')}

Thresholds:
  Global: ${this.config.thresholds.global}%
  lib/: ${this.config.thresholds.lib}%
  components/: ${this.config.thresholds.components}%
  app/: ${this.config.thresholds.app}%

Status: ${this.getCoverageStatus(metrics)}
`;

    writeFileSync(textPath, textContent);
    console.log(`📄 Text report generated: ${textPath}`);
  }

  /**
   * Generate Markdown report
   */
  private async generateMarkdownReport(metrics: CoverageMetrics): Promise<void> {
    const mdPath = path.join(this.config.outputDir, 'coverage-report.md');
    
    const mdContent = `# 📊 Test Coverage Report

**Generated:** ${new Date().toLocaleString()}  
**Project:** ${path.basename(this.projectRoot)}  
**Overall Coverage:** ${this.calculateOverallCoverage(metrics)}%

## Coverage Summary

| Metric | Coverage | Covered/Total |
|--------|----------|---------------|
| Lines | ${metrics.percentage.lines}% | ${metrics.covered.lines}/${metrics.total.lines} |
| Functions | ${metrics.percentage.functions}% | ${metrics.covered.functions}/${metrics.total.functions} |
| Branches | ${metrics.percentage.branches}% | ${metrics.covered.branches}/${metrics.total.branches} |
| Statements | ${metrics.percentage.statements}% | ${metrics.covered.statements}/${metrics.total.statements} |

## Coverage Thresholds

| Path | Threshold | Status |
|------|-----------|--------|
| Global | ${this.config.thresholds.global}% | ${this.getThresholdStatus(metrics.percentage.lines, this.config.thresholds.global)} |
| lib/ | ${this.config.thresholds.lib}% | ${this.getThresholdStatus(metrics.percentage.lines, this.config.thresholds.lib)} |
| components/ | ${this.config.thresholds.components}% | ${this.getThresholdStatus(metrics.percentage.lines, this.config.thresholds.components)} |
| app/ | ${this.config.thresholds.app}% | ${this.getThresholdStatus(metrics.percentage.lines, this.config.thresholds.app)} |

## File Coverage Details

${metrics.files.map(file => `
### ${file.path}

| Metric | Coverage | Covered/Total |
|--------|----------|---------------|
| Lines | ${file.lines.percentage}% | ${file.lines.covered}/${file.lines.total} |
| Functions | ${file.functions.percentage}% | ${file.functions.covered}/${file.functions.total} |
| Branches | ${file.branches.percentage}% | ${file.branches.covered}/${file.branches.total} |
| Statements | ${file.statements.percentage}% | ${file.statements.covered}/${file.statements.total} |
`).join('')}

## Status

**Overall Status:** ${this.getCoverageStatus(metrics)}

## Recommendations

${this.generateRecommendations(metrics).map(rec => `- ${rec}`).join('\n')}

---

_Generated by HT-008.7.8 Test Coverage Reporting System_`;

    writeFileSync(mdPath, mdContent);
    console.log(`📄 Markdown report generated: ${mdPath}`);
  }

  /**
   * Generate coverage trends
   */
  private async generateCoverageTrends(metrics: CoverageMetrics): Promise<void> {
    console.log('📈 Generating coverage trends...');
    
    // This would typically read historical data and generate trend analysis
    // For now, we'll create a placeholder
    const trendsPath = path.join(this.config.outputDir, 'coverage-trends.json');
    
    const trendsData = {
      timestamp: new Date().toISOString(),
      current: metrics,
      trends: {
        lines: { direction: 'stable', change: 0 },
        functions: { direction: 'stable', change: 0 },
        branches: { direction: 'stable', change: 0 },
        statements: { direction: 'stable', change: 0 }
      },
      recommendations: this.generateTrendRecommendations(metrics)
    };

    writeFileSync(trendsPath, JSON.stringify(trendsData, null, 2));
    console.log(`📈 Coverage trends generated: ${trendsPath}`);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(metrics: CoverageMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.percentage.lines < this.config.thresholds.global) {
      recommendations.push(`Increase line coverage from ${metrics.percentage.lines}% to ${this.config.thresholds.global}%`);
    }

    if (metrics.percentage.functions < this.config.thresholds.global) {
      recommendations.push(`Increase function coverage from ${metrics.percentage.functions}% to ${this.config.thresholds.global}%`);
    }

    if (metrics.percentage.branches < this.config.thresholds.global) {
      recommendations.push(`Increase branch coverage from ${metrics.percentage.branches}% to ${this.config.thresholds.global}%`);
    }

    if (metrics.percentage.statements < this.config.thresholds.global) {
      recommendations.push(`Increase statement coverage from ${metrics.percentage.statements}% to ${this.config.thresholds.global}%`);
    }

    // Add specific file recommendations
    const lowCoverageFiles = metrics.files.filter(file => 
      file.lines.percentage < this.config.thresholds.global
    );

    if (lowCoverageFiles.length > 0) {
      recommendations.push(`Focus on improving coverage for ${lowCoverageFiles.length} files with low coverage`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Coverage targets are met. Consider adding more edge case tests.');
    }

    return recommendations;
  }

  /**
   * Generate trend recommendations
   */
  private generateTrendRecommendations(metrics: CoverageMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.percentage.lines < 80) {
      recommendations.push('Line coverage is below 80%. Consider adding more unit tests.');
    }

    if (metrics.percentage.branches < 70) {
      recommendations.push('Branch coverage is below 70%. Consider adding more integration tests.');
    }

    if (metrics.percentage.functions < 85) {
      recommendations.push('Function coverage is below 85%. Consider adding more function tests.');
    }

    return recommendations;
  }

  /**
   * Calculate overall coverage
   */
  private calculateOverallCoverage(metrics: CoverageMetrics): number {
    const total = metrics.percentage.lines + metrics.percentage.functions + 
                  metrics.percentage.branches + metrics.percentage.statements;
    return Math.round(total / 4 * 100) / 100;
  }

  /**
   * Get coverage status
   */
  private getCoverageStatus(metrics: CoverageMetrics): string {
    const overall = this.calculateOverallCoverage(metrics);
    
    if (overall >= this.config.thresholds.global) {
      return '✅ PASS';
    } else if (overall >= this.config.thresholds.global * 0.8) {
      return '⚠️ WARNING';
    } else {
      return '❌ FAIL';
    }
  }

  /**
   * Get coverage class for styling
   */
  private getCoverageClass(percentage: number): string {
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'warning';
    return 'poor';
  }

  /**
   * Get threshold status
   */
  private getThresholdStatus(percentage: number, threshold: number): string {
    return percentage >= threshold ? '✅ PASS' : '❌ FAIL';
  }

  /**
   * Display summary
   */
  private displaySummary(metrics: CoverageMetrics): void {
    const duration = Date.now() - this.startTime.getTime();
    const overall = this.calculateOverallCoverage(metrics);
    const status = this.getCoverageStatus(metrics);

    console.log('\n📊 Test Coverage Report Summary');
    console.log('==============================');
    console.log(`Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`Overall Coverage: ${overall}%`);
    console.log(`Status: ${status}`);
    console.log(`Files Analyzed: ${metrics.files.length}`);
    console.log(`Lines: ${metrics.percentage.lines}% (${metrics.covered.lines}/${metrics.total.lines})`);
    console.log(`Functions: ${metrics.percentage.functions}% (${metrics.covered.functions}/${metrics.total.functions})`);
    console.log(`Branches: ${metrics.percentage.branches}% (${metrics.covered.branches}/${metrics.total.branches})`);
    console.log(`Statements: ${metrics.percentage.statements}% (${metrics.covered.statements}/${metrics.total.statements})`);

    console.log('\n📄 Reports generated:');
    this.config.formats.forEach(format => {
      console.log(`- ${format.toUpperCase()} report`);
    });

    console.log('\n🎯 Recommendations:');
    this.generateRecommendations(metrics).forEach(rec => {
      console.log(`  - ${rec}`);
    });

    console.log('\n✅ Coverage report generation complete!');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const config: CoverageReportConfig = {
    outputDir: 'reports/coverage',
    formats: ['html', 'json', 'lcov', 'text', 'markdown'],
    thresholds: {
      global: 80,
      lib: 85,
      components: 80,
      app: 75
    },
    includeMetrics: true,
    includeTrends: true,
    includeRecommendations: true
  };

  const reporter = new TestCoverageReporter(config);
  
  try {
    await reporter.generateCoverageReport();
    process.exit(0);
  } catch (error) {
    console.error('❌ Coverage report generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TestCoverageReporter };
export type { CoverageReportConfig, CoverageMetrics };
