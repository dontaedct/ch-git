/**
 * Productivity Insights Analysis Library
 * 
 * Provides comprehensive productivity analysis, metrics tracking, and trend analysis
 * for development teams and individual developers.
 */

import { EventEmitter } from 'events'

export interface ProductivityMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: Date
  category: 'commit' | 'review' | 'deployment' | 'testing' | 'build'
  metadata?: Record<string, any>
}

export interface ProductivityTrend {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  metrics: ProductivityMetric[]
  aggregatedData: {
    average: number
    median: number
    min: number
    max: number
    trend: 'up' | 'down' | 'stable'
    changePercentage: number
  }
}

export interface ProductivityScore {
  overall: number
  breakdown: {
    activity: number
    efficiency: number
    quality: number
    collaboration: number
  }
  trend: 'improving' | 'declining' | 'stable'
  recommendations: string[]
  benchmark: {
    teamAverage: number
    industryAverage: number
    percentile: number
  }
}

export interface ProductivityInsight {
  id: string
  type: 'pattern' | 'anomaly' | 'opportunity' | 'warning'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  suggestions: string[]
  relatedMetrics: string[]
  timeframe: {
    start: Date
    end: Date
  }
}

export interface TeamProductivityAnalysis {
  teamId: string
  period: Date
  individualScores: Record<string, ProductivityScore>
  teamScore: ProductivityScore
  collaborationMetrics: {
    codeReviewParticipation: number
    crossTeamCollaboration: number
    knowledgeSharing: number
  }
  bottlenecks: string[]
  opportunities: string[]
}

export class ProductivityInsightsAnalyzer extends EventEmitter {
  private metrics: Map<string, ProductivityMetric[]> = new Map()
  private trends: Map<string, ProductivityTrend> = new Map()
  private insights: Map<string, ProductivityInsight> = new Map()
  private teamAnalysis: Map<string, TeamProductivityAnalysis> = new Map()

  constructor() {
    super()
    this.initializeDefaultMetrics()
  }

  /**
   * Add a new productivity metric
   */
  addMetric(metric: ProductivityMetric): void {
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
    this.updateTrends(key, metrics)
  }

  /**
   * Get productivity metrics for a specific category and time range
   */
  getMetrics(
    category: string, 
    name: string, 
    startDate?: Date, 
    endDate?: Date
  ): ProductivityMetric[] {
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
   * Calculate productivity trends for a specific metric
   */
  calculateTrend(
    category: string, 
    name: string, 
    period: 'daily' | 'weekly' | 'monthly'
  ): ProductivityTrend | null {
    const key = this.getTrendKey(category, name, period)
    return this.trends.get(key) || null
  }

  /**
   * Calculate comprehensive productivity score for a developer or team
   */
  calculateProductivityScore(
    developerId: string, 
    startDate: Date, 
    endDate: Date
  ): ProductivityScore {
    const commitMetrics = this.getMetrics('commit', 'count', startDate, endDate)
    const reviewMetrics = this.getMetrics('review', 'time', startDate, endDate)
    const deploymentMetrics = this.getMetrics('deployment', 'frequency', startDate, endDate)
    const testingMetrics = this.getMetrics('testing', 'coverage', startDate, endDate)

    // Calculate activity score (commits, deployments)
    const activityScore = this.calculateActivityScore(commitMetrics, deploymentMetrics)
    
    // Calculate efficiency score (review time, build time)
    const efficiencyScore = this.calculateEfficiencyScore(reviewMetrics)
    
    // Calculate quality score (test coverage, code review participation)
    const qualityScore = this.calculateQualityScore(testingMetrics, reviewMetrics)
    
    // Calculate collaboration score (code reviews given/received)
    const collaborationScore = this.calculateCollaborationScore(reviewMetrics)

    const overall = Math.round((activityScore + efficiencyScore + qualityScore + collaborationScore) / 4)
    
    const breakdown = {
      activity: activityScore,
      efficiency: efficiencyScore,
      quality: qualityScore,
      collaboration: collaborationScore
    }

    const trend = this.determineTrend(commitMetrics)
    const recommendations = this.generateRecommendations(breakdown, trend)

    return {
      overall,
      breakdown,
      trend,
      recommendations,
      benchmark: {
        teamAverage: 75, // This would be calculated from actual team data
        industryAverage: 70,
        percentile: Math.min(100, Math.max(0, (overall / 100) * 100))
      }
    }
  }

  /**
   * Generate productivity insights based on metrics analysis
   */
  generateInsights(
    developerId: string, 
    startDate: Date, 
    endDate: Date
  ): ProductivityInsight[] {
    const insights: ProductivityInsight[] = []
    
    // Analyze commit patterns
    const commitInsights = this.analyzeCommitPatterns(developerId, startDate, endDate)
    insights.push(...commitInsights)
    
    // Analyze review patterns
    const reviewInsights = this.analyzeReviewPatterns(developerId, startDate, endDate)
    insights.push(...reviewInsights)
    
    // Analyze deployment patterns
    const deploymentInsights = this.analyzeDeploymentPatterns(developerId, startDate, endDate)
    insights.push(...deploymentInsights)
    
    // Analyze collaboration patterns
    const collaborationInsights = this.analyzeCollaborationPatterns(developerId, startDate, endDate)
    insights.push(...collaborationInsights)

    // Store insights for future reference
    insights.forEach(insight => {
      this.insights.set(insight.id, insight)
    })

    return insights.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Analyze team productivity and collaboration
   */
  analyzeTeamProductivity(
    teamId: string, 
    period: Date
  ): TeamProductivityAnalysis {
    const individualScores: Record<string, ProductivityScore> = {}
    const teamMembers = this.getTeamMembers(teamId)
    
    // Calculate individual scores
    teamMembers.forEach(memberId => {
      const startDate = new Date(period.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      individualScores[memberId] = this.calculateProductivityScore(memberId, startDate, period)
    })

    // Calculate team score
    const teamScore = this.calculateTeamScore(individualScores)
    
    // Analyze collaboration metrics
    const collaborationMetrics = this.calculateCollaborationMetrics(teamId, period)
    
    // Identify bottlenecks and opportunities
    const bottlenecks = this.identifyBottlenecks(individualScores)
    const opportunities = this.identifyOpportunities(individualScores, collaborationMetrics)

    const analysis: TeamProductivityAnalysis = {
      teamId,
      period,
      individualScores,
      teamScore,
      collaborationMetrics,
      bottlenecks,
      opportunities
    }

    this.teamAnalysis.set(`${teamId}-${period.getTime()}`, analysis)
    return analysis
  }

  /**
   * Get productivity recommendations based on current metrics
   */
  getRecommendations(
    developerId: string, 
    context?: Record<string, any>
  ): Array<{
    id: string
    title: string
    description: string
    category: 'productivity' | 'efficiency' | 'quality' | 'collaboration'
    priority: 'high' | 'medium' | 'low'
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
    confidence: number
    estimatedImprovement: string
    implementationSteps: string[]
  }> {
    const recommendations = []
    
    // Analyze current productivity score
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const score = this.calculateProductivityScore(developerId, startDate, endDate)
    
    // Generate recommendations based on score breakdown
    if (score.breakdown.activity < 70) {
      recommendations.push({
        id: 'activity-001',
        title: 'Increase Development Activity',
        description: 'Consider increasing commit frequency and deployment activity to improve overall productivity',
        category: 'productivity' as const,
        priority: 'medium' as const,
        impact: 'high' as const,
        effort: 'low' as const,
        confidence: 85,
        estimatedImprovement: '+15% productivity score',
        implementationSteps: [
          'Set daily commit goals',
          'Implement smaller, more frequent commits',
          'Automate deployment processes'
        ]
      })
    }

    if (score.breakdown.efficiency < 70) {
      recommendations.push({
        id: 'efficiency-001',
        title: 'Improve Development Efficiency',
        description: 'Optimize code review process and reduce build times to improve efficiency',
        category: 'efficiency' as const,
        priority: 'high' as const,
        impact: 'high' as const,
        effort: 'medium' as const,
        confidence: 90,
        estimatedImprovement: '+20% efficiency score',
        implementationSteps: [
          'Implement automated code review tools',
          'Optimize build configurations',
          'Set up parallel testing'
        ]
      })
    }

    if (score.breakdown.quality < 70) {
      recommendations.push({
        id: 'quality-001',
        title: 'Enhance Code Quality',
        description: 'Increase test coverage and improve code review participation',
        category: 'quality' as const,
        priority: 'high' as const,
        impact: 'medium' as const,
        effort: 'high' as const,
        confidence: 80,
        estimatedImprovement: '+25% quality score',
        implementationSteps: [
          'Write comprehensive unit tests',
          'Increase code review participation',
          'Implement quality gates'
        ]
      })
    }

    if (score.breakdown.collaboration < 70) {
      recommendations.push({
        id: 'collaboration-001',
        title: 'Improve Team Collaboration',
        description: 'Increase code review participation and knowledge sharing activities',
        category: 'collaboration' as const,
        priority: 'medium' as const,
        impact: 'medium' as const,
        effort: 'medium' as const,
        confidence: 75,
        estimatedImprovement: '+18% collaboration score',
        implementationSteps: [
          'Participate in more code reviews',
          'Share knowledge through documentation',
          'Mentor junior developers'
        ]
      })
    }

    return recommendations
  }

  // Private helper methods

  private getMetricKey(category: string, name: string): string {
    return `${category}:${name}`
  }

  private getTrendKey(category: string, name: string, period: string): string {
    return `${category}:${name}:${period}`
  }

  private initializeDefaultMetrics(): void {
    // Initialize with some sample data for demonstration
    const now = new Date()
    const sampleMetrics: ProductivityMetric[] = [
      {
        id: 'commit-001',
        name: 'count',
        value: 12,
        unit: 'commits',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        category: 'commit'
      },
      {
        id: 'review-001',
        name: 'time',
        value: 2.5,
        unit: 'hours',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        category: 'review'
      },
      {
        id: 'deployment-001',
        name: 'frequency',
        value: 8,
        unit: 'per week',
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        category: 'deployment'
      }
    ]

    sampleMetrics.forEach(metric => this.addMetric(metric))
  }

  private updateTrends(key: string, metrics: ProductivityMetric[]): void {
    const periods: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly']
    
    periods.forEach(period => {
      const trendKey = this.getTrendKey(key.split(':')[0], key.split(':')[1], period)
      const trend = this.calculateTrendForPeriod(metrics, period)
      this.trends.set(trendKey, trend)
    })
  }

  private calculateTrendForPeriod(
    metrics: ProductivityMetric[], 
    period: 'daily' | 'weekly' | 'monthly'
  ): ProductivityTrend {
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    const periodMetrics = metrics.filter(m => m.timestamp >= startDate && m.timestamp <= now)
    const values = periodMetrics.map(m => m.value)
    
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const sorted = [...values].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Calculate trend direction
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (secondAvg > firstAvg * 1.1) trend = 'up'
    else if (secondAvg < firstAvg * 0.9) trend = 'down'
    
    const changePercentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0

    return {
      period,
      startDate,
      endDate: now,
      metrics: periodMetrics,
      aggregatedData: {
        average,
        median,
        min,
        max,
        trend,
        changePercentage
      }
    }
  }

  private calculateActivityScore(
    commitMetrics: ProductivityMetric[], 
    deploymentMetrics: ProductivityMetric[]
  ): number {
    const avgCommits = commitMetrics.length > 0 ? 
      commitMetrics.reduce((sum, m) => sum + m.value, 0) / commitMetrics.length : 0
    const avgDeployments = deploymentMetrics.length > 0 ? 
      deploymentMetrics.reduce((sum, m) => sum + m.value, 0) / deploymentMetrics.length : 0
    
    // Score based on commits per day (target: 5-10 commits/day)
    const commitScore = Math.min(100, (avgCommits / 7.5) * 100)
    
    // Score based on deployments per week (target: 3-7 deployments/week)
    const deploymentScore = Math.min(100, (avgDeployments / 5) * 100)
    
    return Math.round((commitScore + deploymentScore) / 2)
  }

  private calculateEfficiencyScore(reviewMetrics: ProductivityMetric[]): number {
    const avgReviewTime = reviewMetrics.length > 0 ? 
      reviewMetrics.reduce((sum, m) => sum + m.value, 0) / reviewMetrics.length : 0
    
    // Lower review time is better (target: <2 hours per review)
    const efficiencyScore = Math.max(0, 100 - (avgReviewTime * 20))
    
    return Math.round(efficiencyScore)
  }

  private calculateQualityScore(
    testingMetrics: ProductivityMetric[], 
    reviewMetrics: ProductivityMetric[]
  ): number {
    const avgTestCoverage = testingMetrics.length > 0 ? 
      testingMetrics.reduce((sum, m) => sum + m.value, 0) / testingMetrics.length : 0
    
    // Score based on test coverage (target: >80%)
    const coverageScore = Math.min(100, avgTestCoverage * 1.25)
    
    // Score based on code review participation
    const reviewParticipationScore = reviewMetrics.length > 0 ? 100 : 50
    
    return Math.round((coverageScore + reviewParticipationScore) / 2)
  }

  private calculateCollaborationScore(reviewMetrics: ProductivityMetric[]): number {
    // Score based on code review participation
    const participationScore = reviewMetrics.length > 0 ? 100 : 60
    
    return Math.round(participationScore)
  }

  private determineTrend(metrics: ProductivityMetric[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 2) return 'stable'
    
    const recent = metrics.slice(-7) // Last 7 metrics
    const older = metrics.slice(-14, -7) // Previous 7 metrics
    
    const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length
    const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (change > 10) return 'improving'
    if (change < -10) return 'declining'
    return 'stable'
  }

  private generateRecommendations(
    breakdown: any, 
    trend: string
  ): string[] {
    const recommendations = []
    
    if (breakdown.activity < 70) {
      recommendations.push('Consider increasing commit frequency and deployment activity')
    }
    if (breakdown.efficiency < 70) {
      recommendations.push('Optimize code review process and reduce build times')
    }
    if (breakdown.quality < 70) {
      recommendations.push('Increase test coverage and improve code review participation')
    }
    if (breakdown.collaboration < 70) {
      recommendations.push('Participate more in code reviews and knowledge sharing')
    }
    
    return recommendations
  }

  private analyzeCommitPatterns(
    developerId: string, 
    startDate: Date, 
    endDate: Date
  ): ProductivityInsight[] {
    // This would analyze actual commit patterns
    // For now, returning sample insights
    return [
      {
        id: 'commit-pattern-001',
        type: 'pattern',
        title: 'Consistent Daily Commits',
        description: 'You maintain a consistent pattern of daily commits, which is excellent for productivity',
        confidence: 85,
        impact: 'high',
        actionable: true,
        suggestions: ['Continue the consistent commit pattern', 'Consider smaller, more frequent commits'],
        relatedMetrics: ['commit:count'],
        timeframe: { start: startDate, end: endDate }
      }
    ]
  }

  private analyzeReviewPatterns(
    developerId: string, 
    startDate: Date, 
    endDate: Date
  ): ProductivityInsight[] {
    return [
      {
        id: 'review-pattern-001',
        type: 'opportunity',
        title: 'Code Review Participation',
        description: 'Increasing code review participation could improve team collaboration and code quality',
        confidence: 75,
        impact: 'medium',
        actionable: true,
        suggestions: ['Participate in more code reviews', 'Provide constructive feedback'],
        relatedMetrics: ['review:time', 'review:count'],
        timeframe: { start: startDate, end: endDate }
      }
    ]
  }

  private analyzeDeploymentPatterns(
    developerId: string, 
    startDate: Date, 
    endDate: Date
  ): ProductivityInsight[] {
    return []
  }

  private analyzeCollaborationPatterns(
    developerId: string, 
    startDate: Date, 
    endDate: Date
  ): ProductivityInsight[] {
    return []
  }

  private getTeamMembers(teamId: string): string[] {
    // This would return actual team members from a database
    // For now, returning sample data
    return ['dev-001', 'dev-002', 'dev-003']
  }

  private calculateTeamScore(individualScores: Record<string, ProductivityScore>): ProductivityScore {
    const scores = Object.values(individualScores)
    const overall = Math.round(scores.reduce((sum, s) => sum + s.overall, 0) / scores.length)
    
    return {
      overall,
      breakdown: {
        activity: Math.round(scores.reduce((sum, s) => sum + s.breakdown.activity, 0) / scores.length),
        efficiency: Math.round(scores.reduce((sum, s) => sum + s.breakdown.efficiency, 0) / scores.length),
        quality: Math.round(scores.reduce((sum, s) => sum + s.breakdown.quality, 0) / scores.length),
        collaboration: Math.round(scores.reduce((sum, s) => sum + s.breakdown.collaboration, 0) / scores.length)
      },
      trend: 'stable',
      recommendations: [],
      benchmark: {
        teamAverage: overall,
        industryAverage: 70,
        percentile: Math.min(100, Math.max(0, (overall / 100) * 100))
      }
    }
  }

  private calculateCollaborationMetrics(teamId: string, period: Date): any {
    return {
      codeReviewParticipation: 85,
      crossTeamCollaboration: 60,
      knowledgeSharing: 70
    }
  }

  private identifyBottlenecks(individualScores: Record<string, ProductivityScore>): string[] {
    const bottlenecks = []
    const scores = Object.values(individualScores)
    
    if (scores.some(s => s.breakdown.efficiency < 60)) {
      bottlenecks.push('Code review process bottlenecks')
    }
    if (scores.some(s => s.breakdown.collaboration < 60)) {
      bottlenecks.push('Limited cross-team collaboration')
    }
    
    return bottlenecks
  }

  private identifyOpportunities(individualScores: Record<string, ProductivityScore>, collaborationMetrics: any): string[] {
    const opportunities = []
    
    if (collaborationMetrics.codeReviewParticipation < 80) {
      opportunities.push('Increase code review participation')
    }
    if (collaborationMetrics.knowledgeSharing < 70) {
      opportunities.push('Improve knowledge sharing practices')
    }
    
    return opportunities
  }
}

// Export singleton instance
export const productivityInsights = new ProductivityInsightsAnalyzer()
