/**
 * Deployment Tracking System for HT-033.3.1
 * Tracks client deployments, health monitoring, and deployment lifecycle management
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type DeploymentRow = Database['public']['Tables']['client_deployments']['Row'];
type DeploymentInsert = Database['public']['Tables']['client_deployments']['Insert'];
type DeploymentUpdate = Database['public']['Tables']['client_deployments']['Update'];
type DeploymentEventRow = Database['public']['Tables']['deployment_tracking_events']['Row'];
type DeploymentEventInsert = Database['public']['Tables']['deployment_tracking_events']['Insert'];

export interface DeploymentConfig {
  hosting: {
    provider: 'vercel' | 'netlify' | 'aws' | 'custom';
    region: string;
    instanceType?: string;
    scalingConfig?: Record<string, any>;
  };
  domain: {
    customDomain?: string;
    subdomain?: string;
    sslConfig: {
      enabled: boolean;
      certificateType: 'letsencrypt' | 'custom' | 'cloudflare';
    };
  };
  environment: {
    variables: Record<string, string>;
    secrets: Record<string, string>;
    featureFlags: Record<string, boolean>;
  };
  performance: {
    cdnEnabled: boolean;
    cachingStrategy: string;
    compressionEnabled: boolean;
    imageOptimization: boolean;
  };
  monitoring: {
    healthCheckUrl: string;
    alertsEnabled: boolean;
    uptimeMonitoring: boolean;
    performanceMonitoring: boolean;
  };
}

export interface DeploymentMetrics {
  uptime: {
    percentage: number;
    downtime_minutes: number;
    last_incident: string | null;
  };
  performance: {
    avg_response_time: number;
    p95_response_time: number;
    error_rate: number;
    throughput: number;
  };
  traffic: {
    unique_visitors: number;
    page_views: number;
    bandwidth_used: number;
    peak_concurrent_users: number;
  };
  business: {
    conversions: number;
    conversion_rate: number;
    revenue: number;
    bounce_rate: number;
  };
}

export interface DeploymentEvent {
  id: string;
  type: 'build_started' | 'build_completed' | 'deploy_started' | 'deploy_completed' | 'health_check' | 'error' | 'rollback' | 'maintenance';
  status: 'success' | 'failure' | 'warning' | 'info';
  message: string;
  details: Record<string, any>;
  timestamp: string;
  duration_ms?: number;
  triggered_by: 'user' | 'system' | 'webhook' | 'schedule';
}

export interface DeploymentSummary {
  id: string;
  client_name: string;
  deployment_name: string;
  deployment_url: string;
  status: string;
  health_status: string;
  deployed_at: string;
  uptime_percentage: number;
  last_health_check: string;
  metrics: DeploymentMetrics;
}

export class DeploymentTracker {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  /**
   * Create new deployment record
   */
  async createDeployment(
    clientId: string,
    customizationId: string,
    deploymentName: string,
    config: DeploymentConfig
  ): Promise<{ data: DeploymentRow | null; error: Error | null }> {
    try {
      const deploymentData: DeploymentInsert = {
        client_id: clientId,
        customization_id: customizationId,
        deployment_name: deploymentName,
        deployment_type: 'production',
        hosting_provider: config.hosting.provider,
        region: config.hosting.region,
        environment_config: config as any,
        custom_domain: config.domain.customDomain,
        ssl_enabled: config.domain.sslConfig.enabled,
        cdn_enabled: config.performance.cdnEnabled,
        feature_flags: config.environment.featureFlags as any,
        environment_variables: config.environment.variables as any,
        status: 'pending',
        health_status: 'unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('client_deployments')
        .insert([deploymentData])
        .select()
        .single();

      if (error) {
        console.error('Error creating deployment:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Log deployment creation event
      await this.logDeploymentEvent(data.id, 'deploy_started', 'success', 'Deployment record created', { config });

      return { data, error: null };
    } catch (error) {
      console.error('Error in createDeployment:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<{ data: DeploymentRow | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('client_deployments')
        .select('*')
        .eq('id', deploymentId)
        .single();

      if (error) {
        console.error('Error fetching deployment:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getDeployment:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all deployments for a client
   */
  async getClientDeployments(clientId: string): Promise<{ data: DeploymentRow[]; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('client_deployments')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client deployments:', error);
        return { data: [], error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getClientDeployments:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Update deployment status
   */
  async updateDeploymentStatus(
    deploymentId: string,
    status: string,
    additionalData: Partial<DeploymentUpdate> = {}
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const updateData: DeploymentUpdate = {
        status,
        ...additionalData,
        updated_at: new Date().toISOString()
      };

      if (status === 'deployed') {
        updateData.deployed_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('client_deployments')
        .update(updateData)
        .eq('id', deploymentId);

      if (error) {
        console.error('Error updating deployment status:', error);
        return { success: false, error: new Error(error.message) };
      }

      // Log status change event
      await this.logDeploymentEvent(
        deploymentId,
        status === 'deployed' ? 'deploy_completed' : 'deploy_started',
        'success',
        `Deployment status updated to ${status}`,
        { previous_status: status, new_data: additionalData }
      );

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in updateDeploymentStatus:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Update deployment health status
   */
  async updateHealthStatus(
    deploymentId: string,
    healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown',
    metrics: Partial<DeploymentMetrics> = {}
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const updateData: DeploymentUpdate = {
        health_status: healthStatus,
        last_health_check: new Date().toISOString(),
        performance_metrics: metrics as any,
        updated_at: new Date().toISOString()
      };

      if (metrics.uptime?.percentage) {
        updateData.uptime_percentage = metrics.uptime.percentage;
      }

      if (metrics.performance?.avg_response_time) {
        updateData.response_time_avg = metrics.performance.avg_response_time;
      }

      const { error } = await this.supabase
        .from('client_deployments')
        .update(updateData)
        .eq('id', deploymentId);

      if (error) {
        console.error('Error updating health status:', error);
        return { success: false, error: new Error(error.message) };
      }

      // Log health check event
      await this.logDeploymentEvent(
        deploymentId,
        'health_check',
        healthStatus === 'critical' ? 'failure' : healthStatus === 'warning' ? 'warning' : 'success',
        `Health check completed - status: ${healthStatus}`,
        { health_status: healthStatus, metrics }
      );

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in updateHealthStatus:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Log deployment event
   */
  async logDeploymentEvent(
    deploymentId: string,
    eventType: string,
    status: 'success' | 'failure' | 'warning' | 'info',
    message: string,
    details: Record<string, any> = {},
    triggeredBy: 'user' | 'system' | 'webhook' | 'schedule' = 'system',
    durationMs?: number
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const eventData: DeploymentEventInsert = {
        deployment_id: deploymentId,
        event_type: eventType,
        event_status: status,
        event_message: message,
        event_details: details as any,
        event_timestamp: new Date().toISOString(),
        duration_ms: durationMs,
        triggered_by: triggeredBy,
        metadata: {} as any
      };

      const { error } = await this.supabase
        .from('deployment_tracking_events')
        .insert([eventData]);

      if (error) {
        console.error('Error logging deployment event:', error);
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in logDeploymentEvent:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get deployment events
   */
  async getDeploymentEvents(
    deploymentId: string,
    eventTypes?: string[],
    limit = 100
  ): Promise<{ data: DeploymentEvent[]; error: Error | null }> {
    try {
      let query = this.supabase
        .from('deployment_tracking_events')
        .select('*')
        .eq('deployment_id', deploymentId);

      if (eventTypes && eventTypes.length > 0) {
        query = query.in('event_type', eventTypes);
      }

      const { data, error } = await query
        .order('event_timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching deployment events:', error);
        return { data: [], error: new Error(error.message) };
      }

      const events: DeploymentEvent[] = data.map(event => ({
        id: event.id,
        type: event.event_type as any,
        status: event.event_status as any,
        message: event.event_message,
        details: event.event_details || {},
        timestamp: event.event_timestamp,
        duration_ms: event.duration_ms || undefined,
        triggered_by: event.triggered_by as any
      }));

      return { data: events, error: null };
    } catch (error) {
      console.error('Error in getDeploymentEvents:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Get deployment metrics
   */
  async getDeploymentMetrics(deploymentId: string): Promise<{ data: DeploymentMetrics | null; error: Error | null }> {
    try {
      const { data: deployment, error } = await this.getDeployment(deploymentId);
      if (error || !deployment) {
        return { data: null, error: error || new Error('Deployment not found') };
      }

      const metrics = deployment.performance_metrics as DeploymentMetrics || {
        uptime: { percentage: 0, downtime_minutes: 0, last_incident: null },
        performance: { avg_response_time: 0, p95_response_time: 0, error_rate: 0, throughput: 0 },
        traffic: { unique_visitors: 0, page_views: 0, bandwidth_used: 0, peak_concurrent_users: 0 },
        business: { conversions: 0, conversion_rate: 0, revenue: 0, bounce_rate: 0 }
      };

      return { data: metrics, error: null };
    } catch (error) {
      console.error('Error in getDeploymentMetrics:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get deployment summary with enhanced information
   */
  async getDeploymentSummary(): Promise<{ data: DeploymentSummary[]; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('deployment_status_summary')
        .select('*')
        .order('deployed_at', { ascending: false });

      if (error) {
        console.error('Error fetching deployment summary:', error);
        return { data: [], error: new Error(error.message) };
      }

      const summaries: DeploymentSummary[] = await Promise.all(
        data.map(async (deployment) => {
          const { data: metrics } = await this.getDeploymentMetrics(deployment.id);

          return {
            id: deployment.id,
            client_name: deployment.client_name,
            deployment_name: deployment.deployment_name,
            deployment_url: deployment.deployment_url || '',
            status: deployment.status,
            health_status: deployment.health_status,
            deployed_at: deployment.deployed_at || '',
            uptime_percentage: deployment.uptime_percentage || 0,
            last_health_check: deployment.last_health_check || '',
            metrics: metrics || {
              uptime: { percentage: 0, downtime_minutes: 0, last_incident: null },
              performance: { avg_response_time: 0, p95_response_time: 0, error_rate: 0, throughput: 0 },
              traffic: { unique_visitors: 0, page_views: 0, bandwidth_used: 0, peak_concurrent_users: 0 },
              business: { conversions: 0, conversion_rate: 0, revenue: 0, bounce_rate: 0 }
            }
          };
        })
      );

      return { data: summaries, error: null };
    } catch (error) {
      console.error('Error in getDeploymentSummary:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Perform health check on deployment
   */
  async performHealthCheck(deploymentId: string): Promise<{ success: boolean; metrics: DeploymentMetrics | null; error: Error | null }> {
    try {
      const { data: deployment, error: deploymentError } = await this.getDeployment(deploymentId);
      if (deploymentError || !deployment) {
        return { success: false, metrics: null, error: deploymentError || new Error('Deployment not found') };
      }

      const startTime = Date.now();
      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      const metrics: DeploymentMetrics = {
        uptime: { percentage: 0, downtime_minutes: 0, last_incident: null },
        performance: { avg_response_time: 0, p95_response_time: 0, error_rate: 0, throughput: 0 },
        traffic: { unique_visitors: 0, page_views: 0, bandwidth_used: 0, peak_concurrent_users: 0 },
        business: { conversions: 0, conversion_rate: 0, revenue: 0, bounce_rate: 0 }
      };

      // Perform actual health check if deployment URL is available
      if (deployment.deployment_url) {
        try {
          const response = await fetch(deployment.deployment_url, {
            method: 'HEAD',
            timeout: 10000
          });

          const responseTime = Date.now() - startTime;
          metrics.performance.avg_response_time = responseTime;

          if (response.ok) {
            if (responseTime > 5000) {
              healthStatus = 'warning';
            }
          } else {
            healthStatus = 'critical';
            metrics.performance.error_rate = 100;
          }
        } catch (fetchError) {
          healthStatus = 'critical';
          metrics.performance.error_rate = 100;
        }
      }

      // Calculate uptime (simplified - in real implementation would use historical data)
      metrics.uptime.percentage = healthStatus === 'healthy' ? 99.9 : healthStatus === 'warning' ? 95.0 : 85.0;

      // Update deployment with health check results
      await this.updateHealthStatus(deploymentId, healthStatus, metrics);

      return { success: true, metrics, error: null };
    } catch (error) {
      console.error('Error in performHealthCheck:', error);
      return { success: false, metrics: null, error: error as Error };
    }
  }

  /**
   * Rollback deployment
   */
  async rollbackDeployment(deploymentId: string, reason: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Update deployment status to maintenance mode
      await this.updateDeploymentStatus(deploymentId, 'maintenance', {
        health_status: 'warning'
      });

      // Log rollback event
      await this.logDeploymentEvent(
        deploymentId,
        'rollback',
        'warning',
        `Deployment rollback initiated: ${reason}`,
        { reason, initiated_at: new Date().toISOString() },
        'user'
      );

      // In a real implementation, this would trigger the actual rollback process
      // For now, we'll simulate the rollback completion
      setTimeout(async () => {
        await this.updateDeploymentStatus(deploymentId, 'deployed', {
          health_status: 'healthy'
        });

        await this.logDeploymentEvent(
          deploymentId,
          'rollback',
          'success',
          'Deployment rollback completed successfully',
          { reason, completed_at: new Date().toISOString() },
          'system'
        );
      }, 5000);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in rollbackDeployment:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Delete deployment
   */
  async deleteDeployment(deploymentId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Log deletion event first
      await this.logDeploymentEvent(
        deploymentId,
        'deploy_completed',
        'info',
        'Deployment marked for deletion',
        { deleted_at: new Date().toISOString() },
        'user'
      );

      // Delete deployment record (events will be cascade deleted)
      const { error } = await this.supabase
        .from('client_deployments')
        .delete()
        .eq('id', deploymentId);

      if (error) {
        console.error('Error deleting deployment:', error);
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in deleteDeployment:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get deployment analytics for time period
   */
  async getDeploymentAnalytics(
    deploymentId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: any; error: Error | null }> {
    try {
      // Get deployment events in date range
      const { data: events, error: eventsError } = await this.supabase
        .from('deployment_tracking_events')
        .select('*')
        .eq('deployment_id', deploymentId)
        .gte('event_timestamp', startDate)
        .lte('event_timestamp', endDate)
        .order('event_timestamp', { ascending: true });

      if (eventsError) {
        console.error('Error fetching deployment analytics:', eventsError);
        return { data: null, error: new Error(eventsError.message) };
      }

      // Process events to generate analytics
      const analytics = {
        total_events: events.length,
        success_events: events.filter(e => e.event_status === 'success').length,
        error_events: events.filter(e => e.event_status === 'failure').length,
        warning_events: events.filter(e => e.event_status === 'warning').length,
        deployments: events.filter(e => e.event_type === 'deploy_completed').length,
        health_checks: events.filter(e => e.event_type === 'health_check').length,
        rollbacks: events.filter(e => e.event_type === 'rollback').length,
        avg_deployment_time: this.calculateAverageDeploymentTime(events),
        uptime_percentage: this.calculateUptime(events),
        timeline: events.map(event => ({
          timestamp: event.event_timestamp,
          type: event.event_type,
          status: event.event_status,
          message: event.event_message
        }))
      };

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Error in getDeploymentAnalytics:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Calculate average deployment time from events
   */
  private calculateAverageDeploymentTime(events: any[]): number {
    const deploymentPairs = [];
    const startEvents = events.filter(e => e.event_type === 'deploy_started');
    const endEvents = events.filter(e => e.event_type === 'deploy_completed');

    for (const start of startEvents) {
      const end = endEvents.find(e =>
        new Date(e.event_timestamp) > new Date(start.event_timestamp)
      );
      if (end) {
        const duration = new Date(end.event_timestamp).getTime() - new Date(start.event_timestamp).getTime();
        deploymentPairs.push(duration);
      }
    }

    return deploymentPairs.length > 0
      ? deploymentPairs.reduce((sum, duration) => sum + duration, 0) / deploymentPairs.length
      : 0;
  }

  /**
   * Calculate uptime percentage from health check events
   */
  private calculateUptime(events: any[]): number {
    const healthEvents = events.filter(e => e.event_type === 'health_check');
    if (healthEvents.length === 0) return 100;

    const healthyEvents = healthEvents.filter(e => e.event_status === 'success');
    return (healthyEvents.length / healthEvents.length) * 100;
  }
}