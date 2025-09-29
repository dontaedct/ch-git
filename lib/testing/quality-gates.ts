/**
 * @fileoverview Quality Gates System
 * HT-031.1.2: Automated Testing Framework Integration
 * Comprehensive quality assurance gates with automated validation and reporting
 */

export interface QualityGate {
  id: string;
  name: string;
  type: 'coverage' | 'performance' | 'security' | 'accessibility' | 'functionality';
  severity: 'critical' | 'high' | 'medium' | 'low';
  threshold: number;
  current: number;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  description: string;
  remediation?: string;
}

export interface QualityGateConfig {
  coverage: {
    minCoverage: number;
    targetCoverage: number;
    criticalThreshold: number;
  };
  performance: {
    maxLoadTime: number;
    maxBundleSize: number;
    maxMemoryUsage: number;
  };
  security: {
    maxVulnerabilities: number;
    maxHighSeverity: number;
    maxMediumSeverity: number;
  };
  accessibility: {
    minScore: number;
    maxViolations: number;
    criticalViolations: number;
  };
  functionality: {
    maxFailedTests: number;
    maxSkippedTests: number;
    minTestPassRate: number;
  };
}

export interface QualityReport {
  id: string;
  timestamp: Date;
  status: 'passed' | 'failed' | 'warning';
  gates: QualityGate[];
  summary: {
    totalGates: number;
    passed: number;
    failed: number;
    warning: number;
    pending: number;
  };
  recommendations: string[];
  nextSteps: string[];
}

export class QualityGatesSystem {
  private config: QualityGateConfig;
  private gates: Map<string, QualityGate> = new Map();

  constructor(config: QualityGateConfig) {
    this.config = config;
    this.initializeGates();
  }

  /**
   * Initialize quality gates based on configuration
   */
  private initializeGates(): void {
    // Coverage Gates
    this.addGate({
      id: 'coverage-critical',
      name: 'Critical Coverage',
      type: 'coverage',
      severity: 'critical',
      threshold: this.config.coverage.criticalThreshold,
      current: 0,
      status: 'pending',
      description: `Code coverage must be at least ${this.config.coverage.criticalThreshold}%`,
      remediation: 'Increase test coverage by adding more test cases'
    });

    this.addGate({
      id: 'coverage-target',
      name: 'Target Coverage',
      type: 'coverage',
      severity: 'high',
      threshold: this.config.coverage.targetCoverage,
      current: 0,
      status: 'pending',
      description: `Code coverage should reach ${this.config.coverage.targetCoverage}%`,
      remediation: 'Add comprehensive test cases for better coverage'
    });

    this.addGate({
      id: 'coverage-minimum',
      name: 'Minimum Coverage',
      type: 'coverage',
      severity: 'medium',
      threshold: this.config.coverage.minCoverage,
      current: 0,
      status: 'pending',
      description: `Code coverage must not fall below ${this.config.coverage.minCoverage}%`,
      remediation: 'Maintain minimum coverage standards'
    });

    // Performance Gates
    this.addGate({
      id: 'performance-load-time',
      name: 'Page Load Time',
      type: 'performance',
      severity: 'high',
      threshold: this.config.performance.maxLoadTime,
      current: 0,
      status: 'pending',
      description: `Page load time must be under ${this.config.performance.maxLoadTime}ms`,
      remediation: 'Optimize bundle size, implement lazy loading, or improve server response times'
    });

    this.addGate({
      id: 'performance-bundle-size',
      name: 'Bundle Size',
      type: 'performance',
      severity: 'medium',
      threshold: this.config.performance.maxBundleSize,
      current: 0,
      status: 'pending',
      description: `Bundle size must be under ${this.config.performance.maxBundleSize}KB`,
      remediation: 'Remove unused dependencies, implement code splitting, or optimize assets'
    });

    this.addGate({
      id: 'performance-memory',
      name: 'Memory Usage',
      type: 'performance',
      severity: 'medium',
      threshold: this.config.performance.maxMemoryUsage,
      current: 0,
      status: 'pending',
      description: `Memory usage must be under ${this.config.performance.maxMemoryUsage}MB`,
      remediation: 'Optimize memory usage, fix memory leaks, or reduce data processing'
    });

    // Security Gates
    this.addGate({
      id: 'security-vulnerabilities',
      name: 'Security Vulnerabilities',
      type: 'security',
      severity: 'critical',
      threshold: this.config.security.maxVulnerabilities,
      current: 0,
      status: 'pending',
      description: `Total vulnerabilities must not exceed ${this.config.security.maxVulnerabilities}`,
      remediation: 'Update dependencies, fix security issues, or implement security patches'
    });

    this.addGate({
      id: 'security-high-severity',
      name: 'High Severity Issues',
      type: 'security',
      severity: 'critical',
      threshold: this.config.security.maxHighSeverity,
      current: 0,
      status: 'pending',
      description: `High severity vulnerabilities must not exceed ${this.config.security.maxHighSeverity}`,
      remediation: 'Address high-priority security vulnerabilities immediately'
    });

    // Accessibility Gates
    this.addGate({
      id: 'accessibility-score',
      name: 'Accessibility Score',
      type: 'accessibility',
      severity: 'high',
      threshold: this.config.accessibility.minScore,
      current: 0,
      status: 'pending',
      description: `Accessibility score must be at least ${this.config.accessibility.minScore}/100`,
      remediation: 'Improve ARIA labels, fix color contrast, or enhance keyboard navigation'
    });

    this.addGate({
      id: 'accessibility-violations',
      name: 'Accessibility Violations',
      type: 'accessibility',
      severity: 'medium',
      threshold: this.config.accessibility.maxViolations,
      current: 0,
      status: 'pending',
      description: `Accessibility violations must not exceed ${this.config.accessibility.maxViolations}`,
      remediation: 'Fix accessibility issues to meet WCAG guidelines'
    });

    // Functionality Gates
    this.addGate({
      id: 'functionality-failed-tests',
      name: 'Failed Tests',
      type: 'functionality',
      severity: 'critical',
      threshold: this.config.functionality.maxFailedTests,
      current: 0,
      status: 'pending',
      description: `Failed tests must not exceed ${this.config.functionality.maxFailedTests}`,
      remediation: 'Fix failing tests or update test expectations'
    });

    this.addGate({
      id: 'functionality-pass-rate',
      name: 'Test Pass Rate',
      type: 'functionality',
      severity: 'high',
      threshold: this.config.functionality.minTestPassRate,
      current: 0,
      status: 'pending',
      description: `Test pass rate must be at least ${this.config.functionality.minTestPassRate}%`,
      remediation: 'Improve test reliability and fix flaky tests'
    });
  }

  /**
   * Add a quality gate
   */
  addGate(gate: QualityGate): void {
    this.gates.set(gate.id, gate);
  }

  /**
   * Update gate status based on current value
   */
  updateGate(gateId: string, current: number): void {
    const gate = this.gates.get(gateId);
    if (!gate) return;

    gate.current = current;
    
    // Determine status based on type and threshold
    switch (gate.type) {
      case 'coverage':
      case 'accessibility':
        if (current >= gate.threshold) {
          gate.status = 'passed';
        } else if (current >= gate.threshold * 0.9) {
          gate.status = 'warning';
        } else {
          gate.status = 'failed';
        }
        break;
      
      case 'performance':
      case 'security':
      case 'functionality':
        if (current <= gate.threshold) {
          gate.status = 'passed';
        } else if (current <= gate.threshold * 1.1) {
          gate.status = 'warning';
        } else {
          gate.status = 'failed';
        }
        break;
    }
  }

  /**
   * Evaluate all quality gates
   */
  evaluateGates(testResults: any, coverageReport: any, performanceMetrics: any, securityReport: any, accessibilityReport: any): QualityReport {
    // Update gates based on actual data
    this.updateGatesFromData(testResults, coverageReport, performanceMetrics, securityReport, accessibilityReport);

    const gates = Array.from(this.gates.values());
    const summary = this.calculateSummary(gates);
    const status = this.determineOverallStatus(gates);
    const recommendations = this.generateRecommendations(gates);
    const nextSteps = this.generateNextSteps(gates);

    return {
      id: `quality-report-${Date.now()}`,
      timestamp: new Date(),
      status,
      gates,
      summary,
      recommendations,
      nextSteps
    };
  }

  /**
   * Update gates based on actual test and metric data
   */
  private updateGatesFromData(testResults: any, coverageReport: any, performanceMetrics: any, securityReport: any, accessibilityReport: any): void {
    // Update coverage gates
    if (coverageReport) {
      this.updateGate('coverage-critical', coverageReport.totalCoverage || 0);
      this.updateGate('coverage-target', coverageReport.totalCoverage || 0);
      this.updateGate('coverage-minimum', coverageReport.totalCoverage || 0);
    }

    // Update performance gates
    if (performanceMetrics) {
      this.updateGate('performance-load-time', performanceMetrics.loadTime || 0);
      this.updateGate('performance-bundle-size', performanceMetrics.bundleSize || 0);
      this.updateGate('performance-memory', performanceMetrics.memoryUsage || 0);
    }

    // Update security gates
    if (securityReport) {
      this.updateGate('security-vulnerabilities', securityReport.totalVulnerabilities || 0);
      this.updateGate('security-high-severity', securityReport.highSeverity || 0);
    }

    // Update accessibility gates
    if (accessibilityReport) {
      this.updateGate('accessibility-score', accessibilityReport.score || 0);
      this.updateGate('accessibility-violations', accessibilityReport.violations || 0);
    }

    // Update functionality gates
    if (testResults) {
      const totalTests = testResults.totalTests || 0;
      const failedTests = testResults.failedTests || 0;
      const passRate = totalTests > 0 ? ((totalTests - failedTests) / totalTests) * 100 : 0;
      
      this.updateGate('functionality-failed-tests', failedTests);
      this.updateGate('functionality-pass-rate', passRate);
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(gates: QualityGate[]): QualityReport['summary'] {
    return {
      totalGates: gates.length,
      passed: gates.filter(g => g.status === 'passed').length,
      failed: gates.filter(g => g.status === 'failed').length,
      warning: gates.filter(g => g.status === 'warning').length,
      pending: gates.filter(g => g.status === 'pending').length
    };
  }

  /**
   * Determine overall status
   */
  private determineOverallStatus(gates: QualityGate[]): 'passed' | 'failed' | 'warning' {
    const criticalFailed = gates.some(g => g.severity === 'critical' && g.status === 'failed');
    const highFailed = gates.some(g => g.severity === 'high' && g.status === 'failed');
    const anyWarning = gates.some(g => g.status === 'warning');

    if (criticalFailed || highFailed) {
      return 'failed';
    } else if (anyWarning) {
      return 'warning';
    } else {
      return 'passed';
    }
  }

  /**
   * Generate recommendations based on gate status
   */
  private generateRecommendations(gates: QualityGate[]): string[] {
    const recommendations: string[] = [];
    
    const failedGates = gates.filter(g => g.status === 'failed');
    const warningGates = gates.filter(g => g.status === 'warning');

    // Critical and high priority recommendations
    const criticalFailed = failedGates.filter(g => g.severity === 'critical');
    const highFailed = failedGates.filter(g => g.severity === 'high');

    if (criticalFailed.length > 0) {
      recommendations.push(`Address ${criticalFailed.length} critical quality gate(s) immediately`);
    }

    if (highFailed.length > 0) {
      recommendations.push(`Resolve ${highFailed.length} high-priority quality gate(s)`);
    }

    // Specific recommendations for each failed gate
    failedGates.forEach(gate => {
      if (gate.remediation) {
        recommendations.push(`${gate.name}: ${gate.remediation}`);
      }
    });

    // Warning recommendations
    if (warningGates.length > 0) {
      recommendations.push(`Monitor ${warningGates.length} quality gate(s) that are approaching thresholds`);
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('All quality gates are passing - maintain current standards');
    }

    return recommendations;
  }

  /**
   * Generate next steps based on gate status
   */
  private generateNextSteps(gates: QualityGate[]): string[] {
    const nextSteps: string[] = [];
    
    const failedGates = gates.filter(g => g.status === 'failed');
    const warningGates = gates.filter(g => g.status === 'warning');

    if (failedGates.length > 0) {
      nextSteps.push('1. Fix all failed quality gates before deployment');
      nextSteps.push('2. Review and update quality gate thresholds if needed');
      nextSteps.push('3. Implement automated quality checks in CI/CD pipeline');
    }

    if (warningGates.length > 0) {
      nextSteps.push('1. Monitor warning gates closely');
      nextSteps.push('2. Plan improvements to prevent future failures');
    }

    if (failedGates.length === 0 && warningGates.length === 0) {
      nextSteps.push('1. Continue monitoring quality metrics');
      nextSteps.push('2. Consider raising quality standards');
      nextSteps.push('3. Share best practices with the team');
    }

    return nextSteps;
  }

  /**
   * Get gate by ID
   */
  getGate(gateId: string): QualityGate | undefined {
    return this.gates.get(gateId);
  }

  /**
   * Get all gates
   */
  getAllGates(): QualityGate[] {
    return Array.from(this.gates.values());
  }

  /**
   * Get gates by type
   */
  getGatesByType(type: QualityGate['type']): QualityGate[] {
    return Array.from(this.gates.values()).filter(gate => gate.type === type);
  }

  /**
   * Get gates by status
   */
  getGatesByStatus(status: QualityGate['status']): QualityGate[] {
    return Array.from(this.gates.values()).filter(gate => gate.status === status);
  }

  /**
   * Get gates by severity
   */
  getGatesBySeverity(severity: QualityGate['severity']): QualityGate[] {
    return Array.from(this.gates.values()).filter(gate => gate.severity === severity);
  }

  /**
   * Export quality gates configuration
   */
  exportConfig(): QualityGateConfig {
    return { ...this.config };
  }

  /**
   * Update quality gates configuration
   */
  updateConfig(newConfig: Partial<QualityGateConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeGates(); // Reinitialize gates with new config
  }

  /**
   * Validate quality gates configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate coverage thresholds
    if (this.config.coverage.minCoverage > this.config.coverage.targetCoverage) {
      errors.push('Minimum coverage cannot be higher than target coverage');
    }
    if (this.config.coverage.targetCoverage > this.config.coverage.criticalThreshold) {
      errors.push('Target coverage cannot be higher than critical threshold');
    }

    // Validate performance thresholds
    if (this.config.performance.maxLoadTime <= 0) {
      errors.push('Maximum load time must be positive');
    }
    if (this.config.performance.maxBundleSize <= 0) {
      errors.push('Maximum bundle size must be positive');
    }
    if (this.config.performance.maxMemoryUsage <= 0) {
      errors.push('Maximum memory usage must be positive');
    }

    // Validate security thresholds
    if (this.config.security.maxVulnerabilities < 0) {
      errors.push('Maximum vulnerabilities cannot be negative');
    }
    if (this.config.security.maxHighSeverity < 0) {
      errors.push('Maximum high severity issues cannot be negative');
    }

    // Validate accessibility thresholds
    if (this.config.accessibility.minScore < 0 || this.config.accessibility.minScore > 100) {
      errors.push('Accessibility score must be between 0 and 100');
    }
    if (this.config.accessibility.maxViolations < 0) {
      errors.push('Maximum accessibility violations cannot be negative');
    }

    // Validate functionality thresholds
    if (this.config.functionality.maxFailedTests < 0) {
      errors.push('Maximum failed tests cannot be negative');
    }
    if (this.config.functionality.minTestPassRate < 0 || this.config.functionality.minTestPassRate > 100) {
      errors.push('Test pass rate must be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Default quality gates configuration
 */
export const defaultQualityGateConfig: QualityGateConfig = {
  coverage: {
    minCoverage: 70,
    targetCoverage: 85,
    criticalThreshold: 95
  },
  performance: {
    maxLoadTime: 2000,
    maxBundleSize: 500,
    maxMemoryUsage: 100
  },
  security: {
    maxVulnerabilities: 0,
    maxHighSeverity: 0,
    maxMediumSeverity: 2
  },
  accessibility: {
    minScore: 90,
    maxViolations: 3,
    criticalViolations: 0
  },
  functionality: {
    maxFailedTests: 0,
    maxSkippedTests: 5,
    minTestPassRate: 95
  }
};

/**
 * Factory function to create quality gates system
 */
export function createQualityGatesSystem(config: Partial<QualityGateConfig> = {}): QualityGatesSystem {
  const mergedConfig = { ...defaultQualityGateConfig, ...config };
  return new QualityGatesSystem(mergedConfig);
}
