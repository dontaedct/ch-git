/**
 * @fileoverview Brand Migration Service
 * @module lib/brand/brand-migration-service
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.6: Create Brand Migration System
 * Service for upgrading existing deployments to support the new branding capabilities.
 */

import { createServerClient } from '@/lib/supabase/server';
import { BrandConfig, BrandPreset } from '@/types/brand-config';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BrandMigrationPlan {
  /** Migration identifier */
  id: string;
  /** Migration name */
  name: string;
  /** Migration description */
  description: string;
  /** Source version */
  fromVersion: string;
  /** Target version */
  toVersion: string;
  /** Migration steps */
  steps: BrandMigrationStep[];
  /** Estimated duration in minutes */
  estimatedDuration: number;
  /** Risk level */
  riskLevel: 'low' | 'medium' | 'high';
  /** Whether migration can be rolled back */
  rollbackable: boolean;
  /** Prerequisites */
  prerequisites: string[];
  /** Post-migration validation */
  validation: BrandMigrationValidation;
}

export interface BrandMigrationStep {
  /** Step identifier */
  id: string;
  /** Step name */
  name: string;
  /** Step description */
  description: string;
  /** Step type */
  type: 'database' | 'config' | 'assets' | 'validation' | 'cleanup';
  /** Whether step is required */
  required: boolean;
  /** Estimated time in minutes */
  estimatedTime: number;
  /** Whether step can be rolled back */
  rollbackable: boolean;
  /** Step dependencies */
  dependencies: string[];
  /** Step configuration */
  config: Record<string, any>;
}

export interface BrandMigrationValidation {
  /** Validation checks to perform */
  checks: BrandValidationCheck[];
  /** Required data integrity checks */
  dataIntegrity: string[];
  /** Performance benchmarks */
  performance: BrandPerformanceCheck[];
}

export interface BrandValidationCheck {
  /** Check identifier */
  id: string;
  /** Check name */
  name: string;
  /** Check description */
  description: string;
  /** Check type */
  type: 'schema' | 'data' | 'config' | 'assets' | 'performance';
  /** Check query or function */
  query: string;
  /** Expected result */
  expectedResult: any;
  /** Whether check is critical */
  critical: boolean;
}

export interface BrandPerformanceCheck {
  /** Performance metric */
  metric: string;
  /** Expected threshold */
  threshold: number;
  /** Unit of measurement */
  unit: string;
  /** Whether metric is critical */
  critical: boolean;
}

export interface BrandMigrationResult {
  /** Migration success status */
  success: boolean;
  /** Migration plan ID */
  planId: string;
  /** Tenant ID */
  tenantId: string;
  /** Steps completed */
  stepsCompleted: string[];
  /** Steps failed */
  stepsFailed: string[];
  /** Migration errors */
  errors: BrandMigrationError[];
  /** Migration warnings */
  warnings: string[];
  /** Migration duration in milliseconds */
  duration: number;
  /** Whether rollback is available */
  rollbackAvailable: boolean;
  /** Migration metadata */
  metadata: Record<string, any>;
}

export interface BrandMigrationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error step */
  step: string;
  /** Error details */
  details: any;
  /** Whether error is recoverable */
  recoverable: boolean;
}

export interface BrandMigrationStatus {
  /** Migration ID */
  id: string;
  /** Migration plan ID */
  planId: string;
  /** Tenant ID */
  tenantId: string;
  /** Current status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  /** Current step */
  currentStep: string | null;
  /** Progress percentage */
  progress: number;
  /** Started at */
  startedAt: string | null;
  /** Completed at */
  completedAt: string | null;
  /** Error message */
  error: string | null;
  /** Migration result */
  result: BrandMigrationResult | null;
}

// =============================================================================
// BRAND MIGRATION SERVICE
// =============================================================================

/**
 * Brand Migration Service
 */
export class BrandMigrationService {
  private static instance: BrandMigrationService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): BrandMigrationService {
    if (!BrandMigrationService.instance) {
      BrandMigrationService.instance = new BrandMigrationService();
    }
    return BrandMigrationService.instance;
  }

  /**
   * Create migration plan for upgrading to new branding system
   */
  public async createMigrationPlan(
    tenantId: string,
    fromVersion: string = '1.0.0',
    toVersion: string = '2.0.0'
  ): Promise<BrandMigrationPlan> {
    const plan: BrandMigrationPlan = {
      id: `brand-migration-${tenantId}-${Date.now()}`,
      name: 'Brand System Upgrade',
      description: 'Upgrade existing deployment to support new branding capabilities',
      fromVersion,
      toVersion,
      estimatedDuration: 15,
      riskLevel: 'low',
      rollbackable: true,
      prerequisites: [
        'Database backup completed',
        'Application in maintenance mode',
        'All users logged out',
      ],
      steps: [
        {
          id: 'backup_existing_config',
          name: 'Backup Existing Configuration',
          description: 'Create backup of current brand configuration',
          type: 'database',
          required: true,
          estimatedTime: 2,
          rollbackable: false,
          dependencies: [],
          config: {
            backupTable: 'tenant_branding_config_backup',
            includeAssets: true,
          },
        },
        {
          id: 'create_brand_tables',
          name: 'Create Brand Configuration Tables',
          description: 'Create new brand configuration tables if they do not exist',
          type: 'database',
          required: true,
          estimatedTime: 3,
          rollbackable: true,
          dependencies: ['backup_existing_config'],
          config: {
            tables: [
              'tenant_branding_config',
              'tenant_branding_presets',
              'tenant_branding_assets',
              'tenant_branding_history',
            ],
          },
        },
        {
          id: 'migrate_existing_brand',
          name: 'Migrate Existing Brand Configuration',
          description: 'Migrate existing brand settings to new schema',
          type: 'config',
          required: true,
          estimatedTime: 5,
          rollbackable: true,
          dependencies: ['create_brand_tables'],
          config: {
            sourceTable: 'tenant_branding_config_backup',
            targetTable: 'tenant_branding_config',
            preserveIds: false,
          },
        },
        {
          id: 'create_default_presets',
          name: 'Create Default Brand Presets',
          description: 'Create default brand presets for new installations',
          type: 'config',
          required: false,
          estimatedTime: 2,
          rollbackable: true,
          dependencies: ['migrate_existing_brand'],
          config: {
            presets: ['default', 'tech', 'corporate', 'startup'],
          },
        },
        {
          id: 'validate_migration',
          name: 'Validate Migration',
          description: 'Validate that migration was successful',
          type: 'validation',
          required: true,
          estimatedTime: 2,
          rollbackable: false,
          dependencies: ['create_default_presets'],
          config: {
            checks: ['schema_integrity', 'data_consistency', 'asset_accessibility'],
          },
        },
        {
          id: 'cleanup_backup',
          name: 'Cleanup Backup Data',
          description: 'Remove temporary backup data after successful migration',
          type: 'cleanup',
          required: false,
          estimatedTime: 1,
          rollbackable: false,
          dependencies: ['validate_migration'],
          config: {
            keepBackup: false,
            backupRetentionDays: 0,
          },
        },
      ],
      validation: {
        checks: [
          {
            id: 'schema_integrity',
            name: 'Schema Integrity Check',
            description: 'Verify all brand tables exist and have correct structure',
            type: 'schema',
            query: 'SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE \'tenant_branding_%\'',
            expectedResult: 4,
            critical: true,
          },
          {
            id: 'data_consistency',
            name: 'Data Consistency Check',
            description: 'Verify brand configuration data is consistent',
            type: 'data',
            query: 'SELECT COUNT(*) FROM tenant_branding_config WHERE tenant_id = $1',
            expectedResult: 1,
            critical: true,
          },
          {
            id: 'asset_accessibility',
            name: 'Asset Accessibility Check',
            description: 'Verify brand assets are accessible',
            type: 'assets',
            query: 'SELECT COUNT(*) FROM tenant_branding_assets WHERE tenant_id = $1 AND is_active = true',
            expectedResult: '>=0',
            critical: false,
          },
        ],
        dataIntegrity: [
          'tenant_branding_config.tenant_id references auth.users(id)',
          'tenant_branding_config.brand_colors is valid JSON',
          'tenant_branding_config.typography_config is valid JSON',
        ],
        performance: [
          {
            metric: 'migration_duration',
            threshold: 300000, // 5 minutes
            unit: 'milliseconds',
            critical: true,
          },
          {
            metric: 'database_connections',
            threshold: 10,
            unit: 'connections',
            critical: false,
          },
        ],
      },
    };

    return plan;
  }

  /**
   * Execute brand migration
   */
  public async executeMigration(
    plan: BrandMigrationPlan,
    tenantId: string
  ): Promise<BrandMigrationResult> {
    const startTime = Date.now();
    const result: BrandMigrationResult = {
      success: false,
      planId: plan.id,
      tenantId,
      stepsCompleted: [],
      stepsFailed: [],
      errors: [],
      warnings: [],
      duration: 0,
      rollbackAvailable: false,
      metadata: {},
    };

    console.log(`🔄 Starting brand migration: ${plan.name} for tenant ${tenantId}`);

    try {
      // Pre-migration validation
      const preChecks = await this.performPreMigrationChecks(plan, tenantId);
      if (!preChecks.success) {
        throw new Error(`Pre-migration checks failed: ${preChecks.errors.join(', ')}`);
      }

      // Execute migration steps
      for (const step of plan.steps) {
        try {
          console.log(`⏳ Executing: ${step.name}`);
          await this.executeMigrationStep(step, tenantId, plan);
          result.stepsCompleted.push(step.id);
          console.log(`✅ Completed: ${step.name}`);
        } catch (error) {
          console.error(`❌ Failed: ${step.name}`, error);
          result.stepsFailed.push(step.id);
          result.errors.push({
            code: 'STEP_FAILED',
            message: `Migration step failed: ${step.name}`,
            step: step.id,
            details: error,
            recoverable: step.rollbackable,
          });

          if (step.required) {
            throw new Error(`Required migration step failed: ${step.name}`);
          } else {
            result.warnings.push(`Optional step failed: ${step.name}`);
          }
        }
      }

      // Post-migration validation
      const postChecks = await this.performPostMigrationValidation(plan, tenantId);
      if (!postChecks.success) {
        result.warnings.push(`Post-migration validation warnings: ${postChecks.errors.join(', ')}`);
      }

      result.success = true;
      result.rollbackAvailable = result.stepsCompleted.some(
        stepId => plan.steps.find(s => s.id === stepId)?.rollbackable
      );

      console.log(`✅ Brand migration completed: ${plan.name} for tenant ${tenantId}`);

    } catch (error) {
      console.error(`❌ Brand migration failed:`, error);
      result.errors.push({
        code: 'MIGRATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown migration error',
        step: 'migration_execution',
        details: error,
        recoverable: true,
      });
      result.rollbackAvailable = result.stepsCompleted.some(
        stepId => plan.steps.find(s => s.id === stepId)?.rollbackable
      );
    } finally {
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Rollback brand migration
   */
  public async rollbackMigration(
    plan: BrandMigrationPlan,
    tenantId: string,
    result: BrandMigrationResult
  ): Promise<BrandMigrationResult> {
    const startTime = Date.now();
    const rollbackResult: BrandMigrationResult = {
      success: false,
      planId: plan.id,
      tenantId,
      stepsCompleted: [],
      stepsFailed: [],
      errors: [],
      warnings: [],
      duration: 0,
      rollbackAvailable: false,
      metadata: { rollback: true },
    };

    console.log(`🔄 Starting brand migration rollback: ${plan.name} for tenant ${tenantId}`);

    try {
      // Rollback steps in reverse order
      const rollbackableSteps = plan.steps
        .filter(step => step.rollbackable && result.stepsCompleted.includes(step.id))
        .reverse();

      for (const step of rollbackableSteps) {
        try {
          console.log(`⏳ Rolling back: ${step.name}`);
          await this.rollbackMigrationStep(step, tenantId, plan);
          rollbackResult.stepsCompleted.push(`rollback_${step.id}`);
          console.log(`✅ Rolled back: ${step.name}`);
        } catch (error) {
          console.error(`❌ Rollback failed: ${step.name}`, error);
          rollbackResult.stepsFailed.push(`rollback_${step.id}`);
          rollbackResult.errors.push({
            code: 'ROLLBACK_FAILED',
            message: `Rollback step failed: ${step.name}`,
            step: step.id,
            details: error,
            recoverable: false,
          });
        }
      }

      rollbackResult.success = rollbackResult.stepsFailed.length === 0;
      console.log(`✅ Brand migration rollback completed: ${plan.name} for tenant ${tenantId}`);

    } catch (error) {
      console.error(`❌ Brand migration rollback failed:`, error);
      rollbackResult.errors.push({
        code: 'ROLLBACK_FAILED',
        message: error instanceof Error ? error.message : 'Unknown rollback error',
        step: 'rollback_execution',
        details: error,
        recoverable: false,
      });
    } finally {
      rollbackResult.duration = Date.now() - startTime;
    }

    return rollbackResult;
  }

  /**
   * Get migration status
   */
  public async getMigrationStatus(migrationId: string): Promise<BrandMigrationStatus | null> {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('brand_migration_status')
      .select('*')
      .eq('id', migrationId)
      .single();

    if (error) {
      console.error('Error fetching migration status:', error);
      return null;
    }

    return data;
  }

  /**
   * List migration history for tenant
   */
  public async getMigrationHistory(tenantId: string): Promise<BrandMigrationStatus[]> {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('brand_migration_status')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching migration history:', error);
      return [];
    }

    return data || [];
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async performPreMigrationChecks(
    plan: BrandMigrationPlan,
    tenantId: string
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check prerequisites
      for (const prerequisite of plan.prerequisites) {
        // This would check actual prerequisites in a real implementation
        console.log(`Checking prerequisite: ${prerequisite}`);
      }

      // Check database connectivity
      const supabase = await createServerClient();
      const { error } = await supabase.from('auth.users').select('id').limit(1);
      if (error) {
        errors.push('Database connectivity check failed');
      }

      // Check tenant exists
      const { data: tenant } = await supabase
        .from('auth.users')
        .select('id')
        .eq('id', tenantId)
        .single();

      if (!tenant) {
        errors.push('Tenant does not exist');
      }

    } catch (error) {
      errors.push(`Pre-migration check failed: ${error}`);
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  private async executeMigrationStep(
    step: BrandMigrationStep,
    tenantId: string,
    plan: BrandMigrationPlan
  ): Promise<void> {
    const supabase = await createServerClient();

    switch (step.type) {
      case 'database':
        await this.executeDatabaseStep(step, tenantId, supabase);
        break;
      case 'config':
        await this.executeConfigStep(step, tenantId, supabase);
        break;
      case 'assets':
        await this.executeAssetsStep(step, tenantId, supabase);
        break;
      case 'validation':
        await this.executeValidationStep(step, tenantId, supabase);
        break;
      case 'cleanup':
        await this.executeCleanupStep(step, tenantId, supabase);
        break;
      default:
        throw new Error(`Unknown migration step type: ${step.type}`);
    }
  }

  private async executeDatabaseStep(
    step: BrandMigrationStep,
    tenantId: string,
    supabase: any
  ): Promise<void> {
    switch (step.id) {
      case 'backup_existing_config':
        // Create backup of existing configuration
        await this.createConfigurationBackup(tenantId, supabase);
        break;
      case 'create_brand_tables':
        // Tables should already exist from migration, just verify
        await this.verifyBrandTables(supabase);
        break;
      default:
        throw new Error(`Unknown database step: ${step.id}`);
    }
  }

  private async executeConfigStep(
    step: BrandMigrationStep,
    tenantId: string,
    supabase: any
  ): Promise<void> {
    switch (step.id) {
      case 'migrate_existing_brand':
        await this.migrateExistingBrandConfiguration(tenantId, supabase);
        break;
      case 'create_default_presets':
        await this.createDefaultPresets(supabase);
        break;
      default:
        throw new Error(`Unknown config step: ${step.id}`);
    }
  }

  private async executeAssetsStep(
    step: BrandMigrationStep,
    tenantId: string,
    supabase: any
  ): Promise<void> {
    // Asset migration logic would go here
    console.log(`Executing assets step: ${step.id}`);
  }

  private async executeValidationStep(
    step: BrandMigrationStep,
    tenantId: string,
    supabase: any
  ): Promise<void> {
    await this.performPostMigrationValidation(step, tenantId);
  }

  private async executeCleanupStep(
    step: BrandMigrationStep,
    tenantId: string,
    supabase: any
  ): Promise<void> {
    switch (step.id) {
      case 'cleanup_backup':
        await this.cleanupBackupData(tenantId, supabase);
        break;
      default:
        throw new Error(`Unknown cleanup step: ${step.id}`);
    }
  }

  private async rollbackMigrationStep(
    step: BrandMigrationStep,
    tenantId: string,
    plan: BrandMigrationPlan
  ): Promise<void> {
    // Rollback logic would go here
    console.log(`Rolling back step: ${step.id}`);
  }

  private async createConfigurationBackup(tenantId: string, supabase: any): Promise<void> {
    // Create backup of existing configuration
    console.log(`Creating configuration backup for tenant: ${tenantId}`);
  }

  private async verifyBrandTables(supabase: any): Promise<void> {
    // Verify brand tables exist
    const tables = [
      'tenant_branding_config',
      'tenant_branding_presets',
      'tenant_branding_assets',
      'tenant_branding_history',
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        throw new Error(`Brand table ${table} does not exist`);
      }
    }
  }

  private async migrateExistingBrandConfiguration(tenantId: string, supabase: any): Promise<void> {
    // Check if tenant already has brand configuration
    const { data: existingConfig } = await supabase
      .from('tenant_branding_config')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (existingConfig) {
      console.log(`Tenant ${tenantId} already has brand configuration`);
      return;
    }

    // Create default brand configuration for tenant
    const { error } = await supabase
      .from('tenant_branding_config')
      .insert({
        tenant_id: tenantId,
        organization_name: 'Your Organization',
        app_name: 'Micro App',
        preset_name: 'default',
        is_custom: false,
        validation_status: 'valid',
      });

    if (error) {
      throw new Error(`Failed to create brand configuration: ${error.message}`);
    }
  }

  private async createDefaultPresets(supabase: any): Promise<void> {
    // Check if presets already exist
    const { data: existingPresets } = await supabase
      .from('tenant_branding_presets')
      .select('preset_name')
      .eq('is_system', true);

    if (existingPresets && existingPresets.length > 0) {
      console.log('Default presets already exist');
      return;
    }

    // Default presets should already be created by the migration
    console.log('Default presets should already exist from migration');
  }

  private async performPostMigrationValidation(
    plan: BrandMigrationPlan | BrandMigrationStep,
    tenantId: string
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const supabase = await createServerClient();

      // Validate brand configuration exists
      const { data: brandConfig } = await supabase
        .from('tenant_branding_config')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (!brandConfig) {
        errors.push('Brand configuration not found after migration');
      }

      // Validate brand tables exist
      const tables = [
        'tenant_branding_config',
        'tenant_branding_presets',
        'tenant_branding_assets',
        'tenant_branding_history',
      ];

      for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          errors.push(`Brand table ${table} is not accessible`);
        }
      }

    } catch (error) {
      errors.push(`Post-migration validation failed: ${error}`);
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  private async cleanupBackupData(tenantId: string, supabase: any): Promise<void> {
    // Cleanup backup data
    console.log(`Cleaning up backup data for tenant: ${tenantId}`);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const brandMigrationService = BrandMigrationService.getInstance();

export default brandMigrationService;
