import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type Client = Database['public']['Tables']['clients']['Row'];
type AdminAccess = {
  id: string;
  clientId: string;
  accessLevel: 'full' | 'limited' | 'readonly';
  permissions: string[];
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class AdminAccessManager {
  private supabase = createClient();

  async createAdminAccess(
    clientId: string,
    accessLevel: AdminAccess['accessLevel'],
    permissions: string[] = [],
    expiresAt?: Date
  ): Promise<AdminAccess> {
    const accessId = `admin_${clientId}_${Date.now()}`;

    const adminAccess: AdminAccess = {
      id: accessId,
      clientId,
      accessLevel,
      permissions: this.getDefaultPermissions(accessLevel, permissions),
      expiresAt,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store admin access in database
    await this.storeAdminAccess(adminAccess);

    // Log access creation
    await this.logAccessEvent('admin_access_created', clientId, {
      accessId,
      accessLevel,
      permissions: adminAccess.permissions
    });

    return adminAccess;
  }

  async revokeAdminAccess(accessId: string): Promise<void> {
    const access = await this.getAdminAccess(accessId);
    if (!access) {
      throw new Error('Admin access not found');
    }

    access.isActive = false;
    access.updatedAt = new Date();

    await this.updateAdminAccess(access);

    await this.logAccessEvent('admin_access_revoked', access.clientId, {
      accessId
    });
  }

  async updateAdminAccess(
    accessId: string,
    updates: Partial<Pick<AdminAccess, 'accessLevel' | 'permissions' | 'expiresAt'>>
  ): Promise<AdminAccess> {
    const access = await this.getAdminAccess(accessId);
    if (!access) {
      throw new Error('Admin access not found');
    }

    const updatedAccess = {
      ...access,
      ...updates,
      updatedAt: new Date()
    };

    await this.updateAdminAccess(updatedAccess);

    await this.logAccessEvent('admin_access_updated', access.clientId, {
      accessId,
      updates
    });

    return updatedAccess;
  }

  async getAdminAccess(accessId: string): Promise<AdminAccess | null> {
    try {
      const { data, error } = await this.supabase
        .from('client_admin_access')
        .select('*')
        .eq('id', accessId)
        .single();

      if (error) throw error;
      return this.mapDatabaseToAdminAccess(data);
    } catch (error) {
      console.error('Error fetching admin access:', error);
      return null;
    }
  }

  async getClientAdminAccess(clientId: string): Promise<AdminAccess[]> {
    try {
      const { data, error } = await this.supabase
        .from('client_admin_access')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (error) throw error;
      return data.map(this.mapDatabaseToAdminAccess);
    } catch (error) {
      console.error('Error fetching client admin access:', error);
      return [];
    }
  }

  async validateAccess(accessId: string, requiredPermission?: string): Promise<boolean> {
    const access = await this.getAdminAccess(accessId);

    if (!access || !access.isActive) {
      return false;
    }

    // Check expiration
    if (access.expiresAt && access.expiresAt < new Date()) {
      await this.revokeAdminAccess(accessId);
      return false;
    }

    // Check permission if required
    if (requiredPermission && !access.permissions.includes(requiredPermission)) {
      return false;
    }

    return true;
  }

  async refreshAccess(accessId: string, newExpiresAt?: Date): Promise<AdminAccess> {
    const access = await this.getAdminAccess(accessId);
    if (!access) {
      throw new Error('Admin access not found');
    }

    const updatedAccess = {
      ...access,
      expiresAt: newExpiresAt || this.getDefaultExpiration(),
      updatedAt: new Date()
    };

    await this.updateAdminAccess(updatedAccess);

    await this.logAccessEvent('admin_access_refreshed', access.clientId, {
      accessId,
      newExpiresAt: updatedAccess.expiresAt
    });

    return updatedAccess;
  }

  async getAccessHistory(clientId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('client_access_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching access history:', error);
      return [];
    }
  }

  private getDefaultPermissions(
    accessLevel: AdminAccess['accessLevel'],
    customPermissions: string[] = []
  ): string[] {
    const basePermissions = {
      full: [
        'admin.dashboard.view',
        'admin.settings.edit',
        'admin.users.manage',
        'admin.content.edit',
        'admin.analytics.view',
        'admin.integrations.manage',
        'admin.security.manage'
      ],
      limited: [
        'admin.dashboard.view',
        'admin.content.edit',
        'admin.analytics.view'
      ],
      readonly: [
        'admin.dashboard.view',
        'admin.analytics.view'
      ]
    };

    return [...basePermissions[accessLevel], ...customPermissions];
  }

  private getDefaultExpiration(): Date {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 30); // 30 days default
    return expiration;
  }

  private async storeAdminAccess(access: AdminAccess): Promise<void> {
    const { error } = await this.supabase
      .from('client_admin_access')
      .insert({
        id: access.id,
        client_id: access.clientId,
        access_level: access.accessLevel,
        permissions: access.permissions,
        expires_at: access.expiresAt?.toISOString(),
        is_active: access.isActive,
        created_at: access.createdAt.toISOString(),
        updated_at: access.updatedAt.toISOString()
      });

    if (error) {
      throw new Error(`Failed to store admin access: ${error.message}`);
    }
  }

  private async updateAdminAccess(access: AdminAccess): Promise<void> {
    const { error } = await this.supabase
      .from('client_admin_access')
      .update({
        access_level: access.accessLevel,
        permissions: access.permissions,
        expires_at: access.expiresAt?.toISOString(),
        is_active: access.isActive,
        updated_at: access.updatedAt.toISOString()
      })
      .eq('id', access.id);

    if (error) {
      throw new Error(`Failed to update admin access: ${error.message}`);
    }
  }

  private async logAccessEvent(
    eventType: string,
    clientId: string,
    metadata: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('client_access_logs')
        .insert({
          client_id: clientId,
          event_type: eventType,
          metadata,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging access event:', error);
    }
  }

  private mapDatabaseToAdminAccess(data: any): AdminAccess {
    return {
      id: data.id,
      clientId: data.client_id,
      accessLevel: data.access_level,
      permissions: data.permissions || [],
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

export const adminAccessManager = new AdminAccessManager();