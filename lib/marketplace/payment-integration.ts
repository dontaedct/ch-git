/**
 * HT-035.3.3: Payment Integration for Module Marketplace
 * 
 * Handles payment processing, subscription management, and payment analytics
 * for module purchases and subscriptions.
 */

import { z } from 'zod'

// ============================================================================
// PAYMENT TYPES & SCHEMAS
// ============================================================================

export const PaymentStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded'
])

export const PaymentMethodSchema = z.enum([
  'credit_card',
  'debit_card',
  'paypal',
  'stripe',
  'bank_transfer',
  'crypto'
])

export const PaymentProviderSchema = z.enum([
  'stripe',
  'paypal',
  'square',
  'razorpay',
  'internal'
])

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  moduleId: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
  status: PaymentStatusSchema,
  paymentMethod: PaymentMethodSchema,
  paymentProvider: PaymentProviderSchema,
  providerTransactionId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  description: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const SubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  moduleId: z.string(),
  transactionId: z.string(),
  status: z.enum(['active', 'cancelled', 'expired', 'paused']),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']),
  amount: z.number().positive(),
  currency: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  nextBillingDate: z.date().optional(),
  providerSubscriptionId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const PaymentWebhookSchema = z.object({
  id: z.string(),
  provider: PaymentProviderSchema,
  eventType: z.string(),
  data: z.record(z.string(), z.unknown()),
  signature: z.string().optional(),
  processed: z.boolean().default(false),
  processedAt: z.date().optional(),
  createdAt: z.date()
})

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>
export type Transaction = z.infer<typeof TransactionSchema>
export type Subscription = z.infer<typeof SubscriptionSchema>
export type PaymentWebhook = z.infer<typeof PaymentWebhookSchema>

// ============================================================================
// PAYMENT INTEGRATION CLASS
// ============================================================================

export class PaymentIntegration {
  private transactionCache: Map<string, Transaction> = new Map()
  private subscriptionCache: Map<string, Subscription> = new Map()
  private webhookCache: Map<string, PaymentWebhook> = new Map()
  
  constructor() {
    // Initialize payment integration
  }

  // ============================================================================
  // TRANSACTION MANAGEMENT
  // ============================================================================

  /**
   * Create a new payment transaction
   */
  async createTransaction(
    userId: string,
    moduleId: string,
    amount: number,
    currency: string,
    paymentMethod: PaymentMethod,
    options: {
      description?: string
      metadata?: Record<string, unknown>
      provider?: PaymentProvider
    } = {}
  ): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      userId,
      moduleId,
      amount,
      currency,
      status: 'pending',
      paymentMethod,
      paymentProvider: options.provider || 'stripe',
      description: options.description || `Module purchase: ${moduleId}`,
      metadata: options.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.transactionCache.set(transaction.id, transaction)
    return transaction
  }

  /**
   * Process payment for a transaction
   */
  async processPayment(
    transactionId: string,
    paymentData: {
      paymentMethodId?: string
      customerId?: string
      billingAddress?: Record<string, unknown>
      metadata?: Record<string, unknown>
    }
  ): Promise<{
    success: boolean
    transaction?: Transaction
    providerResponse?: Record<string, unknown>
    error?: string
  }> {
    const transaction = await this.getTransaction(transactionId)
    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.status !== 'pending') {
      return { success: false, error: 'Transaction is not in pending status' }
    }

    try {
      // Update transaction status to processing
      await this.updateTransactionStatus(transactionId, 'processing')

      // Process payment with provider
      const providerResponse = await this.processWithProvider(
        transaction,
        paymentData
      )

      if (providerResponse.success) {
        // Update transaction with provider details
        const updatedTransaction = await this.updateTransaction(transactionId, {
          status: 'completed',
          providerTransactionId: providerResponse.transactionId,
          providerPaymentId: providerResponse.paymentId,
          metadata: {
            ...transaction.metadata,
            providerResponse: providerResponse.data
          }
        })

        return {
          success: true,
          transaction: updatedTransaction,
          providerResponse: providerResponse.data
        }
      } else {
        // Payment failed
        await this.updateTransactionStatus(transactionId, 'failed')
        return {
          success: false,
          error: providerResponse.error || 'Payment processing failed'
        }
      }
    } catch (error) {
      await this.updateTransactionStatus(transactionId, 'failed')
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<{
    success: boolean
    refundId?: string
    error?: string
  }> {
    const transaction = await this.getTransaction(transactionId)
    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.status !== 'completed') {
      return { success: false, error: 'Transaction is not completed' }
    }

    try {
      const refundAmount = amount || transaction.amount
      
      // Process refund with provider
      const refundResponse = await this.refundWithProvider(
        transaction,
        refundAmount,
        reason
      )

      if (refundResponse.success) {
        // Update transaction status
        const newStatus = refundAmount === transaction.amount ? 'refunded' : 'partially_refunded'
        await this.updateTransaction(transactionId, {
          status: newStatus,
          metadata: {
            ...transaction.metadata,
            refundId: refundResponse.refundId,
            refundAmount,
            refundReason: reason,
            refundedAt: new Date()
          }
        })

        return {
          success: true,
          refundId: refundResponse.refundId
        }
      } else {
        return {
          success: false,
          error: refundResponse.error || 'Refund processing failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Create a subscription for recurring payments
   */
  async createSubscription(
    userId: string,
    moduleId: string,
    transactionId: string,
    billingCycle: 'monthly' | 'yearly',
    amount: number,
    currency: string,
    options: {
      startDate?: Date
      providerSubscriptionId?: string
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<Subscription> {
    const startDate = options.startDate || new Date()
    const endDate = this.calculateEndDate(startDate, billingCycle)
    const nextBillingDate = this.calculateNextBillingDate(startDate, billingCycle)

    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      userId,
      moduleId,
      transactionId,
      status: 'active',
      billingCycle,
      amount,
      currency,
      startDate,
      endDate,
      nextBillingDate,
      providerSubscriptionId: options.providerSubscriptionId,
      metadata: options.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.subscriptionCache.set(subscription.id, subscription)
    return subscription
  }

  /**
   * Process recurring payment for subscription
   */
  async processRecurringPayment(subscriptionId: string): Promise<{
    success: boolean
    transaction?: Transaction
    error?: string
  }> {
    const subscription = await this.getSubscription(subscriptionId)
    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    if (subscription.status !== 'active') {
      return { success: false, error: 'Subscription is not active' }
    }

    if (subscription.nextBillingDate && subscription.nextBillingDate > new Date()) {
      return { success: false, error: 'Subscription is not due for billing' }
    }

    try {
      // Create new transaction for recurring payment
      const transaction = await this.createTransaction(
        subscription.userId,
        subscription.moduleId,
        subscription.amount,
        subscription.currency,
        'credit_card', // Default method for recurring payments
        {
          description: `Recurring payment for subscription: ${subscriptionId}`,
          provider: 'stripe'
        }
      )

      // Process the payment
      const paymentResult = await this.processPayment(transaction.id, {
        customerId: subscription.metadata?.customerId as string
      })

      if (paymentResult.success) {
        // Update subscription with next billing date
        const nextBillingDate = this.calculateNextBillingDate(
          new Date(),
          subscription.billingCycle
        )
        
        await this.updateSubscription(subscriptionId, {
          nextBillingDate,
          metadata: {
            ...subscription.metadata,
            lastPaymentTransactionId: transaction.id,
            lastPaymentDate: new Date()
          }
        })

        return {
          success: true,
          transaction: paymentResult.transaction
        }
      } else {
        // Payment failed - handle subscription status
        await this.handleFailedRecurringPayment(subscriptionId, paymentResult.error)
        return {
          success: false,
          error: paymentResult.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason?: string
  ): Promise<{
    success: boolean
    error?: string
  }> {
    const subscription = await this.getSubscription(subscriptionId)
    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    try {
      // Cancel with provider if applicable
      if (subscription.providerSubscriptionId) {
        await this.cancelWithProvider(subscription.providerSubscriptionId)
      }

      // Update subscription status
      await this.updateSubscription(subscriptionId, {
        status: 'cancelled',
        endDate: new Date(),
        metadata: {
          ...subscription.metadata,
          cancellationReason: reason,
          cancelledAt: new Date()
        }
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // ============================================================================
  // WEBHOOK HANDLING
  // ============================================================================

  /**
   * Process payment webhook from provider
   */
  async processWebhook(
    provider: PaymentProvider,
    eventType: string,
    data: Record<string, unknown>,
    signature?: string
  ): Promise<{
    success: boolean
    processed: boolean
    error?: string
  }> {
    try {
      // Verify webhook signature if provided
      if (signature && !this.verifyWebhookSignature(provider, data, signature)) {
        return { success: false, error: 'Invalid webhook signature' }
      }

      // Create webhook record
      const webhook: PaymentWebhook = {
        id: this.generateWebhookId(),
        provider,
        eventType,
        data,
        signature,
        processed: false,
        createdAt: new Date()
      }

      this.webhookCache.set(webhook.id, webhook)

      // Process webhook based on event type
      const processed = await this.handleWebhookEvent(webhook)

      if (processed) {
        await this.markWebhookProcessed(webhook.id)
      }

      return { success: true, processed }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalRevenue: number
    totalTransactions: number
    successfulTransactions: number
    failedTransactions: number
    refundedTransactions: number
    averageTransactionValue: number
    revenueByMonth: Record<string, number>
    topModules: Array<{ moduleId: string; revenue: number; transactions: number }>
  }> {
    const transactions = Array.from(this.transactionCache.values())
    const filteredTransactions = transactions.filter(t => {
      if (startDate && t.createdAt < startDate) return false
      if (endDate && t.createdAt > endDate) return false
      return true
    })

    const totalRevenue = filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalTransactions = filteredTransactions.length
    const successfulTransactions = filteredTransactions.filter(t => t.status === 'completed').length
    const failedTransactions = filteredTransactions.filter(t => t.status === 'failed').length
    const refundedTransactions = filteredTransactions.filter(t => 
      t.status === 'refunded' || t.status === 'partially_refunded'
    ).length

    const averageTransactionValue = successfulTransactions > 0 
      ? totalRevenue / successfulTransactions 
      : 0

    // Group by module for top modules
    const moduleStats = filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        if (!acc[t.moduleId]) {
          acc[t.moduleId] = { revenue: 0, transactions: 0 }
        }
        acc[t.moduleId].revenue += t.amount
        acc[t.moduleId].transactions += 1
        return acc
      }, {} as Record<string, { revenue: number; transactions: number }>)

    const topModules = Object.entries(moduleStats)
      .map(([moduleId, stats]) => ({ moduleId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      totalRevenue,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      refundedTransactions,
      averageTransactionValue,
      revenueByMonth: {}, // Would be calculated from actual data
      topModules
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async getTransaction(transactionId: string): Promise<Transaction | null> {
    return this.transactionCache.get(transactionId) || null
  }

  private async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionCache.get(subscriptionId) || null
  }

  private async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const current = await this.getTransaction(transactionId)
    if (!current) throw new Error('Transaction not found')

    const updated = { ...current, ...updates, updatedAt: new Date() }
    this.transactionCache.set(transactionId, updated)
    return updated
  }

  private async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const current = await this.getSubscription(subscriptionId)
    if (!current) throw new Error('Subscription not found')

    const updated = { ...current, ...updates, updatedAt: new Date() }
    this.subscriptionCache.set(subscriptionId, updated)
    return updated
  }

  private async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus
  ): Promise<void> {
    await this.updateTransaction(transactionId, { status })
  }

  private async markWebhookProcessed(webhookId: string): Promise<void> {
    const webhook = this.webhookCache.get(webhookId)
    if (webhook) {
      webhook.processed = true
      webhook.processedAt = new Date()
    }
  }

  private async handleWebhookEvent(webhook: PaymentWebhook): Promise<boolean> {
    // Handle different webhook event types
    switch (webhook.eventType) {
      case 'payment.succeeded':
        return await this.handlePaymentSucceeded(webhook.data)
      case 'payment.failed':
        return await this.handlePaymentFailed(webhook.data)
      case 'subscription.updated':
        return await this.handleSubscriptionUpdated(webhook.data)
      default:
        return false
    }
  }

  private async handlePaymentSucceeded(data: Record<string, unknown>): Promise<boolean> {
    // Update transaction status based on provider data
    return true
  }

  private async handlePaymentFailed(data: Record<string, unknown>): Promise<boolean> {
    // Handle failed payment
    return true
  }

  private async handleSubscriptionUpdated(data: Record<string, unknown>): Promise<boolean> {
    // Update subscription based on provider data
    return true
  }

  private async handleFailedRecurringPayment(
    subscriptionId: string,
    error?: string
  ): Promise<void> {
    // Handle failed recurring payment - might suspend subscription after multiple failures
    const subscription = await this.getSubscription(subscriptionId)
    if (subscription) {
      const failureCount = (subscription.metadata?.paymentFailureCount as number) || 0
      const newFailureCount = failureCount + 1

      if (newFailureCount >= 3) {
        // Suspend subscription after 3 failures
        await this.updateSubscription(subscriptionId, {
          status: 'paused',
          metadata: {
            ...subscription.metadata,
            paymentFailureCount: newFailureCount,
            suspendedAt: new Date(),
            suspensionReason: error
          }
        })
      } else {
        // Update failure count
        await this.updateSubscription(subscriptionId, {
          metadata: {
            ...subscription.metadata,
            paymentFailureCount: newFailureCount,
            lastFailureReason: error
          }
        })
      }
    }
  }

  private async processWithProvider(
    transaction: Transaction,
    paymentData: Record<string, unknown>
  ): Promise<{
    success: boolean
    transactionId?: string
    paymentId?: string
    data?: Record<string, unknown>
    error?: string
  }> {
    // Mock provider integration - would integrate with actual payment providers
    return {
      success: true,
      transactionId: `provider_txn_${Date.now()}`,
      paymentId: `provider_pay_${Date.now()}`,
      data: { processed: true }
    }
  }

  private async refundWithProvider(
    transaction: Transaction,
    amount: number,
    reason?: string
  ): Promise<{
    success: boolean
    refundId?: string
    error?: string
  }> {
    // Mock provider integration
    return {
      success: true,
      refundId: `refund_${Date.now()}`
    }
  }

  private async cancelWithProvider(providerSubscriptionId: string): Promise<void> {
    // Mock provider integration
  }

  private verifyWebhookSignature(
    provider: PaymentProvider,
    data: Record<string, unknown>,
    signature: string
  ): boolean {
    // Mock signature verification - would implement actual verification
    return true
  }

  private calculateEndDate(startDate: Date, billingCycle: string): Date {
    const endDate = new Date(startDate)
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }
    return endDate
  }

  private calculateNextBillingDate(startDate: Date, billingCycle: string): Date {
    return this.calculateEndDate(startDate, billingCycle)
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateWebhookId(): string {
    return `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const paymentIntegration = new PaymentIntegration()
export default paymentIntegration
