/**
 * HT-035.3.3: Module Pricing Engine & Tier System
 * 
 * Provides comprehensive pricing management for modules with tier-based pricing,
 * dynamic pricing, promotional pricing, and revenue optimization.
 */

import { z } from 'zod'

// ============================================================================
// PRICING TYPES & SCHEMAS
// ============================================================================

export const PricingTierSchema = z.enum([
  'free',
  'basic', 
  'premium',
  'enterprise',
  'custom'
])

export const PricingModelSchema = z.enum([
  'one-time',
  'subscription-monthly',
  'subscription-yearly',
  'usage-based',
  'freemium'
])

export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])

export const PricingStructureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tier: PricingTierSchema,
  model: PricingModelSchema,
  currency: CurrencySchema,
  basePrice: z.number().positive(),
  features: z.array(z.string()),
  limits: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
  metadata: z.record(z.string(), z.unknown()).optional()
})

export const PromotionalPricingSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  discountType: z.enum(['percentage', 'fixed', 'tier-upgrade']),
  discountValue: z.number().positive(),
  startDate: z.date(),
  endDate: z.date(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  maxUses: z.number().optional(),
  currentUses: z.number().default(0)
})

export const ModulePricingSchema = z.object({
  moduleId: z.string(),
  pricingStructures: z.array(PricingStructureSchema),
  promotionalPricing: z.array(PromotionalPricingSchema).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type PricingTier = z.infer<typeof PricingTierSchema>
export type PricingModel = z.infer<typeof PricingModelSchema>
export type Currency = z.infer<typeof CurrencySchema>
export type PricingStructure = z.infer<typeof PricingStructureSchema>
export type PromotionalPricing = z.infer<typeof PromotionalPricingSchema>
export type ModulePricing = z.infer<typeof ModulePricingSchema>

// ============================================================================
// PRICING ENGINE CLASS
// ============================================================================

export class PricingEngine {
  private pricingCache: Map<string, ModulePricing> = new Map()
  private currencyRates: Map<string, number> = new Map()
  
  constructor() {
    this.initializeDefaultRates()
  }

  /**
   * Create a new pricing structure for a module
   */
  async createPricingStructure(
    moduleId: string,
    pricing: Omit<PricingStructure, 'id'>
  ): Promise<PricingStructure> {
    const structure: PricingStructure = {
      ...pricing,
      id: this.generatePricingId(moduleId, pricing.tier)
    }

    await this.updateModulePricing(moduleId, (current) => ({
      ...current,
      pricingStructures: [...(current?.pricingStructures || []), structure],
      updatedAt: new Date()
    }))

    return structure
  }

  /**
   * Calculate the final price for a module with all discounts applied
   */
  async calculatePrice(
    moduleId: string,
    tier: PricingTier,
    currency: Currency = 'USD',
    userId?: string,
    quantity: number = 1
  ): Promise<{
    basePrice: number
    discountAmount: number
    finalPrice: number
    currency: Currency
    appliedPromotions: PromotionalPricing[]
    breakdown: {
      subtotal: number
      discounts: Array<{ name: string; amount: number; type: string }>
      total: number
    }
  }> {
    const modulePricing = await this.getModulePricing(moduleId)
    if (!modulePricing) {
      throw new Error(`Module pricing not found: ${moduleId}`)
    }

    const structure = modulePricing.pricingStructures.find(s => s.tier === tier)
    if (!structure) {
      throw new Error(`Pricing structure not found for tier: ${tier}`)
    }

    // Convert to requested currency
    const basePrice = this.convertCurrency(structure.basePrice, structure.currency, currency)
    const subtotal = basePrice * quantity

    // Apply promotional pricing
    const applicablePromotions = await this.getApplicablePromotions(
      moduleId,
      tier,
      userId
    )

    let totalDiscount = 0
    const appliedPromotions: PromotionalPricing[] = []
    const discountBreakdown: Array<{ name: string; amount: number; type: string }> = []

    for (const promotion of applicablePromotions) {
      const discount = this.calculateDiscount(subtotal, promotion)
      totalDiscount += discount
      appliedPromotions.push(promotion)
      discountBreakdown.push({
        name: promotion.name,
        amount: discount,
        type: promotion.discountType
      })
    }

    const finalPrice = Math.max(0, subtotal - totalDiscount)

    return {
      basePrice,
      discountAmount: totalDiscount,
      finalPrice,
      currency,
      appliedPromotions,
      breakdown: {
        subtotal,
        discounts: discountBreakdown,
        total: finalPrice
      }
    }
  }

  /**
   * Create a promotional pricing offer
   */
  async createPromotionalPricing(
    moduleId: string,
    promotion: Omit<PromotionalPricing, 'id' | 'currentUses'>
  ): Promise<PromotionalPricing> {
    const promotionalPricing: PromotionalPricing = {
      ...promotion,
      id: this.generatePromotionId(moduleId),
      currentUses: 0
    }

    await this.updateModulePricing(moduleId, (current) => ({
      ...current,
      promotionalPricing: [...(current?.promotionalPricing || []), promotionalPricing],
      updatedAt: new Date()
    }))

    return promotionalPricing
  }

  /**
   * Get applicable promotions for a module and tier
   */
  async getApplicablePromotions(
    moduleId: string,
    tier: PricingTier,
    userId?: string
  ): Promise<PromotionalPricing[]> {
    const modulePricing = await this.getModulePricing(moduleId)
    if (!modulePricing) return []

    const now = new Date()
    
    return modulePricing.promotionalPricing.filter(promotion => {
      // Check if promotion is active
      if (now < promotion.startDate || now > promotion.endDate) return false
      
      // Check usage limits
      if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) return false
      
      // Check tier conditions
      if (promotion.conditions?.tier && promotion.conditions.tier !== tier) return false
      
      // Check user conditions
      if (promotion.conditions?.userId && promotion.conditions.userId !== userId) return false
      
      return true
    })
  }

  /**
   * Convert price between currencies
   */
  convertCurrency(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount
    
    const fromRate = this.currencyRates.get(from) || 1
    const toRate = this.currencyRates.get(to) || 1
    
    return (amount / fromRate) * toRate
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async getModulePricing(moduleId: string): Promise<ModulePricing | null> {
    // Check cache first
    if (this.pricingCache.has(moduleId)) {
      return this.pricingCache.get(moduleId)!
    }

    // In a real implementation, this would fetch from database
    return null
  }

  private async updateModulePricing(
    moduleId: string,
    updater: (current: ModulePricing | null) => ModulePricing
  ): Promise<ModulePricing> {
    const current = await this.getModulePricing(moduleId)
    const updated = updater(current)
    
    // Cache the updated pricing
    this.pricingCache.set(moduleId, updated)
    
    return updated
  }

  private calculateDiscount(baseAmount: number, promotion: PromotionalPricing): number {
    switch (promotion.discountType) {
      case 'percentage':
        return baseAmount * (promotion.discountValue / 100)
      case 'fixed':
        return Math.min(promotion.discountValue, baseAmount)
      case 'tier-upgrade':
        return promotion.discountValue
      default:
        return 0
    }
  }

  private generatePricingId(moduleId: string, tier: PricingTier): string {
    return `pricing_${moduleId}_${tier}_${Date.now()}`
  }

  private generatePromotionId(moduleId: string): string {
    return `promo_${moduleId}_${Date.now()}`
  }

  private initializeDefaultRates(): void {
    // Default currency rates (would be fetched from external API)
    this.currencyRates.set('USD', 1.0)
    this.currencyRates.set('EUR', 0.85)
    this.currencyRates.set('GBP', 0.73)
    this.currencyRates.set('CAD', 1.25)
    this.currencyRates.set('AUD', 1.35)
  }
}

export const pricingEngine = new PricingEngine()
export default pricingEngine