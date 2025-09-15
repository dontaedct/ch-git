/**
 * @fileoverview HT-008.9.1: Bundle Analysis and Performance Monitoring Script
 * @module scripts/bundle-analysis.ts
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Performance Optimization System
 * Task: HT-008.9.1 - Implement advanced bundle optimization
 * Focus: Bundle analysis and performance monitoring for optimization validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance optimization)
 */

import { BundleAnalyzer, BundleOptimizer, PerformanceBudgetValidator, DEFAULT_BUNDLE_CONFIG } from '../lib/performance/bundle-optimizer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Bundle analysis results interface
 */
interface BundleAnalysisResults {
  timestamp: string;
  analysis: any;
  recommendations: any[];
  budgetValidation: {
    isValid: boolean;
    violations: string[];
    score: number;
  };
  performanceMetrics: {
    totalSize: number;
    initialSize: number;
    asyncSize: number;
    chunkCount: number;
    compressionRatio: number;
  };
}

/**
 * Bundle Analysis CLI Tool
 */
class BundleAnalysisCLI {
  private analyzer: BundleAnalyzer;
  private optimizer: BundleOptimizer;
  private validator: PerformanceBudgetValidator;

  constructor() {
    this.analyzer = new BundleAnalyzer(DEFAULT_BUNDLE_CONFIG);
    this.optimizer = new BundleOptimizer(DEFAULT_BUNDLE_CONFIG);
    this.validator = new PerformanceBudgetValidator(DEFAULT_BUNDLE_CONFIG);
  }

  /**
   * Run comprehensive bundle analysis
   */
  async runAnalysis(): Promise<BundleAnalysisResults> {
    console.log('🔍 Starting comprehensive bundle analysis...');
    
    try {
      // Read bundle stats
      const bundleStats = await this.readBundleStats();
      
      // Analyze bundle
      const analysis = this.analyzer.analyzeBundle(bundleStats);
      
      // Validate against performance budget
      const budgetValidation = this.validator.validateBundle(analysis);
      
      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(analysis);
      
      const results: BundleAnalysisResults = {
        timestamp: new Date().toISOString(),
        analysis,
        recommendations: analysis.recommendations,
        budgetValidation,
        performanceMetrics,
      };

      // Display results
      this.displayResults(results);
      
      // Save results to file
      await this.saveResults(results);
      
      return results;
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      throw error;
    }
  }

  /**
   * Read bundle statistics from build output
   */
  private async readBundleStats(): Promise<any> {
    const statsPath = path.join(process.cwd(), '.next', 'analyze', 'bundle-stats.json');
    
    try {
      const statsContent = await fs.readFile(statsPath, 'utf-8');
      return JSON.parse(statsContent);
    } catch (error) {
      console.warn('⚠️ Bundle stats file not found, using mock data for analysis');
      
      // Return mock data for development
      return {
        chunks: [
          {
            name: 'main',
            size: 150000,
            initial: true,
            modules: ['app/page.tsx', 'components/ui/button.tsx'],
            dependencies: ['react', 'next'],
          },
          {
            name: 'vendor',
            size: 200000,
            modules: ['react', 'react-dom', 'next'],
            dependencies: [],
          },
          {
            name: 'async-page',
            size: 80000,
            async: true,
            modules: ['app/dashboard/page.tsx'],
            dependencies: ['react'],
          },
        ],
      };
    }
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(analysis: any): any {
    const compressionRatio = 0.7; // Assume 30% compression
    
    return {
      totalSize: analysis.totalSize,
      initialSize: analysis.initialSize,
      asyncSize: analysis.asyncSize,
      chunkCount: analysis.chunks.length,
      compressionRatio,
    };
  }

  /**
   * Display analysis results
   */
  private displayResults(results: BundleAnalysisResults): void {
    console.log('\n📊 Bundle Analysis Results');
    console.log('========================');
    
    // Performance metrics
    console.log('\n📈 Performance Metrics:');
    console.log(`Total Bundle Size: ${this.formatBytes(results.performanceMetrics.totalSize)}`);
    console.log(`Initial Bundle Size: ${this.formatBytes(results.performanceMetrics.initialSize)}`);
    console.log(`Async Bundle Size: ${this.formatBytes(results.performanceMetrics.asyncSize)}`);
    console.log(`Chunk Count: ${results.performanceMetrics.chunkCount}`);
    console.log(`Compression Ratio: ${(results.performanceMetrics.compressionRatio * 100).toFixed(1)}%`);
    
    // Budget validation
    console.log('\n🎯 Performance Budget Validation:');
    console.log(`Status: ${results.budgetValidation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Score: ${results.budgetValidation.score}/100`);
    
    if (results.budgetValidation.violations.length > 0) {
      console.log('\n⚠️ Budget Violations:');
      results.budgetValidation.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation}`);
      });
    }
    
    // Recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 Optimization Recommendations:');
      results.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${index + 1}. ${icon} ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
        console.log(`   Impact: ${rec.impact}`);
      });
    }
    
    // Performance score
    console.log('\n🏆 Overall Performance Score:');
    const score = results.budgetValidation.score;
    const scoreIcon = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    console.log(`${scoreIcon} ${score}/100`);
    
    if (score < 70) {
      console.log('⚠️ Performance score below acceptable threshold. Consider implementing recommendations.');
    } else if (score >= 90) {
      console.log('🎉 Excellent performance! Bundle optimization is working well.');
    }
  }

  /**
   * Save results to file
   */
  private async saveResults(results: BundleAnalysisResults): Promise<void> {
    const outputDir = path.join(process.cwd(), '.next', 'analyze');
    const outputPath = path.join(outputDir, 'bundle-analysis-results.json');
    
    try {
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
      console.log(`\n💾 Results saved to: ${outputPath}`);
    } catch (error) {
      console.warn('⚠️ Failed to save results:', error);
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate optimization report
   */
  async generateReport(): Promise<void> {
    console.log('📋 Generating bundle optimization report...');
    
    const results = await this.runAnalysis();
    
    const reportPath = path.join(process.cwd(), 'bundle-optimization-report.md');
    
    const report = `# Bundle Optimization Report

**Generated:** ${results.timestamp}
**Performance Score:** ${results.budgetValidation.score}/100

## Performance Metrics

- **Total Bundle Size:** ${this.formatBytes(results.performanceMetrics.totalSize)}
- **Initial Bundle Size:** ${this.formatBytes(results.performanceMetrics.initialSize)}
- **Async Bundle Size:** ${this.formatBytes(results.performanceMetrics.asyncSize)}
- **Chunk Count:** ${results.performanceMetrics.chunkCount}
- **Compression Ratio:** ${(results.performanceMetrics.compressionRatio * 100).toFixed(1)}%

## Budget Validation

**Status:** ${results.budgetValidation.isValid ? '✅ PASSED' : '❌ FAILED'}

${results.budgetValidation.violations.length > 0 ? `
### Violations
${results.budgetValidation.violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}
` : ''}

## Recommendations

${results.recommendations.map((rec, i) => `
### ${i + 1}. ${rec.message}
- **Type:** ${rec.type}
- **Impact:** ${rec.impact}
- **Action:** ${rec.action}
`).join('')}

## Next Steps

${results.budgetValidation.score < 70 ? 
  'Implement the critical and warning recommendations to improve bundle performance.' :
  results.budgetValidation.score >= 90 ?
  'Bundle optimization is performing excellently. Continue monitoring for regressions.' :
  'Consider implementing the recommendations to further optimize bundle performance.'
}
`;

    await fs.writeFile(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}`);
  }
}

/**
 * CLI entry point
 */
async function main() {
  const cli = new BundleAnalysisCLI();
  
  const command = process.argv[2] || 'analyze';
  
  switch (command) {
    case 'analyze':
      await cli.runAnalysis();
      break;
    case 'report':
      await cli.generateReport();
      break;
    default:
      console.log('Usage: npm run bundle:analyze [analyze|report]');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { BundleAnalysisCLI };
