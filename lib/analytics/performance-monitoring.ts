/**
 * Performance Monitoring Library
 * 
 * Provides comprehensive performance monitoring, metrics tracking, and health monitoring
 * for development systems, applications, and infrastructure.
 */

import { EventEmitter } from 'events'

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: Date
  category: 'build' | 'test' | 'deployment' | 'runtime' | 'infrastructure'
  metadata?: Record<string, any>
  tags?: Record<string, string>
}

export interface PerformanceAlert {
  id: string
  metricId: string
  threshold: number
  currentValue: number
  severity: 'critical' | 'warning' | 'info'
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

export interface PerformanceHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  score: number
  components: {
    build: HealthStatus
    test: HealthStatus
    deployment: HealthStatus
    runtime: HealthStatus
    infrastructure: HealthStatus
  }
  alerts: PerformanceAlert[]
  recommendations: string[]
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical'
  score: number
  metrics: {
    availability: number
    performance: number
    reliability: number
  }
  lastChecked: Date
}

export interface PerformanceTrend {
  metric: string
  period: 'hourly' | 'daily' | 'weekly' | 'monthly'
  data: Array<{
    timestamp: Date
    value: number
    threshold?: number
  }>
  statistics: {
    average: number
    median: number
    p95: number
    p99: number
    min: number
    max: number
  }
  trend: 'improving' | 'degrading' | 'stable'
}

export interface SystemPerformanceReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalMetrics: number
    alertsGenerated: number
    criticalIssues: number
    performanceScore: number
  }
  topMetrics: PerformanceMetric[]
  criticalAlerts: PerformanceAlert[]
  trends: PerformanceTrend[]
  recommendations: Array<{
    id: string
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
    priority: number
  }>
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private alerts: Map<string, PerformanceAlert> = new Map()
  private thresholds: Map<string, { warning: number; critical: number }> = new Map()
  private healthChecks: Map<string, HealthStatus> = new Map()
  private monitoringInterval?: NodeJS.Timeout

  constructor() {
    super()
    this.initializeDefaultThresholds()
    this.startMonitoring()
  }

  /**
   * Add a performance metric
   */
  addMetric(metric: PerformanceMetric): void {
    const key = this.getMetricKey(metric.category, metric.name)
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const metrics = this.metrics.get(key)!
    metrics.push(metric)
    
    // Keep only last 1000 metrics per category to prevent memory issues
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000)
    }

    this.emit('metricAdded', metric)
    this.checkThresholds(metric)
    this.updateHealthStatus(metric)
  }

  /**
   * Get performance metrics for a specific category and time range
   */
  getMetrics(
    category: string, 
    name: string, 
    startDate?: Date, 
    endDate?: Date
  ): PerformanceMetric[] {
    const key = this.getMetricKey(category, name)
    let metrics = this.metrics.get(key) || []

    if (startDate || endDate) {
      metrics = metrics.filter(metric => {
        const metricDate = new Date(metric.timestamp)
        if (startDate && metricDate < startDate) return false
        if (endDate && metricDate > endDate) return false
        return true
      })
    }

    return metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * Get current system health status
   */
  getSystemHealth(): PerformanceHealth {
    const components = {
      build: this.healthChecks.get('build') || this.getDefaultHealthStatus(),
      test: this.healthChecks.get('test') || this.getDefaultHealthStatus(),
      deployment: this.healthChecks.get('deployment') || this.getDefaultHealthStatus(),
      runtime: this.healthChecks.get('runtime') || this.getDefaultHealthStatus(),
      infrastructure: this.healthChecks.get('infrastructure') || this.getDefaultHealthStatus()
    }

    const overallScore = Math.round(
      (components.build.score + components.test.score + components.deployment.score + 
       components.runtime.score + components.infrastructure.score) / 5
    )

    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy'
    if (overallScore < 70) overall = 'degraded'
    if (overallScore < 50) overall = 'critical'

    const alerts = Array.from(this.alerts.values()).filter(alert => !alert.resolved)
    const recommendations = this.generateHealthRecommendations(components, alerts)

    return {
      overall,
      score: overallScore,
      components,
      alerts,
      recommendations
    }
  }

  /**
   * Get performance trends for a specific metric
   */
  getPerformanceTrend(
    category: string, 
    name: string, 
    period: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): PerformanceTrend | null {
    const key = this.getMetricKey(category, name)
    const metrics = this.metrics.get(key) || []

    if (metrics.length === 0) return null

    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'hourly':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours
        break
      case 'daily':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days
        break
      case 'monthly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year
        break
    }

    const periodMetrics = metrics.filter(m => m.timestamp >= startDate)
    const values = periodMetrics.map(m => m.value)
    
    if (values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const median = sorted[Math.floor(sorted.length / 2)]
    const p95Index = Math.floor(sorted.length * 0.95)
    const p99Index = Math.floor(sorted.length * 0.99)
    
    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    
    let trend: 'improving' | 'degrading' | 'stable' = 'stable'
    if (secondAvg < firstAvg * 0.9) trend = 'improving' // Lower values are better for most metrics
    else if (secondAvg > firstAvg * 1.1) trend = 'degrading'

    const threshold = this.thresholds.get(key)
    const data = periodMetrics.map(metric => ({
      timestamp: metric.timestamp,
      value: metric.value,
      threshold: threshold?.warning
    }))

    return {
      metric: `${category}:${name}`,
      period,
      data,
      statistics: {
        average,
        median,
        p95: sorted[p95Index] || 0,
        p99: sorted[p99Index] || 0,
        min: Math.min(...values),
        max: Math.max(...values)
      },
      trend
    }
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(
    startDate: Date, 
    endDate: Date
  ): SystemPerformanceReport {
    const allMetrics = Array.from(this.metrics.values()).flat()
    const periodMetrics = allMetrics.filter(m => 
      m.timestamp >= startDate && m.timestamp <= endDate
    )

    const alerts = Array.from(this.alerts.values()).filter(alert =>
      alert.timestamp >= startDate && alert.timestamp <= endDate
    )

    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
    
    // Get top metrics by frequency
    const metricCounts = new Map<string, number>()
    periodMetrics.forEach(metric => {
      const key = this.getMetricKey(metric.category, metric.name)
      metricCounts.set(key, (metricCounts.get(key) || 0) + 1)
    })

    const topMetrics = Array.from(metricCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => {
        const [category, name] = key.split(':')
        const metrics = this.getMetrics(category, name, startDate, endDate)
        return metrics[metrics.length - 1] // Return most recent metric
      })
      .filter(Boolean)

    // Generate trends for key metrics
    const trends: PerformanceTrend[] = []
    const keyMetrics = ['build:time', 'test:coverage', 'deployment:frequency', 'runtime:response_time']
    
    keyMetrics.forEach(metricKey => {
      const [category, name] = metricKey.split(':')
      const trend = this.getPerformanceTrend(category, name, 'daily')
      if (trend) trends.push(trend)
    })

    // Generate recommendations
    const recommendations = this.generatePerformanceRecommendations(periodMetrics, alerts)

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalMetrics: periodMetrics.length,
        alertsGenerated: alerts.length,
        criticalIssues: criticalAlerts.length,
        performanceScore: this.calculateOverallPerformanceScore(periodMetrics)
      },
      topMetrics: topMetrics as PerformanceMetric[],
      criticalAlerts,
      trends,
      recommendations
    }
  }

  /**
   * Set threshold for a metric
   */
  setThreshold(
    category: string, 
    name: string, 
    warning: number, 
    critical: number
  ): void {
    const key = this.getMetricKey(category, name)
    this.thresholds.set(key, { warning, critical })
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved)
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      this.emit('alertResolved', alert)
    }
  }

  /**
   * Start monitoring (called automatically in constructor)
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks()
      this.emit('monitoringTick')
    }, 60000) // Check every minute
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
  }

  // Private helper methods

  private getMetricKey(category: string, name: string): string {
    return `${category}:${name}`
  }

  private initializeDefaultThresholds(): void {
    // Set default thresholds for common metrics
    this.setThreshold('build', 'time', 300, 600) // 5min warning, 10min critical
    this.setThreshold('test', 'coverage', 70, 50) // 70% warning, 50% critical
    this.setThreshold('deployment', 'frequency', 1, 0) // 1 per week warning, 0 critical
    this.setThreshold('runtime', 'response_time', 2000, 5000) // 2s warning, 5s critical
    this.setThreshold('infrastructure', 'cpu_usage', 80, 95) // 80% warning, 95% critical
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const key = this.getMetricKey(metric.category, metric.name)
    const threshold = this.thresholds.get(key)
    
    if (!threshold) return

    const { warning, critical } = threshold
    let severity: 'critical' | 'warning' | 'info' | null = null

    if (metric.value >= critical) {
      severity = 'critical'
    } else if (metric.value >= warning) {
      severity = 'warning'
    }

    if (severity) {
      const alert: PerformanceAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metricId: metric.id,
        threshold: severity === 'critical' ? critical : warning,
        currentValue: metric.value,
        severity,
        message: `${metric.name} is ${severity}: ${metric.value}${metric.unit} (threshold: ${severity === 'critical' ? critical : warning}${metric.unit})`,
        timestamp: new Date(),
        resolved: false
      }

      this.alerts.set(alert.id, alert)
      this.emit('alertGenerated', alert)
    }
  }

  private updateHealthStatus(metric: PerformanceMetric): void {
    const category = metric.category
    let healthStatus = this.healthChecks.get(category) || this.getDefaultHealthStatus()

    // Update health status based on metric
    if (category === 'build' && metric.name === 'time') {
      healthStatus.metrics.performance = metric.value < 300 ? 100 : Math.max(0, 100 - (metric.value / 300) * 100)
    } else if (category === 'test' && metric.name === 'coverage') {
      healthStatus.metrics.reliability = Math.min(100, metric.value * 1.25)
    } else if (category === 'runtime' && metric.name === 'response_time') {
      healthStatus.metrics.performance = metric.value < 1000 ? 100 : Math.max(0, 100 - (metric.value / 1000) * 100)
    }

    // Calculate overall score for this category
    healthStatus.score = Math.round(
      (healthStatus.metrics.availability + healthStatus.metrics.performance + healthStatus.metrics.reliability) / 3
    )

    // Update status
    if (healthStatus.score >= 80) healthStatus.status = 'healthy'
    else if (healthStatus.score >= 60) healthStatus.status = 'degraded'
    else healthStatus.status = 'critical'

    healthStatus.lastChecked = new Date()
    this.healthChecks.set(category, healthStatus)
  }

  private getDefaultHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      score: 85,
      metrics: {
        availability: 95,
        performance: 80,
        reliability: 80
      },
      lastChecked: new Date()
    }
  }

  private performHealthChecks(): void {
    // Simulate health checks for different components
    const components = ['build', 'test', 'deployment', 'runtime', 'infrastructure']
    
    components.forEach(component => {
      let healthStatus = this.healthChecks.get(component) || this.getDefaultHealthStatus()
      
      // Simulate some variation in health scores
      const variation = (Math.random() - 0.5) * 10
      healthStatus.score = Math.max(0, Math.min(100, healthStatus.score + variation))
      
      if (healthStatus.score >= 80) healthStatus.status = 'healthy'
      else if (healthStatus.score >= 60) healthStatus.status = 'degraded'
      else healthStatus.status = 'critical'

      healthStatus.lastChecked = new Date()
      this.healthChecks.set(component, healthStatus)
    })
  }

  private generateHealthRecommendations(
    components: any, 
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations = []

    if (components.build.status === 'degraded' || components.build.status === 'critical') {
      recommendations.push('Optimize build process to reduce build times')
    }
    if (components.test.status === 'degraded' || components.test.status === 'critical') {
      recommendations.push('Increase test coverage and improve test reliability')
    }
    if (components.runtime.status === 'degraded' || components.runtime.status === 'critical') {
      recommendations.push('Optimize application performance and response times')
    }
    if (alerts.length > 5) {
      recommendations.push('Review and adjust performance thresholds')
    }

    return recommendations
  }

  private generatePerformanceRecommendations(
    metrics: PerformanceMetric[], 
    alerts: PerformanceAlert[]
  ): Array<{
    id: string
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
    priority: number
  }> {
    const recommendations = []

    // Analyze build performance
    const buildMetrics = metrics.filter(m => m.category === 'build')
    const avgBuildTime = buildMetrics.length > 0 ? 
      buildMetrics.reduce((sum, m) => sum + m.value, 0) / buildMetrics.length : 0

    if (avgBuildTime > 300) {
      recommendations.push({
        id: 'perf-build-001',
        title: 'Optimize Build Performance',
        description: `Average build time is ${avgBuildTime.toFixed(1)}s, consider optimizing build process`,
        impact: 'high' as const,
        effort: 'medium' as const,
        priority: 1
      })
    }

    // Analyze test coverage
    const testMetrics = metrics.filter(m => m.category === 'test' && m.name === 'coverage')
    const avgTestCoverage = testMetrics.length > 0 ? 
      testMetrics.reduce((sum, m) => sum + m.value, 0) / testMetrics.length : 0

    if (avgTestCoverage < 80) {
      recommendations.push({
        id: 'perf-test-001',
        title: 'Improve Test Coverage',
        description: `Test coverage is ${avgTestCoverage.toFixed(1)}%, aim for 80%+ coverage`,
        impact: 'medium' as const,
        effort: 'high' as const,
        priority: 2
      })
    }

    // Analyze runtime performance
    const runtimeMetrics = metrics.filter(m => m.category === 'runtime')
    const avgResponseTime = runtimeMetrics.length > 0 ? 
      runtimeMetrics.reduce((sum, m) => sum + m.value, 0) / runtimeMetrics.length : 0

    if (avgResponseTime > 1000) {
      recommendations.push({
        id: 'perf-runtime-001',
        title: 'Optimize Runtime Performance',
        description: `Average response time is ${avgResponseTime.toFixed(1)}ms, optimize for better performance`,
        impact: 'high' as const,
        effort: 'high' as const,
        priority: 1
      })
    }

    return recommendations.sort((a, b) => a.priority - b.priority)
  }

  private calculateOverallPerformanceScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0

    const categories = ['build', 'test', 'deployment', 'runtime', 'infrastructure']
    const categoryScores: number[] = []

    categories.forEach(category => {
      const categoryMetrics = metrics.filter(m => m.category === category)
      if (categoryMetrics.length > 0) {
        // Calculate score based on metric values and thresholds
        let categoryScore = 100
        
        categoryMetrics.forEach(metric => {
          const key = this.getMetricKey(metric.category, metric.name)
          const threshold = this.thresholds.get(key)
          
          if (threshold) {
            const { warning } = threshold
            const ratio = metric.value / warning
            const metricScore = Math.max(0, 100 - (ratio - 1) * 50)
            categoryScore = Math.min(categoryScore, metricScore)
          }
        })
        
        categoryScores.push(categoryScore)
      }
    })

    return categoryScores.length > 0 ? 
      Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length) : 0
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()
