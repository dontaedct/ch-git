/**
 * HT-035.3.3: Module Licensing Manager & Activation System
 * 
 * Handles module licensing, activation, validation, and compliance tracking
 * for the marketplace module system.
 */

import { z } from 'zod'

// ============================================================================
// LICENSING TYPES & SCHEMAS
// ============================================================================

export const LicenseTypeSchema = z.enum([
  'trial',
  'standard',
  'premium',
  'enterprise',
  'custom'
])

export const LicenseStatusSchema = z.enum([
  'active',
  'expired',
  'suspended',
  'revoked',
  'pending'
])

export const ActivationStatusSchema = z.enum([
  'activated',
  'pending',
  'failed',
  'expired'
])

export const ModuleLicenseSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  userId: z.string(),
  licenseType: LicenseTypeSchema,
  status: LicenseStatusSchema,
  activationStatus: ActivationStatusSchema,
  activationKey: z.string(),
  activationDate: z.date().optional(),
  expirationDate: z.date().optional(),
  maxActivations: z.number().positive(),
  currentActivations: z.number().default(0),
  licenseData: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const LicenseActivationSchema = z.object({
  id: z.string(),
  licenseId: z.string(),
  activationKey: z.string(),
  deviceId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  activationDate: z.date(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional()
})

export const LicenseValidationSchema = z.object({
  isValid: z.boolean(),
  status: LicenseStatusSchema,
  activationStatus: ActivationStatusSchema,
  expirationDate: z.date().optional(),
  remainingActivations: z.number(),
  violations: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([])
})

export type LicenseType = z.infer<typeof LicenseTypeSchema>
export type LicenseStatus = z.infer<typeof LicenseStatusSchema>
export type ActivationStatus = z.infer<typeof ActivationStatusSchema>
export type ModuleLicense = z.infer<typeof ModuleLicenseSchema>
export type LicenseActivation = z.infer<typeof LicenseActivationSchema>
export type LicenseValidation = z.infer<typeof LicenseValidationSchema>

// ============================================================================
// LICENSING MANAGER CLASS
// ============================================================================

export class LicensingManager {
  private licenseCache: Map<string, ModuleLicense> = new Map()
  private activationCache: Map<string, LicenseActivation[]> = new Map()
  
  constructor() {
    // Initialize licensing manager
  }

  // ============================================================================
  // LICENSE CREATION & MANAGEMENT
  // ============================================================================

  /**
   * Create a new module license
   */
  async createLicense(
    moduleId: string,
    userId: string,
    licenseType: LicenseType,
    options: {
      maxActivations?: number
      expirationDate?: Date
      licenseData?: Record<string, unknown>
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<ModuleLicense> {
    const license: ModuleLicense = {
      id: this.generateLicenseId(),
      moduleId,
      userId,
      licenseType,
      status: 'pending',
      activationStatus: 'pending',
      activationKey: this.generateActivationKey(),
      maxActivations: options.maxActivations || 1,
      currentActivations: 0,
      licenseData: options.licenseData,
      metadata: options.metadata,
      expirationDate: options.expirationDate,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Cache the license
    this.licenseCache.set(license.id, license)
    
    // In a real implementation, this would save to database
    return license
  }

  /**
   * Update license status
   */
  async updateLicenseStatus(
    licenseId: string,
    status: LicenseStatus,
    reason?: string
  ): Promise<ModuleLicense> {
    const license = await this.getLicense(licenseId)
    if (!license) {
      throw new Error(`License not found: ${licenseId}`)
    }

    const updated: ModuleLicense = {
      ...license,
      status,
      updatedAt: new Date(),
      metadata: {
        ...license.metadata,
        statusChangeReason: reason,
        statusChangedAt: new Date()
      }
    }

    this.licenseCache.set(licenseId, updated)
    return updated
  }

  /**
   * Get license by ID
   */
  async getLicense(licenseId: string): Promise<ModuleLicense | null> {
    // Check cache first
    if (this.licenseCache.has(licenseId)) {
      return this.licenseCache.get(licenseId)!
    }

    // In a real implementation, this would fetch from database
    return null
  }

  /**
   * Get licenses for a user
   */
  async getUserLicenses(userId: string): Promise<ModuleLicense[]> {
    // In a real implementation, this would query the database
    const licenses = Array.from(this.licenseCache.values())
    return licenses.filter(license => license.userId === userId)
  }

  /**
   * Get licenses for a module
   */
  async getModuleLicenses(moduleId: string): Promise<ModuleLicense[]> {
    const licenses = Array.from(this.licenseCache.values())
    return licenses.filter(license => license.moduleId === moduleId)
  }

  // ============================================================================
  // LICENSE ACTIVATION
  // ============================================================================

  /**
   * Activate a license
   */
  async activateLicense(
    activationKey: string,
    options: {
      deviceId?: string
      ipAddress?: string
      userAgent?: string
    } = {}
  ): Promise<{
    success: boolean
    license?: ModuleLicense
    activation?: LicenseActivation
    message?: string
  }> {
    const license = await this.getLicenseByActivationKey(activationKey)
    if (!license) {
      return { success: false, message: 'Invalid activation key' }
    }

    // Validate license status
    if (license.status !== 'active') {
      return { success: false, message: 'License is not active' }
    }

    if (license.activationStatus === 'activated' && license.currentActivations >= license.maxActivations) {
      return { success: false, message: 'Maximum activations reached' }
    }

    // Check expiration
    if (license.expirationDate && license.expirationDate < new Date()) {
      return { success: false, message: 'License has expired' }
    }

    // Create activation record
    const activation: LicenseActivation = {
      id: this.generateActivationId(),
      licenseId: license.id,
      activationKey,
      deviceId: options.deviceId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      activationDate: new Date(),
      isActive: true,
      metadata: {
        activationMethod: 'key',
        ...options
      }
    }

    // Update license
    const updatedLicense: ModuleLicense = {
      ...license,
      activationStatus: 'activated',
      currentActivations: license.currentActivations + 1,
      activationDate: license.activationDate || new Date(),
      updatedAt: new Date()
    }

    // Cache updates
    this.licenseCache.set(license.id, updatedLicense)
    
    const activations = this.activationCache.get(license.id) || []
    activations.push(activation)
    this.activationCache.set(license.id, activations)

    return {
      success: true,
      license: updatedLicense,
      activation
    }
  }

  /**
   * Deactivate a license
   */
  async deactivateLicense(
    licenseId: string,
    activationId: string,
    reason?: string
  ): Promise<{
    success: boolean
    message?: string
  }> {
    const license = await this.getLicense(licenseId)
    if (!license) {
      return { success: false, message: 'License not found' }
    }

    const activations = this.activationCache.get(licenseId) || []
    const activation = activations.find(a => a.id === activationId && a.isActive)
    
    if (!activation) {
      return { success: false, message: 'Active activation not found' }
    }

    // Deactivate the specific activation
    activation.isActive = false
    
    // Update license if no active activations remain
    const activeActivations = activations.filter(a => a.isActive)
    const updatedLicense: ModuleLicense = {
      ...license,
      currentActivations: activeActivations.length,
      activationStatus: activeActivations.length === 0 ? 'pending' : 'activated',
      updatedAt: new Date(),
      metadata: {
        ...license.metadata,
        deactivationReason: reason,
        deactivatedAt: new Date()
      }
    }

    this.licenseCache.set(licenseId, updatedLicense)
    
    return { success: true, message: 'License deactivated successfully' }
  }

  // ============================================================================
  // LICENSE VALIDATION
  // ============================================================================

  /**
   * Validate a license
   */
  async validateLicense(
    licenseId: string,
    options: {
      checkExpiration?: boolean
      checkActivations?: boolean
      requireActiveStatus?: boolean
    } = {}
  ): Promise<LicenseValidation> {
    const license = await this.getLicense(licenseId)
    if (!license) {
      return {
        isValid: false,
        status: 'revoked',
        activationStatus: 'failed',
        remainingActivations: 0,
        violations: ['License not found']
      }
    }

    const violations: string[] = []
    const warnings: string[] = []

    // Check license status
    if (options.requireActiveStatus && license.status !== 'active') {
      violations.push(`License status is ${license.status}`)
    }

    // Check expiration
    if (options.checkExpiration && license.expirationDate) {
      if (license.expirationDate < new Date()) {
        violations.push('License has expired')
      } else {
        const daysUntilExpiration = Math.ceil(
          (license.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysUntilExpiration <= 30) {
          warnings.push(`License expires in ${daysUntilExpiration} days`)
        }
      }
    }

    // Check activations
    if (options.checkActivations) {
      if (license.currentActivations >= license.maxActivations) {
        violations.push('Maximum activations reached')
      }
    }

    const remainingActivations = Math.max(0, license.maxActivations - license.currentActivations)

    return {
      isValid: violations.length === 0,
      status: license.status,
      activationStatus: license.activationStatus,
      expirationDate: license.expirationDate,
      remainingActivations,
      violations,
      warnings
    }
  }

  /**
   * Validate activation key
   */
  async validateActivationKey(activationKey: string): Promise<{
    valid: boolean
    license?: ModuleLicense
    message?: string
  }> {
    const license = await this.getLicenseByActivationKey(activationKey)
    if (!license) {
      return { valid: false, message: 'Invalid activation key' }
    }

    const validation = await this.validateLicense(license.id, {
      checkExpiration: true,
      checkActivations: true,
      requireActiveStatus: true
    })

    if (!validation.isValid) {
      return { valid: false, message: validation.violations.join(', ') }
    }

    return { valid: true, license }
  }

  // ============================================================================
  // LICENSE ANALYTICS
  // ============================================================================

  /**
   * Get license analytics
   */
  async getLicenseAnalytics(moduleId?: string): Promise<{
    totalLicenses: number
    activeLicenses: number
    expiredLicenses: number
    licensesByType: Record<string, number>
    activationRate: number
    averageActivationsPerLicense: number
  }> {
    const licenses = moduleId 
      ? await this.getModuleLicenses(moduleId)
      : Array.from(this.licenseCache.values())

    const totalLicenses = licenses.length
    const activeLicenses = licenses.filter(l => l.status === 'active').length
    const expiredLicenses = licenses.filter(l => 
      l.expirationDate && l.expirationDate < new Date()
    ).length

    const licensesByType = licenses.reduce((acc, license) => {
      acc[license.licenseType] = (acc[license.licenseType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalActivations = licenses.reduce((sum, license) => sum + license.currentActivations, 0)
    const activationRate = totalLicenses > 0 ? activeLicenses / totalLicenses : 0
    const averageActivationsPerLicense = totalLicenses > 0 ? totalActivations / totalLicenses : 0

    return {
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      licensesByType,
      activationRate,
      averageActivationsPerLicense
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async getLicenseByActivationKey(activationKey: string): Promise<ModuleLicense | null> {
    const licenses = Array.from(this.licenseCache.values())
    return licenses.find(license => license.activationKey === activationKey) || null
  }

  private generateLicenseId(): string {
    return `license_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateActivationKey(): string {
    return `ACT-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  }

  private generateActivationId(): string {
    return `activation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const licensingManager = new LicensingManager()
export default licensingManager
