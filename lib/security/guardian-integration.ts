/**
 * Guardian System Integration Library
 *
 * Enterprise-grade security framework with advanced Guardian system integration,
 * automated threat detection, backup management, and security monitoring.
 */

import { runBackupOnce, readStatus, BackupStatus, BackupArtifact } from '../guardian/service'
import { logger } from '../logger'

export interface GuardianConfig {
  enabled: boolean
  autoBackup: boolean
  backupInterval: number // minutes
  threatDetection: boolean
  alertThreshold: 'low' | 'medium' | 'high'
  maxBackupRetries: number
  emergencyMode: boolean
}

export interface SecurityThreat {
  id: string
  type: 'intrusion' | 'malware' | 'ddos' | 'data_breach' | 'privilege_escalation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  description: string
  detectedAt: string
  resolved: boolean
  mitigationSteps: string[]
}

export interface GuardianStatus {
  systemHealth: 'healthy' | 'warning' | 'critical'
  backupStatus: BackupStatus | null
  activeThreats: SecurityThreat[]
  lastHeartbeat: string
  uptime: number
  config: GuardianConfig
}

export interface SecurityEvent {
  id: string
  type: 'backup' | 'threat' | 'auth' | 'access' | 'config'
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  details: Record<string, any>
  timestamp: string
  source: string
}

class GuardianIntegration {
  private config: GuardianConfig
  private eventLog: SecurityEvent[] = []
  private threatRegistry: Map<string, SecurityThreat> = new Map()
  private lastBackupCheck: Date | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<GuardianConfig> = {}) {
    this.config = {
      enabled: true,
      autoBackup: true,
      backupInterval: 60, // 1 hour default
      threatDetection: true,
      alertThreshold: 'medium',
      maxBackupRetries: 3,
      emergencyMode: false,
      ...config
    }

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * Initialize Guardian system
   */
  private async initialize(): Promise<void> {
    try {
      await this.logEvent({
        type: 'config',
        severity: 'info',
        message: 'Guardian system initializing',
        details: { config: this.config },
        source: 'guardian-integration'
      })

      // Start heartbeat monitoring
      this.startHeartbeat()

      // Perform initial system check
      await this.performSystemCheck()

      await this.logEvent({
        type: 'config',
        severity: 'info',
        message: 'Guardian system initialized successfully',
        details: {},
        source: 'guardian-integration'
      })
    } catch (error) {
      await this.logEvent({
        type: 'config',
        severity: 'error',
        message: 'Failed to initialize Guardian system',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        source: 'guardian-integration'
      })
      throw error
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(async () => {
      await this.performHeartbeat()
    }, 30000) // 30 seconds
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Perform heartbeat check
   */
  private async performHeartbeat(): Promise<void> {
    try {
      const status = await this.getSystemStatus()

      if (status.systemHealth === 'critical' && !this.config.emergencyMode) {
        await this.enterEmergencyMode()
      }

      // Auto backup if enabled and interval has passed
      if (this.config.autoBackup && this.shouldPerformBackup()) {
        await this.performBackup()
      }
    } catch (error) {
      await this.logEvent({
        type: 'config',
        severity: 'error',
        message: 'Heartbeat check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        source: 'guardian-heartbeat'
      })
    }
  }

  /**
   * Perform system check
   */
  private async performSystemCheck(): Promise<GuardianStatus> {
    try {
      const backupStatus = await readStatus()
      const activeThreats = Array.from(this.threatRegistry.values()).filter(t => !t.resolved)

      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy'

      // Determine system health
      if (activeThreats.some(t => t.severity === 'critical')) {
        systemHealth = 'critical'
      } else if (activeThreats.some(t => t.severity === 'high') ||
                 (backupStatus && !backupStatus.ok)) {
        systemHealth = 'warning'
      }

      const status: GuardianStatus = {
        systemHealth,
        backupStatus,
        activeThreats,
        lastHeartbeat: new Date().toISOString(),
        uptime: process.uptime(),
        config: this.config
      }

      return status
    } catch (error) {
      await this.logEvent({
        type: 'config',
        severity: 'error',
        message: 'System check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        source: 'guardian-system-check'
      })
      throw error
    }
  }

  /**
   * Get current system status
   */
  public async getSystemStatus(): Promise<GuardianStatus> {
    return await this.performSystemCheck()
  }

  /**
   * Perform backup operation
   */
  public async performBackup(reason?: string): Promise<BackupStatus> {
    try {
      await this.logEvent({
        type: 'backup',
        severity: 'info',
        message: 'Starting backup operation',
        details: { reason: reason || 'scheduled' },
        source: 'guardian-backup'
      })

      const backupStatus = await runBackupOnce({ reason })
      this.lastBackupCheck = new Date()

      if (backupStatus.ok) {
        await this.logEvent({
          type: 'backup',
          severity: 'info',
          message: 'Backup completed successfully',
          details: { artifacts: backupStatus.artifacts },
          source: 'guardian-backup'
        })
      } else {
        await this.logEvent({
          type: 'backup',
          severity: 'error',
          message: 'Backup failed',
          details: { error: backupStatus.error },
          source: 'guardian-backup'
        })
      }

      return backupStatus
    } catch (error) {
      await this.logEvent({
        type: 'backup',
        severity: 'error',
        message: 'Backup operation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        source: 'guardian-backup'
      })
      throw error
    }
  }

  /**
   * Register a security threat
   */
  public async registerThreat(threat: Omit<SecurityThreat, 'id' | 'detectedAt'>): Promise<SecurityThreat> {
    const fullThreat: SecurityThreat = {
      ...threat,
      id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      detectedAt: new Date().toISOString()
    }

    this.threatRegistry.set(fullThreat.id, fullThreat)

    await this.logEvent({
      type: 'threat',
      severity: this.mapThreatSeverityToEventSeverity(threat.severity),
      message: `Security threat detected: ${threat.type}`,
      details: fullThreat,
      source: 'guardian-threat-detection'
    })

    // Auto-trigger backup for high/critical threats
    if (threat.severity === 'high' || threat.severity === 'critical') {
      await this.performBackup(`Security threat: ${threat.type}`)
    }

    // Enter emergency mode for critical threats
    if (threat.severity === 'critical') {
      await this.enterEmergencyMode()
    }

    return fullThreat
  }

  /**
   * Resolve a security threat
   */
  public async resolveThreat(threatId: string, resolutionNotes?: string): Promise<void> {
    const threat = this.threatRegistry.get(threatId)
    if (!threat) {
      throw new Error(`Threat with ID ${threatId} not found`)
    }

    threat.resolved = true
    if (resolutionNotes) {
      threat.mitigationSteps.push(resolutionNotes)
    }

    await this.logEvent({
      type: 'threat',
      severity: 'info',
      message: `Security threat resolved: ${threat.type}`,
      details: { threatId, resolutionNotes },
      source: 'guardian-threat-resolution'
    })
  }

  /**
   * Enter emergency mode
   */
  public async enterEmergencyMode(): Promise<void> {
    if (this.config.emergencyMode) {
      return // Already in emergency mode
    }

    this.config.emergencyMode = true

    await this.logEvent({
      type: 'config',
      severity: 'critical',
      message: 'Guardian system entering emergency mode',
      details: {},
      source: 'guardian-emergency'
    })

    // Perform immediate backup
    await this.performBackup('Emergency mode activation')
  }

  /**
   * Exit emergency mode
   */
  public async exitEmergencyMode(): Promise<void> {
    if (!this.config.emergencyMode) {
      return // Not in emergency mode
    }

    this.config.emergencyMode = false

    await this.logEvent({
      type: 'config',
      severity: 'info',
      message: 'Guardian system exiting emergency mode',
      details: {},
      source: 'guardian-emergency'
    })
  }

  /**
   * Get security events
   */
  public getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.eventLog
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  /**
   * Get active threats
   */
  public getActiveThreats(): SecurityThreat[] {
    return Array.from(this.threatRegistry.values()).filter(t => !t.resolved)
  }

  /**
   * Get all threats
   */
  public getAllThreats(): SecurityThreat[] {
    return Array.from(this.threatRegistry.values())
  }

  /**
   * Update configuration
   */
  public async updateConfig(newConfig: Partial<GuardianConfig>): Promise<void> {
    const oldConfig = { ...this.config }
    this.config = { ...this.config, ...newConfig }

    await this.logEvent({
      type: 'config',
      severity: 'info',
      message: 'Guardian configuration updated',
      details: { oldConfig, newConfig: this.config },
      source: 'guardian-config'
    })

    // Restart heartbeat if interval changed
    if (oldConfig.backupInterval !== this.config.backupInterval) {
      this.startHeartbeat()
    }
  }

  /**
   * Shutdown Guardian system
   */
  public async shutdown(): Promise<void> {
    this.stopHeartbeat()

    await this.logEvent({
      type: 'config',
      severity: 'info',
      message: 'Guardian system shutting down',
      details: {},
      source: 'guardian-shutdown'
    })
  }

  /**
   * Log security event
   */
  private async logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: SecurityEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    this.eventLog.push(fullEvent)

    // Keep only last 1000 events
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000)
    }

    // Log to system logger
    const logLevel = event.severity === 'critical' || event.severity === 'error' ? 'error' :
                    event.severity === 'warning' ? 'warn' : 'info'

    logger[logLevel](`Guardian: ${event.message}`, {
      event: fullEvent
    })
  }

  /**
   * Check if backup should be performed
   */
  private shouldPerformBackup(): boolean {
    if (!this.lastBackupCheck) {
      return true
    }

    const intervalMs = this.config.backupInterval * 60 * 1000
    return Date.now() - this.lastBackupCheck.getTime() > intervalMs
  }

  /**
   * Map threat severity to event severity
   */
  private mapThreatSeverityToEventSeverity(severity: SecurityThreat['severity']): SecurityEvent['severity'] {
    switch (severity) {
      case 'critical':
        return 'critical'
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'info'
    }
  }
}

// Global Guardian instance
let guardianInstance: GuardianIntegration | null = null

/**
 * Get or create Guardian instance
 */
export function getGuardianInstance(config?: Partial<GuardianConfig>): GuardianIntegration {
  if (!guardianInstance) {
    guardianInstance = new GuardianIntegration(config)
  }
  return guardianInstance
}

/**
 * Initialize Guardian system
 */
export async function initializeGuardian(config?: Partial<GuardianConfig>): Promise<GuardianIntegration> {
  if (guardianInstance) {
    await guardianInstance.shutdown()
  }
  guardianInstance = new GuardianIntegration(config)
  return guardianInstance
}

/**
 * Shutdown Guardian system
 */
export async function shutdownGuardian(): Promise<void> {
  if (guardianInstance) {
    await guardianInstance.shutdown()
    guardianInstance = null
  }
}

export { GuardianIntegration }
export default GuardianIntegration