/**
 * HT-022.3.2: Tenant Security & Data Separation
 *
 * Basic multi-tenant security with data separation, access control,
 * and configuration inheritance validation.
 */

export interface TenantSecurityPolicy {
  tenantId: string
  allowCrossTenantAccess: boolean
  dataRetentionDays: number
  configurationInheritance: 'none' | 'default-only' | 'full'
  accessRestrictions: {
    allowThemeCustomization: boolean
    allowModuleConfiguration: boolean
    allowDataExport: boolean
    allowDataImport: boolean
    maxStorageUsageMB: number
    maxActiveModules: number
  }
  auditSettings: {
    enableAuditLog: boolean
    logDataAccess: boolean
    logConfigChanges: boolean
    logThemeChanges: boolean
    retentionDays: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface TenantSecurityContext {
  tenantId: string
  userId?: string
  userRole?: 'admin' | 'user' | 'viewer'
  requestSource: 'api' | 'ui' | 'system'
  requestTimestamp: Date
  sessionId?: string
}

export interface SecurityValidationResult {
  allowed: boolean
  tenantId: string
  operation: string
  reason?: string
  warnings: string[]
  auditRequired: boolean
}

export interface TenantAuditLog {
  id: string
  tenantId: string
  userId?: string
  operation: string
  resourceType: 'theme' | 'config' | 'module' | 'data'
  resourceId: string
  action: 'read' | 'write' | 'delete' | 'activate' | 'deactivate'
  details: Record<string, unknown>
  success: boolean
  errorMessage?: string
  timestamp: Date
  sessionId?: string
  requestSource: string
}

class TenantSecurityManager {
  private policies: Map<string, TenantSecurityPolicy> = new Map()
  private auditLogs: TenantAuditLog[] = []
  private maxAuditLogSize = 10000

  constructor() {
    this.initializeDefaultPolicies()
  }

  private initializeDefaultPolicies() {
    // Default security policy
    const defaultPolicy: TenantSecurityPolicy = {
      tenantId: 'default',
      allowCrossTenantAccess: false,
      dataRetentionDays: 90,
      configurationInheritance: 'default-only',
      accessRestrictions: {
        allowThemeCustomization: true,
        allowModuleConfiguration: true,
        allowDataExport: true,
        allowDataImport: false,
        maxStorageUsageMB: 100,
        maxActiveModules: 10
      },
      auditSettings: {
        enableAuditLog: true,
        logDataAccess: false,
        logConfigChanges: true,
        logThemeChanges: true,
        retentionDays: 30
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.policies.set('default', defaultPolicy)
  }

  // Security Policy Management
  getTenantSecurityPolicy(tenantId: string): TenantSecurityPolicy {
    let policy = this.policies.get(tenantId)
    if (!policy && tenantId !== 'default') {
      // Inherit from default policy
      const defaultPolicy = this.policies.get('default')!
      policy = {
        ...defaultPolicy,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      this.policies.set(tenantId, policy)
    }
    return policy!
  }

  updateTenantSecurityPolicy(tenantId: string, updates: Partial<TenantSecurityPolicy>): boolean {
    try {
      const policy = this.getTenantSecurityPolicy(tenantId)
      Object.assign(policy, updates, {
        tenantId, // Ensure tenant ID cannot be changed
        updatedAt: new Date()
      })
      return true
    } catch (error) {
      console.error(`Failed to update security policy: ${error}`)
      return false
    }
  }

  // Access Control & Validation
  validateTenantAccess(
    context: TenantSecurityContext,
    targetTenantId: string,
    operation: string,
    resourceType: string
  ): SecurityValidationResult {
    const policy = this.getTenantSecurityPolicy(context.tenantId)
    const warnings: string[] = []

    // Basic tenant isolation check
    if (context.tenantId !== targetTenantId && !policy.allowCrossTenantAccess) {
      this.logAuditEvent(context, operation, resourceType as 'data' | 'theme' | 'config' | 'module', '', 'read', {}, false, 'Cross-tenant access denied')
      return {
        allowed: false,
        tenantId: context.tenantId,
        operation,
        reason: 'Cross-tenant access not allowed',
        warnings,
        auditRequired: true
      }
    }

    // Check specific operation permissions
    const operationAllowed = this.checkOperationPermission(policy, operation, resourceType)
    if (!operationAllowed.allowed) {
      this.logAuditEvent(context, operation, resourceType as 'data' | 'theme' | 'config' | 'module', '', 'read', {}, false, operationAllowed.reason)
      return {
        allowed: false,
        tenantId: context.tenantId,
        operation,
        reason: operationAllowed.reason,
        warnings,
        auditRequired: true
      }
    }

    // Add warnings for policy violations
    if (operationAllowed.warnings) {
      warnings.push(...operationAllowed.warnings)
    }

    // Log successful access if required
    const auditRequired = policy.auditSettings.enableAuditLog && this.shouldAuditOperation(policy, operation, resourceType)
    if (auditRequired) {
      this.logAuditEvent(context, operation, resourceType as 'data' | 'theme' | 'config' | 'module', '', 'read', {}, true)
    }

    return {
      allowed: true,
      tenantId: context.tenantId,
      operation,
      warnings,
      auditRequired
    }
  }

  private checkOperationPermission(
    policy: TenantSecurityPolicy,
    operation: string,
    resourceType: string
  ): { allowed: boolean; reason?: string; warnings?: string[] } {
    const warnings: string[] = []

    switch (operation) {
      case 'theme-customize':
        if (!policy.accessRestrictions.allowThemeCustomization) {
          return { allowed: false, reason: 'Theme customization not allowed for this tenant' }
        }
        break

      case 'module-configure':
        if (!policy.accessRestrictions.allowModuleConfiguration) {
          return { allowed: false, reason: 'Module configuration not allowed for this tenant' }
        }
        break

      case 'data-export':
        if (!policy.accessRestrictions.allowDataExport) {
          return { allowed: false, reason: 'Data export not allowed for this tenant' }
        }
        break

      case 'data-import':
        if (!policy.accessRestrictions.allowDataImport) {
          return { allowed: false, reason: 'Data import not allowed for this tenant' }
        }
        break

      case 'module-activate':
        // This would require checking active module count in a real implementation
        warnings.push('Module activation may be subject to limits')
        break
    }

    return { allowed: true, warnings }
  }

  // Data Separation & Sanitization
  sanitizeTenantData(tenantId: string, data: any, context: TenantSecurityContext): any {
    const policy = this.getTenantSecurityPolicy(tenantId)
    const sanitized = JSON.parse(JSON.stringify(data)) // Deep clone

    // Remove cross-tenant references
    if (Array.isArray(sanitized)) {
      return sanitized.filter(item => !item.tenantId || item.tenantId === tenantId)
    }

    if (typeof sanitized === 'object' && sanitized !== null) {
      // Remove sensitive system fields
      const sensitiveFields = ['internalConfig', 'systemOverrides', 'adminFlags', 'debugInfo']
      sensitiveFields.forEach(field => delete sanitized[field])

      // Ensure tenant ID consistency
      if (sanitized.tenantId && sanitized.tenantId !== tenantId) {
        if (policy.allowCrossTenantAccess) {
          // Mark as cross-tenant reference
          sanitized._crossTenantRef = true
        } else {
          // Remove cross-tenant data
          return null
        }
      }

      // Recursively sanitize nested objects
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
          sanitized[key] = this.sanitizeTenantData(tenantId, sanitized[key], context)
        }
      })
    }

    return sanitized
  }

  // Configuration Inheritance Validation
  validateConfigurationInheritance(
    tenantId: string,
    moduleId: string,
    config: Record<string, unknown>
  ): { valid: boolean; issues: string[]; sanitizedConfig: Record<string, unknown> } {
    const policy = this.getTenantSecurityPolicy(tenantId)
    const issues: string[] = []
    const sanitizedConfig = { ...config }

    switch (policy.configurationInheritance) {
      case 'none':
        // No inheritance allowed - must be completely standalone
        if (config.inheritFromDefault) {
          issues.push('Configuration inheritance not allowed for this tenant')
          delete sanitizedConfig.inheritFromDefault
        }
        break

      case 'default-only':
        // Can only inherit from default tenant
        if (config.inheritFromTenant && config.inheritFromTenant !== 'default') {
          issues.push('Can only inherit configuration from default tenant')
          delete sanitizedConfig.inheritFromTenant
        }
        break

      case 'full':
        // Full inheritance allowed
        break
    }

    // Remove any cross-tenant configuration references
    Object.keys(sanitizedConfig).forEach(key => {
      if (key.includes('tenantId') && sanitizedConfig[key] !== tenantId && sanitizedConfig[key] !== 'default') {
        if (policy.configurationInheritance === 'none') {
          issues.push(`Cross-tenant configuration reference not allowed: ${key}`)
          delete sanitizedConfig[key]
        }
      }
    })

    return {
      valid: issues.length === 0,
      issues,
      sanitizedConfig
    }
  }

  // Audit Logging
  logAuditEvent(
    context: TenantSecurityContext,
    operation: string,
    resourceType: 'theme' | 'config' | 'module' | 'data',
    resourceId: string,
    action: 'read' | 'write' | 'delete' | 'activate' | 'deactivate',
    details: Record<string, unknown> = {},
    success: boolean = true,
    errorMessage?: string
  ): void {
    const policy = this.getTenantSecurityPolicy(context.tenantId)
    if (!policy.auditSettings.enableAuditLog) return

    // Check if this operation should be logged
    if (!this.shouldAuditOperation(policy, operation, resourceType)) return

    const auditEntry: TenantAuditLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId: context.tenantId,
      userId: context.userId,
      operation,
      resourceType,
      resourceId,
      action,
      details: this.sanitizeAuditDetails(details),
      success,
      errorMessage,
      timestamp: new Date(),
      sessionId: context.sessionId,
      requestSource: context.requestSource
    }

    this.auditLogs.push(auditEntry)

    // Manage audit log size
    if (this.auditLogs.length > this.maxAuditLogSize) {
      this.auditLogs = this.auditLogs.slice(-this.maxAuditLogSize)
    }

    // Clean up old entries based on retention policy
    this.cleanupOldAuditLogs(context.tenantId)
  }

  private shouldAuditOperation(policy: TenantSecurityPolicy, operation: string, resourceType: string): boolean {
    const { auditSettings } = policy

    switch (resourceType) {
      case 'config':
        return auditSettings.logConfigChanges
      case 'theme':
        return auditSettings.logThemeChanges
      case 'data':
        return auditSettings.logDataAccess
      default:
        return true // Log everything else if audit is enabled
    }
  }

  private sanitizeAuditDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details }

    // Remove sensitive information from audit logs
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'credentials']
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]'
      }
    })

    // Truncate large values
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...[TRUNCATED]'
      }
    })

    return sanitized
  }

  private cleanupOldAuditLogs(tenantId: string): void {
    const policy = this.getTenantSecurityPolicy(tenantId)
    const cutoffDate = new Date(Date.now() - (policy.auditSettings.retentionDays * 24 * 60 * 60 * 1000))

    this.auditLogs = this.auditLogs.filter(log =>
      log.tenantId !== tenantId || log.timestamp > cutoffDate
    )
  }

  // Audit Retrieval
  getTenantAuditLogs(
    tenantId: string,
    options: {
      startDate?: Date
      endDate?: Date
      operation?: string
      resourceType?: string
      userId?: string
      limit?: number
    } = {}
  ): TenantAuditLog[] {
    let logs = this.auditLogs.filter(log => log.tenantId === tenantId)

    // Apply filters
    if (options.startDate) {
      logs = logs.filter(log => log.timestamp >= options.startDate!)
    }
    if (options.endDate) {
      logs = logs.filter(log => log.timestamp <= options.endDate!)
    }
    if (options.operation) {
      logs = logs.filter(log => log.operation === options.operation)
    }
    if (options.resourceType) {
      logs = logs.filter(log => log.resourceType === options.resourceType)
    }
    if (options.userId) {
      logs = logs.filter(log => log.userId === options.userId)
    }

    // Sort by timestamp (most recent first)
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply limit
    if (options.limit) {
      logs = logs.slice(0, options.limit)
    }

    return logs
  }

  // Security Health Check
  runSecurityHealthCheck(tenantId: string): {
    healthy: boolean
    score: number
    issues: Array<{ severity: 'low' | 'medium' | 'high'; message: string }>
    recommendations: string[]
  } {
    const policy = this.getTenantSecurityPolicy(tenantId)
    const issues: Array<{ severity: 'low' | 'medium' | 'high'; message: string }> = []
    const recommendations: string[] = []

    // Check audit settings
    if (!policy.auditSettings.enableAuditLog) {
      issues.push({ severity: 'medium', message: 'Audit logging is disabled' })
      recommendations.push('Enable audit logging for better security monitoring')
    }

    if (policy.auditSettings.retentionDays < 7) {
      issues.push({ severity: 'low', message: 'Audit log retention period is very short' })
      recommendations.push('Consider increasing audit log retention to at least 7 days')
    }

    // Check access restrictions
    if (policy.allowCrossTenantAccess) {
      issues.push({ severity: 'high', message: 'Cross-tenant access is enabled' })
      recommendations.push('Disable cross-tenant access unless specifically required')
    }

    if (policy.accessRestrictions.maxActiveModules > 20) {
      issues.push({ severity: 'low', message: 'High limit on active modules' })
      recommendations.push('Review module activation limits for security')
    }

    // Check data retention
    if (policy.dataRetentionDays > 365) {
      issues.push({ severity: 'low', message: 'Long data retention period' })
      recommendations.push('Review data retention policy for compliance')
    }

    // Calculate security score (0-100)
    const maxScore = 100
    let score = maxScore

    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 30
          break
        case 'medium':
          score -= 15
          break
        case 'low':
          score -= 5
          break
      }
    })

    score = Math.max(0, score)

    return {
      healthy: issues.filter(i => i.severity === 'high').length === 0,
      score,
      issues,
      recommendations
    }
  }
}

// Singleton instance
export const tenantSecurityManager = new TenantSecurityManager()

// Utility functions
export function validateTenantAccess(
  tenantId: string,
  targetTenantId: string,
  operation: string,
  resourceType: string,
  userId?: string
): SecurityValidationResult {
  const context: TenantSecurityContext = {
    tenantId,
    userId,
    requestSource: 'api',
    requestTimestamp: new Date()
  }

  return tenantSecurityManager.validateTenantAccess(context, targetTenantId, operation, resourceType)
}

export function sanitizeDataForTenant(tenantId: string, data: any): any {
  const context: TenantSecurityContext = {
    tenantId,
    requestSource: 'api',
    requestTimestamp: new Date()
  }

  return tenantSecurityManager.sanitizeTenantData(tenantId, data, context)
}

export function getTenantSecurityHealth(tenantId: string) {
  return tenantSecurityManager.runSecurityHealthCheck(tenantId)
}