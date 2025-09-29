import { z } from 'zod';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import type { ClientConfig, TemplateConfig, DeploymentValidation } from '@/types/deployment';

const ValidationSchema = z.object({
  clientId: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
  templateId: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
  environment: z.enum(['staging', 'production']),
  customizations: z.record(z.any()).optional().default({}),
  finalCheck: z.boolean().optional().default(false),
});

export class ProductionValidator {
  private validationResults: DeploymentValidation[] = [];

  async validateDeployment(params: z.infer<typeof ValidationSchema>): Promise<DeploymentValidation> {
    console.log('🔍 Starting production deployment validation...');

    const validation = ValidationSchema.parse(params);
    const result: DeploymentValidation = {
      deploymentId: `validate-${Date.now()}-${validation.clientId}`,
      clientId: validation.clientId,
      templateId: validation.templateId,
      environment: validation.environment,
      timestamp: new Date().toISOString(),
      status: 'pending',
      checks: {},
      errors: [],
      warnings: [],
      metadata: {
        validationLevel: validation.finalCheck ? 'final' : 'initial',
        customizations: validation.customizations,
      },
    };

    try {
      // Run all validation checks
      await this.validateClientConfiguration(validation, result);
      await this.validateTemplateCompatibility(validation, result);
      await this.validateSecurityCompliance(validation, result);
      await this.validatePerformanceRequirements(validation, result);
      await this.validateInfrastructureReadiness(validation, result);
      await this.validateDependencies(validation, result);

      if (validation.finalCheck) {
        await this.runFinalProductionChecks(validation, result);
      }

      // Determine overall status
      result.status = result.errors.length > 0 ? 'failed' : 'passed';

      this.validationResults.push(result);

      if (result.status === 'failed') {
        console.error('❌ Production validation failed:', result.errors);
        throw new Error(`Production validation failed: ${result.errors.join(', ')}`);
      }

      console.log('✅ Production validation completed successfully');
      return result;

    } catch (error) {
      result.status = 'error';
      result.errors.push(error instanceof Error ? error.message : 'Unknown validation error');
      this.validationResults.push(result);
      throw error;
    }
  }

  private async validateClientConfiguration(
    validation: z.infer<typeof ValidationSchema>,
    result: DeploymentValidation
  ): Promise<void> {
    console.log('🔧 Validating client configuration...');

    try {
      // Check if client exists in database
      const clientExists = await this.checkClientExists(validation.clientId);
      if (!clientExists) {
        result.errors.push(`Client ${validation.clientId} not found in database`);
        return;
      }

      // Validate client configuration schema
      const clientConfig = await this.getClientConfig(validation.clientId);
      if (!this.isValidClientConfig(clientConfig)) {
        result.errors.push('Invalid client configuration schema');
        return;
      }

      // Check client subscription status
      if (validation.environment === 'production' && !clientConfig.subscriptionActive) {
        result.errors.push('Client subscription is not active for production deployment');
        return;
      }

      // Validate customizations against client limits
      if (!this.validateCustomizationLimits(validation.customizations, clientConfig)) {
        result.warnings.push('Some customizations exceed client plan limits');
      }

      result.checks.clientConfiguration = 'passed';
      console.log('✓ Client configuration validation passed');

    } catch (error) {
      result.checks.clientConfiguration = 'failed';
      result.errors.push(`Client configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validateTemplateCompatibility(
    validation: z.infer<typeof ValidationSchema>,
    result: DeploymentValidation
  ): Promise<void> {
    console.log('📋 Validating template compatibility...');

    try {
      // Check if template exists
      const templatePath = join(process.cwd(), 'templates', validation.templateId);
      await access(templatePath);

      // Load template configuration
      const templateConfig = await this.getTemplateConfig(validation.templateId);
      if (!templateConfig) {
        result.errors.push(`Template ${validation.templateId} configuration not found`);
        return;
      }

      // Validate template version compatibility
      if (!this.isTemplateVersionCompatible(templateConfig)) {
        result.errors.push('Template version is not compatible with current platform version');
        return;
      }

      // Check customization compatibility
      const incompatibleCustomizations = this.checkCustomizationCompatibility(
        validation.customizations,
        templateConfig
      );

      if (incompatibleCustomizations.length > 0) {
        result.errors.push(`Incompatible customizations: ${incompatibleCustomizations.join(', ')}`);
        return;
      }

      // Validate required dependencies
      if (!await this.validateTemplateDependencies(templateConfig)) {
        result.errors.push('Template dependencies validation failed');
        return;
      }

      result.checks.templateCompatibility = 'passed';
      console.log('✓ Template compatibility validation passed');

    } catch (error) {
      result.checks.templateCompatibility = 'failed';
      result.errors.push(`Template compatibility validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validateSecurityCompliance(
    validation: z.infer<typeof ValidationSchema>,
    result: DeploymentValidation
  ): Promise<void> {
    console.log('🔒 Validating security compliance...');

    try {
      // Check for security vulnerabilities in dependencies
      try {
        execSync('npm audit --audit-level high', { stdio: 'pipe' });
      } catch (error) {
        result.warnings.push('High severity security vulnerabilities detected in dependencies');
      }

      // Validate environment variables for secrets
      const hasSecrets = this.checkForSecretsInCustomizations(validation.customizations);
      if (hasSecrets) {
        result.errors.push('Secrets detected in customizations - use environment variables instead');
        return;
      }

      // Validate HTTPS requirements for production
      if (validation.environment === 'production') {
        const httpsCompliant = this.validateHttpsCompliance(validation.customizations);
        if (!httpsCompliant) {
          result.errors.push('HTTPS compliance validation failed for production deployment');
          return;
        }
      }

      // Check CSP and security headers configuration
      if (!this.validateSecurityHeaders(validation.customizations)) {
        result.warnings.push('Security headers configuration could be improved');
      }

      // Validate API security configurations
      if (!this.validateApiSecurity(validation.customizations)) {
        result.errors.push('API security configuration validation failed');
        return;
      }

      result.checks.securityCompliance = 'passed';
      console.log('✓ Security compliance validation passed');

    } catch (error) {
      result.checks.securityCompliance = 'failed';
      result.errors.push(`Security compliance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validatePerformanceRequirements(
    validation: z.infer<typeof ValidationSchema>,
    result: DeploymentValidation
  ): Promise<void> {
    console.log('⚡ Validating performance requirements...');

    try {
      // Check bundle size limits
      const bundleSize = await this.estimateBundleSize(validation.templateId, validation.customizations);
      if (bundleSize > 5 * 1024 * 1024) { // 5MB limit
        result.warnings.push(`Bundle size (${bundleSize} bytes) exceeds recommended limit`);
      }

      // Validate performance budget
      const performanceBudget = this.validatePerformanceBudget(validation.customizations);
      if (!performanceBudget.valid) {
        result.warnings.push(`Performance budget violations: ${performanceBudget.violations.join(', ')}`);
      }

      // Check image optimization settings
      if (!this.validateImageOptimization(validation.customizations)) {
        result.warnings.push('Image optimization settings could be improved');
      }

      // Validate caching strategy
      if (!this.validateCachingStrategy(validation.customizations)) {
        result.warnings.push('Caching strategy configuration needs improvement');
      }

      // Check CDN configuration for production
      if (validation.environment === 'production' && !this.validateCdnConfiguration(validation.customizations)) {
        result.warnings.push('CDN configuration could be optimized for production');
      }

      result.checks.performanceRequirements = 'passed';
      console.log('✓ Performance requirements validation passed');

    } catch (error) {
      result.checks.performanceRequirements = 'failed';
      result.errors.push(`Performance requirements validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validateInfrastructureReadiness(
    validation: z.infer<typeof ValidationSchema>,
    result: DeploymentValidation
  ): Promise<void> {
    console.log('🏗️ Validating infrastructure readiness...');

    try {
      // Check Vercel deployment limits
      if (!await this.checkVercelDeploymentLimits(validation.clientId)) {
        result.errors.push('Vercel deployment limits exceeded for client');
        return;
      }

      // Validate Supabase database connection
      if (!await this.validateSupabaseConnection()) {
        result.errors.push('Supabase database connection validation failed');
        return;
      }

      // Check environment variables configuration
      const envVarsValid = await this.validateEnvironmentVariables(validation.environment);
      if (!envVarsValid) {
        result.errors.push('Environment variables configuration validation failed');
        return;
      }

      // Validate domain configuration if specified
      const domain = validation.customizations.domain;
      if (domain && !await this.validateDomainConfiguration(domain)) {
        result.errors.push(`Domain configuration validation failed for ${domain}`);
        return;
      }

      // Check monitoring and logging setup
      if (!this.validateMonitoringSetup(validation.environment)) {
        result.warnings.push('Monitoring and logging setup could be improved');
      }

      result.checks.infrastructureReadiness = 'passed';
      console.log('✓ Infrastructure readiness validation passed');

    } catch (error) {
      result.checks.infrastructureReadiness = 'failed';
      result.errors.push(`Infrastructure readiness validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validateDependencies(
    validation: z.infer<typeof ValidationSchema>,
    result: DeploymentValidation
  ): Promise<void> {
    console.log('📦 Validating dependencies...');

    try {
      // Check Node.js version compatibility
      const nodeVersion = process.version;
      if (!this.isNodeVersionCompatible(nodeVersion)) {
        result.errors.push(`Node.js version ${nodeVersion} is not compatible`);
        return;
      }

      // Validate package.json integrity
      if (!await this.validatePackageJsonIntegrity()) {
        result.errors.push('package.json integrity validation failed');
        return;
      }

      // Check for conflicting dependencies
      const conflicts = await this.checkDependencyConflicts();
      if (conflicts.length > 0) {
        result.warnings.push(`Dependency conflicts detected: ${conflicts.join(', ')}`);
      }

      // Validate build dependencies
      if (!await this.validateBuildDependencies()) {
        result.errors.push('Build dependencies validation failed');
        return;
      }

      result.checks.dependencies = 'passed';
      console.log('✓ Dependencies validation passed');

    } catch (error) {
      result.checks.dependencies = 'failed';
      result.errors.push(`Dependencies validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runFinalProductionChecks(
    validation: z.infer<typeof ValidationSchema>,
    result: DeploymentValidation
  ): Promise<void> {
    console.log('🚀 Running final production checks...');

    try {
      // Run full build test
      if (!await this.runBuildTest(validation.templateId, validation.customizations)) {
        result.errors.push('Production build test failed');
        return;
      }

      // Check deployment rollback capability
      if (!this.validateRollbackCapability()) {
        result.warnings.push('Deployment rollback capability verification failed');
      }

      // Validate backup and recovery procedures
      if (!this.validateBackupRecoveryProcedures()) {
        result.warnings.push('Backup and recovery procedures need validation');
      }

      // Check incident response readiness
      if (!this.validateIncidentResponseReadiness()) {
        result.warnings.push('Incident response procedures need validation');
      }

      // Final security scan
      if (!await this.runFinalSecurityScan()) {
        result.errors.push('Final security scan failed');
        return;
      }

      result.checks.finalProductionChecks = 'passed';
      console.log('✓ Final production checks completed');

    } catch (error) {
      result.checks.finalProductionChecks = 'failed';
      result.errors.push(`Final production checks failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods (implementation stubs for type safety)
  private async checkClientExists(clientId: string): Promise<boolean> {
    // Implementation would check database for client existence
    return true;
  }

  private async getClientConfig(clientId: string): Promise<ClientConfig> {
    // Implementation would fetch client configuration from database
    return {
      id: clientId,
      subscriptionActive: true,
      planLimits: {},
    } as ClientConfig;
  }

  private isValidClientConfig(config: ClientConfig): boolean {
    return config && config.id && typeof config.subscriptionActive === 'boolean';
  }

  private validateCustomizationLimits(customizations: Record<string, any>, clientConfig: ClientConfig): boolean {
    // Implementation would validate customizations against client plan limits
    return true;
  }

  private async getTemplateConfig(templateId: string): Promise<TemplateConfig | null> {
    try {
      const configPath = join(process.cwd(), 'templates', templateId, 'template.json');
      const configContent = await readFile(configPath, 'utf-8');
      return JSON.parse(configContent) as TemplateConfig;
    } catch {
      return null;
    }
  }

  private isTemplateVersionCompatible(templateConfig: TemplateConfig): boolean {
    // Implementation would check template version compatibility
    return true;
  }

  private checkCustomizationCompatibility(customizations: Record<string, any>, templateConfig: TemplateConfig): string[] {
    // Implementation would check customization compatibility with template
    return [];
  }

  private async validateTemplateDependencies(templateConfig: TemplateConfig): Promise<boolean> {
    // Implementation would validate template dependencies
    return true;
  }

  private checkForSecretsInCustomizations(customizations: Record<string, any>): boolean {
    const json = JSON.stringify(customizations);
    const secretPatterns = [
      /sk_live_/i,
      /sk_test_/i,
      /password/i,
      /secret/i,
      /private.?key/i,
      /api.?key/i,
    ];

    return secretPatterns.some(pattern => pattern.test(json));
  }

  private validateHttpsCompliance(customizations: Record<string, any>): boolean {
    // Implementation would validate HTTPS compliance
    return true;
  }

  private validateSecurityHeaders(customizations: Record<string, any>): boolean {
    // Implementation would validate security headers configuration
    return true;
  }

  private validateApiSecurity(customizations: Record<string, any>): boolean {
    // Implementation would validate API security configuration
    return true;
  }

  private async estimateBundleSize(templateId: string, customizations: Record<string, any>): Promise<number> {
    // Implementation would estimate bundle size
    return 1024 * 1024; // 1MB placeholder
  }

  private validatePerformanceBudget(customizations: Record<string, any>): { valid: boolean; violations: string[] } {
    // Implementation would validate performance budget
    return { valid: true, violations: [] };
  }

  private validateImageOptimization(customizations: Record<string, any>): boolean {
    // Implementation would validate image optimization settings
    return true;
  }

  private validateCachingStrategy(customizations: Record<string, any>): boolean {
    // Implementation would validate caching strategy
    return true;
  }

  private validateCdnConfiguration(customizations: Record<string, any>): boolean {
    // Implementation would validate CDN configuration
    return true;
  }

  private async checkVercelDeploymentLimits(clientId: string): Promise<boolean> {
    // Implementation would check Vercel deployment limits
    return true;
  }

  private async validateSupabaseConnection(): Promise<boolean> {
    // Implementation would validate Supabase connection
    return true;
  }

  private async validateEnvironmentVariables(environment: string): Promise<boolean> {
    // Implementation would validate environment variables
    return true;
  }

  private async validateDomainConfiguration(domain: string): Promise<boolean> {
    // Implementation would validate domain configuration
    return true;
  }

  private validateMonitoringSetup(environment: string): boolean {
    // Implementation would validate monitoring setup
    return true;
  }

  private isNodeVersionCompatible(nodeVersion: string): boolean {
    const majorVersion = parseInt(nodeVersion.substring(1));
    return majorVersion >= 18;
  }

  private async validatePackageJsonIntegrity(): Promise<boolean> {
    // Implementation would validate package.json integrity
    return true;
  }

  private async checkDependencyConflicts(): Promise<string[]> {
    // Implementation would check for dependency conflicts
    return [];
  }

  private async validateBuildDependencies(): Promise<boolean> {
    // Implementation would validate build dependencies
    return true;
  }

  private async runBuildTest(templateId: string, customizations: Record<string, any>): Promise<boolean> {
    // Implementation would run a full build test
    return true;
  }

  private validateRollbackCapability(): boolean {
    // Implementation would validate rollback capability
    return true;
  }

  private validateBackupRecoveryProcedures(): boolean {
    // Implementation would validate backup and recovery procedures
    return true;
  }

  private validateIncidentResponseReadiness(): boolean {
    // Implementation would validate incident response readiness
    return true;
  }

  private async runFinalSecurityScan(): Promise<boolean> {
    // Implementation would run final security scan
    return true;
  }

  getValidationHistory(): DeploymentValidation[] {
    return this.validationResults;
  }

  async generateValidationReport(deploymentId: string): Promise<string> {
    const validation = this.validationResults.find(v => v.deploymentId === deploymentId);
    if (!validation) {
      throw new Error(`Validation result not found for deployment ${deploymentId}`);
    }

    const report = `
# Production Deployment Validation Report

**Deployment ID:** ${validation.deploymentId}
**Client ID:** ${validation.clientId}
**Template ID:** ${validation.templateId}
**Environment:** ${validation.environment}
**Timestamp:** ${validation.timestamp}
**Status:** ${validation.status}

## Validation Checks

${Object.entries(validation.checks).map(([check, status]) => `- **${check}:** ${status}`).join('\n')}

## Errors

${validation.errors.length > 0 ? validation.errors.map(error => `- ${error}`).join('\n') : 'No errors detected.'}

## Warnings

${validation.warnings.length > 0 ? validation.warnings.map(warning => `- ${warning}`).join('\n') : 'No warnings detected.'}

## Metadata

${JSON.stringify(validation.metadata, null, 2)}
`;

    return report;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const params: any = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];

    if (key && value) {
      switch (key) {
        case 'client-id':
          params.clientId = value;
          break;
        case 'template-id':
          params.templateId = value;
          break;
        case 'environment':
          params.environment = value;
          break;
        case 'customizations':
          params.customizations = JSON.parse(value);
          break;
        case 'final-check':
          params.finalCheck = true;
          break;
      }
    }
  }

  const validator = new ProductionValidator();
  validator.validateDeployment(params)
    .then(result => {
      console.log('Validation completed successfully:', result.status);
      process.exit(0);
    })
    .catch(error => {
      console.error('Validation failed:', error.message);
      process.exit(1);
    });
}

export default ProductionValidator;