import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface ClientDeployment {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'deploying' | 'error';
  lastDeployed: Date;
  version: string;
  template: string;
  health: 'healthy' | 'warning' | 'critical';
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    dailyUsers: number;
  };
  configuration: {
    features: string[];
    integrations: string[];
    customizations: Record<string, any>;
  };
  billing: {
    plan: string;
    monthlyRevenue: number;
    status: 'active' | 'suspended' | 'cancelled';
  };
}

export class UniversalClientManager {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient();
  }

  async getAllClients(): Promise<ClientDeployment[]> {
    try {
      const { data: clients, error } = await this.supabase
        .from('clients')
        .select(`
          *,
          deployments(*),
          configurations(*),
          billing_info(*)
        `);

      if (error) throw error;

      return clients?.map(client => this.transformClientData(client)) || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  async getClientById(id: string): Promise<ClientDeployment | null> {
    try {
      const { data: client, error } = await this.supabase
        .from('clients')
        .select(`
          *,
          deployments(*),
          configurations(*),
          billing_info(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return client ? this.transformClientData(client) : null;
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  }

  async updateClientStatus(id: string, status: ClientDeployment['status']): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('clients')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating client status:', error);
      return false;
    }
  }

  async updateClientConfiguration(id: string, configuration: Partial<ClientDeployment['configuration']>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('configurations')
        .update({
          ...configuration,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating client configuration:', error);
      return false;
    }
  }

  async deployClient(id: string): Promise<boolean> {
    try {
      await this.updateClientStatus(id, 'deploying');

      // Trigger deployment pipeline
      const deploymentResult = await this.triggerDeploymentPipeline(id);

      if (deploymentResult.success) {
        await this.updateClientStatus(id, 'active');
        return true;
      } else {
        await this.updateClientStatus(id, 'error');
        return false;
      }
    } catch (error) {
      console.error('Error deploying client:', error);
      await this.updateClientStatus(id, 'error');
      return false;
    }
  }

  async suspendClient(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('clients')
        .update({
          status: 'inactive',
          suspended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error suspending client:', error);
      return false;
    }
  }

  async getClientMetrics(id: string): Promise<ClientDeployment['metrics'] | null> {
    try {
      const { data: metrics, error } = await this.supabase
        .from('client_metrics')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return metrics ? {
        uptime: metrics.uptime || 0,
        responseTime: metrics.response_time || 0,
        errorRate: metrics.error_rate || 0,
        dailyUsers: metrics.daily_users || 0
      } : null;
    } catch (error) {
      console.error('Error fetching client metrics:', error);
      return null;
    }
  }

  async getAggregatedMetrics(): Promise<{
    totalClients: number;
    activeClients: number;
    totalRevenue: number;
    averageUptime: number;
    totalUsers: number;
  }> {
    try {
      const clients = await this.getAllClients();

      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'active').length;
      const totalRevenue = clients.reduce((sum, c) => sum + c.billing.monthlyRevenue, 0);
      const averageUptime = clients.reduce((sum, c) => sum + c.metrics.uptime, 0) / totalClients;
      const totalUsers = clients.reduce((sum, c) => sum + c.metrics.dailyUsers, 0);

      return {
        totalClients,
        activeClients,
        totalRevenue,
        averageUptime,
        totalUsers
      };
    } catch (error) {
      console.error('Error fetching aggregated metrics:', error);
      return {
        totalClients: 0,
        activeClients: 0,
        totalRevenue: 0,
        averageUptime: 0,
        totalUsers: 0
      };
    }
  }

  private transformClientData(client: any): ClientDeployment {
    return {
      id: client.id,
      name: client.name || 'Unknown Client',
      domain: client.domain || 'No domain configured',
      status: client.status || 'inactive',
      lastDeployed: new Date(client.last_deployed || client.created_at),
      version: client.version || '1.0.0',
      template: client.template || 'default',
      health: this.calculateHealthStatus(client),
      metrics: {
        uptime: client.uptime || 0,
        responseTime: client.response_time || 0,
        errorRate: client.error_rate || 0,
        dailyUsers: client.daily_users || 0
      },
      configuration: {
        features: client.configurations?.features || [],
        integrations: client.configurations?.integrations || [],
        customizations: client.configurations?.customizations || {}
      },
      billing: {
        plan: client.billing_info?.plan || 'basic',
        monthlyRevenue: client.billing_info?.monthly_revenue || 0,
        status: client.billing_info?.status || 'active'
      }
    };
  }

  private calculateHealthStatus(client: any): ClientDeployment['health'] {
    const uptime = client.uptime || 0;
    const errorRate = client.error_rate || 0;
    const responseTime = client.response_time || 0;

    if (uptime < 95 || errorRate > 5 || responseTime > 2000) {
      return 'critical';
    } else if (uptime < 99 || errorRate > 1 || responseTime > 1000) {
      return 'warning';
    }
    return 'healthy';
  }

  private async triggerDeploymentPipeline(clientId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would trigger the actual deployment pipeline
      // For now, we'll simulate the deployment process
      const { data, error } = await this.supabase
        .from('deployments')
        .insert({
          client_id: clientId,
          status: 'pending',
          triggered_at: new Date().toISOString()
        });

      if (error) throw error;

      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return { success: true };
    } catch (error) {
      console.error('Deployment pipeline error:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

export const universalClientManager = new UniversalClientManager();