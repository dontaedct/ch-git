/**
 * HT-035.3.3: Module Pricing API Endpoint
 * 
 * Handles module pricing queries, calculations, and promotional pricing.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { pricingEngine } from '@/lib/marketplace/pricing-engine'

// ============================================================================
// REQUEST/RESPONSE SCHEMAS
// ============================================================================

const PricingRequestSchema = z.object({
  moduleId: z.string(),
  tier: z.enum(['free', 'basic', 'premium', 'enterprise', 'custom']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).optional(),
  userId: z.string().optional(),
  quantity: z.number().positive().optional(),
  promotionCode: z.string().optional()
})

const CreatePricingStructureSchema = z.object({
  moduleId: z.string(),
  name: z.string(),
  description: z.string(),
  tier: z.enum(['free', 'basic', 'premium', 'enterprise', 'custom']),
  model: z.enum(['one-time', 'subscription-monthly', 'subscription-yearly', 'usage-based', 'freemium']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  basePrice: z.number().positive(),
  features: z.array(z.string()),
  limits: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()).optional()
})

const CreatePromotionSchema = z.object({
  moduleId: z.string(),
  name: z.string(),
  description: z.string(),
  discountType: z.enum(['percentage', 'fixed', 'tier-upgrade']),
  discountValue: z.number().positive(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  conditions: z.record(z.string(), z.unknown()).optional(),
  maxUses: z.number().optional()
})

// ============================================================================
// GET - Retrieve Module Pricing
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryParams = {
      moduleId: searchParams.get('moduleId'),
      tier: searchParams.get('tier'),
      currency: searchParams.get('currency'),
      userId: searchParams.get('userId'),
      quantity: searchParams.get('quantity'),
      promotionCode: searchParams.get('promotionCode')
    }

    // Validate required parameters
    if (!queryParams.moduleId || !queryParams.tier) {
      return NextResponse.json(
        { error: 'moduleId and tier are required parameters' },
        { status: 400 }
      )
    }

    // Validate and transform parameters
    const validatedParams = PricingRequestSchema.parse({
      ...queryParams,
      quantity: queryParams.quantity ? parseInt(queryParams.quantity) : undefined
    })

    // Calculate pricing
    const pricing = await pricingEngine.calculatePrice(
      validatedParams.moduleId,
      validatedParams.tier,
      validatedParams.currency,
      validatedParams.userId,
      validatedParams.quantity
    )

    // Apply promotional code if provided
    let promotionApplied = false
    let promotionDetails = null

    if (validatedParams.promotionCode) {
      const promotionResult = await pricingEngine.applyPromotionalCode(
        validatedParams.moduleId,
        validatedParams.tier,
        validatedParams.promotionCode,
        validatedParams.userId
      )

      if (promotionResult.valid && promotionResult.promotion) {
        promotionApplied = true
        promotionDetails = promotionResult.promotion
        
        // Recalculate pricing with promotion
        const promotionalPricing = await pricingEngine.calculatePrice(
          validatedParams.moduleId,
          validatedParams.tier,
          validatedParams.currency,
          validatedParams.userId,
          validatedParams.quantity
        )

        return NextResponse.json({
          success: true,
          pricing: promotionalPricing,
          promotion: {
            applied: promotionApplied,
            code: validatedParams.promotionCode,
            details: promotionDetails
          },
          metadata: {
            calculatedAt: new Date(),
            currency: validatedParams.currency || 'USD'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      pricing,
      promotion: {
        applied: promotionApplied,
        code: validatedParams.promotionCode,
        details: promotionDetails
      },
      metadata: {
        calculatedAt: new Date(),
        currency: validatedParams.currency || 'USD'
      }
    })

  } catch (error) {
    console.error('Pricing API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Pricing Structure
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = CreatePricingStructureSchema.parse(body)

    // Create pricing structure
    const pricingStructure = await pricingEngine.createPricingStructure(
      validatedData.moduleId,
      validatedData
    )

    return NextResponse.json({
      success: true,
      pricingStructure,
      message: 'Pricing structure created successfully'
    })

  } catch (error) {
    console.error('Create pricing structure error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create pricing structure' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Pricing Structure
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    
    const moduleId = searchParams.get('moduleId')
    const structureId = searchParams.get('structureId')
    
    if (!moduleId || !structureId) {
      return NextResponse.json(
        { error: 'moduleId and structureId are required' },
        { status: 400 }
      )
    }

    // Update pricing structure
    const updatedStructure = await pricingEngine.updatePricingStructure(
      moduleId,
      structureId,
      body
    )

    return NextResponse.json({
      success: true,
      pricingStructure: updatedStructure,
      message: 'Pricing structure updated successfully'
    })

  } catch (error) {
    console.error('Update pricing structure error:', error)
    
    return NextResponse.json(
      { error: 'Failed to update pricing structure' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Remove Pricing Structure
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const moduleId = searchParams.get('moduleId')
    const structureId = searchParams.get('structureId')
    
    if (!moduleId || !structureId) {
      return NextResponse.json(
        { error: 'moduleId and structureId are required' },
        { status: 400 }
      )
    }

    // Remove pricing structure
    await pricingEngine.removePricingStructure(moduleId, structureId)

    return NextResponse.json({
      success: true,
      message: 'Pricing structure removed successfully'
    })

  } catch (error) {
    console.error('Remove pricing structure error:', error)
    
    return NextResponse.json(
      { error: 'Failed to remove pricing structure' },
      { status: 500 }
    )
  }
}
