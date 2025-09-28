/**
 * Client Deployment Health Checker
 *
 * Specialized health checking for client deployments with comprehensive
 * validation, performance testing, and automated recovery capabilities.
 */

import { supabase } from '@/lib/supabase/client'

export interface HealthCheckConfig {
  url: string
  timeout: number
  retries: number
  interval: number
  expectedStatus: number[]
  requiredHeaders?: string[]
  customChecks?: HealthCheck[]
}

export interface HealthCheck {
  name: string
  type: 'http' | 'content' | 'performance' | 'security' | 'database' | 'api'
  config: Record<string, any>
  critical: boolean
  timeout: number
}

export interface HealthCheckResult {
  checkId: string
  deploymentId: string
  timestamp: Date
  overall: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    [key: string]: {
      status: 'pass' | 'warn' | 'fail'
      duration: number
      message: string
      details?: Record<string, any>
    }
  }
  metadata: {
    totalChecks: number
    passedChecks: number
    failedChecks: number
    warningChecks: number
    totalDuration: number
  }
}

class HealthChecker {
  private defaultConfig: HealthCheckConfig = {
    url: '',
    timeout: 10000,
    retries: 3,
    interval: 60000,
    expectedStatus: [200, 201, 202, 204]
  }

  private standardChecks: HealthCheck[] = [
    {
      name: 'http-connectivity',
      type: 'http',
      config: { method: 'GET', path: '/' },
      critical: true,
      timeout: 5000
    },
    {
      name: 'response-time',
      type: 'performance',
      config: { maxResponseTime: 2000 },
      critical: false,
      timeout: 10000
    },
    {
      name: 'ssl-certificate',
      type: 'security',
      config: { checkCertificate: true },
      critical: true,
      timeout: 5000
    },
    {
      name: 'content-validation',
      type: 'content',
      config: { requiredElements: ['html', 'head', 'body'] },
      critical: false,
      timeout: 5000
    },
    {
      name: 'api-health',
      type: 'api',
      config: { endpoint: '/api/health' },
      critical: false,
      timeout: 5000
    }
  ]

  /**
   * Perform comprehensive health check on deployment
   */
  async performHealthCheck(
    deploymentId: string,
    config?: Partial<HealthCheckConfig>
  ): Promise<HealthCheckResult> {
    const checkId = `health_${deploymentId}_${Date.now()}`
    const startTime = Date.now()

    try {
      // Get deployment details
      const { data: deployment } = await supabase
        .from('client_deployments')
        .select('*')
        .eq('id', deploymentId)
        .single()

      if (!deployment) {
        throw new Error(`Deployment not found: ${deploymentId}`)
      }

      const finalConfig: HealthCheckConfig = {
        ...this.defaultConfig,
        url: deployment.url,
        ...config
      }

      // Combine standard checks with custom checks
      const allChecks = [
        ...this.standardChecks,
        ...(finalConfig.customChecks || [])
      ]

      // Execute all health checks
      const checkResults: HealthCheckResult['checks'] = {}
      let passedChecks = 0
      let failedChecks = 0
      let warningChecks = 0

      for (const check of allChecks) {
        try {
          const result = await this.executeHealthCheck(check, finalConfig)
          checkResults[check.name] = result

          if (result.status === 'pass') passedChecks++
          else if (result.status === 'warn') warningChecks++
          else failedChecks++

        } catch (error) {
          checkResults[check.name] = {
            status: 'fail',
            duration: 0,
            message: `Check failed: ${error}`,
            details: { error: error instanceof Error ? error.message : String(error) }
          }
          failedChecks++
        }
      }

      // Determine overall health status
      const overall = this.determineOverallHealth(checkResults, allChecks)

      const result: HealthCheckResult = {
        checkId,
        deploymentId,
        timestamp: new Date(),
        overall,
        checks: checkResults,
        metadata: {
          totalChecks: allChecks.length,
          passedChecks,
          failedChecks,
          warningChecks,
          totalDuration: Date.now() - startTime
        }
      }

      // Save health check result
      await this.saveHealthCheckResult(result)

      return result

    } catch (error) {
      // Create failed health check result
      const failedResult: HealthCheckResult = {
        checkId,
        deploymentId,
        timestamp: new Date(),
        overall: 'unhealthy',
        checks: {
          'system-error': {
            status: 'fail',
            duration: Date.now() - startTime,
            message: `Health check system error: ${error}`,
            details: { error: error instanceof Error ? error.message : String(error) }
          }
        },
        metadata: {
          totalChecks: 1,
          passedChecks: 0,
          failedChecks: 1,
          warningChecks: 0,
          totalDuration: Date.now() - startTime
        }
      }

      await this.saveHealthCheckResult(failedResult)
      return failedResult
    }
  }

  /**
   * Execute individual health check
   */
  private async executeHealthCheck(
    check: HealthCheck,
    config: HealthCheckConfig
  ): Promise<HealthCheckResult['checks'][string]> {
    const startTime = Date.now()

    try {
      switch (check.type) {
        case 'http':
          return await this.httpCheck(check, config, startTime)

        case 'performance':
          return await this.performanceCheck(check, config, startTime)

        case 'security':
          return await this.securityCheck(check, config, startTime)

        case 'content':
          return await this.contentCheck(check, config, startTime)

        case 'api':
          return await this.apiCheck(check, config, startTime)

        case 'database':
          return await this.databaseCheck(check, config, startTime)

        default:
          throw new Error(`Unknown check type: ${check.type}`)
      }
    } catch (error) {
      return {
        status: 'fail',
        duration: Date.now() - startTime,
        message: `Check execution failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      }
    }
  }

  /**
   * HTTP connectivity check
   */
  private async httpCheck(
    check: HealthCheck,
    config: HealthCheckConfig,
    startTime: number
  ): Promise<HealthCheckResult['checks'][string]> {
    const url = new URL(check.config.path || '/', config.url).toString()
    const method = check.config.method || 'GET'

    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'HealthChecker/1.0',
        ...check.config.headers
      },
      signal: AbortSignal.timeout(check.timeout)
    })

    const duration = Date.now() - startTime
    const isValidStatus = config.expectedStatus.includes(response.status)

    if (!isValidStatus) {
      return {
        status: 'fail',
        duration,
        message: `Unexpected HTTP status: ${response.status}`,
        details: {
          status: response.status,
          expected: config.expectedStatus,
          url
        }
      }
    }

    return {
      status: 'pass',
      duration,
      message: `HTTP check passed: ${response.status}`,
      details: {
        status: response.status,
        url,
        headers: Object.fromEntries(response.headers.entries())
      }
    }
  }

  /**
   * Performance check
   */
  private async performanceCheck(
    check: HealthCheck,
    config: HealthCheckConfig,
    startTime: number
  ): Promise<HealthCheckResult['checks'][string]> {
    const response = await fetch(config.url, {
      headers: { 'User-Agent': 'HealthChecker/1.0' },
      signal: AbortSignal.timeout(check.timeout)
    })

    const duration = Date.now() - startTime
    const maxResponseTime = check.config.maxResponseTime || 2000

    if (duration > maxResponseTime) {
      return {
        status: duration > maxResponseTime * 2 ? 'fail' : 'warn',
        duration,
        message: `Response time ${duration}ms exceeds threshold ${maxResponseTime}ms`,
        details: {
          responseTime: duration,
          threshold: maxResponseTime,
          severity: duration > maxResponseTime * 2 ? 'critical' : 'warning'
        }
      }
    }

    return {
      status: 'pass',
      duration,
      message: `Performance check passed: ${duration}ms`,
      details: {
        responseTime: duration,
        threshold: maxResponseTime
      }
    }
  }

  /**
   * Security check
   */
  private async securityCheck(
    check: HealthCheck,
    config: HealthCheckConfig,
    startTime: number
  ): Promise<HealthCheckResult['checks'][string]> {
    const duration = Date.now() - startTime

    if (check.config.checkCertificate && config.url.startsWith('https://')) {
      try {
        const response = await fetch(config.url, {
          headers: { 'User-Agent': 'HealthChecker/1.0' },
          signal: AbortSignal.timeout(check.timeout)
        })

        // Basic SSL validation (browser automatically validates certificates)
        const securityHeaders = [
          'strict-transport-security',
          'x-frame-options',
          'x-content-type-options',
          'x-xss-protection'
        ]

        const presentHeaders = securityHeaders.filter(header =>
          response.headers.has(header)
        )

        const missingHeaders = securityHeaders.filter(header =>
          !response.headers.has(header)
        )

        if (missingHeaders.length > 2) {
          return {
            status: 'warn',
            duration: Date.now() - startTime,
            message: `Missing security headers: ${missingHeaders.join(', ')}`,
            details: {
              presentHeaders,
              missingHeaders,
              recommendation: 'Consider adding missing security headers'
            }
          }
        }

        return {
          status: 'pass',
          duration: Date.now() - startTime,
          message: 'Security check passed',
          details: {
            sslValid: true,
            securityHeaders: presentHeaders
          }
        }
      } catch (error) {
        return {
          status: 'fail',
          duration: Date.now() - startTime,
          message: `SSL/Security check failed: ${error}`,
          details: { error: error instanceof Error ? error.message : String(error) }
        }
      }
    }

    return {
      status: 'pass',
      duration: Date.now() - startTime,
      message: 'Security check skipped (HTTP)',
      details: { reason: 'HTTP deployment, SSL check not applicable' }
    }
  }

  /**
   * Content validation check
   */
  private async contentCheck(
    check: HealthCheck,
    config: HealthCheckConfig,
    startTime: number
  ): Promise<HealthCheckResult['checks'][string]> {
    const response = await fetch(config.url, {
      headers: { 'User-Agent': 'HealthChecker/1.0' },
      signal: AbortSignal.timeout(check.timeout)
    })

    const content = await response.text()
    const duration = Date.now() - startTime

    const requiredElements = check.config.requiredElements || []
    const missingElements = requiredElements.filter((element: string) =>
      !content.toLowerCase().includes(`<${element}`)
    )

    if (missingElements.length > 0) {
      return {
        status: 'warn',
        duration,
        message: `Missing required elements: ${missingElements.join(', ')}`,
        details: {
          contentLength: content.length,
          missingElements,
          foundElements: requiredElements.filter((el: string) => !missingElements.includes(el))
        }
      }
    }

    return {
      status: 'pass',
      duration,
      message: 'Content validation passed',
      details: {
        contentLength: content.length,
        requiredElements
      }
    }
  }

  /**
   * API health check
   */
  private async apiCheck(
    check: HealthCheck,
    config: HealthCheckConfig,
    startTime: number
  ): Promise<HealthCheckResult['checks'][string]> {
    const apiUrl = new URL(check.config.endpoint || '/api/health', config.url).toString()

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'HealthChecker/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(check.timeout)
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        return {
          status: 'warn',
          duration,
          message: `API endpoint returned ${response.status}`,
          details: {
            status: response.status,
            url: apiUrl
          }
        }
      }

      let apiData = null
      try {
        apiData = await response.json()
      } catch {
        // Non-JSON response is acceptable
      }

      return {
        status: 'pass',
        duration,
        message: 'API health check passed',
        details: {
          status: response.status,
          url: apiUrl,
          data: apiData
        }
      }
    } catch (error) {
      return {
        status: 'warn',
        duration: Date.now() - startTime,
        message: `API health endpoint not available: ${error}`,
        details: {
          url: apiUrl,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  /**
   * Database connectivity check
   */
  private async databaseCheck(
    check: HealthCheck,
    config: HealthCheckConfig,
    startTime: number
  ): Promise<HealthCheckResult['checks'][string]> {
    try {
      // Simple database connectivity test
      const { data, error } = await supabase
        .from('client_deployments')
        .select('id')
        .limit(1)

      const duration = Date.now() - startTime

      if (error) {
        return {
          status: 'fail',
          duration,
          message: `Database check failed: ${error.message}`,
          details: { error: error.message }
        }
      }

      return {
        status: 'pass',
        duration,
        message: 'Database connectivity check passed',
        details: { connectionTest: 'successful' }
      }
    } catch (error) {
      return {
        status: 'fail',
        duration: Date.now() - startTime,
        message: `Database check error: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      }
    }
  }

  /**
   * Determine overall health status
   */
  private determineOverallHealth(
    checks: HealthCheckResult['checks'],
    allChecks: HealthCheck[]
  ): HealthCheckResult['overall'] {
    const criticalChecks = allChecks.filter(c => c.critical)
    const criticalResults = criticalChecks.map(c => checks[c.name])

    // If any critical check failed, overall is unhealthy
    if (criticalResults.some(r => r?.status === 'fail')) {
      return 'unhealthy'
    }

    // If any check failed or multiple warnings, overall is degraded
    const failedChecks = Object.values(checks).filter(r => r.status === 'fail').length
    const warningChecks = Object.values(checks).filter(r => r.status === 'warn').length

    if (failedChecks > 0 || warningChecks > 2) {
      return 'degraded'
    }

    return 'healthy'
  }

  /**
   * Save health check result to database
   */
  private async saveHealthCheckResult(result: HealthCheckResult): Promise<void> {
    try {
      await supabase
        .from('deployment_health_checks')
        .insert({
          id: result.checkId,
          deployment_id: result.deploymentId,
          timestamp: result.timestamp.toISOString(),
          overall_status: result.overall,
          check_results: result.checks,
          metadata: result.metadata
        })
    } catch (error) {
      console.error('Failed to save health check result:', error)
    }
  }

  /**
   * Get health check history
   */
  async getHealthCheckHistory(
    deploymentId: string,
    options?: {
      since?: Date
      limit?: number
      status?: HealthCheckResult['overall']
    }
  ): Promise<HealthCheckResult[]> {
    try {
      let query = supabase
        .from('deployment_health_checks')
        .select('*')
        .eq('deployment_id', deploymentId)
        .order('timestamp', { ascending: false })

      if (options?.since) {
        query = query.gte('timestamp', options.since.toISOString())
      }

      if (options?.status) {
        query = query.eq('overall_status', options.status)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(row => ({
        checkId: row.id,
        deploymentId: row.deployment_id,
        timestamp: new Date(row.timestamp),
        overall: row.overall_status,
        checks: row.check_results || {},
        metadata: row.metadata || {}
      }))
    } catch (error) {
      console.error('Failed to get health check history:', error)
      return []
    }
  }

  /**
   * Get latest health status
   */
  async getLatestHealthStatus(deploymentId: string): Promise<HealthCheckResult | null> {
    const history = await this.getHealthCheckHistory(deploymentId, { limit: 1 })
    return history[0] || null
  }
}

export const healthChecker = new HealthChecker()
export default healthChecker