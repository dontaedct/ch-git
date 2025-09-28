import { supabase } from '@/lib/supabase/client'

export interface TemplateUsageEvent {
  id: string
  templateId: string
  clientId: string
  eventType: 'view' | 'select' | 'customize' | 'deploy' | 'success' | 'failure'
  eventData: Record<string, any>
  timestamp: Date
  sessionId: string
  userAgent?: string
  ipAddress?: string
}

export interface TemplateUsagePattern {
  templateId: string
  patternType: 'hourly' | 'daily' | 'weekly' | 'monthly'
  usageData: {
    period: string
    count: number
    events: TemplateUsageEvent[]
  }[]
  insights: {
    peakUsagePeriods: string[]
    lowUsagePeriods: string[]
    averageUsagePerPeriod: number
    usageTrends: 'increasing' | 'decreasing' | 'stable'
  }
}

export interface ClientTemplateJourney {
  clientId: string
  templateId: string
  journeyStart: Date
  journeyEnd?: Date
  stages: {
    discovery: TemplateUsageEvent[]
    evaluation: TemplateUsageEvent[]
    customization: TemplateUsageEvent[]
    deployment: TemplateUsageEvent[]
    success: TemplateUsageEvent[]
  }
  totalDuration: number
  conversionRate: number
  dropoffPoints: string[]
}

export interface TemplateAdoptionMetrics {
  templateId: string
  timeToFirstCustomization: number
  timeToDeployment: number
  conversionFunnel: {
    views: number
    selections: number
    customizations: number
    deployments: number
    successes: number
  }
  dropoffRates: {
    viewToSelection: number
    selectionToCustomization: number
    customizationToDeployment: number
    deploymentToSuccess: number
  }
  seasonalTrends: {
    quarter: string
    usage: number
    growth: number
  }[]
}

export class TemplateUsageTracker {
  async trackUsageEvent(event: Omit<TemplateUsageEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('template_usage_events')
        .insert({
          template_id: event.templateId,
          client_id: event.clientId,
          event_type: event.eventType,
          event_data: event.eventData,
          session_id: event.sessionId,
          user_agent: event.userAgent,
          ip_address: event.ipAddress,
          created_at: new Date().toISOString()
        })

      if (error) {
        throw new Error(`Failed to track usage event: ${error.message}`)
      }
    } catch (error) {
      console.error('Error tracking template usage event:', error)
    }
  }

  async getTemplateUsagePattern(
    templateId: string,
    patternType: 'hourly' | 'daily' | 'weekly' | 'monthly',
    startDate?: Date,
    endDate?: Date
  ): Promise<TemplateUsagePattern | null> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      const end = endDate || new Date()

      const { data: events, error } = await supabase
        .from('template_usage_events')
        .select('*')
        .eq('template_id', templateId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch usage events: ${error.message}`)
      }

      const usageData = this.aggregateUsageByPeriod(events || [], patternType)
      const insights = this.analyzeUsagePatterns(usageData)

      return {
        templateId,
        patternType,
        usageData,
        insights
      }
    } catch (error) {
      console.error('Error getting template usage pattern:', error)
      return null
    }
  }

  async getClientTemplateJourney(clientId: string, templateId: string): Promise<ClientTemplateJourney | null> {
    try {
      const { data: events, error } = await supabase
        .from('template_usage_events')
        .select('*')
        .eq('client_id', clientId)
        .eq('template_id', templateId)
        .order('created_at', { ascending: true })

      if (error || !events || events.length === 0) {
        return null
      }

      const stages = this.categorizeJourneyStages(events)
      const journeyStart = new Date(events[0].created_at)
      const journeyEnd = events[events.length - 1]?.event_type === 'success'
        ? new Date(events[events.length - 1].created_at)
        : undefined

      const totalDuration = journeyEnd
        ? journeyEnd.getTime() - journeyStart.getTime()
        : Date.now() - journeyStart.getTime()

      const conversionRate = this.calculateConversionRate(stages)
      const dropoffPoints = this.identifyDropoffPoints(stages)

      return {
        clientId,
        templateId,
        journeyStart,
        journeyEnd,
        stages,
        totalDuration,
        conversionRate,
        dropoffPoints
      }
    } catch (error) {
      console.error('Error getting client template journey:', error)
      return null
    }
  }

  async getTemplateAdoptionMetrics(templateId: string): Promise<TemplateAdoptionMetrics | null> {
    try {
      // Get all events for this template
      const { data: events, error } = await supabase
        .from('template_usage_events')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch adoption metrics: ${error.message}`)
      }

      const conversionFunnel = this.calculateConversionFunnel(events || [])
      const dropoffRates = this.calculateDropoffRates(conversionFunnel)
      const timeMetrics = this.calculateTimeMetrics(events || [])
      const seasonalTrends = await this.calculateSeasonalTrends(templateId)

      return {
        templateId,
        timeToFirstCustomization: timeMetrics.timeToFirstCustomization,
        timeToDeployment: timeMetrics.timeToDeployment,
        conversionFunnel,
        dropoffRates,
        seasonalTrends
      }
    } catch (error) {
      console.error('Error getting template adoption metrics:', error)
      return null
    }
  }

  async getPopularTemplatesUsage(limit: number = 10): Promise<{
    templateId: string
    templateName: string
    totalEvents: number
    uniqueClients: number
    conversionRate: number
    averageTimeToDeployment: number
  }[]> {
    try {
      const { data: usage, error } = await supabase
        .from('template_usage_events')
        .select(`
          template_id,
          client_id,
          event_type,
          created_at,
          templates(name)
        `)

      if (error) {
        throw new Error(`Failed to fetch popular templates usage: ${error.message}`)
      }

      const templateStats = new Map()

      usage?.forEach(event => {
        const templateId = event.template_id
        if (!templateStats.has(templateId)) {
          templateStats.set(templateId, {
            templateId,
            templateName: event.templates?.name || 'Unknown',
            totalEvents: 0,
            uniqueClients: new Set(),
            deployments: 0,
            successes: 0,
            customizationTimes: [],
            deploymentTimes: []
          })
        }

        const stats = templateStats.get(templateId)
        stats.totalEvents++
        stats.uniqueClients.add(event.client_id)

        if (event.event_type === 'deploy') {
          stats.deployments++
        }
        if (event.event_type === 'success') {
          stats.successes++
        }
      })

      return Array.from(templateStats.values())
        .map(stats => ({
          templateId: stats.templateId,
          templateName: stats.templateName,
          totalEvents: stats.totalEvents,
          uniqueClients: stats.uniqueClients.size,
          conversionRate: stats.deployments > 0 ? (stats.successes / stats.deployments) * 100 : 0,
          averageTimeToDeployment: this.calculateAverageTimeToDeployment(stats.templateId)
        }))
        .sort((a, b) => b.totalEvents - a.totalEvents)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting popular templates usage:', error)
      return []
    }
  }

  private aggregateUsageByPeriod(
    events: any[],
    patternType: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): TemplateUsagePattern['usageData'] {
    const aggregated = new Map()

    events.forEach(event => {
      const date = new Date(event.created_at)
      let periodKey: string

      switch (patternType) {
        case 'hourly':
          periodKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`
          break
        case 'daily':
          periodKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
          break
        case 'weekly':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          periodKey = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`
          break
        case 'monthly':
          periodKey = `${date.getFullYear()}-${date.getMonth()}`
          break
        default:
          periodKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      }

      if (!aggregated.has(periodKey)) {
        aggregated.set(periodKey, {
          period: periodKey,
          count: 0,
          events: []
        })
      }

      const periodData = aggregated.get(periodKey)
      periodData.count++
      periodData.events.push({
        id: event.id,
        templateId: event.template_id,
        clientId: event.client_id,
        eventType: event.event_type,
        eventData: event.event_data,
        timestamp: new Date(event.created_at),
        sessionId: event.session_id,
        userAgent: event.user_agent,
        ipAddress: event.ip_address
      })
    })

    return Array.from(aggregated.values())
  }

  private analyzeUsagePatterns(usageData: TemplateUsagePattern['usageData']): TemplateUsagePattern['insights'] {
    if (usageData.length === 0) {
      return {
        peakUsagePeriods: [],
        lowUsagePeriods: [],
        averageUsagePerPeriod: 0,
        usageTrends: 'stable'
      }
    }

    const counts = usageData.map(d => d.count)
    const averageUsage = counts.reduce((acc, count) => acc + count, 0) / counts.length
    const sortedByUsage = [...usageData].sort((a, b) => b.count - a.count)

    const peakUsagePeriods = sortedByUsage
      .slice(0, Math.ceil(sortedByUsage.length * 0.2))
      .map(d => d.period)

    const lowUsagePeriods = sortedByUsage
      .slice(-Math.ceil(sortedByUsage.length * 0.2))
      .map(d => d.period)

    // Calculate trend
    let usageTrends: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (usageData.length >= 3) {
      const firstThird = usageData.slice(0, Math.floor(usageData.length / 3))
      const lastThird = usageData.slice(-Math.floor(usageData.length / 3))

      const firstAvg = firstThird.reduce((acc, d) => acc + d.count, 0) / firstThird.length
      const lastAvg = lastThird.reduce((acc, d) => acc + d.count, 0) / lastThird.length

      const growthRate = (lastAvg - firstAvg) / firstAvg

      if (growthRate > 0.1) usageTrends = 'increasing'
      else if (growthRate < -0.1) usageTrends = 'decreasing'
    }

    return {
      peakUsagePeriods,
      lowUsagePeriods,
      averageUsagePerPeriod: averageUsage,
      usageTrends
    }
  }

  private categorizeJourneyStages(events: any[]): ClientTemplateJourney['stages'] {
    const stages = {
      discovery: [],
      evaluation: [],
      customization: [],
      deployment: [],
      success: []
    }

    events.forEach(event => {
      const usageEvent: TemplateUsageEvent = {
        id: event.id,
        templateId: event.template_id,
        clientId: event.client_id,
        eventType: event.event_type,
        eventData: event.event_data,
        timestamp: new Date(event.created_at),
        sessionId: event.session_id,
        userAgent: event.user_agent,
        ipAddress: event.ip_address
      }

      switch (event.event_type) {
        case 'view':
          stages.discovery.push(usageEvent)
          break
        case 'select':
          stages.evaluation.push(usageEvent)
          break
        case 'customize':
          stages.customization.push(usageEvent)
          break
        case 'deploy':
          stages.deployment.push(usageEvent)
          break
        case 'success':
          stages.success.push(usageEvent)
          break
      }
    })

    return stages
  }

  private calculateConversionRate(stages: ClientTemplateJourney['stages']): number {
    const totalInteractions = Object.values(stages).reduce((acc, stage) => acc + stage.length, 0)
    const successfulCompletions = stages.success.length

    return totalInteractions > 0 ? (successfulCompletions / totalInteractions) * 100 : 0
  }

  private identifyDropoffPoints(stages: ClientTemplateJourney['stages']): string[] {
    const dropoffPoints: string[] = []

    if (stages.discovery.length > 0 && stages.evaluation.length === 0) {
      dropoffPoints.push('discovery-to-evaluation')
    }
    if (stages.evaluation.length > 0 && stages.customization.length === 0) {
      dropoffPoints.push('evaluation-to-customization')
    }
    if (stages.customization.length > 0 && stages.deployment.length === 0) {
      dropoffPoints.push('customization-to-deployment')
    }
    if (stages.deployment.length > 0 && stages.success.length === 0) {
      dropoffPoints.push('deployment-to-success')
    }

    return dropoffPoints
  }

  private calculateConversionFunnel(events: any[]): TemplateAdoptionMetrics['conversionFunnel'] {
    const funnel = {
      views: 0,
      selections: 0,
      customizations: 0,
      deployments: 0,
      successes: 0
    }

    events.forEach(event => {
      switch (event.event_type) {
        case 'view':
          funnel.views++
          break
        case 'select':
          funnel.selections++
          break
        case 'customize':
          funnel.customizations++
          break
        case 'deploy':
          funnel.deployments++
          break
        case 'success':
          funnel.successes++
          break
      }
    })

    return funnel
  }

  private calculateDropoffRates(funnel: TemplateAdoptionMetrics['conversionFunnel']): TemplateAdoptionMetrics['dropoffRates'] {
    return {
      viewToSelection: funnel.views > 0 ? ((funnel.views - funnel.selections) / funnel.views) * 100 : 0,
      selectionToCustomization: funnel.selections > 0 ? ((funnel.selections - funnel.customizations) / funnel.selections) * 100 : 0,
      customizationToDeployment: funnel.customizations > 0 ? ((funnel.customizations - funnel.deployments) / funnel.customizations) * 100 : 0,
      deploymentToSuccess: funnel.deployments > 0 ? ((funnel.deployments - funnel.successes) / funnel.deployments) * 100 : 0
    }
  }

  private calculateTimeMetrics(events: any[]): {
    timeToFirstCustomization: number
    timeToDeployment: number
  } {
    const firstView = events.find(e => e.event_type === 'view')
    const firstCustomization = events.find(e => e.event_type === 'customize')
    const firstDeployment = events.find(e => e.event_type === 'deploy')

    const timeToFirstCustomization = firstView && firstCustomization
      ? new Date(firstCustomization.created_at).getTime() - new Date(firstView.created_at).getTime()
      : 0

    const timeToDeployment = firstView && firstDeployment
      ? new Date(firstDeployment.created_at).getTime() - new Date(firstView.created_at).getTime()
      : 0

    return {
      timeToFirstCustomization: timeToFirstCustomization / (1000 * 60), // Convert to minutes
      timeToDeployment: timeToDeployment / (1000 * 60) // Convert to minutes
    }
  }

  private async calculateSeasonalTrends(templateId: string): Promise<TemplateAdoptionMetrics['seasonalTrends']> {
    try {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      const { data: events, error } = await supabase
        .from('template_usage_events')
        .select('created_at')
        .eq('template_id', templateId)
        .gte('created_at', oneYearAgo.toISOString())

      if (error || !events) {
        return []
      }

      const quarterlyData = new Map()

      events.forEach(event => {
        const date = new Date(event.created_at)
        const quarter = `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`

        quarterlyData.set(quarter, (quarterlyData.get(quarter) || 0) + 1)
      })

      const quarters = Array.from(quarterlyData.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))

      return quarters.map(([quarter, usage], index) => ({
        quarter,
        usage,
        growth: index > 0 ? ((usage - quarters[index - 1][1]) / quarters[index - 1][1]) * 100 : 0
      }))
    } catch (error) {
      console.error('Error calculating seasonal trends:', error)
      return []
    }
  }

  private async calculateAverageTimeToDeployment(templateId: string): Promise<number> {
    // This would need to be implemented based on specific business logic
    // For now, returning a placeholder
    return 0
  }
}

export const templateUsageTracker = new TemplateUsageTracker()