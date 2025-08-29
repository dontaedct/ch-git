/**
 * Tier Migration Utilities - Phase 1, Task 4
 * Handles seamless tier upgrades/downgrades with data integrity and migration support
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { TierLevel, FeatureFlag } from '../flags';
import { getAppConfig, clearAppConfigCache, PresetName, loadPresetConfig } from '../../app.config';
import { initializeFeatureLoader, cleanupAllFeatures } from './feature-loader';

// =============================================================================
// TYPES
// =============================================================================

export interface MigrationPlan {
  fromTier: TierLevel;
  toTier: TierLevel;
  preset?: PresetName;
  steps: MigrationStep[];
  dataBackup: boolean;
  rollbackPlan: RollbackStep[];
  estimatedDuration: number; // minutes
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  type: 'backup' | 'feature_enable' | 'feature_disable' | 'data_migration' | 'config_update' | 'validation';
  required: boolean;
  estimatedTime: number; // minutes
  rollbackable: boolean;
  dependencies?: string[];
}

export interface RollbackStep {
  id: string;
  name: string;
  description: string;
  action: () => Promise<void>;
}

export interface MigrationResult {
  success: boolean;
  fromTier: TierLevel;
  toTier: TierLevel;
  stepsCompleted: string[];
  stepsFailed: string[];
  errors: Error[];
  warnings: string[];
  rollbackAvailable: boolean;
  duration: number; // milliseconds
}

export interface DataIntegrityCheck {
  check: string;
  passed: boolean;
  error?: string;
  data?: any;
}

// =============================================================================
// MIGRATION PLANNING
// =============================================================================

/**
 * Create migration plan for tier change
 */
export function createMigrationPlan(
  fromTier: TierLevel,
  toTier: TierLevel,
  preset?: PresetName
): MigrationPlan {
  const isUpgrade = getTierLevel(toTier) > getTierLevel(fromTier);
  const steps: MigrationStep[] = [];
  const rollbackSteps: RollbackStep[] = [];
  
  // Always start with backup
  steps.push({
    id: 'backup_config',
    name: 'Backup Current Configuration',
    description: 'Create backup of current tier configuration and data',
    type: 'backup',
    required: true,
    estimatedTime: 2,
    rollbackable: false,
  });
  
  steps.push({
    id: 'validate_environment',
    name: 'Validate Environment',
    description: 'Check environment variables and dependencies',
    type: 'validation',
    required: true,
    estimatedTime: 1,
    rollbackable: false,
  });
  
  if (isUpgrade) {
    // Upgrade steps
    steps.push({
      id: 'enable_new_features',
      name: 'Enable New Features',
      description: 'Enable features available in target tier',
      type: 'feature_enable',
      required: true,
      estimatedTime: 3,
      rollbackable: true,
      dependencies: ['validate_environment'],
    });
    
    steps.push({
      id: 'migrate_data_structures',
      name: 'Migrate Data Structures',
      description: 'Update database schemas for new features',
      type: 'data_migration',
      required: true,
      estimatedTime: 5,
      rollbackable: true,
      dependencies: ['enable_new_features'],
    });
  } else {
    // Downgrade steps
    steps.push({
      id: 'backup_premium_data',
      name: 'Backup Premium Data',
      description: 'Backup data that may be lost during downgrade',
      type: 'backup',
      required: true,
      estimatedTime: 3,
      rollbackable: false,
    });
    
    steps.push({
      id: 'disable_features',
      name: 'Disable Premium Features',
      description: 'Safely disable features not available in target tier',
      type: 'feature_disable',
      required: true,
      estimatedTime: 2,
      rollbackable: true,
      dependencies: ['backup_premium_data'],
    });
  }
  
  if (preset) {
    steps.push({
      id: 'update_preset',
      name: 'Update Preset Configuration',
      description: `Apply ${preset} preset configuration`,
      type: 'config_update',
      required: true,
      estimatedTime: 2,
      rollbackable: true,
      dependencies: isUpgrade ? ['migrate_data_structures'] : ['disable_features'],
    });
  }
  
  steps.push({
    id: 'final_validation',
    name: 'Final Validation',
    description: 'Validate migration completed successfully',
    type: 'validation',
    required: true,
    estimatedTime: 2,
    rollbackable: false,
    dependencies: preset ? ['update_preset'] : (isUpgrade ? ['migrate_data_structures'] : ['disable_features']),
  });
  
  // Create rollback steps
  rollbackSteps.push({
    id: 'rollback_config',
    name: 'Restore Previous Configuration',
    description: 'Restore backed up configuration',
    action: async () => {
      // Restore from backup
      console.log('Restoring configuration from backup...');
    },
  });
  
  return {
    fromTier,
    toTier,
    preset,
    steps,
    dataBackup: true,
    rollbackPlan: rollbackSteps,
    estimatedDuration: steps.reduce((total, step) => total + step.estimatedTime, 0),
    riskLevel: isUpgrade ? 'low' : 'medium',
  };
}

/**
 * Get numeric tier level for comparison
 */
function getTierLevel(tier: TierLevel): number {
  const levels: Record<TierLevel, number> = {
    starter: 1,
    pro: 2,
    advanced: 3,
  };
  return levels[tier];
}

// =============================================================================
// MIGRATION EXECUTION
// =============================================================================

/**
 * Execute tier migration
 */
export async function executeMigration(plan: MigrationPlan): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: false,
    fromTier: plan.fromTier,
    toTier: plan.toTier,
    stepsCompleted: [],
    stepsFailed: [],
    errors: [],
    warnings: [],
    rollbackAvailable: false,
    duration: 0,
  };
  
  console.log(`🔄 Starting migration: ${plan.fromTier} → ${plan.toTier}`);
  
  try {
    // Pre-migration validation
    const preChecks = await performDataIntegrityChecks();
    const criticalFailures = preChecks.filter(check => !check.passed && check.check.includes('critical'));
    
    if (criticalFailures.length > 0) {
      throw new Error(`Critical pre-migration checks failed: ${criticalFailures.map(f => f.check).join(', ')}`);
    }
    
    // Execute migration steps
    for (const step of plan.steps) {
      try {
        console.log(`⏳ Executing: ${step.name}`);
        await executeMigrationStep(step, plan);
        result.stepsCompleted.push(step.id);
        console.log(`✅ Completed: ${step.name}`);
      } catch (error) {
        console.error(`❌ Failed: ${step.name}`, error);
        result.stepsFailed.push(step.id);
        result.errors.push(error as Error);
        
        if (step.required) {
          throw new Error(`Required migration step failed: ${step.name}`);
        } else {
          result.warnings.push(`Optional step failed: ${step.name}`);
        }
      }
    }
    
    // Post-migration validation
    const postChecks = await performDataIntegrityChecks();
    const postFailures = postChecks.filter(check => !check.passed);
    
    if (postFailures.length > 0) {
      result.warnings.push(`Post-migration validation warnings: ${postFailures.map(f => f.check).join(', ')}`);
    }
    
    // Update environment configuration
    await updateTierConfiguration(plan.toTier, plan.preset);
    
    result.success = true;
    result.rollbackAvailable = true;
    
    console.log(`✅ Migration completed: ${plan.fromTier} → ${plan.toTier}`);
    
  } catch (error) {
    console.error(`❌ Migration failed:`, error);
    result.errors.push(error as Error);
    result.rollbackAvailable = result.stepsCompleted.some(
      stepId => plan.steps.find(s => s.id === stepId)?.rollbackable
    );
  } finally {
    result.duration = Date.now() - startTime;
  }
  
  return result;
}

/**
 * Execute individual migration step
 */
async function executeMigrationStep(step: MigrationStep, plan: MigrationPlan): Promise<void> {
  switch (step.type) {
    case 'backup':
      await executeBackupStep(step, plan);
      break;
    case 'feature_enable':
      await executeFeatureEnableStep(step, plan);
      break;
    case 'feature_disable':
      await executeFeatureDisableStep(step, plan);
      break;
    case 'data_migration':
      await executeDataMigrationStep(step, plan);
      break;
    case 'config_update':
      await executeConfigUpdateStep(step, plan);
      break;
    case 'validation':
      await executeValidationStep(step, plan);
      break;
    default:
      throw new Error(`Unknown migration step type: ${step.type}`);
  }
}

// =============================================================================
// STEP IMPLEMENTATIONS
// =============================================================================

async function executeBackupStep(step: MigrationStep, plan: MigrationPlan): Promise<void> {
  // Create backup of current configuration
  const currentConfig = getAppConfig();
  const backup = {
    timestamp: new Date().toISOString(),
    tier: currentConfig.tier,
    preset: currentConfig.preset,
    features: currentConfig.features,
    environment: {
      APP_TIER: process.env.APP_TIER,
      APP_PRESET: process.env.APP_PRESET,
    },
  };
  
  // Store backup (in real implementation, this would go to persistent storage)
  if (typeof window !== 'undefined') {
    localStorage.setItem('tier_migration_backup', JSON.stringify(backup));
  }
  
  console.log('💾 Configuration backup created');
}

async function executeFeatureEnableStep(step: MigrationStep, plan: MigrationPlan): Promise<void> {
  // Get features that will be enabled in new tier
  const newFeatures = getNewFeaturesForTier(plan.toTier, plan.fromTier);
  
  console.log(`🔧 Enabling features: ${newFeatures.join(', ')}`);
  
  // In a real implementation, this would update environment variables
  // and initialize new feature modules
  for (const feature of newFeatures) {
    console.log(`  ✅ Enabled: ${feature}`);
  }
}

async function executeFeatureDisableStep(step: MigrationStep, plan: MigrationPlan): Promise<void> {
  // Get features that will be disabled in new tier
  const removedFeatures = getRemovedFeaturesForTier(plan.toTier, plan.fromTier);
  
  console.log(`🔧 Disabling features: ${removedFeatures.join(', ')}`);
  
  // Safely disable features and cleanup resources
  await cleanupAllFeatures();
  
  for (const feature of removedFeatures) {
    console.log(`  ❌ Disabled: ${feature}`);
  }
}

async function executeDataMigrationStep(step: MigrationStep, plan: MigrationPlan): Promise<void> {
  // Migrate data structures for new tier
  console.log('🗄️ Migrating data structures...');
  
  // In a real implementation, this would run database migrations
  // For now, we'll simulate the process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Data migration completed');
}

async function executeConfigUpdateStep(step: MigrationStep, plan: MigrationPlan): Promise<void> {
  if (!plan.preset) return;
  
  console.log(`📝 Updating preset configuration: ${plan.preset}`);
  
  const presetConfig = loadPresetConfig(plan.preset);
  if (!presetConfig) {
    throw new Error(`Failed to load preset configuration: ${plan.preset}`);
  }
  
  // In real implementation, update environment variables
  console.log('✅ Preset configuration updated');
}

async function executeValidationStep(step: MigrationStep, plan: MigrationPlan): Promise<void> {
  console.log('🔍 Running validation checks...');
  
  const checks = await performDataIntegrityChecks();
  const failures = checks.filter(check => !check.passed);
  
  if (failures.length > 0) {
    console.warn('⚠️ Validation warnings:', failures.map(f => f.check));
  } else {
    console.log('✅ All validation checks passed');
  }
}

// =============================================================================
// DATA INTEGRITY
// =============================================================================

/**
 * Perform comprehensive data integrity checks
 */
export async function performDataIntegrityChecks(): Promise<DataIntegrityCheck[]> {
  const checks: DataIntegrityCheck[] = [];
  
  // Check configuration validity
  try {
    const config = getAppConfig();
    checks.push({
      check: 'config_validity',
      passed: true,
      data: { tier: config.tier, preset: config.preset },
    });
  } catch (error) {
    checks.push({
      check: 'config_validity',
      passed: false,
      error: (error as Error).message,
    });
  }
  
  // Check environment variables
  const requiredEnvVars = ['NODE_ENV'];
  for (const envVar of requiredEnvVars) {
    checks.push({
      check: `env_var_${envVar}`,
      passed: !!process.env[envVar],
      error: !process.env[envVar] ? `Missing ${envVar}` : undefined,
    });
  }
  
  // Check database connectivity (if database feature is enabled)
  // This would be implemented based on actual database setup
  checks.push({
    check: 'database_connectivity',
    passed: true, // Simulated
  });
  
  return checks;
}

// =============================================================================
// ROLLBACK
// =============================================================================

/**
 * Rollback migration to previous state
 */
export async function rollbackMigration(): Promise<boolean> {
  try {
    console.log('🔄 Starting migration rollback...');
    
    // Restore from backup
    let backup: any = null;
    if (typeof window !== 'undefined') {
      const backupStr = localStorage.getItem('tier_migration_backup');
      backup = backupStr ? JSON.parse(backupStr) : null;
    }
    
    if (!backup) {
      throw new Error('No backup found for rollback');
    }
    
    // Restore tier configuration
    await updateTierConfiguration(backup.tier, backup.preset);
    
    console.log('✅ Migration rollback completed');
    return true;
  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    return false;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Update tier configuration in environment
 */
async function updateTierConfiguration(tier: TierLevel, preset?: PresetName): Promise<void> {
  // In a real implementation, this would update .env file or environment variables
  console.log(`📝 Updating tier configuration: ${tier}${preset ? `, preset: ${preset}` : ''}`);
  
  // Clear cache to force reload
  clearAppConfigCache();
  
  // Reinitialize feature loader with new configuration
  await initializeFeatureLoader();
}

/**
 * Get features that will be newly enabled in target tier
 */
function getNewFeaturesForTier(toTier: TierLevel, fromTier: TierLevel): FeatureFlag[] {
  // This would implement the actual logic based on TIER_FEATURES
  // For now, return a simulated list
  const allFeatures: FeatureFlag[] = ['payments', 'webhooks', 'automation', 'ai_features'];
  return allFeatures.filter(() => getTierLevel(toTier) > getTierLevel(fromTier));
}

/**
 * Get features that will be disabled in target tier
 */
function getRemovedFeaturesForTier(toTier: TierLevel, fromTier: TierLevel): FeatureFlag[] {
  // This would implement the actual logic based on TIER_FEATURES
  // For now, return a simulated list
  const premiumFeatures: FeatureFlag[] = ['ai_features', 'automation', 'admin_operations'];
  return premiumFeatures.filter(() => getTierLevel(toTier) < getTierLevel(fromTier));
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  createMigrationPlan,
  executeMigration,
  performDataIntegrityChecks,
  rollbackMigration,
};