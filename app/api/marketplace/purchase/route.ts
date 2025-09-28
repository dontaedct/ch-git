/**
 * HT-035.3.3: Module Purchase API Endpoint
 * 
 * Handles module purchases, payment processing, and purchase validation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { pricingEngine } from '@/lib/marketplace/pricing-engine'
import { licensingManager } from '@/lib/marketplace/licensing-manager'
import { paymentIntegration } from '@/lib/marketplace/payment-integration'
import { revenueTracking } from '@/lib/marketplace/revenue-tracking'
import { subscriptionManager } from '@/lib/marketplace/subscription-manager'

// ============================================================================
// REQUEST/RESPONSE SCHEMAS
// ============================================================================

const PurchaseRequestSchema = z.object({
  moduleId: z.string(),
  userId: z.string(),
  tier: z.enum(['free', 'basic', 'premium', 'enterprise', 'custom']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).optional(),
  quantity: z.number().positive().optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'crypto']),
  paymentData: z.object({
    paymentMethodId: z.string().optional(),
    customerId: z.string().optional(),
    billingAddress: z.record(z.string(), z.unknown()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional()
  }),
  promotionCode: z.string().optional(),
  subscriptionData: z.object({
    isSubscription: z.boolean().optional(),
    billingCycle: z.enum(['monthly', 'yearly', 'quarterly', 'weekly']).optional(),
    autoRenew: z.boolean().optional()
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
})

const PurchaseValidationSchema = z.object({
  moduleId: z.string(),
  userId: z.string(),
  tier: z.string(),
  amount: z.number().positive(),
  currency: z.string()
})

// ============================================================================
// POST - Process Module Purchase
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = PurchaseRequestSchema.parse(body)

    // Step 1: Calculate pricing
    const pricing = await pricingEngine.calculatePrice(
      validatedData.moduleId,
      validatedData.tier,
      validatedData.currency,
      validatedData.userId,
      validatedData.quantity
    )

    // Apply promotional code if provided
    if (validatedData.promotionCode) {
      const promotionResult = await pricingEngine.applyPromotionalCode(
        validatedData.moduleId,
        validatedData.tier,
        validatedData.promotionCode,
        validatedData.userId
      )

      if (!promotionResult.valid) {
        return NextResponse.json(
          { error: 'Invalid promotional code' },
          { status: 400 }
        )
      }

      // Recalculate with promotion applied
      const promotionalPricing = await pricingEngine.calculatePrice(
        validatedData.moduleId,
        validatedData.tier,
        validatedData.currency,
        validatedData.userId,
        validatedData.quantity
      )

      // Validate final amount matches expectation
      if (Math.abs(promotionalPricing.finalPrice - pricing.finalPrice) > 0.01) {
        return NextResponse.json(
          { error: 'Pricing mismatch after promotion application' },
          { status: 400 }
        )
      }
    }

    // Step 2: Create payment transaction
    const transaction = await paymentIntegration.createTransaction(
      validatedData.userId,
      validatedData.moduleId,
      pricing.finalPrice,
      pricing.currency,
      validatedData.paymentMethod,
      {
        description: `Module purchase: ${validatedData.moduleId} (${validatedData.tier})`,
        metadata: {
          ...validatedData.metadata,
          tier: validatedData.tier,
          quantity: validatedData.quantity || 1,
          promotionCode: validatedData.promotionCode
        }
      }
    )

    // Step 3: Process payment
    const paymentResult = await paymentIntegration.processPayment(
      transaction.id,
      validatedData.paymentData
    )

    if (!paymentResult.success) {
      return NextResponse.json(
        { 
          error: 'Payment processing failed',
          details: paymentResult.error,
          transactionId: transaction.id
        },
        { status: 402 }
      )
    }

    // Step 4: Create license
    const license = await licensingManager.createLicense(
      validatedData.moduleId,
      validatedData.userId,
      validatedData.tier as any,
      {
        maxActivations: validatedData.quantity || 1,
        metadata: {
          transactionId: transaction.id,
          purchaseTier: validatedData.tier,
          promotionCode: validatedData.promotionCode
        }
      }
    )

    // Step 5: Activate license
    const activationResult = await licensingManager.activateLicense(
      license.activationKey,
      {
        deviceId: validatedData.paymentData.metadata?.deviceId as string,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    )

    if (!activationResult.success) {
      // If activation fails, refund the payment
      await paymentIntegration.refundTransaction(transaction.id, undefined, 'License activation failed')
      
      return NextResponse.json(
        { 
          error: 'License activation failed',
          details: activationResult.message,
          refunded: true
        },
        { status: 500 }
      )
    }

    // Step 6: Handle subscription if applicable
    let subscription = null
    if (validatedData.subscriptionData?.isSubscription) {
      // Create subscription plan first (if it doesn't exist)
      const plans = await subscriptionManager.getModuleSubscriptionPlans(validatedData.moduleId)
      let plan = plans.find(p => p.billingCycle === validatedData.subscriptionData?.billingCycle)

      if (!plan) {
        plan = await subscriptionManager.createSubscriptionPlan(
          validatedData.moduleId,
          {
            name: `${validatedData.tier} Plan`,
            description: `Subscription plan for ${validatedData.tier} tier`,
            billingCycle: validatedData.subscriptionData.billingCycle || 'monthly',
            price: pricing.finalPrice,
            currency: pricing.currency,
            features: [`Access to ${validatedData.tier} features`],
            limits: { activations: validatedData.quantity || 1 }
          }
        )
      }

      // Create subscription
      subscription = await subscriptionManager.createSubscription(
        validatedData.userId,
        validatedData.moduleId,
        plan.id,
        {
          paymentMethodId: validatedData.paymentData.paymentMethodId,
          autoRenew: validatedData.subscriptionData.autoRenew,
          metadata: {
            transactionId: transaction.id,
            licenseId: license.id
          }
        }
      )

      // Activate subscription
      await subscriptionManager.activateSubscription(subscription.id)
    }

    // Step 7: Track revenue
    await revenueTracking.trackPurchase(
      validatedData.moduleId,
      validatedData.userId,
      pricing.finalPrice,
      pricing.currency,
      transaction.id
    )

    // Step 8: Return success response
    return NextResponse.json({
      success: true,
      purchase: {
        transactionId: transaction.id,
        licenseId: license.id,
        activationKey: license.activationKey,
        subscriptionId: subscription?.id,
        amount: pricing.finalPrice,
        currency: pricing.currency,
        tier: validatedData.tier,
        status: 'completed'
      },
      license: {
        id: license.id,
        status: license.status,
        activationStatus: license.activationStatus,
        expirationDate: license.expirationDate,
        maxActivations: license.maxActivations,
        currentActivations: license.currentActivations
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        nextBillingDate: subscription.nextBillingDate,
        autoRenew: subscription.autoRenew
      } : null,
      metadata: {
        purchasedAt: new Date(),
        appliedPromotions: pricing.appliedPromotions,
        pricingBreakdown: pricing.breakdown
      }
    })

  } catch (error) {
    console.error('Purchase API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Purchase processing failed' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - Validate Purchase
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const moduleId = searchParams.get('moduleId')
    const userId = searchParams.get('userId')
    const tier = searchParams.get('tier')
    
    if (!moduleId || !userId || !tier) {
      return NextResponse.json(
        { error: 'moduleId, userId, and tier are required parameters' },
        { status: 400 }
      )
    }

    // Validate request parameters
    const validatedParams = PurchaseValidationSchema.parse({
      moduleId,
      userId,
      tier,
      amount: 0, // Will be calculated
      currency: 'USD'
    })

    // Check if user already has a license for this module/tier
    const userLicenses = await licensingManager.getUserLicenses(userId)
    const existingLicense = userLicenses.find(
      license => license.moduleId === moduleId && license.licenseType === tier
    )

    if (existingLicense) {
      // Validate existing license
      const validation = await licensingManager.validateLicense(existingLicense.id, {
        checkExpiration: true,
        checkActivations: true,
        requireActiveStatus: true
      })

      return NextResponse.json({
        success: true,
        hasExistingLicense: true,
        license: existingLicense,
        validation,
        message: 'User already has a license for this module'
      })
    }

    // Calculate pricing for validation
    const pricing = await pricingEngine.calculatePrice(
      moduleId,
      tier as any,
      'USD',
      userId
    )

    return NextResponse.json({
      success: true,
      hasExistingLicense: false,
      pricing: {
        amount: pricing.finalPrice,
        currency: pricing.currency,
        breakdown: pricing.breakdown
      },
      message: 'Purchase validation successful'
    })

  } catch (error) {
    console.error('Purchase validation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Purchase validation failed' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Purchase/Subscription
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    
    const action = searchParams.get('action')
    const subscriptionId = searchParams.get('subscriptionId')
    
    if (!action || !subscriptionId) {
      return NextResponse.json(
        { error: 'action and subscriptionId are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'cancel':
        const cancelResult = await subscriptionManager.cancelSubscription(
          subscriptionId,
          { reason: body.reason }
        )
        
        return NextResponse.json({
          success: cancelResult.success,
          error: cancelResult.error,
          message: 'Subscription cancelled successfully'
        })

      case 'pause':
        const pauseResult = await subscriptionManager.pauseSubscription(
          subscriptionId,
          { reason: body.reason }
        )
        
        return NextResponse.json({
          success: true,
          subscription: pauseResult,
          message: 'Subscription paused successfully'
        })

      case 'resume':
        const resumeResult = await subscriptionManager.resumeSubscription(
          subscriptionId,
          { newBillingDate: body.newBillingDate ? new Date(body.newBillingDate) : undefined }
        )
        
        return NextResponse.json({
          success: true,
          subscription: resumeResult,
          message: 'Subscription resumed successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: cancel, pause, resume' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Update purchase error:', error)
    
    return NextResponse.json(
      { error: 'Failed to update purchase/subscription' },
      { status: 500 }
    )
  }
}
