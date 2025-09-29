import { TemplateConfig, ValidationResult, QualityMetrics } from '@/types/templates/template-config';

export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
  suggestion?: string;
}

export interface ValidationReport {
  isValid: boolean;
  score: number;
  errors: ValidationError[];
  metrics: QualityMetrics;
  timestamp: Date;
}

export class TemplateValidationEngine {
  private validationRules: Map<string, (template: TemplateConfig) => ValidationError[]> = new Map();

  constructor() {
    this.initializeValidationRules();
  }

  private initializeValidationRules() {
    this.validationRules.set('structure', this.validateStructure);
    this.validationRules.set('metadata', this.validateMetadata);
    this.validationRules.set('dependencies', this.validateDependencies);
    this.validationRules.set('customization', this.validateCustomizationPoints);
    this.validationRules.set('performance', this.validatePerformance);
    this.validationRules.set('security', this.validateSecurity);
    this.validationRules.set('accessibility', this.validateAccessibility);
  }

  async validateTemplate(template: TemplateConfig): Promise<ValidationReport> {
    const errors: ValidationError[] = [];
    const startTime = Date.now();

    for (const [ruleName, validator] of this.validationRules) {
      try {
        const ruleErrors = validator.call(this, template);
        errors.push(...ruleErrors);
      } catch (error) {
        errors.push({
          type: 'error',
          message: `Validation rule '${ruleName}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          location: 'validation-engine'
        });
      }
    }

    const metrics = this.calculateQualityMetrics(template, errors);
    const score = this.calculateQualityScore(metrics, errors);

    return {
      isValid: errors.filter(e => e.type === 'error').length === 0,
      score,
      errors,
      metrics,
      timestamp: new Date()
    };
  }

  private validateStructure(template: TemplateConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push({
        type: 'error',
        message: 'Template name is required',
        location: 'metadata.name',
        suggestion: 'Provide a descriptive name for the template'
      });
    }

    if (!template.version || !this.isValidVersion(template.version)) {
      errors.push({
        type: 'error',
        message: 'Valid version number is required (semver format)',
        location: 'metadata.version',
        suggestion: 'Use semantic versioning format (e.g., 1.0.0)'
      });
    }

    if (!template.files || template.files.length === 0) {
      errors.push({
        type: 'error',
        message: 'Template must include at least one file',
        location: 'files',
        suggestion: 'Add template files to the configuration'
      });
    }

    return errors;
  }

  private validateMetadata(template: TemplateConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!template.description || template.description.length < 10) {
      errors.push({
        type: 'warning',
        message: 'Template description should be more descriptive',
        location: 'metadata.description',
        suggestion: 'Provide a detailed description of the template purpose and features'
      });
    }

    if (!template.tags || template.tags.length === 0) {
      errors.push({
        type: 'warning',
        message: 'Template should have tags for better discoverability',
        location: 'metadata.tags',
        suggestion: 'Add relevant tags to categorize the template'
      });
    }

    if (!template.author) {
      errors.push({
        type: 'info',
        message: 'Consider adding author information',
        location: 'metadata.author',
        suggestion: 'Add author name and contact information'
      });
    }

    return errors;
  }

  private validateDependencies(template: TemplateConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    if (template.dependencies) {
      for (const [name, version] of Object.entries(template.dependencies)) {
        if (!this.isValidDependencyVersion(version)) {
          errors.push({
            type: 'warning',
            message: `Invalid version format for dependency '${name}': ${version}`,
            location: `dependencies.${name}`,
            suggestion: 'Use valid version range (e.g., ^1.0.0, ~2.1.0)'
          });
        }
      }
    }

    return errors;
  }

  private validateCustomizationPoints(template: TemplateConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!template.customizationPoints || template.customizationPoints.length === 0) {
      errors.push({
        type: 'warning',
        message: 'Template has no customization points defined',
        location: 'customizationPoints',
        suggestion: 'Define customization points to enable client-specific modifications'
      });
    }

    template.customizationPoints?.forEach((point, index) => {
      if (!point.id || !point.type) {
        errors.push({
          type: 'error',
          message: `Customization point at index ${index} is missing required fields`,
          location: `customizationPoints[${index}]`,
          suggestion: 'Ensure each customization point has id and type'
        });
      }
    });

    return errors;
  }

  private validatePerformance(template: TemplateConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    if (template.files && template.files.length > 100) {
      errors.push({
        type: 'warning',
        message: 'Template has many files, consider optimization',
        location: 'files',
        suggestion: 'Consider breaking down into smaller templates or optimizing file structure'
      });
    }

    return errors;
  }

  private validateSecurity(template: TemplateConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token/i,
      /private[_-]?key/i
    ];

    template.files?.forEach((file, index) => {
      if (file.content) {
        sensitivePatterns.forEach(pattern => {
          if (pattern.test(file.content!)) {
            errors.push({
              type: 'error',
              message: `Potential sensitive information found in file: ${file.path}`,
              location: `files[${index}].content`,
              suggestion: 'Remove sensitive information and use environment variables instead'
            });
          }
        });
      }
    });

    return errors;
  }

  private validateAccessibility(template: TemplateConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    template.files?.forEach((file, index) => {
      if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
        if (file.content && !file.content.includes('alt=')) {
          errors.push({
            type: 'info',
            message: `Consider adding alt attributes for images in ${file.path}`,
            location: `files[${index}]`,
            suggestion: 'Add alt attributes to improve accessibility'
          });
        }
      }
    });

    return errors;
  }

  private calculateQualityMetrics(template: TemplateConfig, errors: ValidationError[]): QualityMetrics {
    const errorCount = errors.filter(e => e.type === 'error').length;
    const warningCount = errors.filter(e => e.type === 'warning').length;
    const infoCount = errors.filter(e => e.type === 'info').length;

    return {
      completeness: this.calculateCompleteness(template),
      maintainability: this.calculateMaintainability(template, errors),
      reusability: this.calculateReusability(template),
      performance: this.calculatePerformanceScore(template),
      security: this.calculateSecurityScore(errors),
      accessibility: this.calculateAccessibilityScore(errors),
      errorCount,
      warningCount,
      infoCount
    };
  }

  private calculateQualityScore(metrics: QualityMetrics, errors: ValidationError[]): number {
    const weights = {
      completeness: 0.2,
      maintainability: 0.2,
      reusability: 0.2,
      performance: 0.15,
      security: 0.15,
      accessibility: 0.1
    };

    const baseScore = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (metrics[key as keyof QualityMetrics] as number) * weight;
    }, 0);

    const errorPenalty = metrics.errorCount * 10;
    const warningPenalty = metrics.warningCount * 5;

    return Math.max(0, Math.min(100, baseScore - errorPenalty - warningPenalty));
  }

  private calculateCompleteness(template: TemplateConfig): number {
    let score = 0;
    const maxScore = 100;

    if (template.name) score += 15;
    if (template.description && template.description.length > 20) score += 15;
    if (template.version) score += 10;
    if (template.author) score += 10;
    if (template.tags && template.tags.length > 0) score += 10;
    if (template.files && template.files.length > 0) score += 20;
    if (template.customizationPoints && template.customizationPoints.length > 0) score += 20;

    return Math.min(maxScore, score);
  }

  private calculateMaintainability(template: TemplateConfig, errors: ValidationError[]): number {
    const errorPenalty = errors.filter(e => e.type === 'error').length * 20;
    const warningPenalty = errors.filter(e => e.type === 'warning').length * 10;

    let baseScore = 100;

    if (!template.documentation) baseScore -= 20;
    if (!template.changelog) baseScore -= 10;

    return Math.max(0, baseScore - errorPenalty - warningPenalty);
  }

  private calculateReusability(template: TemplateConfig): number {
    let score = 50;

    if (template.customizationPoints && template.customizationPoints.length > 0) {
      score += Math.min(30, template.customizationPoints.length * 10);
    }

    if (template.tags && template.tags.length > 2) score += 10;
    if (template.dependencies && Object.keys(template.dependencies).length < 10) score += 10;

    return Math.min(100, score);
  }

  private calculatePerformanceScore(template: TemplateConfig): number {
    let score = 100;

    if (template.files && template.files.length > 50) score -= 20;
    if (template.files && template.files.length > 100) score -= 30;

    return Math.max(0, score);
  }

  private calculateSecurityScore(errors: ValidationError[]): number {
    const securityErrors = errors.filter(e =>
      e.type === 'error' && e.message.toLowerCase().includes('sensitive')
    ).length;

    return Math.max(0, 100 - (securityErrors * 25));
  }

  private calculateAccessibilityScore(errors: ValidationError[]): number {
    const accessibilityIssues = errors.filter(e =>
      e.message.toLowerCase().includes('accessibility') ||
      e.message.toLowerCase().includes('alt')
    ).length;

    return Math.max(0, 100 - (accessibilityIssues * 15));
  }

  private isValidVersion(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(-[a-zA-Z0-9-.]+)?(\+[a-zA-Z0-9-.]+)?$/;
    return semverRegex.test(version);
  }

  private isValidDependencyVersion(version: string): boolean {
    const versionRegex = /^[\^~]?\d+\.\d+\.\d+(-[a-zA-Z0-9-.]+)?(\+[a-zA-Z0-9-.]+)?$/;
    return versionRegex.test(version);
  }

  async batchValidate(templates: TemplateConfig[]): Promise<Map<string, ValidationReport>> {
    const results = new Map<string, ValidationReport>();

    const validationPromises = templates.map(async (template) => {
      const report = await this.validateTemplate(template);
      return { id: template.id || template.name, report };
    });

    const validationResults = await Promise.all(validationPromises);

    validationResults.forEach(({ id, report }) => {
      results.set(id, report);
    });

    return results;
  }
}

export const templateValidationEngine = new TemplateValidationEngine();