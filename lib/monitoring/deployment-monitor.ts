/**
 * Deployment Monitoring System
 *
 * Comprehensive deployment monitoring for client applications with
 * real-time status tracking, performance metrics, and automated alerting.
 */

import { supabase } from '@/lib/supabase/client'

export interface DeploymentStatus {
  id: string
  clientId: string
  deploymentId: string
  status: 'initializing' | 'deploying' | 'healthy' | 'degraded' | 'failed' | 'maintenance'
  url: string
  version: string
  timestamp: Date
  metadata: {
    buildTime?: number
    deployTime?: number
    lastHealthCheck?: Date
    uptime?: number
    errorCount?: number
    responseTime?: number
  }
}

export interface DeploymentAlert {
  id: string
  deploymentId: string
  type: 'performance' | 'availability' | 'error' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

class DeploymentMonitor {
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map()
  private alertThresholds = {
    responseTime: 2000, // ms
    errorRate: 0.05, // 5%
    uptime: 0.99, // 99%
    cpuUsage: 0.8, // 80%
    memoryUsage: 0.85 // 85%
  }

  /**
   * Start monitoring a client deployment
   */
  async startMonitoring(deploymentId: string, config?: Partial<typeof this.alertThresholds>): Promise<void> {
    if (this.monitoringIntervals.has(deploymentId)) {
      this.stopMonitoring(deploymentId)
    }

    // Merge custom thresholds
    const thresholds = { ...this.alertThresholds, ...config }

    // Start monitoring interval
    const interval = setInterval(async () => {
      await this.performHealthCheck(deploymentId, thresholds)
    }, 30000) // Check every 30 seconds

    this.monitoringIntervals.set(deploymentId, interval)

    console.log(`Started monitoring deployment: ${deploymentId}`)
  }

  /**
   * Stop monitoring a deployment
   */
  stopMonitoring(deploymentId: string): void {
    const interval = this.monitoringIntervals.get(deploymentId)
    if (interval) {
      clearInterval(interval)
      this.monitoringIntervals.delete(deploymentId)
      console.log(`Stopped monitoring deployment: ${deploymentId}`)
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(deploymentId: string, thresholds: typeof this.alertThresholds): Promise<DeploymentStatus> {
    try {
      // Get deployment info
      const { data: deployment } = await supabase
        .from('client_deployments')
        .select('*')
        .eq('id', deploymentId)
        .single()

      if (!deployment) {
        throw new Error(`Deployment not found: ${deploymentId}`)
      }

      const startTime = Date.now()

      // Perform HTTP health check
      const healthResult = await this.checkHttpHealth(deployment.url)
      const responseTime = Date.now() - startTime

      // Check performance metrics
      const performanceMetrics = await this.collectPerformanceMetrics(deployment.url)

      // Determine overall status
      const status = this.determineDeploymentStatus(healthResult, performanceMetrics, thresholds)

      // Create status record
      const deploymentStatus: DeploymentStatus = {
        id: `status_${deploymentId}_${Date.now()}`,
        clientId: deployment.client_id,
        deploymentId,
        status,
        url: deployment.url,
        version: deployment.version,
        timestamp: new Date(),
        metadata: {
          deployTime: deployment.deploy_time,
          lastHealthCheck: new Date(),
          uptime: performanceMetrics.uptime,
          errorCount: performanceMetrics.errorCount,
          responseTime
        }
      }

      // Save status to database
      await this.saveDeploymentStatus(deploymentStatus)

      // Check for alerts
      await this.checkAndCreateAlerts(deploymentStatus, thresholds)

      return deploymentStatus

    } catch (error) {
      console.error(`Health check failed for deployment ${deploymentId}:`, error)

      // Create failed status
      const failedStatus: DeploymentStatus = {
        id: `status_${deploymentId}_${Date.now()}`,
        clientId: '',
        deploymentId,
        status: 'failed',
        url: '',
        version: '',
        timestamp: new Date(),
        metadata: {
          lastHealthCheck: new Date(),
          errorCount: 1
        }
      }

      await this.saveDeploymentStatus(failedStatus)
      return failedStatus
    }
  }

  /**
   * Check HTTP health of deployment
   */
  private async checkHttpHealth(url: string): Promise<{
    status: number
    responseTime: number
    headers: Record<string, string>
    ssl?: {
      valid: boolean
      expiresAt?: Date
    }
  }> {
    const startTime = Date.now()

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'DeploymentMonitor/1.0'
        }
      })

      const responseTime = Date.now() - startTime
      const headers: Record<string, string> = {}

      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      return {
        status: response.status,
        responseTime,
        headers
      }
    } catch (error) {
      throw new Error(`HTTP health check failed: ${error}`)
    }
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(url: string): Promise<{
    uptime: number
    errorCount: number
    cpuUsage?: number
    memoryUsage?: number
    requestCount?: number
  }> {
    try {
      // In a real implementation, this would connect to monitoring services
      // For now, we'll simulate metrics collection

      const { data: recentStatuses } = await supabase
        .from('deployment_statuses')
        .select('status, timestamp')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(288) // 24 hours of 5-minute intervals

      const totalChecks = recentStatuses?.length || 0
      const healthyChecks = recentStatuses?.filter(s => s.status === 'healthy').length || 0
      const errorChecks = recentStatuses?.filter(s => s.status === 'failed').length || 0

      return {
        uptime: totalChecks > 0 ? healthyChecks / totalChecks : 1,
        errorCount: errorChecks,
        cpuUsage: Math.random() * 0.8, // Simulated
        memoryUsage: Math.random() * 0.7, // Simulated
        requestCount: Math.floor(Math.random() * 1000) // Simulated
      }
    } catch (error) {
      console.error('Failed to collect performance metrics:', error)
      return {
        uptime: 0,
        errorCount: 1
      }
    }
  }

  /**
   * Determine deployment status based on health and performance data
   */
  private determineDeploymentStatus(
    healthResult: any,
    performanceMetrics: any,
    thresholds: typeof this.alertThresholds
  ): DeploymentStatus['status'] {
    // Check if deployment is completely down
    if (healthResult.status >= 500 || performanceMetrics.uptime < 0.5) {
      return 'failed'
    }

    // Check if deployment is degraded
    if (
      healthResult.responseTime > thresholds.responseTime ||
      performanceMetrics.uptime < thresholds.uptime ||
      (performanceMetrics.cpuUsage && performanceMetrics.cpuUsage > thresholds.cpuUsage) ||
      (performanceMetrics.memoryUsage && performanceMetrics.memoryUsage > thresholds.memoryUsage)
    ) {
      return 'degraded'
    }

    // Check if deployment is healthy
    if (healthResult.status >= 200 && healthResult.status < 400) {
      return 'healthy'
    }

    return 'initializing'
  }

  /**
   * Save deployment status to database
   */
  private async saveDeploymentStatus(status: DeploymentStatus): Promise<void> {
    try {
      await supabase
        .from('deployment_statuses')
        .insert({
          id: status.id,
          client_id: status.clientId,
          deployment_id: status.deploymentId,
          status: status.status,
          url: status.url,
          version: status.version,
          timestamp: status.timestamp.toISOString(),
          metadata: status.metadata
        })
    } catch (error) {
      console.error('Failed to save deployment status:', error)
    }
  }

  /**
   * Check for alert conditions and create alerts
   */
  private async checkAndCreateAlerts(
    status: DeploymentStatus,
    thresholds: typeof this.alertThresholds
  ): Promise<void> {
    const alerts: Omit<DeploymentAlert, 'id'>[] = []

    // Performance alerts
    if (status.metadata.responseTime && status.metadata.responseTime > thresholds.responseTime) {
      alerts.push({
        deploymentId: status.deploymentId,
        type: 'performance',
        severity: status.metadata.responseTime > thresholds.responseTime * 2 ? 'high' : 'medium',
        message: `High response time detected: ${status.metadata.responseTime}ms`,
        details: { responseTime: status.metadata.responseTime, threshold: thresholds.responseTime },
        timestamp: new Date(),
        resolved: false
      })
    }

    // Availability alerts
    if (status.status === 'failed') {
      alerts.push({
        deploymentId: status.deploymentId,
        type: 'availability',
        severity: 'critical',
        message: 'Deployment is currently unavailable',
        details: { status: status.status },
        timestamp: new Date(),
        resolved: false
      })
    } else if (status.status === 'degraded') {
      alerts.push({
        deploymentId: status.deploymentId,
        type: 'performance',
        severity: 'medium',
        message: 'Deployment performance is degraded',
        details: { status: status.status },
        timestamp: new Date(),
        resolved: false
      })
    }

    // Error rate alerts
    if (status.metadata.errorCount && status.metadata.errorCount > 10) {
      alerts.push({
        deploymentId: status.deploymentId,
        type: 'error',
        severity: 'high',
        message: `High error count detected: ${status.metadata.errorCount}`,
        details: { errorCount: status.metadata.errorCount },
        timestamp: new Date(),
        resolved: false
      })
    }

    // Save alerts to database
    for (const alert of alerts) {
      await this.createAlert(alert)
    }
  }

  /**
   * Create and save alert
   */
  private async createAlert(alert: Omit<DeploymentAlert, 'id'>): Promise<void> {
    try {
      const alertWithId: DeploymentAlert = {
        ...alert,
        id: `alert_${alert.deploymentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      await supabase
        .from('deployment_alerts')
        .insert({
          id: alertWithId.id,
          deployment_id: alertWithId.deploymentId,
          type: alertWithId.type,
          severity: alertWithId.severity,
          message: alertWithId.message,
          details: alertWithId.details,
          timestamp: alertWithId.timestamp.toISOString(),
          resolved: alertWithId.resolved
        })

      console.log(`Created alert: ${alertWithId.message}`)
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  /**
   * Get deployment statuses with filtering
   */
  async getDeploymentStatuses(filters?: {
    clientId?: string
    deploymentId?: string
    status?: DeploymentStatus['status']
    since?: Date
    limit?: number
  }): Promise<DeploymentStatus[]> {
    try {
      let query = supabase
        .from('deployment_statuses')
        .select('*')
        .order('timestamp', { ascending: false })

      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId)
      }

      if (filters?.deploymentId) {
        query = query.eq('deployment_id', filters.deploymentId)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.since) {
        query = query.gte('timestamp', filters.since.toISOString())
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(row => ({
        id: row.id,
        clientId: row.client_id,
        deploymentId: row.deployment_id,
        status: row.status,
        url: row.url,
        version: row.version,
        timestamp: new Date(row.timestamp),
        metadata: row.metadata || {}
      }))
    } catch (error) {
      console.error('Failed to get deployment statuses:', error)
      return []
    }
  }

  /**
   * Get deployment alerts with filtering
   */
  async getDeploymentAlerts(filters?: {
    deploymentId?: string
    type?: DeploymentAlert['type']
    severity?: DeploymentAlert['severity']
    resolved?: boolean
    since?: Date
    limit?: number
  }): Promise<DeploymentAlert[]> {
    try {
      let query = supabase
        .from('deployment_alerts')
        .select('*')
        .order('timestamp', { ascending: false })

      if (filters?.deploymentId) {
        query = query.eq('deployment_id', filters.deploymentId)
      }

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      if (filters?.severity) {
        query = query.eq('severity', filters.severity)
      }

      if (filters?.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved)
      }

      if (filters?.since) {
        query = query.gte('timestamp', filters.since.toISOString())
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(row => ({
        id: row.id,
        deploymentId: row.deployment_id,
        type: row.type,
        severity: row.severity,
        message: row.message,
        details: row.details || {},
        timestamp: new Date(row.timestamp),
        resolved: row.resolved,
        resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined
      }))
    } catch (error) {
      console.error('Failed to get deployment alerts:', error)
      return []
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, resolution?: string): Promise<void> {
    try {
      await supabase
        .from('deployment_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolution: resolution
        })
        .eq('id', alertId)
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  /**
   * Get deployment summary metrics
   */
  async getDeploymentSummary(deploymentId: string): Promise<{
    currentStatus: DeploymentStatus['status']
    uptime24h: number
    avgResponseTime24h: number
    errorCount24h: number
    alertCount24h: number
    lastHealthCheck: Date
  }> {
    try {
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

      // Get recent statuses
      const statuses = await this.getDeploymentStatuses({
        deploymentId,
        since: since24h,
        limit: 100
      })

      // Get recent alerts
      const alerts = await this.getDeploymentAlerts({
        deploymentId,
        since: since24h
      })

      // Calculate metrics
      const healthyCount = statuses.filter(s => s.status === 'healthy').length
      const uptime24h = statuses.length > 0 ? healthyCount / statuses.length : 0

      const responseTimes = statuses
        .map(s => s.metadata.responseTime)
        .filter(rt => rt !== undefined) as number[]
      const avgResponseTime24h = responseTimes.length > 0
        ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
        : 0

      const errorCount24h = statuses.filter(s => s.status === 'failed').length
      const alertCount24h = alerts.length
      const currentStatus = statuses[0]?.status || 'initializing'
      const lastHealthCheck = statuses[0]?.timestamp || new Date()

      return {
        currentStatus,
        uptime24h,
        avgResponseTime24h,
        errorCount24h,
        alertCount24h,
        lastHealthCheck
      }
    } catch (error) {
      console.error('Failed to get deployment summary:', error)
      return {
        currentStatus: 'failed',
        uptime24h: 0,
        avgResponseTime24h: 0,
        errorCount24h: 1,
        alertCount24h: 0,
        lastHealthCheck: new Date()
      }
    }
  }
}

export const deploymentMonitor = new DeploymentMonitor()
export default deploymentMonitor