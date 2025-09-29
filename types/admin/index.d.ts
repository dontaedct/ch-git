/**
 * @fileoverview Admin Type Definitions
 * @module types/admin
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-22
 */

// Export all admin-related types
export * from './template-registry';
export * from './modular-components';

// Define common admin types
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSettings {
  organizationName: string;
  brandingEnabled: boolean;
  templateManagementEnabled: boolean;
  analyticsEnabled: boolean;
  securitySettings: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    allowedDomains: string[];
  };
}

export interface AdminDashboardMetrics {
  totalTemplates: number;
  activeUsers: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    userId: string;
  }>;
  systemStatus: 'healthy' | 'warning' | 'critical';
}