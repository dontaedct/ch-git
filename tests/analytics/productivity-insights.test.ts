/**
 * Productivity Insights Test Suite
 * 
 * Comprehensive tests for the productivity insights analysis system
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { 
  ProductivityInsightsAnalyzer,
  productivityInsights,
  ProductivityMetric,
  ProductivityScore,
  ProductivityInsight,
  TeamProductivityAnalysis
} from '@/lib/analytics/productivity-insights'

describe('ProductivityInsightsAnalyzer', () => {
  let analyzer: ProductivityInsightsAnalyzer

  beforeEach(() => {
    analyzer = new ProductivityInsightsAnalyzer()
  })

  describe('Metric Management', () => {
    it('should add a new productivity metric', () => {
      const metric: ProductivityMetric = {
        id: 'test-metric-001',
        name: 'count',
        value: 10,
        unit: 'commits',
        timestamp: new Date(),
        category: 'commit'
      }

      analyzer.addMetric(metric)
      const retrievedMetrics = analyzer.getMetrics('commit', 'count')
      
      expect(retrievedMetrics).toHaveLength(1)
      expect(retrievedMetrics[0]).toEqual(metric)
    })

    it('should retrieve metrics within date range', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

      const metric1: ProductivityMetric = {
        id: 'test-metric-001',
        name: 'count',
        value: 5,
        unit: 'commits',
        timestamp: twoDaysAgo,
        category: 'commit'
      }

      const metric2: ProductivityMetric = {
        id: 'test-metric-002',
        name: 'count',
        value: 8,
        unit: 'commits',
        timestamp: yesterday,
        category: 'commit'
      }

      analyzer.addMetric(metric1)
      analyzer.addMetric(metric2)

      const recentMetrics = analyzer.getMetrics('commit', 'count', yesterday)
      expect(recentMetrics).toHaveLength(1)
      expect(recentMetrics[0]).toEqual(metric2)
    })

    it('should limit metrics to prevent memory issues', () => {
      // Add 1001 metrics to test the limit
      for (let i = 0; i < 1001; i++) {
        const metric: ProductivityMetric = {
          id: `test-metric-${i}`,
          name: 'count',
          value: i,
          unit: 'commits',
          timestamp: new Date(),
          category: 'commit'
        }
        analyzer.addMetric(metric)
      }

      const metrics = analyzer.getMetrics('commit', 'count')
      expect(metrics).toHaveLength(1000)
      // Should keep the most recent metrics
      expect(metrics[0].value).toBe(1)
      expect(metrics[999].value).toBe(1000)
    })
  })

  describe('Productivity Score Calculation', () => {
    it('should calculate productivity score for a developer', () => {
      const developerId = 'dev-001'
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Add sample metrics
      const commitMetric: ProductivityMetric = {
        id: 'commit-001',
        name: 'count',
        value: 50,
        unit: 'commits',
        timestamp: endDate,
        category: 'commit'
      }

      const reviewMetric: ProductivityMetric = {
        id: 'review-001',
        name: 'time',
        value: 1.5,
        unit: 'hours',
        timestamp: endDate,
        category: 'review'
      }

      analyzer.addMetric(commitMetric)
      analyzer.addMetric(reviewMetric)

      const score = analyzer.calculateProductivityScore(developerId, startDate, endDate)

      expect(score).toHaveProperty('overall')
      expect(score).toHaveProperty('breakdown')
      expect(score).toHaveProperty('trend')
      expect(score).toHaveProperty('recommendations')
      expect(score).toHaveProperty('benchmark')

      expect(typeof score.overall).toBe('number')
      expect(score.overall).toBeGreaterThanOrEqual(0)
      expect(score.overall).toBeLessThanOrEqual(100)

      expect(score.breakdown).toHaveProperty('activity')
      expect(score.breakdown).toHaveProperty('efficiency')
      expect(score.breakdown).toHaveProperty('quality')
      expect(score.breakdown).toHaveProperty('collaboration')

      expect(['improving', 'declining', 'stable']).toContain(score.trend)
    })

    it('should handle empty metrics gracefully', () => {
      const developerId = 'dev-001'
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

      const score = analyzer.calculateProductivityScore(developerId, startDate, endDate)

      expect(score.overall).toBeGreaterThanOrEqual(0)
      expect(score.overall).toBeLessThanOrEqual(100)
      expect(score.trend).toBe('stable')
    })
  })

  describe('Insight Generation', () => {
    it('should generate productivity insights', () => {
      const developerId = 'dev-001'
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

      const insights = analyzer.generateInsights(developerId, startDate, endDate)

      expect(Array.isArray(insights)).toBe(true)
      
      insights.forEach(insight => {
        expect(insight).toHaveProperty('id')
        expect(insight).toHaveProperty('type')
        expect(insight).toHaveProperty('title')
        expect(insight).toHaveProperty('description')
        expect(insight).toHaveProperty('confidence')
        expect(insight).toHaveProperty('impact')
        expect(insight).toHaveProperty('actionable')
        expect(insight).toHaveProperty('suggestions')
        expect(insight).toHaveProperty('relatedMetrics')
        expect(insight).toHaveProperty('timeframe')

        expect(['pattern', 'anomaly', 'opportunity', 'warning']).toContain(insight.type)
        expect(['high', 'medium', 'low']).toContain(insight.impact)
        expect(typeof insight.confidence).toBe('number')
        expect(insight.confidence).toBeGreaterThanOrEqual(0)
        expect(insight.confidence).toBeLessThanOrEqual(100)
        expect(typeof insight.actionable).toBe('boolean')
        expect(Array.isArray(insight.suggestions)).toBe(true)
        expect(Array.isArray(insight.relatedMetrics)).toBe(true)
      })
    })
  })

  describe('Team Analysis', () => {
    it('should analyze team productivity', () => {
      const teamId = 'team-001'
      const period = new Date()

      const analysis = analyzer.analyzeTeamProductivity(teamId, period)

      expect(analysis).toHaveProperty('teamId')
      expect(analysis).toHaveProperty('period')
      expect(analysis).toHaveProperty('individualScores')
      expect(analysis).toHaveProperty('teamScore')
      expect(analysis).toHaveProperty('collaborationMetrics')
      expect(analysis).toHaveProperty('bottlenecks')
      expect(analysis).toHaveProperty('opportunities')

      expect(analysis.teamId).toBe(teamId)
      expect(analysis.period).toBe(period)
      expect(typeof analysis.teamScore.overall).toBe('number')
      expect(Array.isArray(analysis.bottlenecks)).toBe(true)
      expect(Array.isArray(analysis.opportunities)).toBe(true)
    })
  })

  describe('Recommendations', () => {
    it('should generate recommendations based on productivity score', () => {
      const developerId = 'dev-001'
      const context = { team: 'team-001', project: 'project-001' }

      const recommendations = analyzer.getRecommendations(developerId, context)

      expect(Array.isArray(recommendations)).toBe(true)

      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('id')
        expect(rec).toHaveProperty('title')
        expect(rec).toHaveProperty('description')
        expect(rec).toHaveProperty('category')
        expect(rec).toHaveProperty('priority')
        expect(rec).toHaveProperty('impact')
        expect(rec).toHaveProperty('effort')
        expect(rec).toHaveProperty('confidence')
        expect(rec).toHaveProperty('estimatedImprovement')
        expect(rec).toHaveProperty('implementationSteps')

        expect(['productivity', 'efficiency', 'quality', 'collaboration']).toContain(rec.category)
        expect(['high', 'medium', 'low']).toContain(rec.priority)
        expect(['high', 'medium', 'low']).toContain(rec.impact)
        expect(['high', 'medium', 'low']).toContain(rec.effort)
        expect(typeof rec.confidence).toBe('number')
        expect(rec.confidence).toBeGreaterThanOrEqual(0)
        expect(rec.confidence).toBeLessThanOrEqual(100)
        expect(Array.isArray(rec.implementationSteps)).toBe(true)
      })
    })
  })

  describe('Event Emission', () => {
    it('should emit events when metrics are added', (done) => {
      const metric: ProductivityMetric = {
        id: 'test-metric-001',
        name: 'count',
        value: 10,
        unit: 'commits',
        timestamp: new Date(),
        category: 'commit'
      }

      analyzer.on('metricAdded', (addedMetric) => {
        expect(addedMetric).toEqual(metric)
        done()
      })

      analyzer.addMetric(metric)
    })
  })

  describe('Trend Calculation', () => {
    it('should calculate trends for different periods', () => {
      // Add metrics over time
      const baseTime = new Date()
      for (let i = 0; i < 10; i++) {
        const metric: ProductivityMetric = {
          id: `trend-metric-${i}`,
          name: 'count',
          value: 10 + i, // Increasing trend
          unit: 'commits',
          timestamp: new Date(baseTime.getTime() - (9 - i) * 24 * 60 * 60 * 1000),
          category: 'commit'
        }
        analyzer.addMetric(metric)
      }

      const dailyTrend = analyzer.calculateTrend('commit', 'count', 'daily')
      expect(dailyTrend).not.toBeNull()
      expect(dailyTrend?.period).toBe('daily')
      expect(dailyTrend?.aggregatedData.trend).toBe('up')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid date ranges gracefully', () => {
      const developerId = 'dev-001'
      const invalidStartDate = new Date()
      const invalidEndDate = new Date(invalidStartDate.getTime() - 24 * 60 * 60 * 1000) // Start after end

      expect(() => {
        analyzer.calculateProductivityScore(developerId, invalidStartDate, invalidEndDate)
      }).not.toThrow()
    })

    it('should handle missing metrics gracefully', () => {
      const metrics = analyzer.getMetrics('nonexistent', 'metric')
      expect(metrics).toEqual([])
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton instance', () => {
      expect(productivityInsights).toBeInstanceOf(ProductivityInsightsAnalyzer)
    })

    it('should maintain state across singleton usage', () => {
      const metric: ProductivityMetric = {
        id: 'singleton-test-001',
        name: 'count',
        value: 15,
        unit: 'commits',
        timestamp: new Date(),
        category: 'commit'
      }

      productivityInsights.addMetric(metric)
      const retrievedMetrics = productivityInsights.getMetrics('commit', 'count')
      
      expect(retrievedMetrics).toHaveLength(1)
      expect(retrievedMetrics[0].value).toBe(15)
    })
  })
})

describe('Integration Tests', () => {
  let analyzer: ProductivityInsightsAnalyzer

  beforeEach(() => {
    analyzer = new ProductivityInsightsAnalyzer()
  })

  it('should provide end-to-end productivity analysis workflow', () => {
    const developerId = 'dev-001'
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Add comprehensive metrics
    const metrics = [
      { category: 'commit', name: 'count', value: 45, unit: 'commits' },
      { category: 'commit', name: 'count', value: 52, unit: 'commits' },
      { category: 'review', name: 'time', value: 2.1, unit: 'hours' },
      { category: 'review', name: 'time', value: 1.8, unit: 'hours' },
      { category: 'deployment', name: 'frequency', value: 6, unit: 'per week' },
      { category: 'testing', name: 'coverage', value: 85, unit: 'percent' }
    ]

    metrics.forEach((metricData, index) => {
      const metric: ProductivityMetric = {
        id: `integration-metric-${index}`,
        name: metricData.name,
        value: metricData.value,
        unit: metricData.unit,
        timestamp: new Date(endDate.getTime() - (5 - index) * 24 * 60 * 60 * 1000),
        category: metricData.category as any
      }
      analyzer.addMetric(metric)
    })

    // Calculate productivity score
    const score = analyzer.calculateProductivityScore(developerId, startDate, endDate)
    expect(score.overall).toBeGreaterThan(0)

    // Generate insights
    const insights = analyzer.generateInsights(developerId, startDate, endDate)
    expect(insights.length).toBeGreaterThan(0)

    // Get recommendations
    const recommendations = analyzer.getRecommendations(developerId)
    expect(recommendations.length).toBeGreaterThan(0)

    // Verify all components work together
    expect(score.recommendations.length).toBeGreaterThan(0)
    expect(insights.some(insight => insight.actionable)).toBe(true)
    expect(recommendations.some(rec => rec.confidence > 80)).toBe(true)
  })

  it('should handle team productivity analysis with multiple developers', () => {
    const teamId = 'team-001'
    const period = new Date()

    // Mock team members and their metrics
    const teamMembers = ['dev-001', 'dev-002', 'dev-003']
    
    teamMembers.forEach((memberId, memberIndex) => {
      for (let i = 0; i < 5; i++) {
        const metric: ProductivityMetric = {
          id: `team-metric-${memberId}-${i}`,
          name: 'count',
          value: 20 + memberIndex * 10 + i,
          unit: 'commits',
          timestamp: new Date(period.getTime() - i * 24 * 60 * 60 * 1000),
          category: 'commit'
        }
        analyzer.addMetric(metric)
      }
    })

    const analysis = analyzer.analyzeTeamProductivity(teamId, period)

    expect(analysis.teamScore.overall).toBeGreaterThan(0)
    expect(Object.keys(analysis.individualScores).length).toBeGreaterThan(0)
    expect(analysis.collaborationMetrics.codeReviewParticipation).toBeGreaterThan(0)
    expect(Array.isArray(analysis.bottlenecks)).toBe(true)
    expect(Array.isArray(analysis.opportunities)).toBe(true)
  })
})
