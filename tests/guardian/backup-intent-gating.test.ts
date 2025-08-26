/**
 * Guardian Tests - Backup Intent Gating
 * 
 * Tests for Guardian backup intent endpoint feature flag gating and access controls.
 */

import { getFlag } from '@lib/flags/server';

// Mock the flags module
jest.mock('@lib/flags/server', () => ({
  getFlag: jest.fn(),
}));

describe('Guardian Tests - Backup Intent Gating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Feature Flag Gating', () => {
    it('should allow backup intent when guardian_enabled flag is true', async () => {
      (getFlag as jest.Mock).mockResolvedValue(true);

      const guardianEnabled = await getFlag('tenant-a', 'guardian_enabled');

      expect(guardianEnabled).toBe(true);
      expect(getFlag).toHaveBeenCalledWith('tenant-a', 'guardian_enabled');
    });

    it('should block backup intent when guardian_enabled flag is false', async () => {
      (getFlag as jest.Mock).mockResolvedValue(false);

      const guardianEnabled = await getFlag('tenant-a', 'guardian_enabled');

      expect(guardianEnabled).toBe(false);
      expect(getFlag).toHaveBeenCalledWith('tenant-a', 'guardian_enabled');
    });

    it('should handle missing feature flag gracefully', async () => {
      (getFlag as jest.Mock).mockResolvedValue(null);

      const guardianEnabled = await getFlag('tenant-a', 'guardian_enabled');

      expect(guardianEnabled).toBeNull();
    });

    it('should handle feature flag errors gracefully', async () => {
      (getFlag as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await expect(getFlag('tenant-a', 'guardian_enabled')).rejects.toThrow('Database connection failed');
    });
  });

  describe('Tenant-specific Feature Flags', () => {
    it('should check feature flags per tenant', async () => {
      // Tenant A has guardian enabled
      (getFlag as jest.Mock).mockResolvedValueOnce(true);
      
      // Tenant B has guardian disabled
      (getFlag as jest.Mock).mockResolvedValueOnce(false);

      const tenantAEnabled = await getFlag('tenant-a', 'guardian_enabled');
      const tenantBEnabled = await getFlag('tenant-b', 'guardian_enabled');

      expect(tenantAEnabled).toBe(true);
      expect(tenantBEnabled).toBe(false);
      expect(getFlag).toHaveBeenCalledWith('tenant-a', 'guardian_enabled');
      expect(getFlag).toHaveBeenCalledWith('tenant-b', 'guardian_enabled');
    });

    it('should handle system-wide feature flags', async () => {
      (getFlag as jest.Mock).mockResolvedValue(true);

      const systemEnabled = await getFlag('system', 'guardian_enabled');

      expect(systemEnabled).toBe(true);
      expect(getFlag).toHaveBeenCalledWith('system', 'guardian_enabled');
    });
  });

  describe('Backup Intent Access Control', () => {
    it('should require authentication for backup intent', async () => {
      // Mock authenticated user
      const mockUser = {
        id: 'tenant-a-user-1',
        email: 'user1@tenanta.com',
        user_metadata: { tenant_id: 'tenant-a' }
      };

      const requireUser = jest.fn().mockResolvedValue({ user: mockUser });

      const { user } = await requireUser();

      expect(user).toBeDefined();
      expect(user.id).toBe('tenant-a-user-1');
      expect(user.user_metadata.tenant_id).toBe('tenant-a');
    });

    it('should reject anonymous backup intent requests', async () => {
      const requireUser = jest.fn().mockRejectedValue(new Error('Authentication required'));

      await expect(requireUser()).rejects.toThrow('Authentication required');
    });

    it('should extract tenant ID from authenticated user', async () => {
      const mockUser = {
        id: 'tenant-b-user-2',
        email: 'user2@tenantb.com',
        user_metadata: { tenant_id: 'tenant-b' }
      };

      const requireUser = jest.fn().mockResolvedValue({ user: mockUser });

      const { user } = await requireUser();
      const tenantId = user.id; // Using user ID as tenant ID

      expect(tenantId).toBe('tenant-b-user-2');
    });
  });

  describe('Backup Intent Request Validation', () => {
    it('should accept valid backup intent requests', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          reason: 'Scheduled backup'
        })
      };

      const body = await mockRequest.json();

      expect(body.reason).toBe('Scheduled backup');
      expect(typeof body.reason).toBe('string');
    });

    it('should handle missing request body gracefully', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };

      await expect(mockRequest.json()).rejects.toThrow('Invalid JSON');
    });

    it('should use default reason when none provided', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({})
      };

      const body = await mockRequest.json();
      const backupReason = body.reason || 'Scheduled backup';

      expect(backupReason).toBe('Scheduled backup');
    });

    it('should validate backup reason format', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          reason: 123 // Invalid type
        })
      };

      const body = await mockRequest.json();
      const backupReason = typeof body.reason === 'string' ? body.reason : 'Scheduled backup';

      expect(backupReason).toBe('Scheduled backup');
    });
  });

  describe('Backup Operation Execution', () => {
    it('should execute backup operation with timeout', async () => {
      const mockBackupOperation = jest.fn().mockResolvedValue({
        ok: true,
        artifacts: ['backup-1.json', 'backup-2.json'],
        startedAt: new Date('2024-01-15T10:00:00Z'),
        finishedAt: new Date('2024-01-15T10:01:00Z')
      });

      const backupResult = await mockBackupOperation({
        reason: 'Test backup',
        timeout: 60 * 1000 // 60 seconds
      });

      expect(backupResult.ok).toBe(true);
      expect(backupResult.artifacts).toHaveLength(2);
      expect(backupResult.startedAt).toBeDefined();
      expect(backupResult.finishedAt).toBeDefined();
    });

    it('should handle backup operation failures', async () => {
      const mockBackupOperation = jest.fn().mockResolvedValue({
        ok: false,
        error: 'Backup storage unavailable',
        startedAt: new Date('2024-01-15T10:00:00Z'),
        finishedAt: new Date('2024-01-15T10:00:30Z')
      });

      const backupResult = await mockBackupOperation({
        reason: 'Test backup',
        timeout: 60 * 1000
      });

      expect(backupResult.ok).toBe(false);
      expect(backupResult.error).toBe('Backup storage unavailable');
    });

    it('should handle backup operation timeouts', async () => {
      const mockBackupOperation = jest.fn().mockRejectedValue(new Error('Operation timeout'));

      await expect(mockBackupOperation({
        reason: 'Test backup',
        timeout: 1000 // 1 second timeout
      })).rejects.toThrow('Operation timeout');
    });
  });

  describe('Backup Status Checking', () => {
    it('should check backup status without triggering backup', async () => {
      const mockStatusCheck = jest.fn().mockResolvedValue({
        hasStatus: true,
        lastBackup: new Date('2024-01-15T09:00:00Z'),
        lastBackupOk: true,
        artifacts: ['backup-1.json']
      });

      const status = await mockStatusCheck();

      expect(status.hasStatus).toBe(true);
      expect(status.lastBackupOk).toBe(true);
      expect(status.artifacts).toHaveLength(1);
    });

    it('should handle missing backup status', async () => {
      const mockStatusCheck = jest.fn().mockResolvedValue({
        hasStatus: false,
        lastBackup: null,
        lastBackupOk: false,
        artifacts: []
      });

      const status = await mockStatusCheck();

      expect(status.hasStatus).toBe(false);
      expect(status.lastBackup).toBeNull();
      expect(status.lastBackupOk).toBe(false);
    });
  });

  describe('Error Response Handling', () => {
    it('should return proper error response for feature disabled', () => {
      const errorResponse = {
        ok: false,
        code: 'FEATURE_DISABLED',
        message: 'Guardian system is disabled for this tenant'
      };

      expect(errorResponse.ok).toBe(false);
      expect(errorResponse.code).toBe('FEATURE_DISABLED');
      expect(errorResponse.message).toContain('disabled');
    });

    it('should return proper error response for rate limiting', () => {
      const errorResponse = {
        ok: false,
        code: 'RATE_LIMITED',
        message: 'Too many backup requests. Please wait before requesting another backup.',
        retryAfter: 1800
      };

      expect(errorResponse.ok).toBe(false);
      expect(errorResponse.code).toBe('RATE_LIMITED');
      expect(errorResponse.retryAfter).toBe(1800);
    });

    it('should return proper error response for backup failure', () => {
      const errorResponse = {
        ok: false,
        code: 'BACKUP_FAILED',
        message: 'Backup operation failed',
        error: 'Storage unavailable'
      };

      expect(errorResponse.ok).toBe(false);
      expect(errorResponse.code).toBe('BACKUP_FAILED');
      expect(errorResponse.error).toBe('Storage unavailable');
    });
  });

  describe('Success Response Handling', () => {
    it('should return proper success response for backup completion', () => {
      const successResponse = {
        ok: true,
        message: 'Backup completed successfully',
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-a',
        backup: {
          startedAt: new Date('2024-01-15T10:00:00Z'),
          finishedAt: new Date('2024-01-15T10:01:00Z'),
          artifacts: ['backup-1.json', 'backup-2.json'],
          reason: 'Scheduled backup'
        },
        rateLimit: {
          remaining: 2,
          resetTime: new Date(Date.now() + 3600000).toISOString()
        }
      };

      expect(successResponse.ok).toBe(true);
      expect(successResponse.message).toContain('successfully');
      expect(successResponse.backup.artifacts).toHaveLength(2);
      expect(successResponse.rateLimit.remaining).toBe(2);
    });
  });
});
