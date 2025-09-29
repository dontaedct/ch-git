/**
 * HT-035.3.4: Security Scanner System
 * 
 * Automated security scanning for module quality assurance.
 * 
 * Features:
 * - Dependency vulnerability scanning
 * - Static code analysis for security issues
 * - License compliance checking
 * - Malware detection
 * - Security policy enforcement
 */

import { z } from 'zod';

// Schema definitions
export const SecurityScanConfigSchema = z.object({
  moduleId: z.string(),
  version: z.string(),
  scanTypes: z.array(z.enum(['dependencies', 'static', 'license', 'malware', 'policy'])).default(['dependencies', 'static', 'license']),
  severityThreshold: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  failOnCritical: z.boolean().default(true),
  failOnHigh: z.boolean().default(false),
  allowedLicenses: z.array(z.string()).default(['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC']),
  forbiddenLicenses: z.array(z.string()).default(['GPL-2.0', 'GPL-3.0', 'AGPL-3.0']),
});

export const VulnerabilitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  cve: z.string().optional(),
  cwe: z.string().optional(),
  package: z.string(),
  version: z.string(),
  vulnerableVersions: z.string(),
  patchedVersions: z.string(),
  publishedAt: z.date(),
  references: z.array(z.string()).default([]),
  exploitability: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  impact: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const LicenseIssueSchema = z.object({
  package: z.string(),
  license: z.string(),
  issue: z.enum(['forbidden', 'unknown', 'incompatible', 'copyleft']),
  description: z.string(),
  recommendation: z.string(),
});

export const StaticAnalysisIssueSchema = z.object({
  id: z.string(),
  type: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  file: z.string(),
  line: z.number().optional(),
  column: z.number().optional(),
  message: z.string(),
  description: z.string(),
  fix: z.string().optional(),
  references: z.array(z.string()).default([]),
});

export const SecurityScanResultSchema = z.object({
  scanId: z.string(),
  moduleId: z.string(),
  version: z.string(),
  config: SecurityScanConfigSchema,
  status: z.enum(['completed', 'failed', 'partial']),
  vulnerabilities: z.array(VulnerabilitySchema).default([]),
  licenseIssues: z.array(LicenseIssueSchema).default([]),
  staticAnalysisIssues: z.array(StaticAnalysisIssueSchema).default([]),
  malwareDetected: z.boolean().default(false),
  policyViolations: z.array(z.string()).default([]),
  overallScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  recommendations: z.array(z.string()).default([]),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  duration: z.number(),
});

// Type exports
export type SecurityScanConfig = z.infer<typeof SecurityScanConfigSchema>;
export type Vulnerability = z.infer<typeof VulnerabilitySchema>;
export type LicenseIssue = z.infer<typeof LicenseIssueSchema>;
export type StaticAnalysisIssue = z.infer<typeof StaticAnalysisIssueSchema>;
export type SecurityScanResult = z.infer<typeof SecurityScanResultSchema>;

export interface SecurityScanner {
  name: string;
  supportedTypes: Array<'dependencies' | 'static' | 'license' | 'malware' | 'policy'>;
  scan: (config: SecurityScanConfig, modulePath: string) => Promise<Partial<SecurityScanResult>>;
}

/**
 * Security Scanner Engine
 * 
 * Orchestrates security scanning across different scanner types
 */
export class SecurityScannerEngine {
  private scanners: Map<string, SecurityScanner> = new Map();
  private scanResults: Map<string, SecurityScanResult> = new Map();
  private vulnerabilityDatabase: Map<string, Vulnerability> = new Map();

  constructor() {
    this.initializeDefaultScanners();
    this.initializeVulnerabilityDatabase();
  }

  /**
   * Run comprehensive security scan for a module
   */
  async scanModule(config: SecurityScanConfig): Promise<SecurityScanResult> {
    const scanId = this.generateScanId();
    
    const result: SecurityScanResult = {
      scanId,
      moduleId: config.moduleId,
      version: config.version,
      config,
      status: 'completed',
      vulnerabilities: [],
      licenseIssues: [],
      staticAnalysisIssues: [],
      malwareDetected: false,
      policyViolations: [],
      overallScore: 100,
      riskLevel: 'low',
      recommendations: [],
      startedAt: new Date(),
      duration: 0,
    };

    try {
      // Run scans for each configured type
      for (const scanType of config.scanTypes) {
        const scanner = this.getScannerForType(scanType);
        if (!scanner) {
          console.warn(`No scanner available for scan type: ${scanType}`);
          continue;
        }

        const scanResult = await this.runScanType(scanType, config, scanner);
        
        // Merge results
        result.vulnerabilities.push(...(scanResult.vulnerabilities || []));
        result.licenseIssues.push(...(scanResult.licenseIssues || []));
        result.staticAnalysisIssues.push(...(scanResult.staticAnalysisIssues || []));
        result.policyViolations.push(...(scanResult.policyViolations || []));
        
        if (scanResult.malwareDetected) {
          result.malwareDetected = true;
        }
      }

      // Calculate overall score and risk level
      result.overallScore = this.calculateSecurityScore(result, config);
      result.riskLevel = this.calculateRiskLevel(result, config);
      result.recommendations = this.generateRecommendations(result, config);
      
      // Determine scan status
      if (config.failOnCritical && this.hasCriticalIssues(result)) {
        result.status = 'failed';
      } else if (config.failOnHigh && this.hasHighIssues(result)) {
        result.status = 'failed';
      }

      result.completedAt = new Date();
      result.duration = result.completedAt.getTime() - result.startedAt.getTime();

      this.scanResults.set(scanId, result);
      return result;

    } catch (error) {
      result.status = 'failed';
      result.overallScore = 0;
      result.riskLevel = 'critical';
      result.completedAt = new Date();
      result.duration = result.completedAt.getTime() - result.startedAt.getTime();
      
      console.error('Security scan failed:', error);
      return result;
    }
  }

  /**
   * Run a specific scan type
   */
  private async runScanType(
    scanType: 'dependencies' | 'static' | 'license' | 'malware' | 'policy',
    config: SecurityScanConfig,
    scanner: SecurityScanner
  ): Promise<Partial<SecurityScanResult>> {
    try {
      // Mock scan execution based on type
      switch (scanType) {
        case 'dependencies':
          return await this.scanDependencies(config);
        case 'static':
          return await this.scanStaticAnalysis(config);
        case 'license':
          return await this.scanLicenses(config);
        case 'malware':
          return await this.scanForMalware(config);
        case 'policy':
          return await this.scanPolicyCompliance(config);
        default:
          return {};
      }
    } catch (error) {
      console.error(`Security scan failed for type ${scanType}:`, error);
      return {};
    }
  }

  /**
   * Scan dependencies for vulnerabilities
   */
  private async scanDependencies(config: SecurityScanConfig): Promise<Partial<SecurityScanResult>> {
    // Mock implementation - in real app, this would:
    // - Parse package.json and lock files
    // - Query vulnerability databases (npm audit, Snyk, etc.)
    // - Check for known CVEs and security issues
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          vulnerabilities: [
            {
              id: 'CVE-2023-12345',
              title: 'Prototype Pollution in lodash',
              description: 'A prototype pollution vulnerability in lodash before 4.17.21',
              severity: 'medium',
              cve: 'CVE-2023-12345',
              cwe: 'CWE-1321',
              package: 'lodash',
              version: '4.17.20',
              vulnerableVersions: '<4.17.21',
              patchedVersions: '>=4.17.21',
              publishedAt: new Date('2023-01-15'),
              references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-12345'],
              exploitability: 'medium',
              impact: 'medium',
            },
          ],
        });
      }, 1000);
    });
  }

  /**
   * Run static code analysis for security issues
   */
  private async scanStaticAnalysis(config: SecurityScanConfig): Promise<Partial<SecurityScanResult>> {
    // Mock implementation - in real app, this would:
    // - Run ESLint security plugins
    // - Use tools like Semgrep, CodeQL, or SonarQube
    // - Check for common security anti-patterns
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          staticAnalysisIssues: [
            {
              id: 'SA-001',
              type: 'hardcoded-secret',
              severity: 'high',
              file: 'src/config.js',
              line: 15,
              column: 8,
              message: 'Hardcoded API key detected',
              description: 'API keys should not be hardcoded in source code',
              fix: 'Use environment variables or secure configuration management',
              references: ['https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_credentials'],
            },
            {
              id: 'SA-002',
              type: 'sql-injection',
              severity: 'critical',
              file: 'src/database.js',
              line: 42,
              message: 'Potential SQL injection vulnerability',
              description: 'User input is directly concatenated into SQL query',
              fix: 'Use parameterized queries or prepared statements',
              references: ['https://owasp.org/www-community/attacks/SQL_Injection'],
            },
          ],
        });
      }, 1500);
    });
  }

  /**
   * Scan for license compliance issues
   */
  private async scanLicenses(config: SecurityScanConfig): Promise<Partial<SecurityScanResult>> {
    // Mock implementation - in real app, this would:
    // - Parse package.json files for license information
    // - Check license compatibility
    // - Identify forbidden or problematic licenses
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          licenseIssues: [
            {
              package: 'some-gpl-package',
              license: 'GPL-3.0',
              issue: 'forbidden',
              description: 'Package uses GPL-3.0 license which is not allowed',
              recommendation: 'Replace with MIT or Apache-2.0 licensed alternative',
            },
          ],
        });
      }, 800);
    });
  }

  /**
   * Scan for malware
   */
  private async scanForMalware(config: SecurityScanConfig): Promise<Partial<SecurityScanResult>> {
    // Mock implementation - in real app, this would:
    // - Scan files for known malware signatures
    // - Check for suspicious patterns
    // - Validate package integrity
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          malwareDetected: false,
        });
      }, 500);
    });
  }

  /**
   * Scan for policy compliance
   */
  private async scanPolicyCompliance(config: SecurityScanConfig): Promise<Partial<SecurityScanResult>> {
    // Mock implementation - in real app, this would:
    // - Check against security policies
    // - Validate configuration compliance
    // - Ensure best practices are followed
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          policyViolations: [
            'Missing security headers in HTTP responses',
            'No rate limiting configured',
          ],
        });
      }, 600);
    });
  }

  /**
   * Get scan result by ID
   */
  async getScanResult(scanId: string): Promise<SecurityScanResult | null> {
    return this.scanResults.get(scanId) || null;
  }

  /**
   * Get security scan results for a module
   */
  async getModuleScanResults(moduleId: string, limit: number = 10): Promise<SecurityScanResult[]> {
    return Array.from(this.scanResults.values())
      .filter(result => result.moduleId === moduleId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get security statistics
   */
  async getSecurityStatistics(): Promise<{
    totalScans: number;
    scansPassed: number;
    scansFailed: number;
    averageSecurityScore: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    licenseViolations: number;
    securityTrends: Array<{ date: string; scans: number; avgScore: number }>;
  }> {
    const results = Array.from(this.scanResults.values());
    const scansPassed = results.filter(r => r.status === 'completed' && r.riskLevel !== 'critical').length;
    const scansFailed = results.filter(r => r.status === 'failed' || r.riskLevel === 'critical').length;
    
    const averageSecurityScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
      : 0;

    const criticalVulnerabilities = results.reduce((sum, r) => 
      sum + r.vulnerabilities.filter(v => v.severity === 'critical').length, 0);
    
    const highVulnerabilities = results.reduce((sum, r) => 
      sum + r.vulnerabilities.filter(v => v.severity === 'high').length, 0);
    
    const licenseViolations = results.reduce((sum, r) => sum + r.licenseIssues.length, 0);

    // Calculate trends (last 30 days)
    const trends: Array<{ date: string; scans: number; avgScore: number }> = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayResults = results.filter(r => {
        const rDate = new Date(r.startedAt);
        return rDate.toISOString().split('T')[0] === dateStr;
      });

      const avgScore = dayResults.length > 0
        ? dayResults.reduce((sum, r) => sum + r.overallScore, 0) / dayResults.length
        : 0;

      trends.push({
        date: dateStr,
        scans: dayResults.length,
        avgScore: Math.round(avgScore),
      });
    }

    return {
      totalScans: results.length,
      scansPassed,
      scansFailed,
      averageSecurityScore: Math.round(averageSecurityScore),
      criticalVulnerabilities,
      highVulnerabilities,
      licenseViolations,
      securityTrends: trends,
    };
  }

  // Private helper methods

  private initializeDefaultScanners(): void {
    // Mock security scanners - in real app, these would be actual scanners
    this.scanners.set('npm-audit', {
      name: 'NPM Audit',
      supportedTypes: ['dependencies'],
      scan: async (config, modulePath) => {
        return {};
      },
    });

    this.scanners.set('semgrep', {
      name: 'Semgrep',
      supportedTypes: ['static'],
      scan: async (config, modulePath) => {
        return {};
      },
    });

    this.scanners.set('license-checker', {
      name: 'License Checker',
      supportedTypes: ['license'],
      scan: async (config, modulePath) => {
        return {};
      },
    });
  }

  private initializeVulnerabilityDatabase(): void {
    // Mock vulnerability database - in real app, this would be populated from actual sources
    this.vulnerabilityDatabase.set('CVE-2023-12345', {
      id: 'CVE-2023-12345',
      title: 'Prototype Pollution in lodash',
      description: 'A prototype pollution vulnerability in lodash before 4.17.21',
      severity: 'medium',
      cve: 'CVE-2023-12345',
      cwe: 'CWE-1321',
      package: 'lodash',
      version: '4.17.20',
      vulnerableVersions: '<4.17.21',
      patchedVersions: '>=4.17.21',
      publishedAt: new Date('2023-01-15'),
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-12345'],
      exploitability: 'medium',
      impact: 'medium',
    });
  }

  private getScannerForType(scanType: string): SecurityScanner | null {
    for (const scanner of this.scanners.values()) {
      if (scanner.supportedTypes.includes(scanType as any)) {
        return scanner;
      }
    }
    return null;
  }

  private calculateSecurityScore(result: SecurityScanResult, config: SecurityScanConfig): number {
    let score = 100;

    // Deduct points for vulnerabilities
    for (const vuln of result.vulnerabilities) {
      switch (vuln.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    }

    // Deduct points for static analysis issues
    for (const issue of result.staticAnalysisIssues) {
      switch (issue.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 8; break;
        case 'low': score -= 3; break;
      }
    }

    // Deduct points for license issues
    score -= result.licenseIssues.length * 5;

    // Deduct points for policy violations
    score -= result.policyViolations.length * 3;

    // Deduct points for malware
    if (result.malwareDetected) {
      score = 0;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateRiskLevel(result: SecurityScanResult, config: SecurityScanConfig): 'low' | 'medium' | 'high' | 'critical' {
    const criticalIssues = result.vulnerabilities.filter(v => v.severity === 'critical').length +
                          result.staticAnalysisIssues.filter(i => i.severity === 'critical').length;
    
    const highIssues = result.vulnerabilities.filter(v => v.severity === 'high').length +
                      result.staticAnalysisIssues.filter(i => i.severity === 'high').length;

    if (result.malwareDetected || criticalIssues > 0) {
      return 'critical';
    }
    
    if (highIssues > 2 || result.overallScore < 50) {
      return 'high';
    }
    
    if (highIssues > 0 || result.overallScore < 75) {
      return 'medium';
    }
    
    return 'low';
  }

  private hasCriticalIssues(result: SecurityScanResult): boolean {
    return result.malwareDetected ||
           result.vulnerabilities.some(v => v.severity === 'critical') ||
           result.staticAnalysisIssues.some(i => i.severity === 'critical');
  }

  private hasHighIssues(result: SecurityScanResult): boolean {
    return result.vulnerabilities.some(v => v.severity === 'high') ||
           result.staticAnalysisIssues.some(i => i.severity === 'high');
  }

  private generateRecommendations(result: SecurityScanResult, config: SecurityScanConfig): string[] {
    const recommendations: string[] = [];

    // Vulnerability recommendations
    if (result.vulnerabilities.length > 0) {
      recommendations.push('Update vulnerable dependencies to patched versions');
    }

    // Static analysis recommendations
    if (result.staticAnalysisIssues.length > 0) {
      recommendations.push('Fix static analysis security issues before publishing');
    }

    // License recommendations
    if (result.licenseIssues.length > 0) {
      recommendations.push('Resolve license compliance issues');
    }

    // Policy recommendations
    if (result.policyViolations.length > 0) {
      recommendations.push('Address security policy violations');
    }

    // General recommendations
    if (result.overallScore < 80) {
      recommendations.push('Improve overall security posture before publishing');
    }

    return recommendations;
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const securityScannerEngine = new SecurityScannerEngine();
