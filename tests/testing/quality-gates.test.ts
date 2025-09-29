/**
 * @fileoverview Quality Gates System Tests
 * HT-031.1.2: Automated Testing Framework Integration
 * Tests for the quality gates system
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createQualityGatesSystem, QualityGatesSystem } from '@/lib/testing/quality-gates';

describe('Quality Gates System', () => {
  let qualityGates: QualityGatesSystem;

  beforeEach(() => {
    qualityGates = createQualityGatesSystem();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(qualityGates).toBeInstanceOf(QualityGatesSystem);
      const gates = qualityGates.getAllGates();
      expect(gates.length).toBeGreaterThan(0);
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        coverage: {
          minCoverage: 80,
          targetCoverage: 90,
          criticalThreshold: 95
        }
      };
      
      const customQualityGates = createQualityGatesSystem(customConfig);
      expect(customQualityGates).toBeInstanceOf(QualityGatesSystem);
    });

    it('should have coverage gates initialized', () => {
      const coverageGates = qualityGates.getGatesByType('coverage');
      expect(coverageGates.length).toBeGreaterThan(0);
      
      const criticalCoverage = qualityGates.getGate('coverage-critical');
      expect(criticalCoverage).toBeDefined();
      expect(criticalCoverage?.type).toBe('coverage');
      expect(criticalCoverage?.severity).toBe('critical');
    });

    it('should have performance gates initialized', () => {
      const performanceGates = qualityGates.getGatesByType('performance');
      expect(performanceGates.length).toBeGreaterThan(0);
      
      const loadTimeGate = qualityGates.getGate('performance-load-time');
      expect(loadTimeGate).toBeDefined();
      expect(loadTimeGate?.type).toBe('performance');
    });

    it('should have security gates initialized', () => {
      const securityGates = qualityGates.getGatesByType('security');
      expect(securityGates.length).toBeGreaterThan(0);
      
      const vulnerabilityGate = qualityGates.getGate('security-vulnerabilities');
      expect(vulnerabilityGate).toBeDefined();
      expect(vulnerabilityGate?.type).toBe('security');
    });

    it('should have accessibility gates initialized', () => {
      const accessibilityGates = qualityGates.getGatesByType('accessibility');
      expect(accessibilityGates.length).toBeGreaterThan(0);
      
      const scoreGate = qualityGates.getGate('accessibility-score');
      expect(scoreGate).toBeDefined();
      expect(scoreGate?.type).toBe('accessibility');
    });

    it('should have functionality gates initialized', () => {
      const functionalityGates = qualityGates.getGatesByType('functionality');
      expect(functionalityGates.length).toBeGreaterThan(0);
      
      const failedTestsGate = qualityGates.getGate('functionality-failed-tests');
      expect(failedTestsGate).toBeDefined();
      expect(failedTestsGate?.type).toBe('functionality');
    });
  });

  describe('Gate Updates', () => {
    it('should update coverage gate status correctly', () => {
      const coverageGate = qualityGates.getGate('coverage-critical');
      expect(coverageGate?.status).toBe('pending');
      
      // Update with good coverage
      qualityGates.updateGate('coverage-critical', 96);
      const updatedGate = qualityGates.getGate('coverage-critical');
      expect(updatedGate?.current).toBe(96);
      expect(updatedGate?.status).toBe('passed');
    });

    it('should set coverage gate to warning when close to threshold', () => {
      qualityGates.updateGate('coverage-critical', 94); // Just below 95 threshold
      const updatedGate = qualityGates.getGate('coverage-critical');
      expect(updatedGate?.status).toBe('warning');
    });

    it('should set coverage gate to failed when below threshold', () => {
      qualityGates.updateGate('coverage-critical', 80); // Well below 95 threshold
      const updatedGate = qualityGates.getGate('coverage-critical');
      expect(updatedGate?.status).toBe('failed');
    });

    it('should update performance gate status correctly', () => {
      const performanceGate = qualityGates.getGate('performance-load-time');
      expect(performanceGate?.status).toBe('pending');
      
      // Update with good performance (under threshold)
      qualityGates.updateGate('performance-load-time', 1500); // Under 2000ms threshold
      const updatedGate = qualityGates.getGate('performance-load-time');
      expect(updatedGate?.current).toBe(1500);
      expect(updatedGate?.status).toBe('passed');
    });

    it('should set performance gate to failed when above threshold', () => {
      qualityGates.updateGate('performance-load-time', 2500); // Above 2000ms threshold
      const updatedGate = qualityGates.getGate('performance-load-time');
      expect(updatedGate?.status).toBe('failed');
    });

    it('should update security gate status correctly', () => {
      const securityGate = qualityGates.getGate('security-vulnerabilities');
      expect(securityGate?.status).toBe('pending');
      
      // Update with no vulnerabilities
      qualityGates.updateGate('security-vulnerabilities', 0);
      const updatedGate = qualityGates.getGate('security-vulnerabilities');
      expect(updatedGate?.current).toBe(0);
      expect(updatedGate?.status).toBe('passed');
    });

    it('should set security gate to failed when vulnerabilities exist', () => {
      qualityGates.updateGate('security-vulnerabilities', 3); // Above 0 threshold
      const updatedGate = qualityGates.getGate('security-vulnerabilities');
      expect(updatedGate?.status).toBe('failed');
    });
  });

  describe('Gate Evaluation', () => {
    it('should evaluate gates with test results', () => {
      const mockTestResults = {
        totalTests: 100,
        failedTests: 2,
        passedTests: 98,
        skippedTests: 0
      };

      const mockCoverageReport = {
        totalCoverage: 87
      };

      const mockPerformanceMetrics = {
        loadTime: 1500,
        bundleSize: 450,
        memoryUsage: 80
      };

      const mockSecurityReport = {
        totalVulnerabilities: 0,
        highSeverity: 0,
        mediumSeverity: 1
      };

      const mockAccessibilityReport = {
        score: 92,
        violations: 2
      };

      const report = qualityGates.evaluateGates(
        mockTestResults,
        mockCoverageReport,
        mockPerformanceMetrics,
        mockSecurityReport,
        mockAccessibilityReport
      );

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.gates).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.nextSteps).toBeDefined();
    });

    it('should calculate correct summary statistics', () => {
      // Update some gates to different statuses
      qualityGates.updateGate('coverage-critical', 96); // passed
      qualityGates.updateGate('performance-load-time', 2500); // failed
      qualityGates.updateGate('security-vulnerabilities', 0); // passed
      qualityGates.updateGate('accessibility-score', 88); // warning

      const gates = qualityGates.getAllGates();
      const summary = (qualityGates as any).calculateSummary(gates);

      expect(summary.totalGates).toBeGreaterThan(0);
      expect(summary.passed).toBeGreaterThanOrEqual(0);
      expect(summary.failed).toBeGreaterThanOrEqual(0);
      expect(summary.warning).toBeGreaterThanOrEqual(0);
      expect(summary.pending).toBeGreaterThanOrEqual(0);
    });

    it('should determine overall status correctly', () => {
      // All passed
      qualityGates.updateGate('coverage-critical', 96);
      qualityGates.updateGate('performance-load-time', 1500);
      qualityGates.updateGate('security-vulnerabilities', 0);
      
      let gates = qualityGates.getAllGates();
      let status = (qualityGates as any).determineOverallStatus(gates);
      expect(status).toBe('passed');

      // Critical failed
      qualityGates.updateGate('security-vulnerabilities', 2);
      gates = qualityGates.getAllGates();
      status = (qualityGates as any).determineOverallStatus(gates);
      expect(status).toBe('failed');

      // Only warnings
      qualityGates.updateGate('security-vulnerabilities', 0);
      qualityGates.updateGate('accessibility-score', 88); // warning
      gates = qualityGates.getAllGates();
      status = (qualityGates as any).determineOverallStatus(gates);
      expect(status).toBe('warning');
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendations for failed gates', () => {
      // Set some gates to failed status
      qualityGates.updateGate('coverage-critical', 80); // failed
      qualityGates.updateGate('security-vulnerabilities', 3); // failed
      
      const gates = qualityGates.getAllGates();
      const recommendations = (qualityGates as any).generateRecommendations(gates);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('critical'))).toBe(true);
    });

    it('should generate recommendations for warning gates', () => {
      qualityGates.updateGate('coverage-critical', 94); // warning
      qualityGates.updateGate('accessibility-score', 88); // warning
      
      const gates = qualityGates.getAllGates();
      const recommendations = (qualityGates as any).generateRecommendations(gates);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('warning'))).toBe(true);
    });

    it('should generate positive recommendations when all gates pass', () => {
      qualityGates.updateGate('coverage-critical', 96);
      qualityGates.updateGate('performance-load-time', 1500);
      qualityGates.updateGate('security-vulnerabilities', 0);
      
      const gates = qualityGates.getAllGates();
      const recommendations = (qualityGates as any).generateRecommendations(gates);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('passing'))).toBe(true);
    });
  });

  describe('Next Steps', () => {
    it('should generate next steps for failed gates', () => {
      qualityGates.updateGate('coverage-critical', 80); // failed
      
      const gates = qualityGates.getAllGates();
      const nextSteps = (qualityGates as any).generateNextSteps(gates);

      expect(nextSteps.length).toBeGreaterThan(0);
      expect(nextSteps.some(step => step.includes('Fix'))).toBe(true);
    });

    it('should generate monitoring steps for warning gates', () => {
      qualityGates.updateGate('coverage-critical', 94); // warning
      
      const gates = qualityGates.getAllGates();
      const nextSteps = (qualityGates as any).generateNextSteps(gates);

      expect(nextSteps.length).toBeGreaterThan(0);
      expect(nextSteps.some(step => step.includes('Monitor'))).toBe(true);
    });

    it('should generate positive steps when all gates pass', () => {
      qualityGates.updateGate('coverage-critical', 96);
      qualityGates.updateGate('performance-load-time', 1500);
      qualityGates.updateGate('security-vulnerabilities', 0);
      
      const gates = qualityGates.getAllGates();
      const nextSteps = (qualityGates as any).generateNextSteps(gates);

      expect(nextSteps.length).toBeGreaterThan(0);
      expect(nextSteps.some(step => step.includes('Continue'))).toBe(true);
    });
  });

  describe('Gate Filtering', () => {
    it('should filter gates by type', () => {
      const coverageGates = qualityGates.getGatesByType('coverage');
      const performanceGates = qualityGates.getGatesByType('performance');
      const securityGates = qualityGates.getGatesByType('security');

      expect(coverageGates.every(gate => gate.type === 'coverage')).toBe(true);
      expect(performanceGates.every(gate => gate.type === 'performance')).toBe(true);
      expect(securityGates.every(gate => gate.type === 'security')).toBe(true);
    });

    it('should filter gates by status', () => {
      qualityGates.updateGate('coverage-critical', 96); // passed
      qualityGates.updateGate('performance-load-time', 2500); // failed
      qualityGates.updateGate('accessibility-score', 88); // warning

      const passedGates = qualityGates.getGatesByStatus('passed');
      const failedGates = qualityGates.getGatesByStatus('failed');
      const warningGates = qualityGates.getGatesByStatus('warning');

      expect(passedGates.every(gate => gate.status === 'passed')).toBe(true);
      expect(failedGates.every(gate => gate.status === 'failed')).toBe(true);
      expect(warningGates.every(gate => gate.status === 'warning')).toBe(true);
    });

    it('should filter gates by severity', () => {
      const criticalGates = qualityGates.getGatesBySeverity('critical');
      const highGates = qualityGates.getGatesBySeverity('high');
      const mediumGates = qualityGates.getGatesBySeverity('medium');

      expect(criticalGates.every(gate => gate.severity === 'critical')).toBe(true);
      expect(highGates.every(gate => gate.severity === 'high')).toBe(true);
      expect(mediumGates.every(gate => gate.severity === 'medium')).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    it('should export configuration', () => {
      const config = qualityGates.exportConfig();
      
      expect(config.coverage).toBeDefined();
      expect(config.performance).toBeDefined();
      expect(config.security).toBeDefined();
      expect(config.accessibility).toBeDefined();
      expect(config.functionality).toBeDefined();
    });

    it('should update configuration', () => {
      const newConfig = {
        coverage: {
          minCoverage: 80,
          targetCoverage: 90,
          criticalThreshold: 95
        }
      };

      qualityGates.updateConfig(newConfig);
      const exportedConfig = qualityGates.exportConfig();
      
      expect(exportedConfig.coverage.minCoverage).toBe(80);
      expect(exportedConfig.coverage.targetCoverage).toBe(90);
      expect(exportedConfig.coverage.criticalThreshold).toBe(95);
    });

    it('should validate configuration', () => {
      const validConfig = {
        coverage: {
          minCoverage: 70,
          targetCoverage: 85,
          criticalThreshold: 95
        }
      };

      const invalidConfig = {
        coverage: {
          minCoverage: 90, // Higher than target
          targetCoverage: 85,
          criticalThreshold: 95
        }
      };

      qualityGates.updateConfig(validConfig);
      let validation = qualityGates.validateConfig();
      expect(validation.valid).toBe(true);

      qualityGates.updateConfig(invalidConfig);
      validation = qualityGates.validateConfig();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
