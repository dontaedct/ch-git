import { TemplateConfig, QualityMetrics } from '@/types/templates/template-config';
import { ValidationReport, ValidationError } from './validation-system';

export interface QualityStandard {
  id: string;
  name: string;
  description: string;
  minScore: number;
  weight: number;
  required: boolean;
}

export interface QualityAssessment {
  templateId: string;
  overallScore: number;
  passedStandards: QualityStandard[];
  failedStandards: QualityStandard[];
  recommendations: string[];
  timestamp: Date;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'none';
}

export class TemplateQualityAssurance {
  private qualityStandards: Map<string, QualityStandard> = new Map();

  constructor() {
    this.initializeQualityStandards();
  }

  private initializeQualityStandards() {
    const standards: QualityStandard[] = [
      {
        id: 'completeness',
        name: 'Completeness Standard',
        description: 'Template has all required metadata and documentation',
        minScore: 80,
        weight: 1.0,
        required: true
      },
      {
        id: 'security',
        name: 'Security Standard',
        description: 'Template follows security best practices',
        minScore: 90,
        weight: 1.2,
        required: true
      },
      {
        id: 'performance',
        name: 'Performance Standard',
        description: 'Template is optimized for performance',
        minScore: 75,
        weight: 0.8,
        required: false
      },
      {
        id: 'maintainability',
        name: 'Maintainability Standard',
        description: 'Template is easy to maintain and update',
        minScore: 70,
        weight: 0.9,
        required: false
      },
      {
        id: 'reusability',
        name: 'Reusability Standard',
        description: 'Template is designed for reuse across projects',
        minScore: 75,
        weight: 1.1,
        required: true
      },
      {
        id: 'accessibility',
        name: 'Accessibility Standard',
        description: 'Template follows accessibility guidelines',
        minScore: 80,
        weight: 0.7,
        required: false
      }
    ];

    standards.forEach(standard => {
      this.qualityStandards.set(standard.id, standard);
    });
  }

  async assessQuality(
    template: TemplateConfig,
    validationReport: ValidationReport
  ): Promise<QualityAssessment> {
    const passedStandards: QualityStandard[] = [];
    const failedStandards: QualityStandard[] = [];
    const recommendations: string[] = [];

    let weightedScore = 0;
    let totalWeight = 0;

    for (const [standardId, standard] of this.qualityStandards) {
      const metricScore = this.getMetricScore(validationReport.metrics, standardId);
      const meetsStandard = metricScore >= standard.minScore;

      if (meetsStandard) {
        passedStandards.push(standard);
      } else {
        failedStandards.push(standard);
        recommendations.push(
          `Improve ${standard.name}: Current score ${metricScore}, required ${standard.minScore}`
        );
      }

      weightedScore += metricScore * standard.weight;
      totalWeight += standard.weight;
    }

    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    const requiredFailures = failedStandards.filter(s => s.required);
    if (requiredFailures.length > 0) {
      recommendations.unshift(
        `Address required standards: ${requiredFailures.map(s => s.name).join(', ')}`
      );
    }

    recommendations.push(...this.generateSpecificRecommendations(validationReport));

    const certificationLevel = this.calculateCertificationLevel(
      overallScore,
      requiredFailures.length,
      passedStandards.length
    );

    return {
      templateId: template.id || template.name,
      overallScore: Math.round(overallScore * 100) / 100,
      passedStandards,
      failedStandards,
      recommendations,
      timestamp: new Date(),
      certificationLevel
    };
  }

  private getMetricScore(metrics: QualityMetrics, standardId: string): number {
    switch (standardId) {
      case 'completeness':
        return metrics.completeness;
      case 'security':
        return metrics.security;
      case 'performance':
        return metrics.performance;
      case 'maintainability':
        return metrics.maintainability;
      case 'reusability':
        return metrics.reusability;
      case 'accessibility':
        return metrics.accessibility;
      default:
        return 0;
    }
  }

  private generateSpecificRecommendations(validationReport: ValidationReport): string[] {
    const recommendations: string[] = [];

    const errorsByType = this.groupErrorsByType(validationReport.errors);

    if (errorsByType.has('structure')) {
      recommendations.push('Fix template structure issues for better organization');
    }

    if (errorsByType.has('metadata')) {
      recommendations.push('Enhance template metadata for better discoverability');
    }

    if (errorsByType.has('security')) {
      recommendations.push('Address security vulnerabilities immediately');
    }

    if (errorsByType.has('performance')) {
      recommendations.push('Optimize template for better performance');
    }

    if (validationReport.metrics.errorCount > 0) {
      recommendations.push(`Resolve ${validationReport.metrics.errorCount} critical errors`);
    }

    if (validationReport.metrics.warningCount > 5) {
      recommendations.push(`Address ${validationReport.metrics.warningCount} warnings for quality improvement`);
    }

    return recommendations;
  }

  private groupErrorsByType(errors: ValidationError[]): Map<string, ValidationError[]> {
    const grouped = new Map<string, ValidationError[]>();

    errors.forEach(error => {
      if (error.location) {
        const type = error.location.split('.')[0];
        if (!grouped.has(type)) {
          grouped.set(type, []);
        }
        grouped.get(type)!.push(error);
      }
    });

    return grouped;
  }

  private calculateCertificationLevel(
    overallScore: number,
    requiredFailures: number,
    passedStandards: number
  ): 'bronze' | 'silver' | 'gold' | 'platinum' | 'none' {
    if (requiredFailures > 0) {
      return 'none';
    }

    if (overallScore >= 95 && passedStandards >= 6) {
      return 'platinum';
    } else if (overallScore >= 85 && passedStandards >= 5) {
      return 'gold';
    } else if (overallScore >= 75 && passedStandards >= 4) {
      return 'silver';
    } else if (overallScore >= 65 && passedStandards >= 3) {
      return 'bronze';
    }

    return 'none';
  }

  async batchAssessQuality(
    templates: TemplateConfig[],
    validationReports: Map<string, ValidationReport>
  ): Promise<Map<string, QualityAssessment>> {
    const assessments = new Map<string, QualityAssessment>();

    for (const template of templates) {
      const templateId = template.id || template.name;
      const validationReport = validationReports.get(templateId);

      if (validationReport) {
        const assessment = await this.assessQuality(template, validationReport);
        assessments.set(templateId, assessment);
      }
    }

    return assessments;
  }

  generateQualityReport(assessments: Map<string, QualityAssessment>): QualityReport {
    const allAssessments = Array.from(assessments.values());

    const totalTemplates = allAssessments.length;
    const certificationCounts = {
      platinum: allAssessments.filter(a => a.certificationLevel === 'platinum').length,
      gold: allAssessments.filter(a => a.certificationLevel === 'gold').length,
      silver: allAssessments.filter(a => a.certificationLevel === 'silver').length,
      bronze: allAssessments.filter(a => a.certificationLevel === 'bronze').length,
      none: allAssessments.filter(a => a.certificationLevel === 'none').length
    };

    const averageScore = totalTemplates > 0
      ? allAssessments.reduce((sum, a) => sum + a.overallScore, 0) / totalTemplates
      : 0;

    const topIssues = this.identifyTopIssues(allAssessments);

    return {
      totalTemplates,
      averageScore: Math.round(averageScore * 100) / 100,
      certificationDistribution: certificationCounts,
      topIssues,
      generatedAt: new Date()
    };
  }

  private identifyTopIssues(assessments: QualityAssessment[]): string[] {
    const issueCount = new Map<string, number>();

    assessments.forEach(assessment => {
      assessment.failedStandards.forEach(standard => {
        const count = issueCount.get(standard.name) || 0;
        issueCount.set(standard.name, count + 1);
      });
    });

    return Array.from(issueCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => `${issue} (${count} templates affected)`);
  }

  getQualityStandards(): QualityStandard[] {
    return Array.from(this.qualityStandards.values());
  }

  addCustomStandard(standard: QualityStandard): void {
    this.qualityStandards.set(standard.id, standard);
  }

  removeStandard(standardId: string): boolean {
    return this.qualityStandards.delete(standardId);
  }
}

export interface QualityReport {
  totalTemplates: number;
  averageScore: number;
  certificationDistribution: {
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
    none: number;
  };
  topIssues: string[];
  generatedAt: Date;
}

export const templateQualityAssurance = new TemplateQualityAssurance();