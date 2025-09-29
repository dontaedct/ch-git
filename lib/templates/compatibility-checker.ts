import { TemplateConfig } from '@/types/templates/template-config';

export interface CompatibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'version' | 'dependency' | 'feature' | 'api' | 'framework';
  message: string;
  affectedComponent: string;
  suggestedFix?: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface CompatibilityReport {
  templateId: string;
  isCompatible: boolean;
  compatibilityScore: number;
  issues: CompatibilityIssue[];
  supportedEnvironments: string[];
  unsupportedEnvironments: string[];
  timestamp: Date;
}

export interface EnvironmentConfig {
  id: string;
  name: string;
  nodeVersion: string;
  nextVersion?: string;
  reactVersion?: string;
  typescriptVersion?: string;
  dependencies: Record<string, string>;
  features: string[];
}

export class TemplateCompatibilityChecker {
  private environments: Map<string, EnvironmentConfig> = new Map();
  private compatibilityRules: Map<string, (template: TemplateConfig, env: EnvironmentConfig) => CompatibilityIssue[]> = new Map();

  constructor() {
    this.initializeEnvironments();
    this.initializeCompatibilityRules();
  }

  private initializeEnvironments() {
    const environments: EnvironmentConfig[] = [
      {
        id: 'nextjs-13',
        name: 'Next.js 13 + React 18',
        nodeVersion: '>=16.0.0',
        nextVersion: '^13.0.0',
        reactVersion: '^18.0.0',
        typescriptVersion: '^4.9.0',
        dependencies: {
          'next': '^13.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'typescript': '^4.9.0'
        },
        features: ['app-router', 'server-components', 'streaming', 'middleware']
      },
      {
        id: 'nextjs-14',
        name: 'Next.js 14 + React 18',
        nodeVersion: '>=18.0.0',
        nextVersion: '^14.0.0',
        reactVersion: '^18.0.0',
        typescriptVersion: '^5.0.0',
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'typescript': '^5.0.0'
        },
        features: ['app-router', 'server-components', 'streaming', 'middleware', 'turbopack']
      },
      {
        id: 'nextjs-15',
        name: 'Next.js 15 + React 19',
        nodeVersion: '>=18.0.0',
        nextVersion: '^15.0.0',
        reactVersion: '^19.0.0',
        typescriptVersion: '^5.2.0',
        dependencies: {
          'next': '^15.0.0',
          'react': '^19.0.0',
          'react-dom': '^19.0.0',
          'typescript': '^5.2.0'
        },
        features: ['app-router', 'server-components', 'streaming', 'middleware', 'turbopack', 'react-compiler']
      }
    ];

    environments.forEach(env => {
      this.environments.set(env.id, env);
    });
  }

  private initializeCompatibilityRules() {
    this.compatibilityRules.set('node-version', this.checkNodeVersion);
    this.compatibilityRules.set('framework-version', this.checkFrameworkVersion);
    this.compatibilityRules.set('dependency-compatibility', this.checkDependencyCompatibility);
    this.compatibilityRules.set('feature-support', this.checkFeatureSupport);
    this.compatibilityRules.set('api-compatibility', this.checkAPICompatibility);
    this.compatibilityRules.set('file-structure', this.checkFileStructure);
  }

  async checkCompatibility(template: TemplateConfig, environmentId?: string): Promise<CompatibilityReport> {
    const issues: CompatibilityIssue[] = [];
    const supportedEnvironments: string[] = [];
    const unsupportedEnvironments: string[] = [];

    const environmentsToCheck = environmentId
      ? [this.environments.get(environmentId)!]
      : Array.from(this.environments.values());

    for (const environment of environmentsToCheck) {
      if (!environment) continue;

      const envIssues: CompatibilityIssue[] = [];

      for (const [ruleName, checker] of this.compatibilityRules) {
        try {
          const ruleIssues = checker.call(this, template, environment);
          envIssues.push(...ruleIssues);
        } catch (error) {
          envIssues.push({
            type: 'error',
            category: 'api',
            message: `Compatibility check '${ruleName}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            affectedComponent: 'compatibility-checker',
            severity: 'major'
          });
        }
      }

      const criticalIssues = envIssues.filter(issue => issue.severity === 'critical');

      if (criticalIssues.length === 0) {
        supportedEnvironments.push(environment.name);
      } else {
        unsupportedEnvironments.push(environment.name);
      }

      issues.push(...envIssues);
    }

    const compatibilityScore = this.calculateCompatibilityScore(issues, supportedEnvironments.length, environmentsToCheck.length);

    return {
      templateId: template.id || template.name,
      isCompatible: supportedEnvironments.length > 0,
      compatibilityScore,
      issues,
      supportedEnvironments,
      unsupportedEnvironments,
      timestamp: new Date()
    };
  }

  private checkNodeVersion(template: TemplateConfig, environment: EnvironmentConfig): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    if (template.engines?.node) {
      const requiredNode = template.engines.node;
      const environmentNode = environment.nodeVersion;

      if (!this.isVersionCompatible(requiredNode, environmentNode)) {
        issues.push({
          type: 'error',
          category: 'version',
          message: `Node.js version mismatch: template requires ${requiredNode}, environment has ${environmentNode}`,
          affectedComponent: 'node-runtime',
          suggestedFix: `Update Node.js to ${requiredNode} or modify template requirements`,
          severity: 'critical'
        });
      }
    }

    return issues;
  }

  private checkFrameworkVersion(template: TemplateConfig, environment: EnvironmentConfig): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    const frameworkChecks = [
      { template: 'next', environment: 'nextVersion', name: 'Next.js' },
      { template: 'react', environment: 'reactVersion', name: 'React' },
      { template: 'typescript', environment: 'typescriptVersion', name: 'TypeScript' }
    ];

    frameworkChecks.forEach(({ template: templateKey, environment: envKey, name }) => {
      const templateVersion = template.dependencies?.[templateKey];
      const environmentVersion = environment[envKey as keyof EnvironmentConfig] as string;

      if (templateVersion && environmentVersion) {
        if (!this.isVersionCompatible(templateVersion, environmentVersion)) {
          issues.push({
            type: 'warning',
            category: 'version',
            message: `${name} version mismatch: template uses ${templateVersion}, environment has ${environmentVersion}`,
            affectedComponent: templateKey,
            suggestedFix: `Update ${name} version to match environment or template requirements`,
            severity: 'major'
          });
        }
      }
    });

    return issues;
  }

  private checkDependencyCompatibility(template: TemplateConfig, environment: EnvironmentConfig): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    if (template.dependencies) {
      Object.entries(template.dependencies).forEach(([depName, depVersion]) => {
        const envVersion = environment.dependencies[depName];

        if (envVersion && !this.isVersionCompatible(depVersion, envVersion)) {
          issues.push({
            type: 'warning',
            category: 'dependency',
            message: `Dependency version conflict: ${depName} template=${depVersion}, environment=${envVersion}`,
            affectedComponent: depName,
            suggestedFix: `Resolve version conflict for ${depName}`,
            severity: 'minor'
          });
        }
      });
    }

    return issues;
  }

  private checkFeatureSupport(template: TemplateConfig, environment: EnvironmentConfig): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    if (template.requiredFeatures) {
      template.requiredFeatures.forEach(feature => {
        if (!environment.features.includes(feature)) {
          issues.push({
            type: 'error',
            category: 'feature',
            message: `Required feature '${feature}' not supported in ${environment.name}`,
            affectedComponent: feature,
            suggestedFix: `Use an environment that supports ${feature} or remove dependency on this feature`,
            severity: 'critical'
          });
        }
      });
    }

    return issues;
  }

  private checkAPICompatibility(template: TemplateConfig, environment: EnvironmentConfig): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    if (template.files) {
      template.files.forEach(file => {
        if (file.content) {
          const apiIssues = this.analyzeAPIUsage(file.content, file.path, environment);
          issues.push(...apiIssues);
        }
      });
    }

    return issues;
  }

  private checkFileStructure(template: TemplateConfig, environment: EnvironmentConfig): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    if (template.files) {
      const appRouterFiles = template.files.filter(f => f.path.includes('/app/'));
      const pagesRouterFiles = template.files.filter(f => f.path.includes('/pages/'));

      if (appRouterFiles.length > 0 && pagesRouterFiles.length > 0) {
        issues.push({
          type: 'warning',
          category: 'framework',
          message: 'Template contains both App Router and Pages Router files',
          affectedComponent: 'routing-structure',
          suggestedFix: 'Choose either App Router or Pages Router, not both',
          severity: 'major'
        });
      }

      if (appRouterFiles.length > 0 && !environment.features.includes('app-router')) {
        issues.push({
          type: 'error',
          category: 'feature',
          message: 'Template uses App Router but environment does not support it',
          affectedComponent: 'app-router',
          suggestedFix: 'Use an environment that supports App Router or convert to Pages Router',
          severity: 'critical'
        });
      }
    }

    return issues;
  }

  private analyzeAPIUsage(content: string, filePath: string, environment: EnvironmentConfig): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    const deprecatedAPIs = [
      { pattern: /getStaticProps/g, message: 'getStaticProps is deprecated in App Router', severity: 'major' as const },
      { pattern: /getServerSideProps/g, message: 'getServerSideProps is deprecated in App Router', severity: 'major' as const },
      { pattern: /next\/head/g, message: 'next/head is deprecated in App Router, use metadata instead', severity: 'minor' as const }
    ];

    deprecatedAPIs.forEach(({ pattern, message, severity }) => {
      if (pattern.test(content)) {
        issues.push({
          type: 'warning',
          category: 'api',
          message: `${message} in ${filePath}`,
          affectedComponent: filePath,
          suggestedFix: 'Update to use new API patterns',
          severity
        });
      }
    });

    return issues;
  }

  private isVersionCompatible(required: string, available: string): boolean {
    const cleanRequired = required.replace(/[\^~]/g, '');
    const cleanAvailable = available.replace(/[\^~]/g, '');

    const reqParts = cleanRequired.split('.').map(Number);
    const availParts = cleanAvailable.split('.').map(Number);

    if (reqParts[0] !== availParts[0]) {
      return reqParts[0] < availParts[0];
    }

    if (reqParts[1] !== undefined && availParts[1] !== undefined) {
      if (reqParts[1] > availParts[1]) return false;
    }

    return true;
  }

  private calculateCompatibilityScore(issues: CompatibilityIssue[], supportedEnvs: number, totalEnvs: number): number {
    const baseScore = (supportedEnvs / totalEnvs) * 100;

    const criticalPenalty = issues.filter(i => i.severity === 'critical').length * 20;
    const majorPenalty = issues.filter(i => i.severity === 'major').length * 10;
    const minorPenalty = issues.filter(i => i.severity === 'minor').length * 5;

    return Math.max(0, baseScore - criticalPenalty - majorPenalty - minorPenalty);
  }

  async batchCheckCompatibility(templates: TemplateConfig[], environmentId?: string): Promise<Map<string, CompatibilityReport>> {
    const reports = new Map<string, CompatibilityReport>();

    const compatibilityPromises = templates.map(async (template) => {
      const report = await this.checkCompatibility(template, environmentId);
      return { id: template.id || template.name, report };
    });

    const results = await Promise.all(compatibilityPromises);

    results.forEach(({ id, report }) => {
      reports.set(id, report);
    });

    return reports;
  }

  getEnvironments(): EnvironmentConfig[] {
    return Array.from(this.environments.values());
  }

  addEnvironment(environment: EnvironmentConfig): void {
    this.environments.set(environment.id, environment);
  }

  removeEnvironment(environmentId: string): boolean {
    return this.environments.delete(environmentId);
  }
}

export const templateCompatibilityChecker = new TemplateCompatibilityChecker();

export function getTemplateCompatibilityChecker(): TemplateCompatibilityChecker {
  return templateCompatibilityChecker;
}