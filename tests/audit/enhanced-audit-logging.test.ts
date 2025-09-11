/**
 * Enhanced Audit Logging System Tests
 * HT-004.5.3: Comprehensive audit trail testing
 * 
 * Tests for the enhanced audit logging system including:
 * - Audit event logging and tracking
 * - Change detection and before/after values
 * - Compliance framework support
 * - Suspicious activity detection
 * - User activity monitoring
 * - Data retention and cleanup
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createServerSupabase } from '@lib/supabase/server';
import { 
  AuditLogger,
  AuditLoggerFactory,
  AuditLogging,
  AuditEvent,
  AuditAction,
  ResourceType,
  AuditSeverity,
  ComplianceCategory,
  DataClassification
} from '@lib/audit/enhanced-audit-logger';

// Mock Supabase client
const mockSupabase = {
  rpc: jest.fn(),
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      order: jest.fn(() => ({
        range: jest.fn(),
      })),
      gte: jest.fn(() => ({
        lte: jest.fn(() => ({
          eq: jest.fn(() => ({
            or: jest.fn(),
          })),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
};

describe('Enhanced Audit Logging System', () => {
  let auditLogger: AuditLogger;
  let mockEvent: AuditEvent;

  beforeEach(() => {
    auditLogger = new AuditLogger(mockSupabase as any, {
      userId: 'user-123',
      sessionId: 'session-123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    });

    mockEvent = {
      action: 'update' as AuditAction,
      resourceType: 'task' as ResourceType,
      resourceId: 'task-123',
      resourceName: 'Test Task',
      oldValues: { status: 'pending', priority: 'low' },
      newValues: { status: 'completed', priority: 'high' },
      changedFields: ['status', 'priority'],
      context: { requestId: 'req-123' },
      metadata: { source: 'api' },
      severity: 'info' as AuditSeverity,
      complianceCategory: 'sox' as ComplianceCategory,
      dataClassification: 'internal' as DataClassification,
      retentionPeriod: 2555
    };

    jest.clearAllMocks();
  });

  describe('AuditLogger', () => {
    it('should log audit events with comprehensive data', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      const logId = await auditLogger.logEvent(mockEvent);

      expect(logId).toBe('audit-log-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_hero_audit_event', {
        p_user_id: 'user-123',
        p_session_id: 'session-123',
        p_action: 'update',
        p_resource_type: 'task',
        p_resource_id: 'task-123',
        p_resource_name: 'Test Task',
        p_old_values: { status: 'pending', priority: 'low' },
        p_new_values: { status: 'completed', priority: 'high' },
        p_changed_fields: ['status', 'priority'],
        p_context: { requestId: 'req-123' },
        p_metadata: { source: 'api' },
        p_severity: 'info',
        p_compliance_category: 'sox',
        p_data_classification: 'internal',
        p_retention_period: 2555,
        p_ip_address: '192.168.1.1',
        p_user_agent: 'Mozilla/5.0...'
      });
    });

    it('should handle audit logging errors gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Database error'));

      const logId = await auditLogger.logEvent(mockEvent);

      expect(logId).toBe('');
    });

    it('should log task events with appropriate severity', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      await auditLogger.logTaskEvent('task_create', 'task-123', 'New Task');

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'task_create',
          p_resource_type: 'task',
          p_resource_id: 'task-123',
          p_resource_name: 'New Task',
          p_severity: 'info',
          p_compliance_category: 'sox',
          p_data_classification: 'internal'
        })
      );
    });

    it('should log user events with appropriate classification', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      await auditLogger.logUserEvent('role_change', 'user-123', 'John Doe', {
        oldValues: { role: 'member' },
        newValues: { role: 'admin' },
        changedFields: ['role']
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'role_change',
          p_resource_type: 'user',
          p_resource_id: 'user-123',
          p_resource_name: 'John Doe',
          p_severity: 'critical',
          p_compliance_category: 'gdpr',
          p_data_classification: 'confidential'
        })
      );
    });

    it('should log permission events with warning severity', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      await auditLogger.logPermissionEvent(
        'permission_grant',
        'task-123',
        'Task Permissions',
        { permission: 'write', user: 'user-456' }
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'permission_grant',
          p_resource_type: 'permission',
          p_resource_id: 'task-123',
          p_resource_name: 'Task Permissions',
          p_severity: 'warning',
          p_compliance_category: 'sox',
          p_data_classification: 'confidential'
        })
      );
    });

    it('should log file events with appropriate classification', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      await auditLogger.logFileEvent(
        'file_upload',
        'file-123',
        'document.pdf',
        { size: 1024, type: 'application/pdf' }
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'file_upload',
          p_resource_type: 'file',
          p_resource_id: 'file-123',
          p_resource_name: 'document.pdf',
          p_severity: 'info',
          p_compliance_category: 'gdpr',
          p_data_classification: 'confidential'
        })
      );
    });

    it('should log authentication events with warning severity', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      await auditLogger.logAuthEvent('login', 'user-123', { method: 'oauth' });

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'login',
          p_resource_type: 'user',
          p_resource_id: 'user-123',
          p_severity: 'warning',
          p_compliance_category: 'gdpr',
          p_data_classification: 'confidential'
        })
      );
    });
  });

  describe('Audit Log Queries', () => {
    it('should get audit log summary', async () => {
      const mockSummary = [
        {
          action: 'update',
          resource_type: 'task',
          count: 150,
          last_occurrence: '2025-09-08T10:00:00Z',
          unique_users: 25
        }
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockSummary });

      const summary = await auditLogger.getAuditSummary(
        new Date('2025-09-01'),
        new Date('2025-09-08'),
        'user-123',
        'update',
        'task',
        'info'
      );

      expect(summary).toEqual(mockSummary);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_audit_log_summary', {
        p_start_date: '2025-09-01T00:00:00.000Z',
        p_end_date: '2025-09-08T00:00:00.000Z',
        p_user_id: 'user-123',
        p_action: 'update',
        p_resource_type: 'task',
        p_severity: 'info'
      });
    });

    it('should get user activity summary', async () => {
      const mockActivity = [
        {
          action: 'update',
          count: 50,
          last_activity: '2025-09-08T10:00:00Z',
          resource_types: ['task', 'subtask']
        }
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockActivity });

      const activity = await auditLogger.getUserActivitySummary('user-123', 30);

      expect(activity).toEqual(mockActivity);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_activity_summary', {
        p_user_id: 'user-123',
        p_days: 30
      });
    });

    it('should detect suspicious activity', async () => {
      const mockSuspiciousActivity = [
        {
          user_id: 'user-123',
          action: 'update',
          count: 500,
          severity: 'critical',
          first_occurrence: '2025-09-08T08:00:00Z',
          last_occurrence: '2025-09-08T10:00:00Z'
        }
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockSuspiciousActivity });

      const suspiciousActivity = await auditLogger.detectSuspiciousActivity(24, 100);

      expect(suspiciousActivity).toEqual(mockSuspiciousActivity);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('detect_suspicious_activity', {
        p_hours: 24,
        p_threshold: 100
      });
    });

    it('should get audit logs with filtering', async () => {
      const mockLogs = [
        {
          id: 'log-123',
          user_id: 'user-123',
          action: 'update',
          resource_type: 'task',
          created_at: '2025-09-08T10:00:00Z'
        }
      ];

      mockSupabase.from().select().order().range.mockResolvedValue({
        data: mockLogs
      });

      const logs = await auditLogger.getAuditLogs({
        start_date: '2025-09-01',
        end_date: '2025-09-08',
        user_id: 'user-123',
        action: 'update',
        resource_type: 'task',
        severity: 'info'
      }, 50, 0);

      expect(logs).toEqual(mockLogs);
    });

    it('should save audit log filters', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: { id: 'filter-123' }
      });

      const filterId = await auditLogger.saveFilter({
        name: 'My Filter',
        description: 'Test filter',
        filter_criteria: {
          action: 'update',
          resource_type: 'task'
        }
      });

      expect(filterId).toBe('filter-123');
    });

    it('should get saved filters', async () => {
      const mockFilters = [
        {
          id: 'filter-123',
          name: 'My Filter',
          filter_criteria: { action: 'update' }
        }
      ];

      mockSupabase.from().select().order().or.mockResolvedValue({
        data: mockFilters
      });

      const filters = await auditLogger.getFilters('user-123');

      expect(filters).toEqual(mockFilters);
    });

    it('should cleanup expired audit logs', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 25 });

      const deletedCount = await auditLogger.cleanupExpiredLogs();

      expect(deletedCount).toBe(25);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('cleanup_expired_audit_logs');
    });
  });

  describe('AuditLoggerFactory', () => {
    it('should create audit logger instances', () => {
      const factory = AuditLoggerFactory.getInstance();
      const logger = factory.createLogger({
        userId: 'user-123',
        sessionId: 'session-123'
      });

      expect(logger).toBeInstanceOf(AuditLogger);
    });

    it('should create audit logger from request', async () => {
      const factory = AuditLoggerFactory.getInstance();
      const mockRequest = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0...'
        }
      });

      const logger = await factory.createLoggerFromRequest(mockRequest);

      expect(logger).toBeInstanceOf(AuditLogger);
    });
  });

  describe('AuditLogging Convenience Functions', () => {
    beforeEach(() => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });
    });

    it('should log task creation', async () => {
      const logId = await AuditLogging.logTaskCreation('task-123', 'New Task', 'user-123');

      expect(logId).toBe('audit-log-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'task_create',
          p_resource_type: 'task',
          p_resource_id: 'task-123',
          p_resource_name: 'New Task'
        })
      );
    });

    it('should log task update with change detection', async () => {
      const oldValues = { status: 'pending', priority: 'low' };
      const newValues = { status: 'completed', priority: 'high' };

      const logId = await AuditLogging.logTaskUpdate(
        'task-123',
        'Updated Task',
        oldValues,
        newValues,
        'user-123'
      );

      expect(logId).toBe('audit-log-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'task_update',
          p_resource_type: 'task',
          p_resource_id: 'task-123',
          p_resource_name: 'Updated Task',
          p_old_values: oldValues,
          p_new_values: newValues,
          p_changed_fields: ['status', 'priority']
        })
      );
    });

    it('should log task deletion', async () => {
      const logId = await AuditLogging.logTaskDeletion('task-123', 'Deleted Task', 'user-123');

      expect(logId).toBe('audit-log-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'task_delete',
          p_resource_type: 'task',
          p_resource_id: 'task-123',
          p_resource_name: 'Deleted Task',
          p_severity: 'critical'
        })
      );
    });

    it('should log user login', async () => {
      const logId = await AuditLogging.logUserLogin('user-123', 'John Doe', 'oauth');

      expect(logId).toBe('audit-log-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'login',
          p_resource_type: 'user',
          p_resource_id: 'user-123',
          p_resource_name: 'user-123',
          p_new_values: { auth_method: 'oauth' },
          p_severity: 'warning',
          p_compliance_category: 'gdpr',
          p_data_classification: 'confidential'
        })
      );
    });

    it('should log user logout', async () => {
      const logId = await AuditLogging.logUserLogout('user-123', 'John Doe');

      expect(logId).toBe('audit-log-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'logout',
          p_resource_type: 'user',
          p_resource_id: 'user-123',
          p_resource_name: 'user-123',
          p_severity: 'warning',
          p_compliance_category: 'gdpr',
          p_data_classification: 'confidential'
        })
      );
    });

    it('should log permission changes', async () => {
      const logId = await AuditLogging.logPermissionChange(
        'permission_grant',
        'task-123',
        'Task Permissions',
        { permission: 'write', user: 'user-456' },
        'user-123'
      );

      expect(logId).toBe('audit-log-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_action: 'permission_grant',
          p_resource_type: 'permission',
          p_resource_id: 'task-123',
          p_resource_name: 'Task Permissions',
          p_new_values: { permission: 'write', user: 'user-456' },
          p_severity: 'warning',
          p_compliance_category: 'sox',
          p_data_classification: 'confidential'
        })
      );
    });
  });

  describe('Severity Classification', () => {
    it('should classify critical actions correctly', async () => {
      const criticalActions: AuditAction[] = ['delete', 'password_change', 'role_change', 'user_suspend'];
      
      for (const action of criticalActions) {
        mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });
        
        await auditLogger.logEvent({
          action,
          resourceType: 'task',
          resourceId: 'test-123',
          resourceName: 'Test Resource'
        });

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          'log_hero_audit_event',
          expect.objectContaining({
            p_action: action,
            p_severity: 'critical'
          })
        );
      }
    });

    it('should classify warning actions correctly', async () => {
      const warningActions: AuditAction[] = ['update', 'permission_grant', 'permission_revoke', 'configuration_change'];
      
      for (const action of warningActions) {
        mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });
        
        await auditLogger.logEvent({
          action,
          resourceType: 'task',
          resourceId: 'test-123',
          resourceName: 'Test Resource'
        });

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          'log_hero_audit_event',
          expect.objectContaining({
            p_action: action,
            p_severity: 'warning'
          })
        );
      }
    });

    it('should classify info actions correctly', async () => {
      const infoActions: AuditAction[] = ['create', 'read', 'login', 'logout'];
      
      for (const action of infoActions) {
        mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });
        
        await auditLogger.logEvent({
          action,
          resourceType: 'task',
          resourceId: 'test-123',
          resourceName: 'Test Resource'
        });

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          'log_hero_audit_event',
          expect.objectContaining({
            p_action: action,
            p_severity: 'info'
          })
        );
      }
    });
  });

  describe('Compliance Framework Support', () => {
    it('should support GDPR compliance logging', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      await auditLogger.logEvent({
        action: 'data_access',
        resourceType: 'user',
        resourceId: 'user-123',
        resourceName: 'User Data',
        complianceCategory: 'gdpr',
        dataClassification: 'confidential'
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_compliance_category: 'gdpr',
          p_data_classification: 'confidential'
        })
      );
    });

    it('should support SOX compliance logging', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      await auditLogger.logEvent({
        action: 'configuration_change',
        resourceType: 'configuration',
        resourceId: 'config-123',
        resourceName: 'System Config',
        complianceCategory: 'sox',
        dataClassification: 'internal'
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_compliance_category: 'sox',
          p_data_classification: 'internal'
        })
      );
    });

    it('should support HIPAA compliance logging', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      await auditLogger.logEvent({
        action: 'data_access',
        resourceType: 'file',
        resourceId: 'file-123',
        resourceName: 'Medical Record',
        complianceCategory: 'hipaa',
        dataClassification: 'restricted'
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'log_hero_audit_event',
        expect.objectContaining({
          p_compliance_category: 'hipaa',
          p_data_classification: 'restricted'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Connection failed'));

      const logId = await auditLogger.logEvent(mockEvent);

      expect(logId).toBe('');
    });

    it('should handle invalid audit event data', async () => {
      const invalidEvent = {
        action: 'invalid_action' as any,
        resourceType: 'task' as ResourceType
      };

      mockSupabase.rpc.mockResolvedValue({ data: 'audit-log-123' });

      const logId = await auditLogger.logEvent(invalidEvent);

      expect(logId).toBe('audit-log-123');
    });

    it('should handle query errors gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Query failed'));

      await expect(auditLogger.getAuditSummary()).rejects.toThrow('Failed to get audit summary');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large audit log queries efficiently', async () => {
      const mockLogs = Array.from({ length: 1000 }, (_, i) => ({
        id: `log-${i}`,
        action: 'update',
        resource_type: 'task',
        created_at: '2025-09-08T10:00:00Z'
      }));

      mockSupabase.from().select().order().range.mockResolvedValue({
        data: mockLogs
      });

      const logs = await auditLogger.getAuditLogs({}, 1000, 0);

      expect(logs).toHaveLength(1000);
    });

    it('should support pagination for large datasets', async () => {
      mockSupabase.from().select().order().range.mockResolvedValue({
        data: []
      });

      await auditLogger.getAuditLogs({}, 50, 100);

      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });
});
