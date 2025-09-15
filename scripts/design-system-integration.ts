/**
 * @fileoverview HT-008.10.6: Design System Integration Script
 * @module scripts/design-system-integration.ts
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.6 - Design System Integration with Existing Components
 * Focus: Migrate existing components to use design system tokens and patterns
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system integration)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

interface ComponentAnalysis {
  path: string;
  name: string;
  type: 'tsx' | 'ts' | 'jsx' | 'js';
  size: number;
  hasDesignTokens: boolean;
  hasTailwindClasses: boolean;
  hasInlineStyles: boolean;
  hasHardcodedValues: boolean;
  migrationComplexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  issues: string[];
  recommendations: string[];
}

interface IntegrationReport {
  timestamp: string;
  totalComponents: number;
  migratedComponents: number;
  pendingComponents: number;
  failedComponents: number;
  components: ComponentAnalysis[];
  summary: string;
  nextSteps: string[];
}

class DesignSystemIntegration {
  private componentsPath: string;
  private designTokensPath: string;
  private reportPath: string;

  constructor() {
    this.componentsPath = join(process.cwd(), 'components');
    this.designTokensPath = join(process.cwd(), 'lib/design-tokens');
    this.reportPath = join(process.cwd(), 'reports', 'design-system-integration.json');
  }

  async integrate(): Promise<void> {
    console.log('🔗 Starting Design System Integration...\n');

    await this.analyzeComponents();
    await this.migrateComponents();
    await this.updateImports();
    await this.validateIntegration();
    await this.generateReport();
  }

  private async analyzeComponents(): Promise<void> {
    console.log('🔍 Analyzing Components...');

    const components = this.findComponents();
    console.log(`Found ${components.length} components to analyze`);

    for (const component of components) {
      const analysis = this.analyzeComponent(component);
      console.log(`  📄 ${analysis.name}: ${analysis.migrationComplexity} complexity`);
    }
  }

  private findComponents(): string[] {
    const components: string[] = [];

    const scanDirectory = (dir: string): void => {
      if (!existsSync(dir)) return;

      const items = readdirSync(dir);
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = extname(fullPath);
          if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
            components.push(fullPath);
          }
        }
      }
    };

    scanDirectory(this.componentsPath);
    return components;
  }

  private analyzeComponent(filePath: string): ComponentAnalysis {
    const content = readFileSync(filePath, 'utf-8');
    const fileName = filePath.split('/').pop() || '';
    const name = fileName.replace(/\.(tsx|ts|jsx|js)$/, '');

    const analysis: ComponentAnalysis = {
      path: filePath,
      name,
      type: extname(filePath).slice(1) as any,
      size: content.length,
      hasDesignTokens: this.hasDesignTokens(content),
      hasTailwindClasses: this.hasTailwindClasses(content),
      hasInlineStyles: this.hasInlineStyles(content),
      hasHardcodedValues: this.hasHardcodedValues(content),
      migrationComplexity: 'low',
      dependencies: this.extractDependencies(content),
      issues: [],
      recommendations: [],
    };

    // Determine migration complexity
    analysis.migrationComplexity = this.determineComplexity(analysis);

    // Identify issues and recommendations
    analysis.issues = this.identifyIssues(analysis, content);
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  private hasDesignTokens(content: string): boolean {
    return content.includes('useTokens') || 
           content.includes('designTokens') ||
           content.includes('@/lib/design-tokens');
  }

  private hasTailwindClasses(content: string): boolean {
    return /className\s*=\s*["'`][^"'`]*["'`]/.test(content);
  }

  private hasInlineStyles(content: string): boolean {
    return /style\s*=\s*{/.test(content);
  }

  private hasHardcodedValues(content: string): boolean {
    const hardcodedPatterns = [
      /#[0-9a-fA-F]{6}/g, // Hex colors
      /\d+px/g, // Pixel values
      /\d+rem/g, // Rem values
      /\d+em/g, // Em values
    ];

    return hardcodedPatterns.some(pattern => pattern.test(content));
  }

  private extractDependencies(content: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const dependencies: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    return dependencies;
  }

  private determineComplexity(analysis: ComponentAnalysis): 'low' | 'medium' | 'high' {
    let score = 0;

    if (analysis.hasDesignTokens) score -= 2;
    if (analysis.hasTailwindClasses) score += 1;
    if (analysis.hasInlineStyles) score += 2;
    if (analysis.hasHardcodedValues) score += 3;
    if (analysis.size > 1000) score += 1;
    if (analysis.dependencies.length > 5) score += 1;

    if (score <= 1) return 'low';
    if (score <= 3) return 'medium';
    return 'high';
  }

  private identifyIssues(analysis: ComponentAnalysis, content: string): string[] {
    const issues: string[] = [];

    if (!analysis.hasDesignTokens) {
      issues.push('Component does not use design tokens');
    }

    if (analysis.hasHardcodedValues) {
      issues.push('Component contains hardcoded values');
    }

    if (analysis.hasInlineStyles) {
      issues.push('Component uses inline styles');
    }

    if (content.includes('!important')) {
      issues.push('Component uses !important declarations');
    }

    if (content.includes('px') && !content.includes('rem')) {
      issues.push('Component uses pixel values instead of rem');
    }

    return issues;
  }

  private generateRecommendations(analysis: ComponentAnalysis): string[] {
    const recommendations: string[] = [];

    if (!analysis.hasDesignTokens) {
      recommendations.push('Import and use design tokens from @/lib/design-tokens');
    }

    if (analysis.hasHardcodedValues) {
      recommendations.push('Replace hardcoded values with design tokens');
    }

    if (analysis.hasInlineStyles) {
      recommendations.push('Move inline styles to CSS classes or design tokens');
    }

    if (analysis.migrationComplexity === 'high') {
      recommendations.push('Consider breaking down into smaller components');
    }

    recommendations.push('Add proper TypeScript types for props');
    recommendations.push('Ensure accessibility compliance');

    return recommendations;
  }

  private async migrateComponents(): Promise<void> {
    console.log('🔄 Migrating Components...');

    const components = this.findComponents();
    let migratedCount = 0;

    for (const componentPath of components) {
      try {
        const migrated = await this.migrateComponent(componentPath);
        if (migrated) {
          migratedCount++;
          console.log(`  ✅ Migrated: ${componentPath}`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to migrate ${componentPath}:`, error);
      }
    }

    console.log(`✅ Migrated ${migratedCount} components`);
  }

  private async migrateComponent(filePath: string): Promise<boolean> {
    const content = readFileSync(filePath, 'utf-8');
    let migratedContent = content;

    // Add design tokens import if not present
    if (!content.includes('useTokens') && !content.includes('designTokens')) {
      const importStatement = "import { useTokens } from '@/lib/design-tokens';\n";
      migratedContent = importStatement + migratedContent;
    }

    // Replace hardcoded colors with design tokens
    migratedContent = this.replaceHardcodedColors(migratedContent);

    // Replace hardcoded spacing with design tokens
    migratedContent = this.replaceHardcodedSpacing(migratedContent);

    // Replace hardcoded typography with design tokens
    migratedContent = this.replaceHardcodedTypography(migratedContent);

    // Add design tokens usage
    migratedContent = this.addDesignTokensUsage(migratedContent);

    // Only write if content changed
    if (migratedContent !== content) {
      writeFileSync(filePath, migratedContent);
      return true;
    }

    return false;
  }

  private replaceHardcodedColors(content: string): string {
    // Replace common hardcoded colors with design tokens
    const colorReplacements: Record<string, string> = {
      '#ffffff': 'colors.background',
      '#000000': 'colors.foreground',
      '#3b82f6': 'colors.primary',
      '#ef4444': 'colors.destructive',
      '#22c55e': 'colors.success',
      '#f59e0b': 'colors.warning',
      '#6b7280': 'colors.muted',
    };

    let migratedContent = content;
    for (const [hardcoded, token] of Object.entries(colorReplacements)) {
      migratedContent = migratedContent.replace(
        new RegExp(hardcoded, 'g'),
        `{colors.${token}}`
      );
    }

    return migratedContent;
  }

  private replaceHardcodedSpacing(content: string): string {
    // Replace common hardcoded spacing with design tokens
    const spacingReplacements: Record<string, string> = {
      '4px': 'spacing.xs',
      '8px': 'spacing.sm',
      '16px': 'spacing.md',
      '24px': 'spacing.lg',
      '32px': 'spacing.xl',
      '48px': 'spacing.2xl',
    };

    let migratedContent = content;
    for (const [hardcoded, token] of Object.entries(spacingReplacements)) {
      migratedContent = migratedContent.replace(
        new RegExp(hardcoded, 'g'),
        `{spacing.${token}}`
      );
    }

    return migratedContent;
  }

  private replaceHardcodedTypography(content: string): string {
    // Replace common hardcoded typography with design tokens
    const typographyReplacements: Record<string, string> = {
      '12px': 'typography.fontSize.xs',
      '14px': 'typography.fontSize.sm',
      '16px': 'typography.fontSize.base',
      '18px': 'typography.fontSize.lg',
      '20px': 'typography.fontSize.xl',
      '24px': 'typography.fontSize.2xl',
    };

    let migratedContent = content;
    for (const [hardcoded, token] of Object.entries(typographyReplacements)) {
      migratedContent = migratedContent.replace(
        new RegExp(hardcoded, 'g'),
        `{typography.${token}}`
      );
    }

    return migratedContent;
  }

  private addDesignTokensUsage(content: string): string {
    // Add useTokens hook if component doesn't have it
    if (!content.includes('useTokens()')) {
      const hookUsage = 'const { tokens } = useTokens();\n';
      
      // Find the component function and add the hook
      const functionMatch = content.match(/(export\s+)?function\s+\w+\s*\([^)]*\)\s*{/);
      if (functionMatch) {
        const insertIndex = functionMatch.index! + functionMatch[0].length;
        return content.slice(0, insertIndex) + '\n  ' + hookUsage + content.slice(insertIndex);
      }
    }

    return content;
  }

  private async updateImports(): Promise<void> {
    console.log('📦 Updating Imports...');

    // Update component index files
    const indexFiles = [
      join(this.componentsPath, 'ui', 'index.ts'),
      join(this.componentsPath, 'index.ts'),
    ];

    for (const indexFile of indexFiles) {
      if (existsSync(indexFile)) {
        await this.updateComponentIndex(indexFile);
      }
    }
  }

  private async updateComponentIndex(indexFile: string): Promise<void> {
    const content = readFileSync(indexFile, 'utf-8');
    
    // Add design tokens export if not present
    if (!content.includes('design-tokens')) {
      const tokensExport = "export * from '@/lib/design-tokens';\n";
      const updatedContent = tokensExport + content;
      writeFileSync(indexFile, updatedContent);
    }
  }

  private async validateIntegration(): Promise<void> {
    console.log('✅ Validating Integration...');

    try {
      // Run type checking
      execSync('npm run typecheck', { stdio: 'pipe' });
      console.log('  ✅ TypeScript validation passed');

      // Run linting
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('  ✅ Linting validation passed');

      // Run tests
      execSync('npm run test', { stdio: 'pipe' });
      console.log('  ✅ Tests validation passed');

    } catch (error) {
      console.error('  ❌ Validation failed:', error);
      throw error;
    }
  }

  private async generateReport(): Promise<void> {
    console.log('📊 Generating Integration Report...');

    const components = this.findComponents();
    const analyses = components.map(component => this.analyzeComponent(component));

    const report: IntegrationReport = {
      timestamp: new Date().toISOString(),
      totalComponents: components.length,
      migratedComponents: analyses.filter(a => a.hasDesignTokens).length,
      pendingComponents: analyses.filter(a => !a.hasDesignTokens).length,
      failedComponents: 0,
      components: analyses,
      summary: this.generateSummary(analyses),
      nextSteps: this.generateNextSteps(analyses),
    };

    // Ensure reports directory exists
    const reportsDir = join(process.cwd(), 'reports');
    if (!existsSync(reportsDir)) {
      execSync(`mkdir -p ${reportsDir}`);
    }

    writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved to: ${this.reportPath}`);
  }

  private generateSummary(analyses: ComponentAnalysis[]): string {
    const total = analyses.length;
    const migrated = analyses.filter(a => a.hasDesignTokens).length;
    const pending = total - migrated;
    const highComplexity = analyses.filter(a => a.migrationComplexity === 'high').length;

    return `Design System Integration Summary: ${migrated}/${total} components migrated. ${pending} components pending migration. ${highComplexity} high-complexity components require attention.`;
  }

  private generateNextSteps(analyses: ComponentAnalysis[]): string[] {
    const nextSteps: string[] = [];

    const highComplexity = analyses.filter(a => a.migrationComplexity === 'high');
    if (highComplexity.length > 0) {
      nextSteps.push(`Migrate ${highComplexity.length} high-complexity components`);
    }

    const pending = analyses.filter(a => !a.hasDesignTokens);
    if (pending.length > 0) {
      nextSteps.push(`Complete migration of ${pending.length} remaining components`);
    }

    nextSteps.push('Run comprehensive testing');
    nextSteps.push('Update documentation');
    nextSteps.push('Train team on design system usage');

    return nextSteps;
  }
}

// Main execution
async function main() {
  const integration = new DesignSystemIntegration();
  await integration.integrate();
  
  console.log('\n🎉 Design System Integration Complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { DesignSystemIntegration };
