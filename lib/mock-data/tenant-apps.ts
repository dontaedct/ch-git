/**
 * @fileoverview Shared mock data for tenant apps
 * This ensures consistency across all API routes
 */

import { TenantApp } from '@/types/tenant-apps';

// Shared mock data that persists across API calls
export let mockApps: TenantApp[] = [
  {
    id: 'mock-1',
    name: 'Test Client - Lead Capture',
    slug: 'test-client-lead-capture',
    admin_email: 'admin@testclient.com',
    template_id: 'lead-form-pdf',
    status: 'sandbox',
    environment: 'development',
    archived: false,
    config: {
      form_fields: [
        { id: 'name', type: 'text', label: 'Full Name', required: true },
        { id: 'email', type: 'email', label: 'Email Address', required: true },
        { id: 'phone', type: 'tel', label: 'Phone Number', required: false },
        { id: 'message', type: 'textarea', label: 'Message', required: true }
      ],
      notifications: {
        admin_email: 'admin@testclient.com',
        auto_respond: true
      }
    },
    theme_config: {
      primary_color: '#3B82F6',
      secondary_color: '#6B7280',
      accent_color: '#F59E0B',
      logo_url: null,
      font_family: 'Inter'
    },
    created_by: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    archived_at: null,
    admin_url: '/admin/test-client-lead-capture',
    public_url: '/test-client-lead-capture',
    submissions_count: 23,
    documents_count: 8,
    last_activity_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-2',
    name: 'Johns Consulting Portal',
    slug: 'johns-consulting-portal',
    admin_email: 'admin@johnsconsulting.com',
    template_id: 'client-portal',
    status: 'production',
    environment: 'production',
    archived: false,
    config: {},
    theme_config: {},
    created_by: null,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    archived_at: null,
    admin_url: '/admin/johns-consulting-portal',
    public_url: '/johns-consulting-portal',
    submissions_count: 15,
    documents_count: 12,
    last_activity_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-3',
    name: 'Sarahs Coaching Forms',
    slug: 'sarahs-coaching-forms',
    admin_email: 'admin@sarahscoaching.com',
    template_id: 'lead-form-pdf',
    status: 'sandbox',
    environment: 'development',
    archived: false,
    config: {},
    theme_config: {},
    created_by: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    archived_at: null,
    admin_url: '/admin/sarahs-coaching-forms',
    public_url: '/sarahs-coaching-forms',
    submissions_count: 8,
    documents_count: 3,
    last_activity_at: null
  }
];

// Helper functions to manage the mock data
export function getMockApps(): TenantApp[] {
  return mockApps;
}

export function updateMockApp(id: string, updates: Partial<TenantApp>): TenantApp | null {
  const index = mockApps.findIndex(app => app.id === id);
  if (index === -1) return null;
  
  mockApps[index] = {
    ...mockApps[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  return mockApps[index];
}

export function addMockApp(app: TenantApp): void {
  mockApps.unshift(app);
}

export function removeMockApp(id: string): boolean {
  const index = mockApps.findIndex(app => app.id === id);
  if (index === -1) return false;
  
  mockApps.splice(index, 1);
  return true;
}
