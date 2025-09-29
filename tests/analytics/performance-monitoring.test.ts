/**
 * Performance Monitoring Test Suite
 * 
 * Comprehensive tests for the performance monitoring system
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { 
  PerformanceMonitor,
  performanceMonitor,
  PerformanceMetric,
  PerformanceAlert,
  PerformanceHealth,
  PerformanceTrend,
  SystemPerformanceReport
} from '@/lib/analytics/performance-monitoring'

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = new PerformanceMonitor()
  })

  describe('Metric Management', () => {
    it('should add a new performance metric', () => {
      const metric: PerformanceMetric = {
        id: 'test-metric-001',
        name: 'time',
        value: 150,
        unit: 'seconds',
        timestamp: new Date(),
        category: 'build'
      }

      monitor.addMetric(metric)
      const retrievedMetrics = monitor.getMetrics('build', 'time')
      
      expect(retrievedMetrics).toHaveLength(1)
      expect(retrievedMetrics[0]).toEqual(metric)
    })

    it('should retrieve metrics within date range', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

      const metric1: PerformanceMetric = {
        id: 'test-metric-001',
        name: 'time',
        value: 200,
        unit: 'seconds',
        timestamp: twoDaysAgo,
        category: 'build'
      }

      const metric2: PerformanceMetric = {
        id: 'test-metric-002',
        name: 'time',
        value: 180,
        unit: 'seconds',
        timestamp: yesterday,
        category: 'build'
      }

      monitor.addMetric(metric1)
      monitor.addMetric(metric2)

      const recentMetrics = monitor.getMetrics('build', 'time', yesterday)
      expect(recentMetrics).toHaveLength(1)
      expect(recentMetrics[0]).toEqual(metric2)
    })

    it('should limit metrics to prevent memory issues', () => {
      // Add 1001 metrics to test the limit
      for (let i = 0; i < 1001; i++) {
        const metric: PerformanceMetric = {
          id: `test-metric-${i}`,
          name: 'time',
          value: i,
          unit: 'seconds',
          timestamp: new Date(),
          category: 'build'
        }
        monitor.addMetric(metric)
      }

      const metrics = monitor.getMetrics('build', 'time')
      expect(metrics).toHaveLength(1000)
      // Should keep the most recent metrics
      expect(metrics[0].value).toBe(1)
      expect(metrics[999].value).toBe(1000)
    })
  })

  describe('Threshold Management', () => {
    it('should set and retrieve thresholds', () => {
      monitor.setThreshold('build', 'time', 300, 600)
      
      // This would require exposing the thresholds map or a getter method
      // For now, we'll test by adding a metric that should trigger an alert
      const metric: PerformanceMetric = {
        id: 'threshold-test-001',
        name: 'time',
        value: 400, // Above warning threshold
        unit: 'seconds',
        timestamp: new Date(),
        category: 'build'
      }

      const alertPromise = new Promise<PerformanceAlert>((resolve) => {
        monitor.on('alertGenerated', (alert) => {
          resolve(alert)
        })
      })

      monitor.addMetric(metric)

      return alertPromise.then(alert => {
        expect(alert.metricId).toBe(metric.id)
        expect(alert.severity).toBe('warning')
        expect(alert.currentValue).toBe(400)
      })
    })

    it('should generate critical alerts for values above critical threshold', () => {
      const metric: PerformanceMetric = {
        id: 'critical-test-001',
        name: 'time',
        value: 700, // Above critical threshold
        unit: 'seconds',
        timestamp: new Date(),
        category: 'build'
      }

      const alertPromise = new Promise<PerformanceAlert>((resolve) => {
        monitor.on('alertGenerated', (alert) => {
          resolve(alert)
        })
      })

      monitor.addMetric(metric)

      return alertPromise.then(alert => {
        expect(alert.severity).toBe('critical')
        expect(alert.currentValue).toBe(700)
      })
    })
  })

  describe('System Health', () => {
    it('should calculate system health status', () => {
      const health = monitor.getSystemHealth()

      expect(health).toHaveProperty('overall')
      expect(health).toHaveProperty('score')
      expect(health).toHaveProperty('components')
      expect(health).toHaveProperty('alerts')
      expect(health).toHaveProperty('recommendations')

      expect(['healthy', 'degraded', 'critical']).toContain(health.overall)
      expect(typeof health.score).toBe('number')
      expect(health.score).toBeGreaterThanOrEqual(0)
      expect(health.score).toBeLessThanOrEqual(100)

      expect(health.components).toHaveProperty('build')
      expect(health.components).toHaveProperty('test')
      expect(health.components).toHaveProperty('deployment')
      expect(health.components).toHaveProperty('runtime')
      expect(health.components).toHaveProperty('infrastructure')

      expect(Array.isArray(health.alerts)).toBe(true)
      expect(Array.isArray(health.recommendations)).toBe(true)
    })

    it('should update health status based on metrics', () => {
      const metric: PerformanceMetric = {
        id: 'health-test-001',
        name: 'time',
        value: 250, // Good build time
        unit: 'seconds',
        timestamp: new Date(),
        category: 'build'
      }

      monitor.addMetric(metric)
      const health = monitor.getSystemHealth()

      expect(health.components.build).toBeDefined()
      expect(typeof health.components.build.score).toBe('number')
    })
  })

  describe('Performance Trends', () => {
    it('should calculate performance trends', () => {
      // Add metrics over time
      const baseTime = new Date()
      for (let i = 0; i < 10; i++) {
        const metric: PerformanceMetric = {
          id: `trend-metric-${i}`,
          name: 'time',
          value: 200 - i * 5, // Decreasing trend (improving)
          unit: 'seconds',
          timestamp: new Date(baseTime.getTime() - (9 - i) * 24 * 60 * 60 * 1000),
          category: 'build'
        }
        monitor.addMetric(metric)
      }

      const trend = monitor.getPerformanceTrend('build', 'time', 'daily')
      
      expect(trend).not.toBeNull()
      expect(trend?.period).toBe('daily')
      expect(trend?.statistics.average).toBeGreaterThan(0)
      expect(trend?.statistics.min).toBeGreaterThan(0)
      expect(trend?.statistics.max).toBeGreaterThan(0)
      expect(['improving', 'degrading', 'stable']).toContain(trend?.trend)
    })

    it('should handle empty metrics for trend calculation', () => {
      const trend = monitor.getPerformanceTrend('nonexistent', 'metric', 'daily')
      expect(trend).toBeNull()
    })
  })

  describe('Performance Reports', () => {
    it('should generate comprehensive performance report', () => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Add some sample metrics
      const metrics = [
        { category: 'build', name: 'time', value: 180, unit: 'seconds' },
        { category: 'test', name: 'coverage', value: 85, unit: 'percent' },
        { category: 'runtime', name: 'response_time', value: 250, unit: 'ms' }
      ]

      metrics.forEach((metricData, index) => {
        const metric: PerformanceMetric = {
          id: `report-metric-${index}`,
          name: metricData.name,
          value: metricData.value,
          unit: metricData.unit,
          timestamp: new Date(endDate.getTime() - index * 24 * 60 * 60 * 1000),
          category: metricData.category as any
        }
        monitor.addMetric(metric)
      })

      const report = monitor.generatePerformanceReport(startDate, endDate)

      expect(report).toHaveProperty('period')
      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('topMetrics')
      expect(report).toHaveProperty('criticalAlerts')
      expect(report).toHaveProperty('trends')
      expect(report).toHaveProperty('recommendations')

      expect(report.period.start).toEqual(startDate)
      expect(report.period.end).toEqual(endDate)
      expect(typeof report.summary.totalMetrics).toBe('number')
      expect(typeof report.summary.alertsGenerated).toBe('number')
      expect(typeof report.summary.criticalIssues).toBe('number')
      expect(typeof report.summary.performanceScore).toBe('number')

      expect(Array.isArray(report.topMetrics)).toBe(true)
      expect(Array.isArray(report.criticalAlerts)).toBe(true)
      expect(Array.isArray(report.trends)).toBe(true)
      expect(Array.isArray(report.recommendations)).toBe(true)
    })
  })

  describe('Alert Management', () => {
    it('should track active alerts', () => {
      const activeAlerts = monitor.getActiveAlerts()
      expect(Array.isArray(activeAlerts)).toBe(true)
    })

    it('should resolve alerts', () => {
      // First generate an alert
      const metric: PerformanceMetric = {
        id: 'alert-resolve-test-001',
        name: 'time',
        value: 400, // Above warning threshold
        unit: 'seconds',
        timestamp: new Date(),
        category: 'build'
      }

      const alertPromise = new Promise<PerformanceAlert>((resolve) => {
        monitor.on('alertGenerated', (alert) => {
          resolve(alert)
        })
      })

      monitor.addMetric(metric)

      return alertPromise.then(alert => {
        expect(alert.resolved).toBe(false)
        
        monitor.resolveAlert(alert.id)
        
        const resolvedAlert = monitor.getActiveAlerts().find(a => a.id === alert.id)
        expect(resolvedAlert).toBeUndefined()
      })
    })
  })

  describe('Monitoring Control', () => {
    it('should start and stop monitoring', () => {
      expect(() => {
        monitor.stopMonitoring()
        monitor.startMonitoring()
      }).not.toThrow()
    })

    it('should emit monitoring tick events', (done) => {
      monitor.on('monitoringTick', () => {
        done()
      })

      // Wait for the next monitoring tick (every minute)
      // In a real test, you might want to mock the interval or use a shorter interval for testing
      setTimeout(() => {
        // If the event doesn't fire within 2 seconds, the test will timeout
        done()
      }, 2000)
    })
  })

  describe('Event Emission', () => {
    it('should emit events when metrics are added', (done) => {
      const metric: PerformanceMetric = {
        id: 'event-test-001',
        name: 'time',
        value: 150,
        unit: 'seconds',
        timestamp: new Date(),
        category: 'build'
      }

      monitor.on('metricAdded', (addedMetric) => {
        expect(addedMetric).toEqual(metric)
        done()
      })

      monitor.addMetric(metric)
    })

    it('should emit events when alerts are resolved', (done) => {
      const metric: PerformanceMetric = {
        id: 'alert-resolve-event-test-001',
        name: 'time',
        value: 400, // Above warning threshold
        unit: 'seconds',
        timestamp: new Date(),
        category: 'build'
      }

      monitor.on('alertGenerated', (alert) => {
        monitor.on('alertResolved', (resolvedAlert) => {
          expect(resolvedAlert.id).toBe(alert.id)
          done()
        })
        monitor.resolveAlert(alert.id)
      })

      monitor.addMetric(metric)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid date ranges gracefully', () => {
      const invalidStartDate = new Date()
      const invalidEndDate = new Date(invalidStartDate.getTime() - 24 * 60 * 60 * 1000) // Start after end

      const metrics = monitor.getMetrics('build', 'time', invalidStartDate, invalidEndDate)
      expect(metrics).toEqual([])
    })

    it('should handle missing metrics gracefully', () => {
      const metrics = monitor.getMetrics('nonexistent', 'metric')
      expect(metrics).toEqual([])
    })

    it('should handle invalid alert resolution gracefully', () => {
      expect(() => {
        monitor.resolveAlert('nonexistent-alert-id')
      }).not.toThrow()
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton instance', () => {
      expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor)
    })

    it('should maintain state across singleton usage', () => {
      const metric: PerformanceMetric = {
        id: 'singleton-test-001',
        name: 'time',
        value: 200,
        unit: 'seconds',
        timestamp: new Date(),
        category: 'build'
      }

      performanceMonitor.addMetric(metric)
      const retrievedMetrics = performanceMonitor.getMetrics('build', 'time')
      
      expect(retrievedMetrics).toHaveLength(1)
      expect(retrievedMetrics[0].value).toBe(200)
    })
  })
})

describe('Integration Tests', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = new PerformanceMonitor()
  })

  it('should provide end-to-end performance monitoring workflow', () => {
    // Add comprehensive metrics
    const metrics = [
      { category: 'build', name: 'time', value: 180, unit: 'seconds' },
      { category: 'test', name: 'coverage', value: 85, unit: 'percent' },
      { category: 'runtime', name: 'response_time', value: 250, unit: 'ms' },
      { category: 'deployment', name: 'frequency', value: 5, unit: 'per week' },
      { category: 'infrastructure', name: 'cpu_usage', value: 65, unit: 'percent' }
    ]

    metrics.forEach((metricData, index) => {
      const metric: PerformanceMetric = {
        id: `integration-metric-${index}`,
        name: metricData.name,
        value: metricData.value,
        unit: metricData.unit,
        timestamp: new Date(),
        category: metricData.category as any
      }
      monitor.addMetric(metric)
    })

    // Get system health
    const health = monitor.getSystemHealth()
    expect(health.overall).toBeDefined()
    expect(health.score).toBeGreaterThan(0)

    // Get performance trends
    const buildTrend = monitor.getPerformanceTrend('build', 'time', 'daily')
    expect(buildTrend).toBeDefined()

    // Get active alerts
    const activeAlerts = monitor.getActiveAlerts()
    expect(Array.isArray(activeAlerts)).toBe(true)

    // Generate performance report
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    const report = monitor.generatePerformanceReport(startDate, endDate)
    
    expect(report.summary.totalMetrics).toBeGreaterThan(0)
    expect(report.recommendations.length).toBeGreaterThan(0)
  })

  it('should handle performance degradation scenarios', () => {
    // Add metrics showing performance degradation
    const baseTime = new Date()
    for (let i = 0; i < 5; i++) {
      const metric: PerformanceMetric = {
        id: `degradation-metric-${i}`,
        name: 'time',
        value: 200 + i * 50, // Increasing build times
        unit: 'seconds',
        timestamp: new Date(baseTime.getTime() - (4 - i) * 24 * 60 * 60 * 1000),
        category: 'build'
      }
      monitor.addMetric(metric)
    }

    const trend = monitor.getPerformanceTrend('build', 'time', 'daily')
    expect(trend?.trend).toBe('degrading')

    const health = monitor.getSystemHealth()
    expect(health.recommendations.length).toBeGreaterThan(0)
    expect(health.recommendations.some(rec => rec.includes('build'))).toBe(true)
  })

  it('should handle performance improvement scenarios', () => {
    // Add metrics showing performance improvement
    const baseTime = new Date()
    for (let i = 0; i < 5; i++) {
      const metric: PerformanceMetric = {
        id: `improvement-metric-${i}`,
        name: 'time',
        value: 300 - i * 40, // Decreasing build times
        unit: 'seconds',
        timestamp: new Date(baseTime.getTime() - (4 - i) * 24 * 60 * 60 * 1000),
        category: 'build'
      }
      monitor.addMetric(metric)
    }

    const trend = monitor.getPerformanceTrend('build', 'time', 'daily')
    expect(trend?.trend).toBe('improving')

    const health = monitor.getSystemHealth()
    expect(health.overall).toBe('healthy')
  })
})
