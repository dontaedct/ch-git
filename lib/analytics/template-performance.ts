import { supabase } from '@/lib/supabase/client'

export interface TemplatePerformanceMetrics {
  templateId: string
  templateName: string
  totalUsage: number
  successfulDeployments: number
  failedDeployments: number
  averageCustomizationTime: number
  averageDeploymentTime: number
  clientSatisfactionScore: number
  revenueGenerated: number
  popularCustomizations: string[]
  performanceScore: number
  lastUsed: Date
  trends: {
    usageGrowth: number
    performanceChange: number
    satisfactionTrend: number
  }
}

export interface TemplatePerformanceAnalysis {
  template: TemplatePerformanceMetrics
  insights: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    optimizationOpportunities: string[]
  }
  benchmarks: {
    industryAverage: number
    topPerformer: number
    minimumViable: number
  }
}

export class TemplatePerformanceAnalyzer {
  private readonly PERFORMANCE_WEIGHT_FACTORS = {
    usage: 0.25,
    success_rate: 0.3,
    deployment_speed: 0.2,
    satisfaction: 0.15,
    revenue: 0.1
  }

  async getTemplatePerformanceMetrics(templateId: string): Promise<TemplatePerformanceMetrics | null> {
    try {
      // Get template basic info
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError || !template) {
        throw new Error(`Template not found: ${templateId}`)
      }

      // Get deployment metrics
      const { data: deployments, error: deploymentsError } = await supabase
        .from('client_deployments')
        .select('*')
        .eq('template_id', templateId)

      if (deploymentsError) {
        throw new Error('Failed to fetch deployment data')
      }

      // Get customization data
      const { data: customizations, error: customizationsError } = await supabase
        .from('client_customizations')
        .select('*')
        .eq('template_id', templateId)

      if (customizationsError) {
        throw new Error('Failed to fetch customization data')
      }

      // Calculate metrics
      const totalUsage = deployments?.length || 0
      const successfulDeployments = deployments?.filter(d => d.status === 'success').length || 0
      const failedDeployments = deployments?.filter(d => d.status === 'failed').length || 0

      const averageCustomizationTime = this.calculateAverageTime(
        customizations?.map(c => c.processing_time_minutes) || []
      )

      const averageDeploymentTime = this.calculateAverageTime(
        deployments?.filter(d => d.deployment_time_minutes)
          .map(d => d.deployment_time_minutes) || []
      )

      // Get client satisfaction scores
      const { data: satisfaction, error: satisfactionError } = await supabase
        .from('client_feedback')
        .select('satisfaction_score')
        .eq('template_id', templateId)

      const clientSatisfactionScore = satisfaction?.length
        ? satisfaction.reduce((acc, s) => acc + s.satisfaction_score, 0) / satisfaction.length
        : 0

      // Calculate revenue
      const { data: revenue, error: revenueError } = await supabase
        .from('client_contracts')
        .select('contract_value')
        .eq('template_id', templateId)

      const revenueGenerated = revenue?.reduce((acc, r) => acc + r.contract_value, 0) || 0

      // Get popular customizations
      const popularCustomizations = this.getPopularCustomizations(customizations || [])

      // Calculate performance score
      const performanceScore = this.calculatePerformanceScore({
        usage: totalUsage,
        successRate: successfulDeployments / Math.max(totalUsage, 1),
        deploymentSpeed: averageDeploymentTime,
        satisfaction: clientSatisfactionScore,
        revenue: revenueGenerated
      })

      // Get trends
      const trends = await this.calculateTrends(templateId)

      return {
        templateId,
        templateName: template.name,
        totalUsage,
        successfulDeployments,
        failedDeployments,
        averageCustomizationTime,
        averageDeploymentTime,
        clientSatisfactionScore,
        revenueGenerated,
        popularCustomizations,
        performanceScore,
        lastUsed: deployments?.length
          ? new Date(Math.max(...deployments.map(d => new Date(d.created_at).getTime())))
          : new Date(),
        trends
      }
    } catch (error) {
      console.error('Error analyzing template performance:', error)
      return null
    }
  }

  async getAllTemplatePerformanceMetrics(): Promise<TemplatePerformanceMetrics[]> {
    try {
      const { data: templates, error } = await supabase
        .from('templates')
        .select('id')

      if (error || !templates) {
        throw new Error('Failed to fetch templates')
      }

      const metrics = await Promise.all(
        templates.map(t => this.getTemplatePerformanceMetrics(t.id))
      )

      return metrics.filter(m => m !== null) as TemplatePerformanceMetrics[]
    } catch (error) {
      console.error('Error fetching all template performance metrics:', error)
      return []
    }
  }

  async analyzeTemplatePerformance(templateId: string): Promise<TemplatePerformanceAnalysis | null> {
    try {
      const metrics = await this.getTemplatePerformanceMetrics(templateId)
      if (!metrics) return null

      const allMetrics = await this.getAllTemplatePerformanceMetrics()
      const benchmarks = this.calculateBenchmarks(allMetrics)
      const insights = this.generateInsights(metrics, benchmarks)

      return {
        template: metrics,
        insights,
        benchmarks
      }
    } catch (error) {
      console.error('Error analyzing template performance:', error)
      return null
    }
  }

  async getTopPerformingTemplates(limit: number = 10): Promise<TemplatePerformanceMetrics[]> {
    const allMetrics = await this.getAllTemplatePerformanceMetrics()
    return allMetrics
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit)
  }

  async getUnderperformingTemplates(threshold: number = 50): Promise<TemplatePerformanceMetrics[]> {
    const allMetrics = await this.getAllTemplatePerformanceMetrics()
    return allMetrics.filter(m => m.performanceScore < threshold)
  }

  private calculateAverageTime(times: number[]): number {
    if (times.length === 0) return 0
    return times.reduce((acc, time) => acc + time, 0) / times.length
  }

  private getPopularCustomizations(customizations: any[]): string[] {
    const customizationCounts: { [key: string]: number } = {}

    customizations.forEach(c => {
      if (c.customization_types) {
        c.customization_types.forEach((type: string) => {
          customizationCounts[type] = (customizationCounts[type] || 0) + 1
        })
      }
    })

    return Object.entries(customizationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type)
  }

  private calculatePerformanceScore(metrics: {
    usage: number
    successRate: number
    deploymentSpeed: number
    satisfaction: number
    revenue: number
  }): number {
    const normalizedUsage = Math.min(metrics.usage / 10, 1) * 100
    const normalizedSuccessRate = metrics.successRate * 100
    const normalizedSpeed = Math.max(0, (60 - metrics.deploymentSpeed) / 60) * 100
    const normalizedSatisfaction = (metrics.satisfaction / 5) * 100
    const normalizedRevenue = Math.min(metrics.revenue / 10000, 1) * 100

    return (
      normalizedUsage * this.PERFORMANCE_WEIGHT_FACTORS.usage +
      normalizedSuccessRate * this.PERFORMANCE_WEIGHT_FACTORS.success_rate +
      normalizedSpeed * this.PERFORMANCE_WEIGHT_FACTORS.deployment_speed +
      normalizedSatisfaction * this.PERFORMANCE_WEIGHT_FACTORS.satisfaction +
      normalizedRevenue * this.PERFORMANCE_WEIGHT_FACTORS.revenue
    )
  }

  private async calculateTrends(templateId: string): Promise<{
    usageGrowth: number
    performanceChange: number
    satisfactionTrend: number
  }> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    // Get usage trends
    const { data: recentUsage } = await supabase
      .from('client_deployments')
      .select('*')
      .eq('template_id', templateId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    const { data: previousUsage } = await supabase
      .from('client_deployments')
      .select('*')
      .eq('template_id', templateId)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    const usageGrowth = this.calculateGrowthRate(
      previousUsage?.length || 0,
      recentUsage?.length || 0
    )

    // Calculate satisfaction trends
    const { data: recentSatisfaction } = await supabase
      .from('client_feedback')
      .select('satisfaction_score')
      .eq('template_id', templateId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    const { data: previousSatisfaction } = await supabase
      .from('client_feedback')
      .select('satisfaction_score')
      .eq('template_id', templateId)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    const recentSatisfactionAvg = recentSatisfaction?.length
      ? recentSatisfaction.reduce((acc, s) => acc + s.satisfaction_score, 0) / recentSatisfaction.length
      : 0

    const previousSatisfactionAvg = previousSatisfaction?.length
      ? previousSatisfaction.reduce((acc, s) => acc + s.satisfaction_score, 0) / previousSatisfaction.length
      : 0

    const satisfactionTrend = this.calculateGrowthRate(previousSatisfactionAvg, recentSatisfactionAvg)

    return {
      usageGrowth,
      performanceChange: (usageGrowth + satisfactionTrend) / 2,
      satisfactionTrend
    }
  }

  private calculateGrowthRate(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  private calculateBenchmarks(allMetrics: TemplatePerformanceMetrics[]): {
    industryAverage: number
    topPerformer: number
    minimumViable: number
  } {
    if (allMetrics.length === 0) {
      return { industryAverage: 0, topPerformer: 0, minimumViable: 0 }
    }

    const scores = allMetrics.map(m => m.performanceScore).sort((a, b) => b - a)

    return {
      industryAverage: scores.reduce((acc, score) => acc + score, 0) / scores.length,
      topPerformer: scores[0] || 0,
      minimumViable: scores[Math.floor(scores.length * 0.8)] || 0
    }
  }

  private generateInsights(
    metrics: TemplatePerformanceMetrics,
    benchmarks: { industryAverage: number; topPerformer: number; minimumViable: number }
  ): {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    optimizationOpportunities: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []
    const optimizationOpportunities: string[] = []

    // Analyze strengths
    if (metrics.performanceScore > benchmarks.industryAverage) {
      strengths.push('Above-average overall performance')
    }
    if (metrics.clientSatisfactionScore > 4.0) {
      strengths.push('High client satisfaction')
    }
    if ((metrics.successfulDeployments / Math.max(metrics.totalUsage, 1)) > 0.9) {
      strengths.push('Excellent deployment success rate')
    }
    if (metrics.trends.usageGrowth > 0) {
      strengths.push('Growing adoption and usage')
    }

    // Analyze weaknesses
    if (metrics.performanceScore < benchmarks.minimumViable) {
      weaknesses.push('Below minimum viable performance threshold')
    }
    if (metrics.averageDeploymentTime > 30) {
      weaknesses.push('Slow deployment times')
    }
    if (metrics.clientSatisfactionScore < 3.5) {
      weaknesses.push('Low client satisfaction')
    }
    if (metrics.trends.usageGrowth < -10) {
      weaknesses.push('Declining usage trend')
    }

    // Generate recommendations
    if (metrics.averageDeploymentTime > 20) {
      recommendations.push('Optimize deployment pipeline for faster deployment times')
    }
    if (metrics.clientSatisfactionScore < 4.0) {
      recommendations.push('Improve template quality and user experience')
    }
    if (metrics.totalUsage < 5) {
      recommendations.push('Increase marketing and adoption efforts')
    }
    if (metrics.failedDeployments > 0) {
      recommendations.push('Investigate and fix deployment failure causes')
    }

    // Identify optimization opportunities
    if (metrics.popularCustomizations.length > 0) {
      optimizationOpportunities.push('Create template variants for popular customizations')
    }
    if (metrics.averageCustomizationTime > 15) {
      optimizationOpportunities.push('Streamline customization process')
    }
    if (metrics.revenueGenerated / Math.max(metrics.totalUsage, 1) < 2000) {
      optimizationOpportunities.push('Optimize pricing and value proposition')
    }

    return { strengths, weaknesses, recommendations, optimizationOpportunities }
  }
}

export const templatePerformanceAnalyzer = new TemplatePerformanceAnalyzer()