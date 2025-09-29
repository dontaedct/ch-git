/**
 * HT-035.3.3: Recurring Module Subscription Manager
 * 
 * Manages recurring subscriptions, billing cycles, and subscription lifecycle
 * for module marketplace subscriptions.
 */

import { z } from 'zod'

// ============================================================================
// SUBSCRIPTION TYPES & SCHEMAS
// ============================================================================

export const SubscriptionStatusSchema = z.enum([
  'active',
  'cancelled',
  'expired',
  'paused',
  'pending',
  'failed'
])

export const BillingCycleSchema = z.enum([
  'monthly',
  'yearly',
  'quarterly',
  'weekly'
])

export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  name: z.string(),
  description: z.string(),
  billingCycle: BillingCycleSchema,
  price: z.number().positive(),
  currency: z.string(),
  features: z.array(z.string()),
  limits: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
  isActive: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const ModuleSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  moduleId: z.string(),
  planId: z.string(),
  status: SubscriptionStatusSchema,
  billingCycle: BillingCycleSchema,
  price: z.number().positive(),
  currency: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  nextBillingDate: z.date().optional(),
  lastBillingDate: z.date().optional(),
  cancellationDate: z.date().optional(),
  pauseDate: z.date().optional(),
  resumeDate: z.date().optional(),
  failureCount: z.number().default(0),
  maxFailures: z.number().default(3),
  autoRenew: z.boolean().default(true),
  paymentMethodId: z.string().optional(),
  providerSubscriptionId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const BillingEventSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  eventType: z.enum([
    'billing_attempt',
    'billing_success',
    'billing_failure',
    'subscription_created',
    'subscription_cancelled',
    'subscription_paused',
    'subscription_resumed',
    'subscription_expired'
  ]),
  amount: z.number().optional(),
  currency: z.string().optional(),
  transactionId: z.string().optional(),
  failureReason: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.date()
})

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>
export type BillingCycle = z.infer<typeof BillingCycleSchema>
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>
export type ModuleSubscription = z.infer<typeof ModuleSubscriptionSchema>
export type BillingEvent = z.infer<typeof BillingEventSchema>

// ============================================================================
// SUBSCRIPTION MANAGER CLASS
// ============================================================================

export class SubscriptionManager {
  private subscriptions: Map<string, ModuleSubscription> = new Map()
  private subscriptionPlans: Map<string, SubscriptionPlan> = new Map()
  private billingEvents: Map<string, BillingEvent> = new Map()
  
  constructor() {
    this.initializeDefaultPlans()
  }

  // ============================================================================
  // SUBSCRIPTION PLAN MANAGEMENT
  // ============================================================================

  /**
   * Create a new subscription plan for a module
   */
  async createSubscriptionPlan(
    moduleId: string,
    planData: {
      name: string
      description: string
      billingCycle: BillingCycle
      price: number
      currency: string
      features: string[]
      limits: Record<string, unknown>
      metadata?: Record<string, unknown>
    }
  ): Promise<SubscriptionPlan> {
    const plan: SubscriptionPlan = {
      id: this.generatePlanId(),
      moduleId,
      name: planData.name,
      description: planData.description,
      billingCycle: planData.billingCycle,
      price: planData.price,
      currency: planData.currency,
      features: planData.features,
      limits: planData.limits,
      isActive: true,
      metadata: planData.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.subscriptionPlans.set(plan.id, plan)
    return plan
  }

  /**
   * Get subscription plans for a module
   */
  async getModuleSubscriptionPlans(moduleId: string): Promise<SubscriptionPlan[]> {
    const plans = Array.from(this.subscriptionPlans.values())
    return plans.filter(plan => plan.moduleId === moduleId && plan.isActive)
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(
    planId: string,
    updates: Partial<SubscriptionPlan>
  ): Promise<SubscriptionPlan> {
    const plan = this.subscriptionPlans.get(planId)
    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`)
    }

    const updated: SubscriptionPlan = {
      ...plan,
      ...updates,
      updatedAt: new Date()
    }

    this.subscriptionPlans.set(planId, updated)
    return updated
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    moduleId: string,
    planId: string,
    options: {
      paymentMethodId?: string
      autoRenew?: boolean
      startDate?: Date
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<ModuleSubscription> {
    const plan = this.subscriptionPlans.get(planId)
    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`)
    }

    if (plan.moduleId !== moduleId) {
      throw new Error('Plan does not belong to specified module')
    }

    const startDate = options.startDate || new Date()
    const nextBillingDate = this.calculateNextBillingDate(startDate, plan.billingCycle)

    const subscription: ModuleSubscription = {
      id: this.generateSubscriptionId(),
      userId,
      moduleId,
      planId,
      status: 'pending',
      billingCycle: plan.billingCycle,
      price: plan.price,
      currency: plan.currency,
      startDate,
      nextBillingDate,
      autoRenew: options.autoRenew !== false,
      paymentMethodId: options.paymentMethodId,
      metadata: options.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.subscriptions.set(subscription.id, subscription)

    // Log billing event
    await this.logBillingEvent(subscription.id, 'subscription_created', {
      planId,
      price: plan.price,
      currency: plan.currency
    })

    return subscription
  }

  /**
   * Activate a subscription
   */
  async activateSubscription(subscriptionId: string): Promise<ModuleSubscription> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`)
    }

    const updated: ModuleSubscription = {
      ...subscription,
      status: 'active',
      updatedAt: new Date()
    }

    this.subscriptions.set(subscriptionId, updated)
    return updated
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    options: {
      immediate?: boolean
      reason?: string
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<ModuleSubscription> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`)
    }

    const cancellationDate = new Date()
    const endDate = options.immediate ? cancellationDate : subscription.nextBillingDate

    const updated: ModuleSubscription = {
      ...subscription,
      status: 'cancelled',
      cancellationDate,
      endDate,
      autoRenew: false,
      updatedAt: new Date(),
      metadata: {
        ...subscription.metadata,
        cancellationReason: options.reason,
        ...options.metadata
      }
    }

    this.subscriptions.set(subscriptionId, updated)

    // Log billing event
    await this.logBillingEvent(subscriptionId, 'subscription_cancelled', {
      reason: options.reason,
      immediate: options.immediate
    })

    return updated
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(
    subscriptionId: string,
    options: {
      reason?: string
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<ModuleSubscription> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`)
    }

    if (subscription.status !== 'active') {
      throw new Error('Only active subscriptions can be paused')
    }

    const pauseDate = new Date()
    const updated: ModuleSubscription = {
      ...subscription,
      status: 'paused',
      pauseDate,
      updatedAt: new Date(),
      metadata: {
        ...subscription.metadata,
        pauseReason: options.reason,
        ...options.metadata
      }
    }

    this.subscriptions.set(subscriptionId, updated)

    // Log billing event
    await this.logBillingEvent(subscriptionId, 'subscription_paused', {
      reason: options.reason
    })

    return updated
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(
    subscriptionId: string,
    options: {
      newBillingDate?: Date
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<ModuleSubscription> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`)
    }

    if (subscription.status !== 'paused') {
      throw new Error('Only paused subscriptions can be resumed')
    }

    const resumeDate = new Date()
    const nextBillingDate = options.newBillingDate || 
      this.calculateNextBillingDate(resumeDate, subscription.billingCycle)

    const updated: ModuleSubscription = {
      ...subscription,
      status: 'active',
      resumeDate,
      nextBillingDate,
      updatedAt: new Date(),
      metadata: {
        ...subscription.metadata,
        ...options.metadata
      }
    }

    this.subscriptions.set(subscriptionId, updated)

    // Log billing event
    await this.logBillingEvent(subscriptionId, 'subscription_resumed', {
      newBillingDate: nextBillingDate
    })

    return updated
  }

  // ============================================================================
  // BILLING & PAYMENT PROCESSING
  // ============================================================================

  /**
   * Process recurring billing for subscriptions
   */
  async processRecurringBilling(): Promise<{
    processed: number
    successful: number
    failed: number
    errors: string[]
  }> {
    const dueSubscriptions = await this.getDueSubscriptions()
    const results = {
      processed: dueSubscriptions.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const subscription of dueSubscriptions) {
      try {
        const billingResult = await this.processSubscriptionBilling(subscription.id)
        
        if (billingResult.success) {
          results.successful++
        } else {
          results.failed++
          results.errors.push(billingResult.error || 'Unknown billing error')
        }
      } catch (error) {
        results.failed++
        results.errors.push(
          error instanceof Error ? error.message : 'Unknown error occurred'
        )
      }
    }

    return results
  }

  /**
   * Process billing for a specific subscription
   */
  async processSubscriptionBilling(subscriptionId: string): Promise<{
    success: boolean
    transactionId?: string
    error?: string
  }> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    if (subscription.status !== 'active') {
      return { success: false, error: 'Subscription is not active' }
    }

    try {
      // Log billing attempt
      await this.logBillingEvent(subscriptionId, 'billing_attempt', {
        amount: subscription.price,
        currency: subscription.currency
      })

      // Process payment (would integrate with payment provider)
      const paymentResult = await this.processPayment(subscription)

      if (paymentResult.success) {
        // Update subscription with successful billing
        const nextBillingDate = this.calculateNextBillingDate(
          new Date(),
          subscription.billingCycle
        )

        const updated: ModuleSubscription = {
          ...subscription,
          lastBillingDate: new Date(),
          nextBillingDate,
          failureCount: 0, // Reset failure count on success
          updatedAt: new Date(),
          metadata: {
            ...subscription.metadata,
            lastTransactionId: paymentResult.transactionId
          }
        }

        this.subscriptions.set(subscriptionId, updated)

        // Log successful billing
        await this.logBillingEvent(subscriptionId, 'billing_success', {
          amount: subscription.price,
          currency: subscription.currency,
          transactionId: paymentResult.transactionId
        })

        return {
          success: true,
          transactionId: paymentResult.transactionId
        }
      } else {
        // Handle billing failure
        await this.handleBillingFailure(subscription, paymentResult.error)
        
        return {
          success: false,
          error: paymentResult.error
        }
      }
    } catch (error) {
      await this.handleBillingFailure(subscription, 
        error instanceof Error ? error.message : 'Unknown error'
      )
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Handle billing failure
   */
  private async handleBillingFailure(
    subscription: ModuleSubscription,
    error: string
  ): Promise<void> {
    const newFailureCount = subscription.failureCount + 1
    const maxFailures = subscription.maxFailures

    let newStatus: SubscriptionStatus = subscription.status

    if (newFailureCount >= maxFailures) {
      newStatus = 'failed'
    }

    const updated: ModuleSubscription = {
      ...subscription,
      status: newStatus,
      failureCount: newFailureCount,
      updatedAt: new Date(),
      metadata: {
        ...subscription.metadata,
        lastBillingError: error,
        lastBillingFailureDate: new Date()
      }
    }

    this.subscriptions.set(subscription.id, updated)

    // Log billing failure
    await this.logBillingEvent(subscription.id, 'billing_failure', {
      amount: subscription.price,
      currency: subscription.currency,
      failureReason: error,
      failureCount: newFailureCount
    })
  }

  // ============================================================================
  // SUBSCRIPTION QUERIES & ANALYTICS
  // ============================================================================

  /**
   * Get subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<ModuleSubscription[]> {
    const subscriptions = Array.from(this.subscriptions.values())
    return subscriptions.filter(sub => sub.userId === userId)
  }

  /**
   * Get active subscriptions for a module
   */
  async getModuleActiveSubscriptions(moduleId: string): Promise<ModuleSubscription[]> {
    const subscriptions = Array.from(this.subscriptions.values())
    return subscriptions.filter(sub => 
      sub.moduleId === moduleId && sub.status === 'active'
    )
  }

  /**
   * Get due subscriptions for billing
   */
  async getDueSubscriptions(): Promise<ModuleSubscription[]> {
    const now = new Date()
    const subscriptions = Array.from(this.subscriptions.values())
    
    return subscriptions.filter(sub => 
      sub.status === 'active' &&
      sub.nextBillingDate &&
      sub.nextBillingDate <= now &&
      sub.autoRenew
    )
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalSubscriptions: number
    activeSubscriptions: number
    cancelledSubscriptions: number
    pausedSubscriptions: number
    failedSubscriptions: number
    monthlyRecurringRevenue: number
    averageSubscriptionValue: number
    churnRate: number
    subscriptionGrowth: number
  }> {
    const subscriptions = Array.from(this.subscriptions.values())
    const filteredSubscriptions = subscriptions.filter(sub => {
      if (startDate && sub.createdAt < startDate) return false
      if (endDate && sub.createdAt > endDate) return false
      return true
    })

    const totalSubscriptions = filteredSubscriptions.length
    const activeSubscriptions = filteredSubscriptions.filter(s => s.status === 'active').length
    const cancelledSubscriptions = filteredSubscriptions.filter(s => s.status === 'cancelled').length
    const pausedSubscriptions = filteredSubscriptions.filter(s => s.status === 'paused').length
    const failedSubscriptions = filteredSubscriptions.filter(s => s.status === 'failed').length

    const monthlyRecurringRevenue = filteredSubscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, sub) => {
        const monthlyAmount = this.getMonthlyAmount(sub.price, sub.billingCycle)
        return sum + monthlyAmount
      }, 0)

    const totalRevenue = filteredSubscriptions.reduce((sum, sub) => sum + sub.price, 0)
    const averageSubscriptionValue = totalSubscriptions > 0 ? totalRevenue / totalSubscriptions : 0

    const churnRate = totalSubscriptions > 0 ? cancelledSubscriptions / totalSubscriptions : 0

    // Calculate growth (would compare with previous period)
    const subscriptionGrowth = 0 // Mock value

    return {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      pausedSubscriptions,
      failedSubscriptions,
      monthlyRecurringRevenue,
      averageSubscriptionValue,
      churnRate,
      subscriptionGrowth
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async processPayment(subscription: ModuleSubscription): Promise<{
    success: boolean
    transactionId?: string
    error?: string
  }> {
    // Mock payment processing - would integrate with actual payment provider
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  private calculateNextBillingDate(startDate: Date, billingCycle: BillingCycle): Date {
    const nextDate = new Date(startDate)
    
    switch (billingCycle) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
    }
    
    return nextDate
  }

  private getMonthlyAmount(price: number, billingCycle: BillingCycle): number {
    switch (billingCycle) {
      case 'weekly':
        return price * 4.33 // Average weeks per month
      case 'monthly':
        return price
      case 'quarterly':
        return price / 3
      case 'yearly':
        return price / 12
      default:
        return price
    }
  }

  private async logBillingEvent(
    subscriptionId: string,
    eventType: BillingEvent['eventType'],
    data: Record<string, unknown> = {}
  ): Promise<void> {
    const event: BillingEvent = {
      id: this.generateEventId(),
      subscriptionId,
      eventType,
      amount: data.amount as number,
      currency: data.currency as string,
      transactionId: data.transactionId as string,
      failureReason: data.failureReason as string,
      metadata: data,
      timestamp: new Date()
    }

    this.billingEvents.set(event.id, event)
  }

  private initializeDefaultPlans(): void {
    // Initialize with some default subscription plans for common modules
    // This would typically be loaded from a database
  }

  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const subscriptionManager = new SubscriptionManager()
export default subscriptionManager
