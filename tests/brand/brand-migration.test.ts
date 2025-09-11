/**
 * @fileoverview Brand Migration System Tests
 * @module tests/brand/brand-migration.test
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.6: Create Brand Migration System
 * Comprehensive test suite for brand migration functionality.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { brandMigrationService } from '@/lib/brand/brand-migration-service';
import { BrandMigrationPlan, BrandMigrationResult } from '@/lib/brand/brand-migration-service';

// Mock the Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(),
        limit: jest.fn(),
      })),
      order: jest.fn(),
      limit: jest.fn(),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
};

// Mock the Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => mockSupabase),
}));

describe('Brand Migration Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createMigrationPlan', () => {
    it('should create a migration plan for brand system upgrade', async () => {
      const tenantId = 'test-tenant-id';
      const fromVersion = '1.0.0';
      const toVersion = '2.0.0';

      const plan = await brandMigrationService.createMigrationPlan(
        tenantId,
        fromVersion,
        toVersion
      );

      expect(plan).toBeDefined();
      expect(plan.id).toMatch(/^brand-migration-test-tenant-id-\d+$/);
      expect(plan.name).toBe('Brand System Upgrade');
      expect(plan.fromVersion).toBe(fromVersion);
      expect(plan.toVersion).toBe(toVersion);
      expect(plan.estimatedDuration).toBe(15);
      expect(plan.riskLevel).toBe('low');
      expect(plan.rollbackable).toBe(true);
      expect(plan.steps).toHaveLength(6);
      expect(plan.prerequisites).toHaveLength(3);
      expect(plan.validation.checks).toHaveLength(3);
    });

    it('should include all required migration steps', async () => {
      const plan = await brandMigrationService.createMigrationPlan('test-tenant');

      const stepIds = plan.steps.map(step => step.id);
      expect(stepIds).toContain('backup_existing_config');
      expect(stepIds).toContain('create_brand_tables');
      expect(stepIds).toContain('migrate_existing_brand');
      expect(stepIds).toContain('create_default_presets');
      expect(stepIds).toContain('validate_migration');
      expect(stepIds).toContain('cleanup_backup');
    });

    it('should have proper step dependencies', async () => {
      const plan = await brandMigrationService.createMigrationPlan('test-tenant');

      const backupStep = plan.steps.find(s => s.id === 'backup_existing_config');
      expect(backupStep?.dependencies).toHaveLength(0);

      const createTablesStep = plan.steps.find(s => s.id === 'create_brand_tables');
      expect(createTablesStep?.dependencies).toContain('backup_existing_config');

      const migrateStep = plan.steps.find(s => s.id === 'migrate_existing_brand');
      expect(migrateStep?.dependencies).toContain('create_brand_tables');
    });

    it('should include validation checks', async () => {
      const plan = await brandMigrationService.createMigrationPlan('test-tenant');

      expect(plan.validation.checks).toHaveLength(3);
      
      const schemaCheck = plan.validation.checks.find(c => c.id === 'schema_integrity');
      expect(schemaCheck).toBeDefined();
      expect(schemaCheck?.critical).toBe(true);

      const dataCheck = plan.validation.checks.find(c => c.id === 'data_consistency');
      expect(dataCheck).toBeDefined();
      expect(dataCheck?.critical).toBe(true);

      const assetCheck = plan.validation.checks.find(c => c.id === 'asset_accessibility');
      expect(assetCheck).toBeDefined();
      expect(assetCheck?.critical).toBe(false);
    });
  });

  describe('executeMigration', () => {
    it('should execute migration successfully', async () => {
      const plan = await brandMigrationService.createMigrationPlan('test-tenant');
      const tenantId = 'test-tenant-id';

      // Mock successful database operations
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: { id: tenantId },
        error: null,
      });

      mockSupabase.from().insert().select().single().mockResolvedValue({
        data: { id: 'new-config-id' },
        error: null,
      });

      const result = await brandMigrationService.executeMigration(plan, tenantId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.planId).toBe(plan.id);
      expect(result.tenantId).toBe(tenantId);
      expect(result.stepsCompleted).toHaveLength(6);
      expect(result.stepsFailed).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.rollbackAvailable).toBe(true);
    });

    it('should handle migration failures gracefully', async () => {
      const plan = await brandMigrationService.createMigrationPlan('test-tenant');
      const tenantId = 'test-tenant-id';

      // Mock database error
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const result = await brandMigrationService.executeMigration(plan, tenantId);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.rollbackAvailable).toBe(false);
    });

    it('should track migration progress', async () => {
      const plan = await brandMigrationService.createMigrationPlan('test-tenant');
      const tenantId = 'test-tenant-id';

      // Mock successful operations
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: { id: tenantId },
        error: null,
      });

      mockSupabase.from().insert().select().single().mockResolvedValue({
        data: { id: 'new-config-id' },
        error: null,
      });

      const result = await brandMigrationService.executeMigration(plan, tenantId);

      expect(result.stepsCompleted).toContain('backup_existing_config');
      expect(result.stepsCompleted).toContain('create_brand_tables');
      expect(result.stepsCompleted).toContain('migrate_existing_brand');
      expect(result.stepsCompleted).toContain('create_default_presets');
      expect(result.stepsCompleted).toContain('validate_migration');
      expect(result.stepsCompleted).toContain('cleanup_backup');
    });
  });

  describe('rollbackMigration', () => {
    it('should rollback migration successfully', async () => {
      const plan = await brandMigrationService.createMigrationPlan('test-tenant');
      const tenantId = 'test-tenant-id';
      
      const mockResult: BrandMigrationResult = {
        success: true,
        planId: plan.id,
        tenantId,
        stepsCompleted: ['backup_existing_config', 'create_brand_tables'],
        stepsFailed: [],
        errors: [],
        warnings: [],
        duration: 1000,
        rollbackAvailable: true,
        metadata: {},
      };

      const rollbackResult = await brandMigrationService.rollbackMigration(
        plan,
        tenantId,
        mockResult
      );

      expect(rollbackResult).toBeDefined();
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.planId).toBe(plan.id);
      expect(rollbackResult.tenantId).toBe(tenantId);
      expect(rollbackResult.metadata.rollback).toBe(true);
      expect(rollbackResult.duration).toBeGreaterThan(0);
    });

    it('should handle rollback failures', async () => {
      const plan = await brandMigrationService.createMigrationPlan('test-tenant');
      const tenantId = 'test-tenant-id';
      
      const mockResult: BrandMigrationResult = {
        success: true,
        planId: plan.id,
        tenantId,
        stepsCompleted: ['backup_existing_config'],
        stepsFailed: [],
        errors: [],
        warnings: [],
        duration: 1000,
        rollbackAvailable: true,
        metadata: {},
      };

      // Mock rollback failure
      mockSupabase.from().update().eq().mockRejectedValue(new Error('Rollback failed'));

      const rollbackResult = await brandMigrationService.rollbackMigration(
        plan,
        tenantId,
        mockResult
      );

      expect(rollbackResult.success).toBe(false);
      expect(rollbackResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getMigrationStatus', () => {
    it('should return migration status', async () => {
      const migrationId = 'test-migration-id';
      const mockStatus = {
        id: migrationId,
        planId: 'test-plan-id',
        tenantId: 'test-tenant-id',
        status: 'completed',
        currentStep: null,
        progress: 100,
        startedAt: '2025-01-01T00:00:00Z',
        completedAt: '2025-01-01T00:15:00Z',
        error: null,
        result: null,
      };

      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: mockStatus,
        error: null,
      });

      const status = await brandMigrationService.getMigrationStatus(migrationId);

      expect(status).toEqual(mockStatus);
    });

    it('should return null for non-existent migration', async () => {
      const migrationId = 'non-existent-id';

      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const status = await brandMigrationService.getMigrationStatus(migrationId);

      expect(status).toBeNull();
    });
  });

  describe('getMigrationHistory', () => {
    it('should return migration history for tenant', async () => {
      const tenantId = 'test-tenant-id';
      const mockHistory = [
        {
          id: 'migration-1',
          planId: 'plan-1',
          tenantId,
          status: 'completed',
          startedAt: '2025-01-01T00:00:00Z',
          completedAt: '2025-01-01T00:15:00Z',
        },
        {
          id: 'migration-2',
          planId: 'plan-2',
          tenantId,
          status: 'failed',
          startedAt: '2025-01-02T00:00:00Z',
          completedAt: '2025-01-02T00:05:00Z',
        },
      ];

      mockSupabase.from().select().eq().order().mockResolvedValue({
        data: mockHistory,
        error: null,
      });

      const history = await brandMigrationService.getMigrationHistory(tenantId);

      expect(history).toEqual(mockHistory);
      expect(history).toHaveLength(2);
    });

    it('should return empty array on error', async () => {
      const tenantId = 'test-tenant-id';

      mockSupabase.from().select().eq().order().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const history = await brandMigrationService.getMigrationHistory(tenantId);

      expect(history).toEqual([]);
    });
  });
});

describe('Brand Migration Plan Structure', () => {
  it('should have correct plan structure', async () => {
    const plan = await brandMigrationService.createMigrationPlan('test-tenant');

    expect(plan).toHaveProperty('id');
    expect(plan).toHaveProperty('name');
    expect(plan).toHaveProperty('description');
    expect(plan).toHaveProperty('fromVersion');
    expect(plan).toHaveProperty('toVersion');
    expect(plan).toHaveProperty('steps');
    expect(plan).toHaveProperty('estimatedDuration');
    expect(plan).toHaveProperty('riskLevel');
    expect(plan).toHaveProperty('rollbackable');
    expect(plan).toHaveProperty('prerequisites');
    expect(plan).toHaveProperty('validation');
  });

  it('should have correct step structure', async () => {
    const plan = await brandMigrationService.createMigrationPlan('test-tenant');
    const step = plan.steps[0];

    expect(step).toHaveProperty('id');
    expect(step).toHaveProperty('name');
    expect(step).toHaveProperty('description');
    expect(step).toHaveProperty('type');
    expect(step).toHaveProperty('required');
    expect(step).toHaveProperty('estimatedTime');
    expect(step).toHaveProperty('rollbackable');
    expect(step).toHaveProperty('dependencies');
    expect(step).toHaveProperty('config');
  });

  it('should have correct validation structure', async () => {
    const plan = await brandMigrationService.createMigrationPlan('test-tenant');
    const validation = plan.validation;

    expect(validation).toHaveProperty('checks');
    expect(validation).toHaveProperty('dataIntegrity');
    expect(validation).toHaveProperty('performance');

    expect(Array.isArray(validation.checks)).toBe(true);
    expect(Array.isArray(validation.dataIntegrity)).toBe(true);
    expect(Array.isArray(validation.performance)).toBe(true);
  });

  it('should have correct validation check structure', async () => {
    const plan = await brandMigrationService.createMigrationPlan('test-tenant');
    const check = plan.validation.checks[0];

    expect(check).toHaveProperty('id');
    expect(check).toHaveProperty('name');
    expect(check).toHaveProperty('description');
    expect(check).toHaveProperty('type');
    expect(check).toHaveProperty('query');
    expect(check).toHaveProperty('expectedResult');
    expect(check).toHaveProperty('critical');
  });
});

describe('Brand Migration Error Handling', () => {
  it('should handle database connection errors', async () => {
    const plan = await brandMigrationService.createMigrationPlan('test-tenant');
    const tenantId = 'test-tenant-id';

    // Mock database connection error
    mockSupabase.from().select().eq().single().mockRejectedValue(
      new Error('Database connection failed')
    );

    const result = await brandMigrationService.executeMigration(plan, tenantId);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].code).toBe('MIGRATION_FAILED');
  });

  it('should handle step execution errors', async () => {
    const plan = await brandMigrationService.createMigrationPlan('test-tenant');
    const tenantId = 'test-tenant-id';

    // Mock tenant check success but step failure
    mockSupabase.from().select().eq().single().mockResolvedValueOnce({
      data: { id: tenantId },
      error: null,
    }).mockRejectedValueOnce(new Error('Step execution failed'));

    const result = await brandMigrationService.executeMigration(plan, tenantId);

    expect(result.success).toBe(false);
    expect(result.stepsFailed.length).toBeGreaterThan(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle validation errors', async () => {
    const plan = await brandMigrationService.createMigrationPlan('test-tenant');
    const tenantId = 'test-tenant-id';

    // Mock successful operations but validation failure
    mockSupabase.from().select().eq().single().mockResolvedValue({
      data: { id: tenantId },
      error: null,
    });

    mockSupabase.from().insert().select().single().mockResolvedValue({
      data: { id: 'new-config-id' },
      error: null,
    });

    // Mock validation failure
    mockSupabase.from().select().eq().single().mockResolvedValueOnce({
      data: null,
      error: { message: 'Validation failed' },
    });

    const result = await brandMigrationService.executeMigration(plan, tenantId);

    expect(result.success).toBe(true); // Migration succeeds but with warnings
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
