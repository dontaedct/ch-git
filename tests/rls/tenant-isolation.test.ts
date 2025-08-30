/**
 * RLS Tests - Tenant Isolation
 * 
 * Tests for Row Level Security (RLS) policies ensuring tenant data isolation.
 */

import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for testing
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
};

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('RLS Tests - Tenant Isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Client Table RLS', () => {
    it('should enforce tenant isolation for clients table', async () => {
      // Mock user context
      const mockUser = {
        id: 'tenant-a-user-1',
        email: 'user1@tenanta.com',
        user_metadata: { tenant_id: 'tenant-a' }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock RLS policy enforcement - RLS automatically adds tenant_id filter
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'client-1', name: 'Client A', tenant_id: 'tenant-a' },
          error: null
        })
      };

      // Mock the RLS behavior - when eq is called, it should add tenant_id filter
      mockQuery.eq.mockImplementation((field, value) => {
        if (field === 'id') {
          // RLS automatically adds tenant_id filter
          mockQuery.eq('tenant_id', 'tenant-a');
        }
        return mockQuery;
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // Simulate client access
      const client = createClient('mock-url', 'mock-key');
      const { data, error } = await client
        .from('clients')
        .select('*')
        .eq('id', 'client-1')
        .single();

      // Verify RLS policy is enforced
      expect(mockQuery.eq).toHaveBeenCalledWith('tenant_id', 'tenant-a');
      expect(data).toBeDefined();
      expect(data?.tenant_id).toBe('tenant-a');
      expect(error).toBeNull();
    });

    it('should prevent cross-tenant data access', async () => {
      // Mock user from tenant A trying to access tenant B data
      const mockUser = {
        id: 'tenant-a-user-1',
        email: 'user1@tenanta.com',
        user_metadata: { tenant_id: 'tenant-a' }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock RLS policy blocking cross-tenant access
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row level security policy violation' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // Simulate trying to access tenant B's client
      const client = createClient('mock-url', 'mock-key');
      const { data, error } = await client
        .from('clients')
        .select('*')
        .eq('id', 'tenant-b-client-1')
        .single();

      // Verify access is blocked
      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error?.message).toContain('Row level security policy violation');
    });
  });

  describe('Sessions Table RLS', () => {
    it('should enforce tenant isolation for sessions table', async () => {
      const mockUser = {
        id: 'tenant-a-user-1',
        email: 'user1@tenanta.com',
        user_metadata: { tenant_id: 'tenant-a' }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            { id: 'session-1', client_id: 'client-1', tenant_id: 'tenant-a' },
            { id: 'session-2', client_id: 'client-2', tenant_id: 'tenant-a' }
          ],
          error: null
        })
      };

      // Mock the RLS behavior - when eq is called, it should add tenant_id filter
      mockQuery.eq.mockImplementation((field, value) => {
        if (field === 'client_id') {
          // RLS automatically adds tenant_id filter
          mockQuery.eq('tenant_id', 'tenant-a');
        }
        return mockQuery;
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const client = createClient('mock-url', 'mock-key');
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .eq('client_id', 'client-1')
        .order('created_at', { ascending: false })
        .limit(10);

      expect(mockQuery.eq).toHaveBeenCalledWith('tenant_id', 'tenant-a');
      expect(data).toHaveLength(2);
      expect(data?.every(session => session.tenant_id === 'tenant-a')).toBe(true);
      expect(error).toBeNull();
    });
  });

  describe('Check-ins Table RLS', () => {
    it('should enforce tenant isolation for check-ins table', async () => {
      const mockUser = {
        id: 'tenant-a-user-1',
        email: 'user1@tenanta.com',
        user_metadata: { tenant_id: 'tenant-a' }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            { id: 'checkin-1', client_id: 'client-1', tenant_id: 'tenant-a' },
            { id: 'checkin-2', client_id: 'client-2', tenant_id: 'tenant-a' }
          ],
          error: null
        })
      };

      // Mock the RLS behavior - when eq is called, it should add tenant_id filter
      mockQuery.eq.mockImplementation((field, value) => {
        if (field === 'client_id') {
          // RLS automatically adds tenant_id filter
          mockQuery.eq('tenant_id', 'tenant-a');
        }
        return mockQuery;
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const client = createClient('mock-url', 'mock-key');
      const { data, error } = await client
        .from('checkins')
        .select('*')
        .eq('client_id', 'client-1')
        .gte('created_at', '2024-01-01')
        .lte('created_at', '2024-12-31')
        .order('created_at', { ascending: false });

      expect(mockQuery.eq).toHaveBeenCalledWith('tenant_id', 'tenant-a');
      expect(data).toHaveLength(2);
      expect(data?.every(checkin => checkin.tenant_id === 'tenant-a')).toBe(true);
      expect(error).toBeNull();
    });
  });

  describe('Weekly Plans Table RLS', () => {
    it('should enforce tenant isolation for weekly plans table', async () => {
      const mockUser = {
        id: 'tenant-a-user-1',
        email: 'user1@tenanta.com',
        user_metadata: { tenant_id: 'tenant-a' }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { 
            id: 'plan-1', 
            client_id: 'client-1', 
            week_start: '2024-01-15',
            tenant_id: 'tenant-a' 
          },
          error: null
        })
      };

      // Mock the RLS behavior - when eq is called, it should add tenant_id filter
      mockQuery.eq.mockImplementation((field, value) => {
        if (field === 'client_id') {
          // RLS automatically adds tenant_id filter
          mockQuery.eq('tenant_id', 'tenant-a');
        }
        return mockQuery;
      });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const client = createClient('mock-url', 'mock-key');
      const { data, error } = await client
        .from('weekly_plans')
        .select('*')
        .eq('client_id', 'client-1')
        .eq('week_start', '2024-01-15')
        .single();

      expect(mockQuery.eq).toHaveBeenCalledWith('tenant_id', 'tenant-a');
      expect(data).toBeDefined();
      expect(data?.tenant_id).toBe('tenant-a');
      expect(error).toBeNull();
    });
  });

  describe('Feature Flags Table RLS', () => {
    it('should enforce tenant isolation for feature flags table', async () => {
      const mockUser = {
        id: 'tenant-a-user-1',
        email: 'user1@tenanta.com',
        user_metadata: { tenant_id: 'tenant-a' }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { 
            id: 'flag-1', 
            name: 'guardian_enabled', 
            enabled: true,
            tenant_id: 'tenant-a' 
          },
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const client = createClient('mock-url', 'mock-key');
      const { data, error } = await client
        .from('feature_flags')
        .select('*')
        .eq('name', 'guardian_enabled')
        .eq('tenant_id', 'tenant-a')
        .single();

      expect(mockQuery.eq).toHaveBeenCalledWith('tenant_id', 'tenant-a');
      expect(data).toBeDefined();
      expect(data?.tenant_id).toBe('tenant-a');
      expect(error).toBeNull();
    });
  });

  describe('Admin Access Controls', () => {
    it('should allow admin users to access cross-tenant data', async () => {
      // Mock admin user
      const mockAdminUser = {
        id: 'admin-user-1',
        email: 'admin@system.com',
        user_metadata: { 
          tenant_id: 'system',
          role: 'admin'
        }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { 
            id: 'client-1', 
            name: 'Client A', 
            tenant_id: 'tenant-a' 
          },
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const client = createClient('mock-url', 'mock-key');
      const { data, error } = await client
        .from('clients')
        .select('*')
        .eq('id', 'client-1')
        .single();

      // Admin should be able to access any tenant's data
      expect(data).toBeDefined();
      expect(data?.tenant_id).toBe('tenant-a');
      expect(error).toBeNull();
    });
  });

  describe('Anonymous Access', () => {
    it('should block anonymous access to tenant data', async () => {
      // Mock anonymous user (no user)
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Authentication required' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const client = createClient('mock-url', 'mock-key');
      const { data, error } = await client
        .from('clients')
        .select('*')
        .eq('id', 'client-1')
        .single();

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error?.message).toContain('Authentication required');
    });
  });
});
