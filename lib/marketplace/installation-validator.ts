/**
 * HT-035.3.2: Installation Validation & Testing Framework
 * 
 * Comprehensive installation validation with automated testing, security scanning,
 * and compatibility checking per PRD requirements.
 * 
 * Features:
 * - Pre-installation validation
 * - Automated testing framework
 * - Security vulnerability scanning
 * - Performance testing
 * - Compatibility validation
 * - Installation integrity checking
 * - Rollback validation
 */

import { z } from 'zod';
import { ModuleMetadata } from './module-registry';

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  score: z.number().min(0).max(100),
  category: z.enum(['compatibility', 'security', 'performance', 'functionality', 'integrity']),
  message: z.string(),
  details: z.record(z.unknown()).default({}),
  recommendations: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
});

export const InstallationValidationSchema = z.object({
  moduleId: z.string(),
  version: z.string(),
  tenantId: z.string(),
  validationId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  results: z.array(ValidationResultSchema),
  overallScore: z.number().min(0).max(100),
  passed: z.boolean(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  duration: z.number().default(0),
  metadata: z.record(z.unknown()).default({}),
});

export const TestSuiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  testType: z.enum(['unit', 'integration', 'smoke', 'performance', 'security', 'compatibility']),
  tests: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    status: z.enum(['pending', 'running', 'passed', 'failed', 'skipped']),
    duration: z.number().default(0),
    result: z.record(z.unknown()).default({}),
    logs: z.array(z.string()).default([]),
  })),
  status: z.enum(['pending', 'running', 'passed', 'failed', 'partial']),
  passed: z.number().default(0),
  failed: z.number().default(0),
  skipped: z.number().default(0),
  duration: z.number().default(0),
  startedAt: z.date(),
  completedAt: z.date().optional(),
});

export const SecurityScanResultSchema = z.object({
  scanId: z.string(),
  moduleId: z.string(),
  vulnerabilities: z.array(z.object({
    id: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string(),
    description: z.string(),
    cve: z.string().optional(),
    cvss: z.number().optional(),
    affectedFiles: z.array(z.string()).default([]),
    remediation: z.string().optional(),
    references: z.array(z.string()).default([]),
  })),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string(),
    vulnerabilities: z.number().default(0),
    outdated: z.boolean().default(false),
  })),
  licenseIssues: z.array(z.string()).default([]),
  overallScore: z.number().min(0).max(100),
  passed: z.boolean(),
  scannedAt: z.date(),
});

export const PerformanceTestResultSchema = z.object({
  testId: z.string(),
  moduleId: z.string(),
  metrics: z.object({
    loadTime: z.number(),
    memoryUsage: z.number(),
    cpuUsage: z.number(),
    responseTime: z.number(),
    throughput: z.number(),
    errorRate: z.number(),
  }),
  benchmarks: z.object({
    loadTimeThreshold: z.number(),
    memoryThreshold: z.number(),
    cpuThreshold: z.number(),
    responseTimeThreshold: z.number(),
    throughputThreshold: z.number(),
    errorRateThreshold: z.number(),
  }),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  recommendations: z.array(z.string()).default([]),
  testedAt: z.date(),
});

// Type exports
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type InstallationValidation = z.infer<typeof InstallationValidationSchema>;
export type TestSuite = z.infer<typeof TestSuiteSchema>;
export type SecurityScanResult = z.infer<typeof SecurityScanResultSchema>;
export type PerformanceTestResult = z.infer<typeof PerformanceTestResultSchema>;

// =============================================================================
// INSTALLATION VALIDATOR CLASS
// =============================================================================

export class InstallationValidator {
  private validationCache: Map<string, InstallationValidation> = new Map();
  private testSuites: Map<string, TestSuite[]> = new Map();
  private securityScans: Map<string, SecurityScanResult> = new Map();
  private performanceTests: Map<string, PerformanceTestResult> = new Map();

  constructor() {
    this.initializeDefaultTestSuites();
  }

  /**
   * Validate module installation
   */
  async validateInstallation(
    moduleId: string,
    version: string,
    tenantId: string,
    options: {
      includeSecurityScan?: boolean;
      includePerformanceTest?: boolean;
      includeCompatibilityCheck?: boolean;
      skipCache?: boolean;
    } = {}
  ): Promise<InstallationValidation> {
    const validationId = this.generateValidationId();
    const cacheKey = `${moduleId}-${version}-${tenantId}`;
    
    if (!options.skipCache) {
      const cached = this.validationCache.get(cacheKey);
      if (cached && Date.now() - cached.metadata.timestamp.getTime() < 300000) { // 5 minutes
        return cached;
      }
    }

    const validation: InstallationValidation = {
      moduleId,
      version,
      tenantId,
      validationId,
      status: 'pending',
      results: [],
      overallScore: 0,
      passed: false,
      startedAt: new Date(),
      metadata: {
        timestamp: new Date(),
        options,
      },
    };

    try {
      validation.status = 'running';

      // Step 1: Compatibility validation
      const compatibilityResult = await this.validateCompatibility(moduleId, version, tenantId);
      validation.results.push(compatibilityResult);

      // Step 2: Security scan (if requested)
      if (options.includeSecurityScan) {
        const securityResult = await this.performSecurityScan(moduleId, version);
        validation.results.push(securityResult);
      }

      // Step 3: Performance test (if requested)
      if (options.includePerformanceTest) {
        const performanceResult = await this.performPerformanceTest(moduleId, version, tenantId);
        validation.results.push(performanceResult);
      }

      // Step 4: Functionality validation
      const functionalityResult = await this.validateFunctionality(moduleId, version, tenantId);
      validation.results.push(functionalityResult);

      // Step 5: Integrity validation
      const integrityResult = await this.validateIntegrity(moduleId, version);
      validation.results.push(integrityResult);

      // Step 6: Compatibility check (if requested)
      if (options.includeCompatibilityCheck) {
        const compatibilityCheckResult = await this.performCompatibilityCheck(moduleId, version, tenantId);
        validation.results.push(compatibilityCheckResult);
      }

      // Calculate overall score and status
      validation.overallScore = this.calculateOverallScore(validation.results);
      validation.passed = validation.results.every(result => result.valid);
      validation.status = 'completed';
      validation.completedAt = new Date();
      validation.duration = validation.completedAt.getTime() - validation.startedAt.getTime();

      // Cache the result
      this.validationCache.set(cacheKey, validation);

      return validation;

    } catch (error) {
      validation.status = 'failed';
      validation.completedAt = new Date();
      validation.duration = validation.completedAt.getTime() - validation.startedAt.getTime();
      validation.results.push({
        valid: false,
        score: 0,
        category: 'functionality',
        message: 'Validation failed due to error',
        details: { error: error instanceof Error ? error.message : String(error) },
        recommendations: ['Check module integrity and try again'],
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
      });
      return validation;
    }
  }

  /**
   * Run test suite for a module
   */
  async runTestSuite(
    moduleId: string,
    version: string,
    tenantId: string,
    testType: 'unit' | 'integration' | 'smoke' | 'performance' | 'security' | 'compatibility'
  ): Promise<TestSuite> {
    const testSuite: TestSuite = {
      id: this.generateTestSuiteId(),
      name: `${testType} tests for ${moduleId}`,
      description: `Automated ${testType} testing for module ${moduleId} version ${version}`,
      testType,
      tests: [],
      status: 'pending',
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      startedAt: new Date(),
    };

    try {
      testSuite.status = 'running';

      // Get test cases for the test type
      const testCases = await this.getTestCases(moduleId, testType);
      
      for (const testCase of testCases) {
        const test = {
          id: this.generateTestId(),
          name: testCase.name,
          description: testCase.description,
          status: 'pending' as const,
          duration: 0,
          result: {},
          logs: [],
        };

        testSuite.tests.push(test);

        try {
          test.status = 'running';
          const startTime = Date.now();

          // Run the test
          const testResult = await this.runTest(testCase, moduleId, version, tenantId);
          
          test.result = testResult.result;
          test.logs = testResult.logs;
          test.status = testResult.passed ? 'passed' : 'failed';
          test.duration = Date.now() - startTime;

          if (test.status === 'passed') {
            testSuite.passed++;
          } else {
            testSuite.failed++;
          }

        } catch (error) {
          test.status = 'failed';
          test.logs.push(error instanceof Error ? error.message : String(error));
          testSuite.failed++;
        }
      }

      // Calculate suite status
      if (testSuite.failed === 0) {
        testSuite.status = 'passed';
      } else if (testSuite.passed === 0) {
        testSuite.status = 'failed';
      } else {
        testSuite.status = 'partial';
      }

      testSuite.completedAt = new Date();
      testSuite.duration = testSuite.completedAt.getTime() - testSuite.startedAt.getTime();

      // Store test suite results
      const key = `${moduleId}-${version}-${tenantId}`;
      const existing = this.testSuites.get(key) || [];
      existing.push(testSuite);
      this.testSuites.set(key, existing);

      return testSuite;

    } catch (error) {
      testSuite.status = 'failed';
      testSuite.completedAt = new Date();
      testSuite.duration = testSuite.completedAt.getTime() - testSuite.startedAt.getTime();
      return testSuite;
    }
  }

  /**
   * Perform security scan
   */
  async performSecurityScan(moduleId: string, version: string): Promise<SecurityScanResult> {
    const scanId = this.generateScanId();
    const cacheKey = `${moduleId}-${version}`;
    
    const cached = this.securityScans.get(cacheKey);
    if (cached && Date.now() - cached.scannedAt.getTime() < 3600000) { // 1 hour
      return cached;
    }

    const scanResult: SecurityScanResult = {
      scanId,
      moduleId,
      vulnerabilities: [],
      dependencies: [],
      licenseIssues: [],
      overallScore: 100,
      passed: true,
      scannedAt: new Date(),
    };

    try {
      // Mock security scan - in real app, this would:
      // - Scan for known vulnerabilities
      // - Check dependency security
      // - Validate license compliance
      // - Check for malicious code

      // Simulate vulnerability detection
      const vulnerabilities = await this.detectVulnerabilities(moduleId, version);
      scanResult.vulnerabilities = vulnerabilities;

      // Check dependencies
      const dependencies = await this.checkDependencySecurity(moduleId, version);
      scanResult.dependencies = dependencies;

      // Check licenses
      const licenseIssues = await this.checkLicenseCompliance(moduleId, version);
      scanResult.licenseIssues = licenseIssues;

      // Calculate security score
      scanResult.overallScore = this.calculateSecurityScore(scanResult);
      scanResult.passed = scanResult.overallScore >= 80; // Pass if score >= 80

      // Cache the result
      this.securityScans.set(cacheKey, scanResult);

      return scanResult;

    } catch (error) {
      scanResult.overallScore = 0;
      scanResult.passed = false;
      scanResult.vulnerabilities.push({
        id: 'scan-error',
        severity: 'critical',
        title: 'Security scan failed',
        description: error instanceof Error ? error.message : String(error),
        remediation: 'Review module integrity and retry scan',
      });
      return scanResult;
    }
  }

  /**
   * Perform performance test
   */
  async performPerformanceTest(
    moduleId: string,
    version: string,
    tenantId: string
  ): Promise<PerformanceTestResult> {
    const testId = this.generateTestId();
    const cacheKey = `${moduleId}-${version}-${tenantId}`;
    
    const cached = this.performanceTests.get(cacheKey);
    if (cached && Date.now() - cached.testedAt.getTime() < 1800000) { // 30 minutes
      return cached;
    }

    const testResult: PerformanceTestResult = {
      testId,
      moduleId,
      metrics: {
        loadTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
      },
      benchmarks: {
        loadTimeThreshold: 2000, // 2 seconds
        memoryThreshold: 100, // 100 MB
        cpuThreshold: 50, // 50%
        responseTimeThreshold: 500, // 500ms
        throughputThreshold: 100, // 100 req/s
        errorRateThreshold: 1, // 1%
      },
      passed: false,
      score: 0,
      recommendations: [],
      testedAt: new Date(),
    };

    try {
      // Mock performance test - in real app, this would:
      // - Load test the module
      // - Measure resource usage
      // - Test response times
      // - Check error rates

      // Simulate performance metrics
      testResult.metrics = await this.measurePerformance(moduleId, version, tenantId);

      // Check against benchmarks
      testResult.passed = this.checkPerformanceBenchmarks(testResult.metrics, testResult.benchmarks);
      testResult.score = this.calculatePerformanceScore(testResult.metrics, testResult.benchmarks);

      // Generate recommendations
      testResult.recommendations = this.generatePerformanceRecommendations(testResult);

      // Cache the result
      this.performanceTests.set(cacheKey, testResult);

      return testResult;

    } catch (error) {
      testResult.passed = false;
      testResult.score = 0;
      testResult.recommendations.push(`Performance test failed: ${error}`);
      return testResult;
    }
  }

  /**
   * Get validation statistics
   */
  async getValidationStatistics(): Promise<{
    totalValidations: number;
    passedValidations: number;
    failedValidations: number;
    averageScore: number;
    averageDuration: number;
    validationTrends: Array<{ date: string; count: number; averageScore: number }>;
    categoryBreakdown: Record<string, { passed: number; failed: number; averageScore: number }>;
  }> {
    const validations = Array.from(this.validationCache.values());
    const testSuites = Array.from(this.testSuites.values()).flat();
    const securityScans = Array.from(this.securityScans.values());
    const performanceTests = Array.from(this.performanceTests.values());

    const totalValidations = validations.length;
    const passedValidations = validations.filter(v => v.passed).length;
    const failedValidations = totalValidations - passedValidations;
    const averageScore = totalValidations > 0 
      ? validations.reduce((sum, v) => sum + v.overallScore, 0) / totalValidations 
      : 0;
    const averageDuration = totalValidations > 0 
      ? validations.reduce((sum, v) => sum + v.duration, 0) / totalValidations 
      : 0;

    // Calculate validation trends (last 30 days)
    const trends: Array<{ date: string; count: number; averageScore: number }> = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayValidations = validations.filter(v => {
        const vDate = new Date(v.startedAt);
        return vDate.toISOString().split('T')[0] === dateStr;
      });

      const count = dayValidations.length;
      const averageScore = count > 0 
        ? dayValidations.reduce((sum, v) => sum + v.overallScore, 0) / count 
        : 0;

      trends.push({ date: dateStr, count, averageScore });
    }

    // Calculate category breakdown
    const categoryBreakdown: Record<string, { passed: number; failed: number; averageScore: number }> = {};
    for (const validation of validations) {
      for (const result of validation.results) {
        const category = result.category;
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { passed: 0, failed: 0, averageScore: 0 };
        }
        
        if (result.valid) {
          categoryBreakdown[category].passed++;
        } else {
          categoryBreakdown[category].failed++;
        }
        
        categoryBreakdown[category].averageScore += result.score;
      }
    }

    // Calculate average scores for categories
    for (const category in categoryBreakdown) {
      const total = categoryBreakdown[category].passed + categoryBreakdown[category].failed;
      if (total > 0) {
        categoryBreakdown[category].averageScore /= total;
      }
    }

    return {
      totalValidations,
      passedValidations,
      failedValidations,
      averageScore,
      averageDuration,
      validationTrends: trends,
      categoryBreakdown,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async validateCompatibility(
    moduleId: string,
    version: string,
    tenantId: string
  ): Promise<ValidationResult> {
    // Mock implementation - in real app, this would check:
    // - System version compatibility
    // - Dependency compatibility
    // - Tenant tier compatibility
    return {
      valid: true,
      score: 95,
      category: 'compatibility',
      message: 'Module is compatible with current system',
      details: { moduleId, version, tenantId },
      recommendations: [],
      warnings: [],
      errors: [],
    };
  }

  private async validateFunctionality(
    moduleId: string,
    version: string,
    tenantId: string
  ): Promise<ValidationResult> {
    // Mock implementation - in real app, this would check:
    // - Module functionality
    // - API endpoints
    // - Database operations
    return {
      valid: true,
      score: 90,
      category: 'functionality',
      message: 'Module functionality validated successfully',
      details: { moduleId, version, tenantId },
      recommendations: [],
      warnings: [],
      errors: [],
    };
  }

  private async validateIntegrity(
    moduleId: string,
    version: string
  ): Promise<ValidationResult> {
    // Mock implementation - in real app, this would check:
    // - File integrity
    // - Checksum validation
    // - Digital signatures
    return {
      valid: true,
      score: 100,
      category: 'integrity',
      message: 'Module integrity validated',
      details: { moduleId, version },
      recommendations: [],
      warnings: [],
      errors: [],
    };
  }

  private async performCompatibilityCheck(
    moduleId: string,
    version: string,
    tenantId: string
  ): Promise<ValidationResult> {
    // Mock implementation - in real app, this would check:
    // - Cross-browser compatibility
    // - Device compatibility
    // - Network compatibility
    return {
      valid: true,
      score: 85,
      category: 'compatibility',
      message: 'Compatibility check passed',
      details: { moduleId, version, tenantId },
      recommendations: [],
      warnings: [],
      errors: [],
    };
  }

  private calculateOverallScore(results: ValidationResult[]): number {
    if (results.length === 0) return 0;
    return results.reduce((sum, result) => sum + result.score, 0) / results.length;
  }

  private generateValidationId(): string {
    return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTestSuiteId(): string {
    return `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getTestCases(
    moduleId: string,
    testType: string
  ): Promise<Array<{ name: string; description: string; test: () => Promise<any> }>> {
    // Mock implementation - in real app, this would load test cases from module
    return [
      {
        name: `${testType} test 1`,
        description: `Basic ${testType} test for ${moduleId}`,
        test: async () => ({ passed: true, result: 'Test passed' }),
      },
    ];
  }

  private async runTest(
    testCase: any,
    moduleId: string,
    version: string,
    tenantId: string
  ): Promise<{ passed: boolean; result: any; logs: string[] }> {
    // Mock implementation - in real app, this would run the actual test
    return {
      passed: true,
      result: { message: 'Test passed' },
      logs: ['Test executed successfully'],
    };
  }

  private async detectVulnerabilities(moduleId: string, version: string): Promise<any[]> {
    // Mock implementation - in real app, this would scan for vulnerabilities
    return [];
  }

  private async checkDependencySecurity(moduleId: string, version: string): Promise<any[]> {
    // Mock implementation - in real app, this would check dependency security
    return [];
  }

  private async checkLicenseCompliance(moduleId: string, version: string): Promise<string[]> {
    // Mock implementation - in real app, this would check license compliance
    return [];
  }

  private calculateSecurityScore(scanResult: SecurityScanResult): number {
    // Calculate security score based on vulnerabilities
    let score = 100;
    
    for (const vuln of scanResult.vulnerabilities) {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }
    
    return Math.max(0, score);
  }

  private async measurePerformance(
    moduleId: string,
    version: string,
    tenantId: string
  ): Promise<{
    loadTime: number;
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
  }> {
    // Mock implementation - in real app, this would measure actual performance
    return {
      loadTime: 1500,
      memoryUsage: 50,
      cpuUsage: 30,
      responseTime: 200,
      throughput: 150,
      errorRate: 0.5,
    };
  }

  private checkPerformanceBenchmarks(
    metrics: any,
    benchmarks: any
  ): boolean {
    return (
      metrics.loadTime <= benchmarks.loadTimeThreshold &&
      metrics.memoryUsage <= benchmarks.memoryThreshold &&
      metrics.cpuUsage <= benchmarks.cpuThreshold &&
      metrics.responseTime <= benchmarks.responseTimeThreshold &&
      metrics.throughput >= benchmarks.throughputThreshold &&
      metrics.errorRate <= benchmarks.errorRateThreshold
    );
  }

  private calculatePerformanceScore(metrics: any, benchmarks: any): number {
    let score = 100;
    
    if (metrics.loadTime > benchmarks.loadTimeThreshold) score -= 10;
    if (metrics.memoryUsage > benchmarks.memoryThreshold) score -= 10;
    if (metrics.cpuUsage > benchmarks.cpuThreshold) score -= 10;
    if (metrics.responseTime > benchmarks.responseTimeThreshold) score -= 10;
    if (metrics.throughput < benchmarks.throughputThreshold) score -= 10;
    if (metrics.errorRate > benchmarks.errorRateThreshold) score -= 10;
    
    return Math.max(0, score);
  }

  private generatePerformanceRecommendations(testResult: PerformanceTestResult): string[] {
    const recommendations: string[] = [];
    
    if (testResult.metrics.loadTime > testResult.benchmarks.loadTimeThreshold) {
      recommendations.push('Consider optimizing module loading time');
    }
    if (testResult.metrics.memoryUsage > testResult.benchmarks.memoryThreshold) {
      recommendations.push('Optimize memory usage');
    }
    if (testResult.metrics.cpuUsage > testResult.benchmarks.cpuThreshold) {
      recommendations.push('Optimize CPU usage');
    }
    if (testResult.metrics.responseTime > testResult.benchmarks.responseTimeThreshold) {
      recommendations.push('Improve response time');
    }
    if (testResult.metrics.throughput < testResult.benchmarks.throughputThreshold) {
      recommendations.push('Increase throughput capacity');
    }
    if (testResult.metrics.errorRate > testResult.benchmarks.errorRateThreshold) {
      recommendations.push('Reduce error rate');
    }
    
    return recommendations;
  }

  private initializeDefaultTestSuites(): void {
    // Initialize with default test suites
    console.log('Initialized default test suites');
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const installationValidator = new InstallationValidator();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export async function validateInstallation(
  moduleId: string,
  version: string,
  tenantId: string,
  options?: {
    includeSecurityScan?: boolean;
    includePerformanceTest?: boolean;
    includeCompatibilityCheck?: boolean;
    skipCache?: boolean;
  }
): Promise<InstallationValidation> {
  return installationValidator.validateInstallation(moduleId, version, tenantId, options);
}

export async function runTestSuite(
  moduleId: string,
  version: string,
  tenantId: string,
  testType: 'unit' | 'integration' | 'smoke' | 'performance' | 'security' | 'compatibility'
): Promise<TestSuite> {
  return installationValidator.runTestSuite(moduleId, version, tenantId, testType);
}

export async function performSecurityScan(moduleId: string, version: string): Promise<SecurityScanResult> {
  return installationValidator.performSecurityScan(moduleId, version);
}

export async function performPerformanceTest(
  moduleId: string,
  version: string,
  tenantId: string
): Promise<PerformanceTestResult> {
  return installationValidator.performPerformanceTest(moduleId, version, tenantId);
}

export async function getValidationStatistics() {
  return installationValidator.getValidationStatistics();
}
