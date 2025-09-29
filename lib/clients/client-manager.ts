/**
 * Client Management System for HT-033.3.1
 * Comprehensive client management with CRUD operations, business logic, and integration
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type ClientRow = Database['public']['Tables']['clients_enhanced']['Row'];
type ClientInsert = Database['public']['Tables']['clients_enhanced']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients_enhanced']['Update'];

export interface ClientWithStats extends ClientRow {
  customizations_count: number;
  deployments_count: number;
  active_deployments: number;
}

export interface ClientFilter {
  status?: string[];
  tier?: string[];
  industry?: string;
  assigned_manager?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ClientMetrics {
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  churn_rate: number;
  avg_client_value: number;
  total_revenue: number;
  by_tier: Record<string, number>;
  by_status: Record<string, number>;
  by_industry: Record<string, number>;
}

export class ClientManager {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  /**
   * Create a new client
   */
  async createClient(clientData: ClientInsert): Promise<{ data: ClientRow | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('clients_enhanced')
        .insert([{
          ...clientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Log client creation event
      await this.logClientEvent(data.id, 'client_created', 'Client account created', { client_data: clientData });

      return { data, error: null };
    } catch (error) {
      console.error('Error in createClient:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get client by ID with complete information
   */
  async getClient(clientId: string): Promise<{ data: ClientRow | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('clients_enhanced')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('Error fetching client:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getClient:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get client with statistics
   */
  async getClientWithStats(clientId: string): Promise<{ data: ClientWithStats | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('client_summary')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('Error fetching client with stats:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as ClientWithStats, error: null };
    } catch (error) {
      console.error('Error in getClientWithStats:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get filtered list of clients
   */
  async getClients(filter: ClientFilter = {}, limit = 50, offset = 0): Promise<{ data: ClientWithStats[]; error: Error | null; count: number }> {
    try {
      let query = this.supabase
        .from('client_summary')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filter.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }

      if (filter.tier && filter.tier.length > 0) {
        query = query.in('tier', filter.tier);
      }

      if (filter.assigned_manager) {
        query = query.eq('assigned_manager', filter.assigned_manager);
      }

      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,company_name.ilike.%${filter.search}%`);
      }

      if (filter.date_range) {
        query = query
          .gte('created_at', filter.date_range.start)
          .lte('created_at', filter.date_range.end);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching clients:', error);
        return { data: [], error: new Error(error.message), count: 0 };
      }

      return { data: data as ClientWithStats[], error: null, count: count || 0 };
    } catch (error) {
      console.error('Error in getClients:', error);
      return { data: [], error: error as Error, count: 0 };
    }
  }

  /**
   * Update client information
   */
  async updateClient(clientId: string, updates: ClientUpdate): Promise<{ data: ClientRow | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('clients_enhanced')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Log client update event
      await this.logClientEvent(clientId, 'client_updated', 'Client information updated', { updates });

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateClient:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete client (soft delete by status change)
   */
  async deleteClient(clientId: string, hard_delete = false): Promise<{ success: boolean; error: Error | null }> {
    try {
      if (hard_delete) {
        const { error } = await this.supabase
          .from('clients_enhanced')
          .delete()
          .eq('id', clientId);

        if (error) {
          console.error('Error deleting client:', error);
          return { success: false, error: new Error(error.message) };
        }
      } else {
        // Soft delete by changing status
        const { error } = await this.supabase
          .from('clients_enhanced')
          .update({
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);

        if (error) {
          console.error('Error soft deleting client:', error);
          return { success: false, error: new Error(error.message) };
        }
      }

      // Log client deletion event
      await this.logClientEvent(clientId, 'client_deleted', `Client ${hard_delete ? 'permanently deleted' : 'deactivated'}`, { hard_delete });

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in deleteClient:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get client metrics and analytics
   */
  async getClientMetrics(): Promise<{ data: ClientMetrics | null; error: Error | null }> {
    try {
      // Get total counts and basic metrics
      const { data: clients, error: clientsError } = await this.supabase
        .from('clients_enhanced')
        .select('id, status, tier, created_at, annual_revenue, industry');

      if (clientsError) {
        console.error('Error fetching client metrics:', clientsError);
        return { data: null, error: new Error(clientsError.message) };
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'active').length;
      const newClientsThisMonth = clients.filter(c =>
        new Date(c.created_at) >= thisMonth
      ).length;

      const clientsLastMonth = clients.filter(c =>
        new Date(c.created_at) >= lastMonth && new Date(c.created_at) < thisMonth
      ).length;

      const churnRate = clientsLastMonth > 0
        ? ((clientsLastMonth - newClientsThisMonth) / clientsLastMonth) * 100
        : 0;

      const totalRevenue = clients.reduce((sum, client) =>
        sum + (client.annual_revenue || 0), 0
      );

      const avgClientValue = totalClients > 0 ? totalRevenue / totalClients : 0;

      // Group by tier
      const byTier = clients.reduce((acc, client) => {
        const tier = client.tier || 'unknown';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by status
      const byStatus = clients.reduce((acc, client) => {
        const status = client.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by industry
      const byIndustry = clients.reduce((acc, client) => {
        const industry = client.industry || 'unknown';
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const metrics: ClientMetrics = {
        total_clients: totalClients,
        active_clients: activeClients,
        new_clients_this_month: newClientsThisMonth,
        churn_rate: Math.round(churnRate * 100) / 100,
        avg_client_value: Math.round(avgClientValue * 100) / 100,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        by_tier: byTier,
        by_status: byStatus,
        by_industry: byIndustry
      };

      return { data: metrics, error: null };
    } catch (error) {
      console.error('Error in getClientMetrics:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update client contact information
   */
  async updateLastContact(clientId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('clients_enhanced')
        .update({
          last_contact_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        console.error('Error updating last contact:', error);
        return { success: false, error: new Error(error.message) };
      }

      await this.logClientEvent(clientId, 'contact_logged', 'Client contact logged');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in updateLastContact:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Assign manager to client
   */
  async assignManager(clientId: string, managerId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('clients_enhanced')
        .update({
          assigned_manager: managerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        console.error('Error assigning manager:', error);
        return { success: false, error: new Error(error.message) };
      }

      await this.logClientEvent(clientId, 'manager_assigned', 'Manager assigned to client', { manager_id: managerId });

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in assignManager:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get clients by manager
   */
  async getClientsByManager(managerId: string): Promise<{ data: ClientWithStats[]; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('client_summary')
        .select('*')
        .eq('assigned_manager', managerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients by manager:', error);
        return { data: [], error: new Error(error.message) };
      }

      return { data: data as ClientWithStats[], error: null };
    } catch (error) {
      console.error('Error in getClientsByManager:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Search clients
   */
  async searchClients(query: string, limit = 20): Promise<{ data: ClientWithStats[]; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('client_summary')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Error searching clients:', error);
        return { data: [], error: new Error(error.message) };
      }

      return { data: data as ClientWithStats[], error: null };
    } catch (error) {
      console.error('Error in searchClients:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Bulk update clients
   */
  async bulkUpdateClients(clientIds: string[], updates: Partial<ClientUpdate>): Promise<{ success: boolean; error: Error | null; updated_count: number }> {
    try {
      const { data, error } = await this.supabase
        .from('clients_enhanced')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', clientIds)
        .select('id');

      if (error) {
        console.error('Error bulk updating clients:', error);
        return { success: false, error: new Error(error.message), updated_count: 0 };
      }

      // Log bulk update event for each client
      for (const clientId of clientIds) {
        await this.logClientEvent(clientId, 'bulk_update', 'Client updated via bulk operation', { updates });
      }

      return { success: true, error: null, updated_count: data.length };
    } catch (error) {
      console.error('Error in bulkUpdateClients:', error);
      return { success: false, error: error as Error, updated_count: 0 };
    }
  }

  /**
   * Log client event for audit trail
   */
  private async logClientEvent(clientId: string, eventType: string, message: string, metadata: any = {}): Promise<void> {
    try {
      // This would integrate with a logging system or events table
      // For now, we'll use console logging with structured data
      console.log('Client Event Log:', {
        client_id: clientId,
        event_type: eventType,
        message,
        metadata,
        timestamp: new Date().toISOString()
      });

      // TODO: Implement proper event logging to database or external service
    } catch (error) {
      console.error('Error logging client event:', error);
    }
  }

  /**
   * Validate client data
   */
  validateClientData(clientData: Partial<ClientInsert>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!clientData.name || clientData.name.trim().length === 0) {
      errors.push('Client name is required');
    }

    if (!clientData.email || !this.isValidEmail(clientData.email)) {
      errors.push('Valid email address is required');
    }

    if (clientData.website_url && !this.isValidUrl(clientData.website_url)) {
      errors.push('Website URL must be a valid URL');
    }

    if (clientData.annual_revenue && clientData.annual_revenue < 0) {
      errors.push('Annual revenue cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}