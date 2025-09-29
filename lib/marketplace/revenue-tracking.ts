/**
 * HT-035.3.3: Module Revenue Analytics & Tracking System
 * 
 * Tracks module revenue, analytics, and financial reporting for the marketplace.
 */

import { z } from 'zod'

// ============================================================================
// REVENUE TRACKING TYPES & SCHEMAS
// ============================================================================

export const RevenueEventSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  userId: z.string(),
  transactionId: z.string().optional(),
  eventType: z.enum([
    'purchase',
    'subscription',
    'renewal',
    'refund',
    'cancellation',
    'upgrade',
    'downgrade'
  ]),
  amount: z.number(),
  currency: z.string(),
  commission: z.number().optional(),
  netRevenue: z.number(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.unknown()).optional()
})

export const RevenueMetricSchema = z.object({
  period: z.string(), // 'daily', 'weekly', 'monthly', 'yearly'
  date: z.string(), // ISO date string
  moduleId: z.string().optional(),
  totalRevenue: z.number(),
  grossRevenue: z.number(),
  netRevenue: z.number(),
  commissionPaid: z.number(),
  refunds: z.number(),
  cancellations: z.number(),
  newPurchases: z.number(),
  renewals: z.number(),
  upgrades: z.number(),
  downgrades: z.number(),
  activeSubscriptions: z.number(),
  churnRate: z.number(),
  averageRevenuePerUser: z.number(),
  lifetimeValue: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional()
})

export const RevenueReportSchema = z.object({
  id: z.string(),
  reportType: z.enum([
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly',
    'custom'
  ]),
  startDate: z.date(),
  endDate: z.date(),
  generatedAt: z.date(),
  metrics: z.array(RevenueMetricSchema),
  summary: z.object({
    totalRevenue: z.number(),
    totalTransactions: z.number(),
    averageTransactionValue: z.number(),
    topPerformingModules: z.array(z.object({
      moduleId: z.string(),
      revenue: z.number(),
      transactions: z.number()
    })),
    revenueGrowth: z.number(),
    churnRate: z.number()
  }),
  metadata: z.record(z.string(), z.unknown()).optional()
})

export type RevenueEvent = z.infer<typeof RevenueEventSchema>
export type RevenueMetric = z.infer<typeof RevenueMetricSchema>
export type RevenueReport = z.infer<typeof RevenueReportSchema>

// ============================================================================
// REVENUE TRACKING CLASS
// ============================================================================

export class RevenueTracking {
  private revenueEvents: Map<string, RevenueEvent> = new Map()
  private revenueMetrics: Map<string, RevenueMetric> = new Map()
  private revenueReports: Map<string, RevenueReport> = new Map()
  
  constructor() {
    // Initialize revenue tracking
  }

  // ============================================================================
  // REVENUE EVENT TRACKING
  // ============================================================================

  /**
   * Track a revenue event
   */
  async trackRevenueEvent(
    moduleId: string,
    userId: string,
    eventType: RevenueEvent['eventType'],
    amount: number,
    currency: string = 'USD',
    options: {
      transactionId?: string
      commission?: number
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<RevenueEvent> {
    const commission = options.commission || this.calculateCommission(amount, moduleId)
    const netRevenue = amount - commission

    const revenueEvent: RevenueEvent = {
      id: this.generateEventId(),
      moduleId,
      userId,
      transactionId: options.transactionId,
      eventType,
      amount,
      currency,
      commission,
      netRevenue,
      timestamp: new Date(),
      metadata: options.metadata
    }

    this.revenueEvents.set(revenueEvent.id, revenueEvent)

    // Update real-time metrics
    await this.updateRealTimeMetrics(revenueEvent)

    return revenueEvent
  }

  /**
   * Track purchase revenue
   */
  async trackPurchase(
    moduleId: string,
    userId: string,
    amount: number,
    currency: string = 'USD',
    transactionId?: string
  ): Promise<RevenueEvent> {
    return this.trackRevenueEvent(
      moduleId,
      userId,
      'purchase',
      amount,
      currency,
      { transactionId }
    )
  }

  /**
   * Track subscription revenue
   */
  async trackSubscription(
    moduleId: string,
    userId: string,
    amount: number,
    currency: string = 'USD',
    transactionId?: string
  ): Promise<RevenueEvent> {
    return this.trackRevenueEvent(
      moduleId,
      userId,
      'subscription',
      amount,
      currency,
      { transactionId }
    )
  }

  /**
   * Track renewal revenue
   */
  async trackRenewal(
    moduleId: string,
    userId: string,
    amount: number,
    currency: string = 'USD',
    transactionId?: string
  ): Promise<RevenueEvent> {
    return this.trackRevenueEvent(
      moduleId,
      userId,
      'renewal',
      amount,
      currency,
      { transactionId }
    )
  }

  /**
   * Track refund
   */
  async trackRefund(
    moduleId: string,
    userId: string,
    amount: number,
    currency: string = 'USD',
    transactionId?: string
  ): Promise<RevenueEvent> {
    return this.trackRevenueEvent(
      moduleId,
      userId,
      'refund',
      amount,
      currency,
      { transactionId }
    )
  }

  // ============================================================================
  // REVENUE ANALYTICS
  // ============================================================================

  /**
   * Get revenue analytics for a period
   */
  async getRevenueAnalytics(
    startDate: Date,
    endDate: Date,
    options: {
      moduleId?: string
      period?: 'daily' | 'weekly' | 'monthly'
      includeBreakdown?: boolean
    } = {}
  ): Promise<{
    totalRevenue: number
    grossRevenue: number
    netRevenue: number
    commissionPaid: number
    refunds: number
    transactionCount: number
    averageTransactionValue: number
    revenueByModule: Record<string, {
      revenue: number
      transactions: number
      commission: number
    }>
    revenueByEventType: Record<string, {
      revenue: number
      transactions: number
    }>
    dailyBreakdown?: Array<{
      date: string
      revenue: number
      transactions: number
    }>
  }> {
    const events = this.getEventsInPeriod(startDate, endDate, options.moduleId)
    
    const totalRevenue = events
      .filter(e => !['refund', 'cancellation'].includes(e.eventType))
      .reduce((sum, e) => sum + e.amount, 0)

    const grossRevenue = events.reduce((sum, e) => sum + e.amount, 0)
    const netRevenue = events.reduce((sum, e) => sum + e.netRevenue, 0)
    const commissionPaid = events.reduce((sum, e) => sum + (e.commission || 0), 0)
    const refunds = events
      .filter(e => e.eventType === 'refund')
      .reduce((sum, e) => sum + e.amount, 0)

    const transactionCount = events.length
    const averageTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0

    // Group by module
    const revenueByModule = events.reduce((acc, event) => {
      if (!acc[event.moduleId]) {
        acc[event.moduleId] = { revenue: 0, transactions: 0, commission: 0 }
      }
      acc[event.moduleId].revenue += event.amount
      acc[event.moduleId].transactions += 1
      acc[event.moduleId].commission += event.commission || 0
      return acc
    }, {} as Record<string, { revenue: number; transactions: number; commission: number }>)

    // Group by event type
    const revenueByEventType = events.reduce((acc, event) => {
      if (!acc[event.eventType]) {
        acc[event.eventType] = { revenue: 0, transactions: 0 }
      }
      acc[event.eventType].revenue += event.amount
      acc[event.eventType].transactions += 1
      return acc
    }, {} as Record<string, { revenue: number; transactions: number }>)

    // Daily breakdown if requested
    let dailyBreakdown: Array<{ date: string; revenue: number; transactions: number }> | undefined
    if (options.includeBreakdown) {
      dailyBreakdown = this.generateDailyBreakdown(events, startDate, endDate)
    }

    return {
      totalRevenue,
      grossRevenue,
      netRevenue,
      commissionPaid,
      refunds,
      transactionCount,
      averageTransactionValue,
      revenueByModule,
      revenueByEventType,
      dailyBreakdown
    }
  }

  /**
   * Get module performance metrics
   */
  async getModulePerformance(
    moduleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRevenue: number
    totalSales: number
    averageSaleValue: number
    conversionRate: number
    churnRate: number
    customerLifetimeValue: number
    monthlyRecurringRevenue: number
    growthRate: number
    topCustomers: Array<{
      userId: string
      totalSpent: number
      transactions: number
    }>
  }> {
    const events = this.getEventsInPeriod(startDate, endDate, moduleId)
    
    const totalRevenue = events
      .filter(e => !['refund', 'cancellation'].includes(e.eventType))
      .reduce((sum, e) => sum + e.amount, 0)

    const totalSales = events.filter(e => e.eventType === 'purchase').length
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Calculate conversion rate (would need view/trial data)
    const conversionRate = 0 // Mock value

    // Calculate churn rate
    const cancellations = events.filter(e => e.eventType === 'cancellation').length
    const totalSubscriptions = events.filter(e => e.eventType === 'subscription').length
    const churnRate = totalSubscriptions > 0 ? cancellations / totalSubscriptions : 0

    // Calculate customer lifetime value
    const customerSpending = events.reduce((acc, event) => {
      acc[event.userId] = (acc[event.userId] || 0) + event.amount
      return acc
    }, {} as Record<string, number>)

    const customerLifetimeValue = Object.values(customerSpending).reduce((sum, spending) => sum + spending, 0) / Object.keys(customerSpending).length || 0

    // Calculate MRR (Monthly Recurring Revenue)
    const monthlyRecurringRevenue = events
      .filter(e => e.eventType === 'subscription' || e.eventType === 'renewal')
      .reduce((sum, e) => sum + e.amount, 0)

    // Calculate growth rate (would compare with previous period)
    const growthRate = 0 // Mock value

    // Get top customers
    const topCustomers = Object.entries(customerSpending)
      .map(([userId, totalSpent]) => ({
        userId,
        totalSpent,
        transactions: events.filter(e => e.userId === userId).length
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    return {
      totalRevenue,
      totalSales,
      averageSaleValue,
      conversionRate,
      churnRate,
      customerLifetimeValue,
      monthlyRecurringRevenue,
      growthRate,
      topCustomers
    }
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport(
    startDate: Date,
    endDate: Date,
    reportType: RevenueReport['reportType'] = 'custom'
  ): Promise<RevenueReport> {
    const analytics = await this.getRevenueAnalytics(startDate, endDate, {
      includeBreakdown: true
    })

    const metrics = await this.generateMetrics(startDate, endDate, 'daily')

    const summary = {
      totalRevenue: analytics.totalRevenue,
      totalTransactions: analytics.transactionCount,
      averageTransactionValue: analytics.averageTransactionValue,
      topPerformingModules: Object.entries(analytics.revenueByModule)
        .map(([moduleId, data]) => ({
          moduleId,
          revenue: data.revenue,
          transactions: data.transactions
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      revenueGrowth: 0, // Would calculate based on previous period
      churnRate: 0 // Would calculate based on subscription data
    }

    const report: RevenueReport = {
      id: this.generateReportId(),
      reportType,
      startDate,
      endDate,
      generatedAt: new Date(),
      metrics,
      summary,
      metadata: {
        generatedBy: 'revenue-tracking-system',
        version: '1.0.0'
      }
    }

    this.revenueReports.set(report.id, report)
    return report
  }

  // ============================================================================
  // FINANCIAL PROJECTIONS
  // ============================================================================

  /**
   * Project future revenue based on historical data
   */
  async projectFutureRevenue(
    months: number = 12,
    moduleId?: string
  ): Promise<{
    projectedRevenue: number[]
    confidence: number
    assumptions: string[]
    scenarios: {
      optimistic: number[]
      realistic: number[]
      pessimistic: number[]
    }
  }> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 12) // Look at last 12 months

    const analytics = await this.getRevenueAnalytics(startDate, endDate, { moduleId })
    
    // Simple linear projection (would use more sophisticated models in production)
    const monthlyAverage = analytics.totalRevenue / 12
    const projectedRevenue = Array.from({ length: months }, (_, i) => 
      monthlyAverage * (1 + (i * 0.05)) // 5% monthly growth assumption
    )

    const scenarios = {
      optimistic: projectedRevenue.map(r => r * 1.2),
      realistic: projectedRevenue,
      pessimistic: projectedRevenue.map(r => r * 0.8)
    }

    return {
      projectedRevenue,
      confidence: 0.75,
      assumptions: [
        'Linear growth trend continues',
        'No major market disruptions',
        'Current customer base remains stable'
      ],
      scenarios
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private getEventsInPeriod(
    startDate: Date,
    endDate: Date,
    moduleId?: string
  ): RevenueEvent[] {
    const events = Array.from(this.revenueEvents.values())
    
    return events.filter(event => {
      if (event.timestamp < startDate || event.timestamp > endDate) return false
      if (moduleId && event.moduleId !== moduleId) return false
      return true
    })
  }

  private async updateRealTimeMetrics(event: RevenueEvent): Promise<void> {
    const dateKey = this.getDateKey(event.timestamp, 'daily')
    const existingMetric = this.revenueMetrics.get(dateKey)
    
    if (existingMetric) {
      // Update existing metric
      existingMetric.totalRevenue += event.amount
      existingMetric.netRevenue += event.netRevenue
      existingMetric.commissionPaid += event.commission || 0
      
      if (event.eventType === 'refund') {
        existingMetric.refunds += event.amount
      } else if (event.eventType === 'cancellation') {
        existingMetric.cancellations += 1
      } else if (event.eventType === 'purchase') {
        existingMetric.newPurchases += 1
      } else if (event.eventType === 'renewal') {
        existingMetric.renewals += 1
      }
    } else {
      // Create new metric
      const metric: RevenueMetric = {
        period: 'daily',
        date: dateKey,
        moduleId: event.moduleId,
        totalRevenue: event.amount,
        grossRevenue: event.amount,
        netRevenue: event.netRevenue,
        commissionPaid: event.commission || 0,
        refunds: event.eventType === 'refund' ? event.amount : 0,
        cancellations: event.eventType === 'cancellation' ? 1 : 0,
        newPurchases: event.eventType === 'purchase' ? 1 : 0,
        renewals: event.eventType === 'renewal' ? 1 : 0,
        upgrades: event.eventType === 'upgrade' ? 1 : 0,
        downgrades: event.eventType === 'downgrade' ? 1 : 0,
        activeSubscriptions: 0, // Would calculate from subscription data
        churnRate: 0,
        averageRevenuePerUser: event.amount,
        lifetimeValue: event.amount
      }
      
      this.revenueMetrics.set(dateKey, metric)
    }
  }

  private async generateMetrics(
    startDate: Date,
    endDate: Date,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<RevenueMetric[]> {
    const metrics: RevenueMetric[] = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dateKey = this.getDateKey(current, period)
      const metric = this.revenueMetrics.get(dateKey)
      
      if (metric) {
        metrics.push(metric)
      }
      
      // Move to next period
      if (period === 'daily') {
        current.setDate(current.getDate() + 1)
      } else if (period === 'weekly') {
        current.setDate(current.getDate() + 7)
      } else if (period === 'monthly') {
        current.setMonth(current.getMonth() + 1)
      }
    }
    
    return metrics
  }

  private generateDailyBreakdown(
    events: RevenueEvent[],
    startDate: Date,
    endDate: Date
  ): Array<{ date: string; revenue: number; transactions: number }> {
    const breakdown: Record<string, { revenue: number; transactions: number }> = {}
    
    events.forEach(event => {
      const dateKey = this.getDateKey(event.timestamp, 'daily')
      if (!breakdown[dateKey]) {
        breakdown[dateKey] = { revenue: 0, transactions: 0 }
      }
      breakdown[dateKey].revenue += event.amount
      breakdown[dateKey].transactions += 1
    })
    
    return Object.entries(breakdown)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private getDateKey(date: Date, period: 'daily' | 'weekly' | 'monthly'): string {
    if (period === 'daily') {
      return date.toISOString().split('T')[0]
    } else if (period === 'weekly') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      return weekStart.toISOString().split('T')[0]
    } else if (period === 'monthly') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
    return date.toISOString().split('T')[0]
  }

  private calculateCommission(amount: number, moduleId: string): number {
    // Default 10% commission rate (would be configurable per module)
    return amount * 0.1
  }

  private generateEventId(): string {
    return `rev_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateReportId(): string {
    return `rev_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const revenueTracking = new RevenueTracking()
export default revenueTracking
