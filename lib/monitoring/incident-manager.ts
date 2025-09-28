/**
 * Incident Management System
 *
 * Comprehensive incident management for client deployments with
 * automated detection, escalation, response coordination, and resolution tracking.
 */

import { supabase } from '@/lib/supabase/client'

export interface Incident {
  id: string
  deploymentId: string
  clientId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'closed'
  type: 'performance' | 'availability' | 'security' | 'data' | 'integration' | 'user-impact'
  title: string
  description: string
  impact: {
    usersAffected: number
    servicesAffected: string[]
    businessImpact: 'low' | 'medium' | 'high' | 'critical'
    revenueImpact?: number
  }
  timeline: IncidentTimelineEvent[]
  assignee?: string
  team?: string
  resolution?: {
    summary: string
    rootCause: string
    preventiveMeasures: string[]
    followUpActions: string[]
  }
  metadata: {
    detectedAt: Date
    acknowledgedAt?: Date
    resolvedAt?: Date
    closedAt?: Date
    escalatedAt?: Date
    communicationsCount: number
    alertsTriggered: string[]
    automatedActions: string[]
  }
  created_at: Date
  updated_at: Date
}

export interface IncidentTimelineEvent {
  id: string
  incidentId: string
  timestamp: Date
  type: 'detection' | 'acknowledgment' | 'investigation' | 'update' | 'escalation' | 'resolution' | 'communication'
  actor: 'system' | 'user' | 'automation'
  actorId?: string
  message: string
  details?: Record<string, any>
  isPublic: boolean
}

export interface EscalationRule {
  id: string
  deploymentId?: string
  clientId?: string
  conditions: {
    severity: Incident['severity'][]
    duration: number // minutes
    status: Incident['status'][]
    type?: Incident['type'][]
  }
  actions: {
    notify: string[] // user IDs or email addresses
    escalateTo?: string // user ID or team
    automatedResponse?: string
    createTicket?: boolean
  }
  enabled: boolean
}

export interface IncidentTemplate {
  id: string
  name: string
  type: Incident['type']
  severity: Incident['severity']
  title: string
  description: string
  investigationSteps: string[]
  commonResolutions: string[]
  escalationThreshold: number // minutes
  automatedActions: string[]
}

class IncidentManager {
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map()
  private incidentSubscriptions: Map<string, Set<(incident: Incident) => void>> = new Map()

  /**
   * Create new incident
   */
  async createIncident(
    incidentData: Omit<Incident, 'id' | 'timeline' | 'metadata' | 'created_at' | 'updated_at'>
  ): Promise<Incident> {
    try {
      const incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const incident: Incident = {
        ...incidentData,
        id: incidentId,
        status: 'open',
        timeline: [],
        metadata: {
          detectedAt: new Date(),
          communicationsCount: 0,
          alertsTriggered: [],
          automatedActions: []
        },
        created_at: new Date(),
        updated_at: new Date()
      }

      // Save to database
      await this.saveIncident(incident)

      // Add detection timeline event
      await this.addTimelineEvent(incidentId, {
        type: 'detection',
        actor: 'system',
        message: `Incident detected: ${incident.title}`,
        details: {
          detectionMethod: 'automated-monitoring',
          severity: incident.severity,
          type: incident.type
        },
        isPublic: true
      })

      // Start escalation timer
      await this.startEscalationTimer(incident)

      // Trigger automated response
      await this.triggerAutomatedResponse(incident)

      // Notify relevant parties
      await this.notifyIncidentCreation(incident)

      console.log(`Created incident: ${incidentId} - ${incident.title}`)
      return incident

    } catch (error) {
      console.error('Failed to create incident:', error)
      throw error
    }
  }

  /**
   * Update incident status and information
   */
  async updateIncident(
    incidentId: string,
    updates: Partial<Pick<Incident, 'status' | 'severity' | 'assignee' | 'team' | 'description' | 'resolution'>>
  ): Promise<Incident> {
    try {
      const incident = await this.getIncident(incidentId)
      if (!incident) {
        throw new Error(`Incident not found: ${incidentId}`)
      }

      const previousStatus = incident.status
      const updatedIncident: Incident = {
        ...incident,
        ...updates,
        updated_at: new Date()
      }

      // Update metadata based on status changes
      if (updates.status && updates.status !== previousStatus) {
        switch (updates.status) {
          case 'investigating':
            updatedIncident.metadata.acknowledgedAt = new Date()
            break
          case 'resolved':
            updatedIncident.metadata.resolvedAt = new Date()
            this.stopEscalationTimer(incidentId)
            break
          case 'closed':
            updatedIncident.metadata.closedAt = new Date()
            break
        }
      }

      // Save updated incident
      await this.saveIncident(updatedIncident)

      // Add timeline event for status change
      if (updates.status && updates.status !== previousStatus) {
        await this.addTimelineEvent(incidentId, {
          type: 'update',
          actor: 'user',
          message: `Status changed from ${previousStatus} to ${updates.status}`,
          details: { previousStatus, newStatus: updates.status },
          isPublic: true
        })
      }

      // Notify subscribers
      await this.notifyIncidentUpdate(updatedIncident)

      return updatedIncident

    } catch (error) {
      console.error('Failed to update incident:', error)
      throw error
    }
  }

  /**
   * Add timeline event to incident
   */
  async addTimelineEvent(
    incidentId: string,
    eventData: Omit<IncidentTimelineEvent, 'id' | 'incidentId' | 'timestamp'>
  ): Promise<IncidentTimelineEvent> {
    try {
      const event: IncidentTimelineEvent = {
        id: `event_${incidentId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        incidentId,
        timestamp: new Date(),
        ...eventData
      }

      // Save to database
      await supabase
        .from('incident_timeline')
        .insert({
          id: event.id,
          incident_id: event.incidentId,
          timestamp: event.timestamp.toISOString(),
          type: event.type,
          actor: event.actor,
          actor_id: event.actorId,
          message: event.message,
          details: event.details,
          is_public: event.isPublic
        })

      // Update incident's timeline
      const incident = await this.getIncident(incidentId)
      if (incident) {
        incident.timeline.push(event)
        incident.updated_at = new Date()
        await this.saveIncident(incident)
      }

      return event

    } catch (error) {
      console.error('Failed to add timeline event:', error)
      throw error
    }
  }

  /**
   * Start escalation timer for incident
   */
  private async startEscalationTimer(incident: Incident): Promise<void> {
    try {
      // Get escalation rules for this deployment/client
      const escalationRules = await this.getEscalationRules(incident.deploymentId, incident.clientId)

      for (const rule of escalationRules) {
        if (this.shouldApplyEscalationRule(incident, rule)) {
          const timer = setTimeout(async () => {
            await this.escalateIncident(incident.id, rule)
          }, rule.conditions.duration * 60 * 1000) // Convert minutes to milliseconds

          this.escalationTimers.set(`${incident.id}_${rule.id}`, timer)
        }
      }
    } catch (error) {
      console.error('Failed to start escalation timer:', error)
    }
  }

  /**
   * Stop escalation timer
   */
  private stopEscalationTimer(incidentId: string): void {
    // Stop all timers for this incident
    for (const [key, timer] of this.escalationTimers.entries()) {
      if (key.startsWith(incidentId)) {
        clearTimeout(timer)
        this.escalationTimers.delete(key)
      }
    }
  }

  /**
   * Check if escalation rule should apply
   */
  private shouldApplyEscalationRule(incident: Incident, rule: EscalationRule): boolean {
    return (
      rule.enabled &&
      rule.conditions.severity.includes(incident.severity) &&
      rule.conditions.status.includes(incident.status) &&
      (!rule.conditions.type || rule.conditions.type.includes(incident.type))
    )
  }

  /**
   * Escalate incident according to rule
   */
  private async escalateIncident(incidentId: string, rule: EscalationRule): Promise<void> {
    try {
      const incident = await this.getIncident(incidentId)
      if (!incident || incident.status === 'resolved' || incident.status === 'closed') {
        return // Don't escalate resolved/closed incidents
      }

      // Mark as escalated
      incident.metadata.escalatedAt = new Date()
      await this.saveIncident(incident)

      // Add timeline event
      await this.addTimelineEvent(incidentId, {
        type: 'escalation',
        actor: 'system',
        message: `Incident escalated after ${rule.conditions.duration} minutes`,
        details: { escalationRule: rule.id, reason: 'timeout' },
        isPublic: true
      })

      // Execute escalation actions
      for (const email of rule.actions.notify) {
        await this.sendEscalationNotification(incident, email, rule)
      }

      if (rule.actions.escalateTo) {
        await this.updateIncident(incidentId, {
          assignee: rule.actions.escalateTo
        })
      }

      if (rule.actions.automatedResponse) {
        await this.executeAutomatedResponse(incident, rule.actions.automatedResponse)
      }

      console.log(`Escalated incident ${incidentId} according to rule ${rule.id}`)

    } catch (error) {
      console.error('Failed to escalate incident:', error)
    }
  }

  /**
   * Trigger automated response for incident
   */
  private async triggerAutomatedResponse(incident: Incident): Promise<void> {
    try {
      // Get incident template for automated actions
      const template = await this.getIncidentTemplate(incident.type, incident.severity)

      if (template && template.automatedActions.length > 0) {
        for (const action of template.automatedActions) {
          await this.executeAutomatedResponse(incident, action)
          incident.metadata.automatedActions.push(action)
        }

        await this.saveIncident(incident)
      }
    } catch (error) {
      console.error('Failed to trigger automated response:', error)
    }
  }

  /**
   * Execute automated response action
   */
  private async executeAutomatedResponse(incident: Incident, action: string): Promise<void> {
    try {
      switch (action) {
        case 'restart-deployment':
          await this.restartDeployment(incident.deploymentId)
          break

        case 'scale-up':
          await this.scaleUpDeployment(incident.deploymentId)
          break

        case 'enable-maintenance-mode':
          await this.enableMaintenanceMode(incident.deploymentId)
          break

        case 'create-backup':
          await this.createBackup(incident.deploymentId)
          break

        case 'notify-client':
          await this.notifyClient(incident)
          break

        default:
          console.log(`Unknown automated action: ${action}`)
      }

      await this.addTimelineEvent(incident.id, {
        type: 'update',
        actor: 'automation',
        message: `Executed automated action: ${action}`,
        details: { action },
        isPublic: false
      })

    } catch (error) {
      console.error(`Failed to execute automated action ${action}:`, error)
    }
  }

  /**
   * Get incident by ID
   */
  async getIncident(incidentId: string): Promise<Incident | null> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          incident_timeline (*)
        `)
        .eq('id', incidentId)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        deploymentId: data.deployment_id,
        clientId: data.client_id,
        severity: data.severity,
        status: data.status,
        type: data.type,
        title: data.title,
        description: data.description,
        impact: data.impact,
        timeline: data.incident_timeline?.map((t: any) => ({
          id: t.id,
          incidentId: t.incident_id,
          timestamp: new Date(t.timestamp),
          type: t.type,
          actor: t.actor,
          actorId: t.actor_id,
          message: t.message,
          details: t.details,
          isPublic: t.is_public
        })) || [],
        assignee: data.assignee,
        team: data.team,
        resolution: data.resolution,
        metadata: data.metadata,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Failed to get incident:', error)
      return null
    }
  }

  /**
   * Get incidents with filtering
   */
  async getIncidents(filters?: {
    deploymentId?: string
    clientId?: string
    status?: Incident['status'][]
    severity?: Incident['severity'][]
    type?: Incident['type'][]
    assignee?: string
    since?: Date
    limit?: number
  }): Promise<Incident[]> {
    try {
      let query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.deploymentId) {
        query = query.eq('deployment_id', filters.deploymentId)
      }

      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId)
      }

      if (filters?.status) {
        query = query.in('status', filters.status)
      }

      if (filters?.severity) {
        query = query.in('severity', filters.severity)
      }

      if (filters?.type) {
        query = query.in('type', filters.type)
      }

      if (filters?.assignee) {
        query = query.eq('assignee', filters.assignee)
      }

      if (filters?.since) {
        query = query.gte('created_at', filters.since.toISOString())
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(row => ({
        id: row.id,
        deploymentId: row.deployment_id,
        clientId: row.client_id,
        severity: row.severity,
        status: row.status,
        type: row.type,
        title: row.title,
        description: row.description,
        impact: row.impact,
        timeline: [], // Timeline loaded separately if needed
        assignee: row.assignee,
        team: row.team,
        resolution: row.resolution,
        metadata: row.metadata,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }))
    } catch (error) {
      console.error('Failed to get incidents:', error)
      return []
    }
  }

  /**
   * Save incident to database
   */
  private async saveIncident(incident: Incident): Promise<void> {
    try {
      await supabase
        .from('incidents')
        .upsert({
          id: incident.id,
          deployment_id: incident.deploymentId,
          client_id: incident.clientId,
          severity: incident.severity,
          status: incident.status,
          type: incident.type,
          title: incident.title,
          description: incident.description,
          impact: incident.impact,
          assignee: incident.assignee,
          team: incident.team,
          resolution: incident.resolution,
          metadata: incident.metadata,
          created_at: incident.created_at.toISOString(),
          updated_at: incident.updated_at.toISOString()
        })
    } catch (error) {
      console.error('Failed to save incident:', error)
    }
  }

  /**
   * Get escalation rules
   */
  private async getEscalationRules(deploymentId: string, clientId: string): Promise<EscalationRule[]> {
    try {
      const { data, error } = await supabase
        .from('escalation_rules')
        .select('*')
        .or(`deployment_id.eq.${deploymentId},client_id.eq.${clientId},deployment_id.is.null`)
        .eq('enabled', true)

      if (error) throw error

      return data.map(row => ({
        id: row.id,
        deploymentId: row.deployment_id,
        clientId: row.client_id,
        conditions: row.conditions,
        actions: row.actions,
        enabled: row.enabled
      }))
    } catch (error) {
      console.error('Failed to get escalation rules:', error)
      return []
    }
  }

  /**
   * Get incident template
   */
  private async getIncidentTemplate(type: Incident['type'], severity: Incident['severity']): Promise<IncidentTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('incident_templates')
        .select('*')
        .eq('type', type)
        .eq('severity', severity)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        investigationSteps: data.investigation_steps,
        commonResolutions: data.common_resolutions,
        escalationThreshold: data.escalation_threshold,
        automatedActions: data.automated_actions
      }
    } catch (error) {
      console.error('Failed to get incident template:', error)
      return null
    }
  }

  /**
   * Automated response implementations
   */
  private async restartDeployment(deploymentId: string): Promise<void> {
    console.log(`Restarting deployment: ${deploymentId}`)
    // Implementation would trigger deployment restart
  }

  private async scaleUpDeployment(deploymentId: string): Promise<void> {
    console.log(`Scaling up deployment: ${deploymentId}`)
    // Implementation would scale deployment resources
  }

  private async enableMaintenanceMode(deploymentId: string): Promise<void> {
    console.log(`Enabling maintenance mode for deployment: ${deploymentId}`)
    // Implementation would enable maintenance mode
  }

  private async createBackup(deploymentId: string): Promise<void> {
    console.log(`Creating backup for deployment: ${deploymentId}`)
    // Implementation would create deployment backup
  }

  private async notifyClient(incident: Incident): Promise<void> {
    console.log(`Notifying client about incident: ${incident.id}`)
    // Implementation would send client notification
  }

  /**
   * Notification implementations
   */
  private async notifyIncidentCreation(incident: Incident): Promise<void> {
    console.log(`Notifying incident creation: ${incident.id}`)
    // Implementation would send notifications
  }

  private async notifyIncidentUpdate(incident: Incident): Promise<void> {
    console.log(`Notifying incident update: ${incident.id}`)
    // Implementation would send update notifications
  }

  private async sendEscalationNotification(incident: Incident, email: string, rule: EscalationRule): Promise<void> {
    console.log(`Sending escalation notification for incident ${incident.id} to ${email}`)
    // Implementation would send escalation email
  }

  /**
   * Get incident metrics and statistics
   */
  async getIncidentMetrics(filters?: {
    deploymentId?: string
    clientId?: string
    timeframe?: '24h' | '7d' | '30d'
  }): Promise<{
    totalIncidents: number
    openIncidents: number
    resolvedIncidents: number
    avgResolutionTime: number // hours
    incidentsByType: Record<string, number>
    incidentsBySeverity: Record<string, number>
    mttr: number // mean time to resolution in hours
    mtbf: number // mean time between failures in hours
  }> {
    try {
      const timeframe = filters?.timeframe || '30d'
      const since = new Date()

      switch (timeframe) {
        case '24h':
          since.setHours(since.getHours() - 24)
          break
        case '7d':
          since.setDate(since.getDate() - 7)
          break
        case '30d':
          since.setDate(since.getDate() - 30)
          break
      }

      const incidents = await this.getIncidents({
        deploymentId: filters?.deploymentId,
        clientId: filters?.clientId,
        since
      })

      const totalIncidents = incidents.length
      const openIncidents = incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length
      const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length

      // Calculate average resolution time
      const resolvedIncidentsWithTimes = incidents.filter(i =>
        (i.status === 'resolved' || i.status === 'closed') &&
        i.metadata.resolvedAt
      )

      const totalResolutionTime = resolvedIncidentsWithTimes.reduce((sum, incident) => {
        const resolutionTime = incident.metadata.resolvedAt!.getTime() - incident.metadata.detectedAt.getTime()
        return sum + resolutionTime
      }, 0)

      const avgResolutionTime = resolvedIncidentsWithTimes.length > 0
        ? totalResolutionTime / resolvedIncidentsWithTimes.length / (1000 * 60 * 60) // Convert to hours
        : 0

      // Incidents by type
      const incidentsByType: Record<string, number> = {}
      incidents.forEach(incident => {
        incidentsByType[incident.type] = (incidentsByType[incident.type] || 0) + 1
      })

      // Incidents by severity
      const incidentsBySeverity: Record<string, number> = {}
      incidents.forEach(incident => {
        incidentsBySeverity[incident.severity] = (incidentsBySeverity[incident.severity] || 0) + 1
      })

      return {
        totalIncidents,
        openIncidents,
        resolvedIncidents,
        avgResolutionTime,
        incidentsByType,
        incidentsBySeverity,
        mttr: avgResolutionTime, // Same as avgResolutionTime for now
        mtbf: totalIncidents > 1 ? (Date.now() - since.getTime()) / (1000 * 60 * 60) / totalIncidents : 0
      }
    } catch (error) {
      console.error('Failed to get incident metrics:', error)
      return {
        totalIncidents: 0,
        openIncidents: 0,
        resolvedIncidents: 0,
        avgResolutionTime: 0,
        incidentsByType: {},
        incidentsBySeverity: {},
        mttr: 0,
        mtbf: 0
      }
    }
  }
}

export const incidentManager = new IncidentManager()
export default incidentManager