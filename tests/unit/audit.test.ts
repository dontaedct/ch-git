/**
 * @fileoverview Unit Tests for Audit Logging
 * @description Unit tests for lib/audit.ts functions
 * @version 1.0.0
 * @author SOS Operation Phase 4 Task 18
 */

import { logAuditEvent, recordConsent, updateClientConsent } from '@/lib/audit';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleSupabase: jest.fn(() => ({
    rpc: jest.fn(),
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Map([
    ['x-forwarded-for', '192.168.1.1'],
    ['user-agent', 'Mozilla/5.0 Test Browser']
  ]))
}));

describe('Audit Logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logAuditEvent', () => {
    it('should log audit event successfully', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: 'audit-id-123', error: null })
      };
      
      jest.mocked(require('@/lib/supabase/server').createServiceRoleSupabase).mockReturnValue(mockSupabase);

      const result = await logAuditEvent('test-coach', {
        action: 'test_action',
        resourceType: 'test_resource',
        resourceId: 'test-id',
        details: { test: 'data' },
        consentGiven: true,
        consentType: 'marketing',
        consentVersion: '1.0'
      });

      expect(result).toBe('audit-id-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_audit_event', {
        p_user_id: null,
        p_coach_id: 'test-coach',
        p_action: 'test_action',
        p_resource_type: 'test_resource',
        p_resource_id: 'test-id',
        p_details: { test: 'data' },
        p_ip_address: '192.168.1.1',
        p_user_agent: 'Mozilla/5.0 Test Browser',
        p_consent_given: true,
        p_consent_type: 'marketing',
        p_consent_version: '1.0'
      });
    });

    it('should handle audit logging errors', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      };
      
      jest.mocked(require('@/lib/supabase/server').createServiceRoleSupabase).mockReturnValue(mockSupabase);

      await expect(logAuditEvent('test-coach', {
        action: 'test_action',
        resourceType: 'test_resource'
      })).rejects.toThrow('Audit logging failed: Database error');
    });
  });

  describe('recordConsent', () => {
    it('should record consent successfully', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: 'consent-id-123', error: null })
      };
      
      jest.mocked(require('@/lib/supabase/server').createServiceRoleSupabase).mockReturnValue(mockSupabase);

      const result = await recordConsent('test-coach', {
        consentType: 'marketing',
        consentVersion: '1.0',
        consentGiven: true,
        consentText: 'I agree to marketing communications'
      });

      expect(result).toBe('consent-id-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('record_consent', {
        p_user_id: null,
        p_coach_id: 'test-coach',
        p_consent_type: 'marketing',
        p_consent_version: '1.0',
        p_consent_given: true,
        p_consent_text: 'I agree to marketing communications',
        p_ip_address: '192.168.1.1',
        p_user_agent: 'Mozilla/5.0 Test Browser'
      });
    });

    it('should handle consent recording errors', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Consent error' } 
        })
      };
      
      jest.mocked(require('@/lib/supabase/server').createServiceRoleSupabase).mockReturnValue(mockSupabase);

      await expect(recordConsent('test-coach', {
        consentType: 'marketing',
        consentVersion: '1.0',
        consentGiven: true,
        consentText: 'I agree'
      })).rejects.toThrow('Consent recording failed: Consent error');
    });
  });

  describe('updateClientConsent', () => {
    it('should update marketing consent', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      });
      const mockFrom = jest.fn().mockReturnValue({
        update: mockUpdate
      });
      const mockSupabase = {
        from: mockFrom
      };
      
      jest.mocked(require('@/lib/supabase/server').createServiceRoleSupabase).mockReturnValue(mockSupabase);

      await updateClientConsent('client-id', 'marketing', true, '1.0');

      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockUpdate).toHaveBeenCalledWith({
        marketing_consent: true,
        marketing_consent_date: expect.any(String),
        consent_version: '1.0'
      });
    });

    it('should update privacy consent', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      });
      const mockFrom = jest.fn().mockReturnValue({
        update: mockUpdate
      });
      const mockSupabase = {
        from: mockFrom
      };
      
      jest.mocked(require('@/lib/supabase/server').createServiceRoleSupabase).mockReturnValue(mockSupabase);

      await updateClientConsent('client-id', 'privacy', false, '1.0');

      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockUpdate).toHaveBeenCalledWith({
        privacy_consent: false,
        privacy_consent_date: null,
        consent_version: '1.0'
      });
    });

    it('should handle update errors', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ 
          error: { message: 'Update error' } 
        })
      });
      const mockFrom = jest.fn().mockReturnValue({
        update: mockUpdate
      });
      const mockSupabase = {
        from: mockFrom
      };
      
      jest.mocked(require('@/lib/supabase/server').createServiceRoleSupabase).mockReturnValue(mockSupabase);

      await expect(updateClientConsent('client-id', 'marketing', true, '1.0'))
        .rejects.toThrow('Client consent update failed: Update error');
    });
  });
});
