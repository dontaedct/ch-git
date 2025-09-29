/**
 * Intelligent Tooling System
 * 
 * Provides smart development tools with AI-powered suggestions,
 * automated optimizations, and intelligent workflow recommendations.
 */

import { automationEngine, ScriptConfig, WorkflowConfig } from './automation-engine';
import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { glob } from 'glob';

export interface ToolingSuggestion {
  id: string;
  type: 'script' | 'workflow' | 'optimization' | 'fix' | 'enhancement';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  category: string;
  action: {
    type: 'run-script' | 'create-workflow' | 'modify-config' | 'install-package';
    payload: any;
  };
  reasoning: string;
  tags: string[];
}

export interface ProjectAnalysis {
  projectType: string;
  framework: string[];
  languages: string[];
  packageManager: string;
  hasTests: boolean;
  hasLinting: boolean;
  hasTypeScript: boolean;
  hasCI: boolean;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  fileCount: number;
  codeQuality: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

export interface ProductivityMetrics {
  scriptsRunToday: number;
  timeSaved: number; // in minutes
  automationRate: number; // percentage
  errorRate: number; // percentage
  mostUsedScripts: Array<{ scriptId: string; count: number }>;
  trends: {
    daily: number[];
    weekly: number[];
  };
}

export interface SystemOptimization {
  bundleSize: {
    current: number;
    optimized: number;
    savings: number;
  };
  performance: {
    buildTime: number;
    testTime: number;
    lintTime: number;
  };
  recommendations: Array<{
    type: string;
    description: string;
    impact: string;
    implementation: string;
  }>;
}

export class IntelligentTooling {
  private projectRoot: string;
  private analysisCache: Map<string, any> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Analyze the current project structure and configuration
   */
  async analyzeProject(): Promise<ProjectAnalysis> {
    const cacheKey = 'project-analysis';
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    const packageJsonPath = join(this.projectRoot, 'package.json');
    let packageJson: any = {};
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf8');
      packageJson = JSON.parse(content);
    } catch {
      // No package.json found
    }

    // Analyze file structure
    const files = await glob('**/*', { 
      cwd: this.projectRoot, 
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
      nodir: true 
    });

    const languages = this.detectLanguages(files);
    const framework = this.detectFrameworks(packageJson, files);
    const projectType = this.detectProjectType(packageJson, files);

    const analysis: ProjectAnalysis = {
      projectType,
      framework,
      languages,
      packageManager: this.detectPackageManager(),
      hasTests: this.hasTestFiles(files),
      hasLinting: this.hasLintingConfig(files),
      hasTypeScript: languages.includes('TypeScript'),
      hasCI: this.hasCIConfig(files),
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      scripts: packageJson.scripts || {},
      fileCount: files.length,
      codeQuality: await this.analyzeCodeQuality(files)
    };

    this.setCachedResult(cacheKey, analysis);
    return analysis;
  }

  /**
   * Generate intelligent suggestions based on project analysis
   */
  async generateSuggestions(analysis?: ProjectAnalysis): Promise<ToolingSuggestion[]> {
    const projectAnalysis = analysis || await this.analyzeProject();
    const suggestions: ToolingSuggestion[] = [];

    // Script optimization suggestions
    suggestions.push(...this.generateScriptSuggestions(projectAnalysis));
    
    // Workflow automation suggestions
    suggestions.push(...this.generateWorkflowSuggestions(projectAnalysis));
    
    // Performance optimization suggestions
    suggestions.push(...this.generatePerformanceSuggestions(projectAnalysis));
    
    // Quality improvement suggestions
    suggestions.push(...this.generateQualitySuggestions(projectAnalysis));
    
    // Security enhancement suggestions
    suggestions.push(...this.generateSecuritySuggestions(projectAnalysis));

    // Sort by impact and confidence
    return suggestions.sort((a, b) => {
      const aScore = this.calculateSuggestionScore(a);
      const bScore = this.calculateSuggestionScore(b);
      return bScore - aScore;
    });
  }

  /**
   * Generate script-related suggestions
   */
  private generateScriptSuggestions(analysis: ProjectAnalysis): ToolingSuggestion[] {
    const suggestions: ToolingSuggestion[] = [];

    // Missing essential scripts
    if (!analysis.scripts['build']) {
      suggestions.push({
        id: 'add-build-script',
        type: 'script',
        title: 'Add Build Script',
        description: 'Add a production build script to package.json',
        impact: 'high',
        effort: 'low',
        confidence: 95,
        category: 'Development',
        action: {
          type: 'modify-config',
          payload: {
            file: 'package.json',
            path: 'scripts.build',
            value: analysis.hasTypeScript ? 'next build' : 'npm run build'
          }
        },
        reasoning: 'Production build script is essential for deployment',
        tags: ['build', 'production', 'essential']
      });
    }

    if (!analysis.scripts['test'] && analysis.hasTests) {
      suggestions.push({
        id: 'add-test-script',
        type: 'script',
        title: 'Add Test Script',
        description: 'Add a test runner script to package.json',
        impact: 'high',
        effort: 'low',
        confidence: 90,
        category: 'Testing',
        action: {
          type: 'modify-config',
          payload: {
            file: 'package.json',
            path: 'scripts.test',
            value: 'jest'
          }
        },
        reasoning: 'Test files detected but no test script configured',
        tags: ['testing', 'quality', 'essential']
      });
    }

    // Performance optimization scripts
    if (!analysis.scripts['analyze']) {
      suggestions.push({
        id: 'add-bundle-analyzer',
        type: 'script',
        title: 'Add Bundle Analyzer',
        description: 'Add bundle analysis script for performance monitoring',
        impact: 'medium',
        effort: 'low',
        confidence: 85,
        category: 'Performance',
        action: {
          type: 'modify-config',
          payload: {
            file: 'package.json',
            path: 'scripts.analyze',
            value: '@next/bundle-analyzer'
          }
        },
        reasoning: 'Bundle analysis helps identify optimization opportunities',
        tags: ['performance', 'optimization', 'monitoring']
      });
    }

    return suggestions;
  }

  /**
   * Generate workflow automation suggestions
   */
  private generateWorkflowSuggestions(analysis: ProjectAnalysis): ToolingSuggestion[] {
    const suggestions: ToolingSuggestion[] = [];

    if (!analysis.hasCI) {
      suggestions.push({
        id: 'setup-ci-workflow',
        type: 'workflow',
        title: 'Setup CI/CD Pipeline',
        description: 'Create automated CI/CD workflow with testing and deployment',
        impact: 'high',
        effort: 'medium',
        confidence: 90,
        category: 'DevOps',
        action: {
          type: 'create-workflow',
          payload: {
            name: 'ci-cd-pipeline',
            trigger: 'git-push',
            steps: [
              { id: 'install', name: 'Install Dependencies', script: 'npm ci' },
              { id: 'lint', name: 'Lint Code', script: 'npm run lint' },
              { id: 'test', name: 'Run Tests', script: 'npm test' },
              { id: 'build', name: 'Build Application', script: 'npm run build' }
            ]
          }
        },
        reasoning: 'Automated CI/CD ensures code quality and deployment reliability',
        tags: ['ci-cd', 'automation', 'quality']
      });
    }

    // Pre-commit workflow
    suggestions.push({
      id: 'setup-precommit-workflow',
      type: 'workflow',
      title: 'Setup Pre-commit Hooks',
      description: 'Automated code quality checks before commits',
      impact: 'medium',
      effort: 'low',
      confidence: 85,
      category: 'Quality',
      action: {
        type: 'create-workflow',
        payload: {
          name: 'pre-commit-quality',
          trigger: 'git-push',
          steps: [
            { id: 'lint', name: 'Lint Changes', script: 'npm run lint:staged' },
            { id: 'format', name: 'Format Code', script: 'npm run format:staged' },
            { id: 'typecheck', name: 'Type Check', script: 'npm run typecheck' }
          ]
        }
      },
      reasoning: 'Pre-commit hooks prevent low-quality code from entering the repository',
      tags: ['git-hooks', 'quality', 'automation']
    });

    return suggestions;
  }

  /**
   * Generate performance optimization suggestions
   */
  private generatePerformanceSuggestions(analysis: ProjectAnalysis): ToolingSuggestion[] {
    const suggestions: ToolingSuggestion[] = [];

    // Bundle optimization
    if (analysis.framework.includes('Next.js')) {
      suggestions.push({
        id: 'optimize-bundle',
        type: 'optimization',
        title: 'Optimize Bundle Size',
        description: 'Enable bundle optimization and tree shaking',
        impact: 'high',
        effort: 'low',
        confidence: 90,
        category: 'Performance',
        action: {
          type: 'modify-config',
          payload: {
            file: 'next.config.js',
            optimization: {
              splitChunks: true,
              treeShaking: true,
              minify: true
            }
          }
        },
        reasoning: 'Bundle optimization reduces load times and improves user experience',
        tags: ['performance', 'optimization', 'bundle']
      });
    }

    // Image optimization
    suggestions.push({
      id: 'optimize-images',
      type: 'optimization',
      title: 'Enable Image Optimization',
      description: 'Optimize images for better performance',
      impact: 'medium',
      effort: 'low',
      confidence: 85,
      category: 'Performance',
      action: {
        type: 'run-script',
        payload: {
          scriptId: 'image-optimization-setup'
        }
      },
      reasoning: 'Image optimization significantly reduces page load times',
      tags: ['performance', 'images', 'optimization']
    });

    return suggestions;
  }

  /**
   * Generate code quality suggestions
   */
  private generateQualitySuggestions(analysis: ProjectAnalysis): ToolingSuggestion[] {
    const suggestions: ToolingSuggestion[] = [];

    if (!analysis.hasLinting) {
      suggestions.push({
        id: 'setup-linting',
        type: 'enhancement',
        title: 'Setup ESLint',
        description: 'Configure ESLint for code quality and consistency',
        impact: 'high',
        effort: 'low',
        confidence: 95,
        category: 'Quality',
        action: {
          type: 'install-package',
          payload: {
            packages: ['eslint', '@typescript-eslint/parser', '@typescript-eslint/eslint-plugin'],
            dev: true
          }
        },
        reasoning: 'Linting catches errors and enforces code quality standards',
        tags: ['quality', 'linting', 'standards']
      });
    }

    if (!analysis.hasTypeScript && analysis.languages.includes('JavaScript')) {
      suggestions.push({
        id: 'migrate-to-typescript',
        type: 'enhancement',
        title: 'Migrate to TypeScript',
        description: 'Gradually migrate JavaScript files to TypeScript for better type safety',
        impact: 'high',
        effort: 'high',
        confidence: 75,
        category: 'Quality',
        action: {
          type: 'run-script',
          payload: {
            scriptId: 'typescript-migration'
          }
        },
        reasoning: 'TypeScript provides better developer experience and catches errors at compile time',
        tags: ['typescript', 'migration', 'type-safety']
      });
    }

    return suggestions;
  }

  /**
   * Generate security enhancement suggestions
   */
  private generateSecuritySuggestions(analysis: ProjectAnalysis): ToolingSuggestion[] {
    const suggestions: ToolingSuggestion[] = [];

    // Security audit
    suggestions.push({
      id: 'security-audit',
      type: 'script',
      title: 'Run Security Audit',
      description: 'Check for known security vulnerabilities in dependencies',
      impact: 'high',
      effort: 'low',
      confidence: 95,
      category: 'Security',
      action: {
        type: 'run-script',
        payload: {
          scriptId: 'security-audit'
        }
      },
      reasoning: 'Regular security audits help identify and fix vulnerabilities',
      tags: ['security', 'audit', 'vulnerabilities']
    });

    // Environment variables validation
    suggestions.push({
      id: 'env-validation',
      type: 'enhancement',
      title: 'Environment Variables Validation',
      description: 'Add validation for required environment variables',
      impact: 'medium',
      effort: 'low',
      confidence: 80,
      category: 'Security',
      action: {
        type: 'run-script',
        payload: {
          scriptId: 'env-validation-setup'
        }
      },
      reasoning: 'Environment variable validation prevents runtime errors and security issues',
      tags: ['security', 'environment', 'validation']
    });

    return suggestions;
  }

  /**
   * Calculate suggestion priority score
   */
  private calculateSuggestionScore(suggestion: ToolingSuggestion): number {
    const impactWeight = { low: 1, medium: 2, high: 3 };
    const effortWeight = { low: 3, medium: 2, high: 1 }; // Lower effort = higher score
    
    return (
      impactWeight[suggestion.impact] * 0.4 +
      effortWeight[suggestion.effort] * 0.3 +
      (suggestion.confidence / 100) * 0.3
    ) * 100;
  }

  /**
   * Get productivity metrics
   */
  async getProductivityMetrics(): Promise<ProductivityMetrics> {
    const history = automationEngine.getExecutionHistory();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayExecutions = history.filter(
      r => r.startTime >= today
    );

    // Calculate time saved (mock implementation)
    const timeSaved = todayExecutions.reduce((total, execution) => {
      // Estimate manual time vs automated time
      const manualTime = this.estimateManualTime(execution.metadata?.scriptId);
      const automatedTime = execution.duration / 1000 / 60; // Convert to minutes
      return total + Math.max(0, manualTime - automatedTime);
    }, 0);

    const stats = automationEngine.getExecutionStats();

    return {
      scriptsRunToday: todayExecutions.length,
      timeSaved: Math.round(timeSaved),
      automationRate: Math.round(stats.successRate * 100),
      errorRate: Math.round((1 - stats.successRate) * 100),
      mostUsedScripts: this.getMostUsedScripts(history),
      trends: {
        daily: this.getDailyTrends(history),
        weekly: this.getWeeklyTrends(history)
      }
    };
  }

  /**
   * Get system optimization recommendations
   */
  async getSystemOptimizations(): Promise<SystemOptimization> {
    // Mock implementation - would integrate with actual analysis tools
    return {
      bundleSize: {
        current: 2.1, // MB
        optimized: 1.4, // MB
        savings: 0.7 // MB
      },
      performance: {
        buildTime: 125000, // ms
        testTime: 45000, // ms
        lintTime: 12000 // ms
      },
      recommendations: [
        {
          type: 'Bundle Optimization',
          description: 'Enable code splitting and tree shaking',
          impact: 'High - 33% bundle size reduction',
          implementation: 'Update webpack configuration'
        },
        {
          type: 'Build Performance',
          description: 'Enable build caching',
          impact: 'Medium - 20% faster builds',
          implementation: 'Configure build cache in CI/CD'
        },
        {
          type: 'Test Performance',
          description: 'Parallelize test execution',
          impact: 'Medium - 30% faster tests',
          implementation: 'Update Jest configuration'
        }
      ]
    };
  }

  /**
   * Smart script recommendation based on context
   */
  async recommendNextScript(context: {
    lastScript?: string;
    projectState?: string;
    timeOfDay?: string;
    gitStatus?: string;
  }): Promise<ToolingSuggestion[]> {
    const suggestions: ToolingSuggestion[] = [];

    // Context-based recommendations
    if (context.gitStatus === 'uncommitted-changes') {
      suggestions.push({
        id: 'pre-commit-check',
        type: 'script',
        title: 'Pre-commit Quality Check',
        description: 'Run linting and tests before committing',
        impact: 'high',
        effort: 'low',
        confidence: 90,
        category: 'Quality',
        action: {
          type: 'run-script',
          payload: { scriptId: 'pre-commit-check' }
        },
        reasoning: 'Uncommitted changes detected - ensure quality before commit',
        tags: ['git', 'quality', 'pre-commit']
      });
    }

    if (context.lastScript === 'build-prod' && context.projectState === 'ready-for-deploy') {
      suggestions.push({
        id: 'deployment-check',
        type: 'script',
        title: 'Deployment Readiness Check',
        description: 'Verify deployment readiness and run final checks',
        impact: 'high',
        effort: 'low',
        confidence: 95,
        category: 'Deployment',
        action: {
          type: 'run-script',
          payload: { scriptId: 'deployment-check' }
        },
        reasoning: 'Production build completed - verify deployment readiness',
        tags: ['deployment', 'verification', 'production']
      });
    }

    return suggestions.slice(0, 3); // Return top 3 recommendations
  }

  // Helper methods

  private detectLanguages(files: string[]): string[] {
    const extensions = files.map(f => extname(f).toLowerCase());
    const languages = new Set<string>();

    if (extensions.some(ext => ['.ts', '.tsx'].includes(ext))) languages.add('TypeScript');
    if (extensions.some(ext => ['.js', '.jsx'].includes(ext))) languages.add('JavaScript');
    if (extensions.some(ext => ext === '.py')) languages.add('Python');
    if (extensions.some(ext => ext === '.go')) languages.add('Go');
    if (extensions.some(ext => ext === '.rs')) languages.add('Rust');

    return Array.from(languages);
  }

  private detectFrameworks(packageJson: any, files: string[]): string[] {
    const frameworks = new Set<string>();
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.next) frameworks.add('Next.js');
    if (deps.react) frameworks.add('React');
    if (deps.vue) frameworks.add('Vue');
    if (deps.angular) frameworks.add('Angular');
    if (deps.express) frameworks.add('Express');
    if (deps.nestjs) frameworks.add('NestJS');

    return Array.from(frameworks);
  }

  private detectProjectType(packageJson: any, files: string[]): string {
    if (packageJson.dependencies?.next) return 'Next.js Application';
    if (packageJson.dependencies?.react) return 'React Application';
    if (files.some(f => f.includes('server.') || f.includes('app.'))) return 'Web Application';
    if (packageJson.main || packageJson.bin) return 'Node.js Package';
    return 'JavaScript Project';
  }

  private detectPackageManager(): string {
    // Simple detection - could be enhanced
    return 'npm';
  }

  private hasTestFiles(files: string[]): boolean {
    return files.some(f => 
      f.includes('.test.') || 
      f.includes('.spec.') || 
      f.includes('__tests__')
    );
  }

  private hasLintingConfig(files: string[]): boolean {
    return files.some(f => 
      f.includes('.eslintrc') || 
      f.includes('eslint.config') ||
      f === '.eslintrc.json' ||
      f === '.eslintrc.js'
    );
  }

  private hasCIConfig(files: string[]): boolean {
    return files.some(f => 
      f.includes('.github/workflows') ||
      f.includes('.gitlab-ci') ||
      f.includes('Jenkinsfile') ||
      f.includes('.circleci')
    );
  }

  private async analyzeCodeQuality(files: string[]): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    // Mock implementation - would integrate with actual code quality tools
    const jsFiles = files.filter(f => ['.js', '.ts', '.jsx', '.tsx'].includes(extname(f)));
    const score = Math.max(60, Math.min(100, 80 + Math.random() * 20));

    return {
      score: Math.round(score),
      issues: [
        'Some files missing JSDoc comments',
        'Inconsistent naming conventions detected',
        'Large functions detected (>50 lines)'
      ],
      recommendations: [
        'Add comprehensive JSDoc documentation',
        'Establish consistent naming conventions',
        'Break down large functions into smaller units',
        'Increase test coverage to >90%'
      ]
    };
  }

  private estimateManualTime(scriptId?: string): number {
    // Estimate manual time for common tasks (in minutes)
    const estimates: Record<string, number> = {
      'build-prod': 5,
      'test-suite': 10,
      'lint-fix': 15,
      'security-audit': 20,
      'performance-audit': 30,
      'accessibility-check': 25
    };

    return estimates[scriptId || ''] || 5;
  }

  private getMostUsedScripts(history: any[]): Array<{ scriptId: string; count: number }> {
    const counts = new Map<string, number>();
    
    history.forEach(execution => {
      const scriptId = execution.metadata?.scriptId || 'unknown';
      counts.set(scriptId, (counts.get(scriptId) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([scriptId, count]) => ({ scriptId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getDailyTrends(history: any[]): number[] {
    // Return last 7 days of execution counts
    const days = Array(7).fill(0);
    const now = new Date();

    history.forEach(execution => {
      const daysDiff = Math.floor(
        (now.getTime() - execution.startTime.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff < 7) {
        days[6 - daysDiff]++;
      }
    });

    return days;
  }

  private getWeeklyTrends(history: any[]): number[] {
    // Return last 4 weeks of execution counts
    const weeks = Array(4).fill(0);
    const now = new Date();

    history.forEach(execution => {
      const weeksDiff = Math.floor(
        (now.getTime() - execution.startTime.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      if (weeksDiff < 4) {
        weeks[3 - weeksDiff]++;
      }
    });

    return weeks;
  }

  private getCachedResult(key: string): any {
    const cached = this.analysisCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.analysisCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const intelligentTooling = new IntelligentTooling();

// Export types
export type {
  ToolingSuggestion,
  ProjectAnalysis,
  ProductivityMetrics,
  SystemOptimization
};
