/**
 * Maintenance Mode System
 * Comprehensive maintenance mode management for production applications
 */

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

export interface MaintenanceConfig {
  enabled: boolean;
  mode: 'full' | 'partial' | 'readonly';
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  message: string;
  title: string;
  allowList: {
    ips: string[];
    users: string[];
    paths: string[];
  };
  redirectUrl?: string;
  customPage?: string;
  notifications: {
    email: string[];
    webhook: string[];
    slack: string;
  };
  autoEnd: boolean;
  gracePeriod: number; // minutes
}

export interface MaintenanceEvent {
  id: string;
  config: MaintenanceConfig;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  reason: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedServices: string[];
  metadata?: Record<string, any>;
}

export interface MaintenanceSchedule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  schedule: {
    type: 'once' | 'recurring';
    startTime: Date;
    endTime?: Date;
    duration?: number; // minutes
    recurrence?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
      dayOfMonth?: number; // 1-31
    };
  };
  config: Omit<MaintenanceConfig, 'enabled' | 'startTime' | 'endTime' | 'duration'>;
  notifications: {
    beforeStart: number; // minutes
    onStart: boolean;
    onEnd: boolean;
    onCancel: boolean;
  };
}

export class MaintenanceManager {
  private supabase: any;
  private currentMaintenance: MaintenanceEvent | null = null;
  private maintenanceFile: string;
  private isRunning: boolean = false;
  private scheduledMaintenances: Map<string, MaintenanceSchedule> = new Map();

  constructor() {
    this.maintenanceFile = path.join(process.cwd(), '.maintenance');
    
    // Initialize Supabase client
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
  }

  /**
   * Start maintenance manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Maintenance manager is already running');
      return;
    }

    this.isRunning = true;
    console.log('Maintenance manager started');

    // Load current maintenance state
    await this.loadCurrentMaintenance();

    // Load scheduled maintenances
    await this.loadScheduledMaintenances();

    // Start maintenance monitoring
    this.startMaintenanceMonitoring();
  }

  /**
   * Stop maintenance manager
   */
  stop(): void {
    this.isRunning = false;
    console.log('Maintenance manager stopped');
  }

  /**
   * Enable maintenance mode
   */
  async enableMaintenance(
    config: Omit<MaintenanceConfig, 'enabled' | 'startTime'>,
    createdBy: string,
    reason: string,
    impact: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    affectedServices: string[] = []
  ): Promise<MaintenanceEvent> {
    const maintenanceEvent: MaintenanceEvent = {
      id: this.generateMaintenanceId(),
      config: {
        ...config,
        enabled: true,
        startTime: new Date(),
      },
      status: 'active',
      createdBy,
      createdAt: new Date(),
      startedAt: new Date(),
      reason,
      impact,
      affectedServices,
    };

    // Set end time if duration is specified
    if (config.duration) {
      maintenanceEvent.config.endTime = new Date(Date.now() + config.duration * 60 * 1000);
    }

    this.currentMaintenance = maintenanceEvent;

    // Create maintenance file
    await this.createMaintenanceFile(maintenanceEvent);

    // Store in database
    await this.storeMaintenanceEvent(maintenanceEvent);

    // Send notifications
    await this.sendMaintenanceNotifications('start', maintenanceEvent);

    console.log(`Maintenance mode enabled: ${maintenanceEvent.id}`);
    return maintenanceEvent;
  }

  /**
   * Disable maintenance mode
   */
  async disableMaintenance(endedBy: string): Promise<void> {
    if (!this.currentMaintenance) {
      throw new Error('No active maintenance mode to disable');
    }

    this.currentMaintenance.status = 'completed';
    this.currentMaintenance.endedAt = new Date();

    // Remove maintenance file
    await this.removeMaintenanceFile();

    // Update database
    await this.updateMaintenanceEvent(this.currentMaintenance);

    // Send notifications
    await this.sendMaintenanceNotifications('end', this.currentMaintenance);

    console.log(`Maintenance mode disabled: ${this.currentMaintenance.id}`);
    this.currentMaintenance = null;
  }

  /**
   * Schedule maintenance
   */
  async scheduleMaintenance(schedule: Omit<MaintenanceSchedule, 'id'>): Promise<MaintenanceSchedule> {
    const maintenanceSchedule: MaintenanceSchedule = {
      ...schedule,
      id: this.generateScheduleId(),
    };

    this.scheduledMaintenances.set(maintenanceSchedule.id, maintenanceSchedule);

    // Store in database
    if (this.supabase) {
      try {
        await this.supabase
          .from('maintenance_schedules')
          .insert({
            id: maintenanceSchedule.id,
            name: maintenanceSchedule.name,
            description: maintenanceSchedule.description,
            enabled: maintenanceSchedule.enabled,
            schedule: maintenanceSchedule.schedule,
            config: maintenanceSchedule.config,
            notifications: maintenanceSchedule.notifications,
            created_at: new Date().toISOString(),
          });
      } catch (error) {
        console.error('Failed to save maintenance schedule:', error);
      }
    }

    console.log(`Maintenance scheduled: ${maintenanceSchedule.name}`);
    return maintenanceSchedule;
  }

  /**
   * Cancel scheduled maintenance
   */
  async cancelScheduledMaintenance(scheduleId: string, cancelledBy: string): Promise<void> {
    const schedule = this.scheduledMaintenances.get(scheduleId);
    if (!schedule) {
      throw new Error(`Maintenance schedule not found: ${scheduleId}`);
    }

    this.scheduledMaintenances.delete(scheduleId);

    // Update database
    if (this.supabase) {
      try {
        await this.supabase
          .from('maintenance_schedules')
          .update({ enabled: false })
          .eq('id', scheduleId);
      } catch (error) {
        console.error('Failed to cancel maintenance schedule:', error);
      }
    }

    // Send cancellation notification
    await this.sendScheduleNotification('cancel', schedule, cancelledBy);

    console.log(`Maintenance schedule cancelled: ${schedule.name}`);
  }

  /**
   * Check if maintenance mode is active
   */
  isMaintenanceActive(): boolean {
    return this.currentMaintenance !== null && this.currentMaintenance.status === 'active';
  }

  /**
   * Get current maintenance info
   */
  getCurrentMaintenance(): MaintenanceEvent | null {
    return this.currentMaintenance;
  }

  /**
   * Check if request should be allowed during maintenance
   */
  shouldAllowRequest(
    ip: string,
    userId?: string,
    path?: string,
    userAgent?: string
  ): boolean {
    if (!this.currentMaintenance) return true;

    const config = this.currentMaintenance.config;

    // Check IP allowlist
    if (config.allowList.ips.length > 0) {
      if (config.allowList.ips.includes(ip)) {
        return true;
      }
    }

    // Check user allowlist
    if (userId && config.allowList.users.length > 0) {
      if (config.allowList.users.includes(userId)) {
        return true;
      }
    }

    // Check path allowlist
    if (path && config.allowList.paths.length > 0) {
      if (config.allowList.paths.some(allowedPath => path.startsWith(allowedPath))) {
        return true;
      }
    }

    // Check maintenance mode type
    switch (config.mode) {
      case 'full':
        return false;
      case 'partial':
        // Allow read-only operations
        return this.isReadOnlyRequest(path);
      case 'readonly':
        return this.isReadOnlyRequest(path);
      default:
        return false;
    }
  }

  /**
   * Get maintenance page HTML
   */
  getMaintenancePageHTML(): string {
    if (!this.currentMaintenance) {
      return '<html><body><h1>System Maintenance</h1><p>No active maintenance.</p></body></html>';
    }

    const config = this.currentMaintenance.config;
    const startTime = this.currentMaintenance.startedAt?.toLocaleString();
    const endTime = config.endTime?.toLocaleString() || 'TBD';

    if (config.customPage) {
      return config.customPage;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 3rem;
            max-width: 600px;
            text-align: center;
            margin: 2rem;
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: #667eea;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        .message {
            color: #666;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #495057;
        }
        .value {
            color: #6c757d;
        }
        .countdown {
            font-size: 1.2rem;
            font-weight: 600;
            color: #667eea;
            margin-top: 1rem;
        }
        .footer {
            color: #6c757d;
            font-size: 0.9rem;
            margin-top: 2rem;
        }
        @media (max-width: 600px) {
            .container {
                margin: 1rem;
                padding: 2rem;
            }
            h1 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <h1>${config.title}</h1>
        <div class="message">${config.message}</div>
        
        <div class="info">
            <div class="info-item">
                <span class="label">Started:</span>
                <span class="value">${startTime}</span>
            </div>
            <div class="info-item">
                <span class="label">Expected End:</span>
                <span class="value">${endTime}</span>
            </div>
            <div class="info-item">
                <span class="label">Impact:</span>
                <span class="value">${this.currentMaintenance.impact.toUpperCase()}</span>
            </div>
        </div>

        ${config.endTime ? `
        <div class="countdown" id="countdown">
            <div>Estimated time remaining: <span id="time-remaining">Calculating...</span></div>
        </div>
        ` : ''}

        <div class="footer">
            We apologize for any inconvenience. Thank you for your patience.
        </div>
    </div>

    ${config.endTime ? `
    <script>
        function updateCountdown() {
            const endTime = new Date('${config.endTime}');
            const now = new Date();
            const diff = endTime - now;
            
            if (diff <= 0) {
                document.getElementById('time-remaining').textContent = 'Maintenance completed';
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            document.getElementById('time-remaining').textContent = 
                hours + 'h ' + minutes + 'm ' + seconds + 's';
        }
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    </script>
    ` : ''}
</body>
</html>`;
  }

  /**
   * Start maintenance monitoring
   */
  private startMaintenanceMonitoring(): void {
    // Check for scheduled maintenances every minute
    setInterval(async () => {
      await this.checkScheduledMaintenances();
    }, 60000);

    // Check for maintenance end time every 30 seconds
    setInterval(async () => {
      await this.checkMaintenanceEndTime();
    }, 30000);
  }

  /**
   * Check scheduled maintenances
   */
  private async checkScheduledMaintenances(): Promise<void> {
    const now = new Date();

    for (const schedule of this.scheduledMaintenances.values()) {
      if (!schedule.enabled) continue;

      const { schedule: scheduleConfig } = schedule;
      const startTime = new Date(scheduleConfig.startTime);

      // Check if it's time to start
      if (now >= startTime && now <= new Date(startTime.getTime() + 60000)) { // Within 1 minute
        await this.executeScheduledMaintenance(schedule);
      }

      // Send pre-maintenance notifications
      if (schedule.notifications.beforeStart > 0) {
        const notificationTime = new Date(startTime.getTime() - schedule.notifications.beforeStart * 60 * 1000);
        if (now >= notificationTime && now <= new Date(notificationTime.getTime() + 60000)) {
          await this.sendScheduleNotification('before_start', schedule);
        }
      }
    }
  }

  /**
   * Check maintenance end time
   */
  private async checkMaintenanceEndTime(): Promise<void> {
    if (!this.currentMaintenance || !this.currentMaintenance.config.endTime) return;

    const now = new Date();
    const endTime = this.currentMaintenance.config.endTime;

    if (now >= endTime) {
      await this.disableMaintenance('system');
    }
  }

  /**
   * Execute scheduled maintenance
   */
  private async executeScheduledMaintenance(schedule: MaintenanceSchedule): Promise<void> {
    const config: MaintenanceConfig = {
      ...schedule.config,
      enabled: true,
      startTime: new Date(),
      endTime: schedule.schedule.endTime ? new Date(schedule.schedule.endTime) : undefined,
      duration: schedule.schedule.duration,
    };

    await this.enableMaintenance(
      config,
      'system',
      `Scheduled maintenance: ${schedule.name}`,
      'medium',
      []
    );

    // Disable the schedule
    schedule.enabled = false;
    this.scheduledMaintenances.delete(schedule.id);

    // Send start notification
    if (schedule.notifications.onStart) {
      await this.sendScheduleNotification('start', schedule);
    }
  }

  /**
   * Create maintenance file
   */
  private async createMaintenanceFile(maintenance: MaintenanceEvent): Promise<void> {
    const maintenanceData = {
      id: maintenance.id,
      enabled: true,
      config: maintenance.config,
      startedAt: maintenance.startedAt,
      reason: maintenance.reason,
      impact: maintenance.impact,
    };

    await fs.writeFile(
      this.maintenanceFile,
      JSON.stringify(maintenanceData, null, 2)
    );
  }

  /**
   * Remove maintenance file
   */
  private async removeMaintenanceFile(): Promise<void> {
    try {
      await fs.unlink(this.maintenanceFile);
    } catch (error) {
      // File might not exist, which is fine
    }
  }

  /**
   * Load current maintenance state
   */
  private async loadCurrentMaintenance(): Promise<void> {
    try {
      const data = await fs.readFile(this.maintenanceFile, 'utf-8');
      const maintenanceData = JSON.parse(data);

      if (maintenanceData.enabled) {
        this.currentMaintenance = {
          id: maintenanceData.id,
          config: maintenanceData.config,
          status: 'active',
          createdBy: 'system',
          createdAt: new Date(maintenanceData.startedAt),
          startedAt: new Date(maintenanceData.startedAt),
          reason: maintenanceData.reason,
          impact: maintenanceData.impact,
          affectedServices: [],
        };
      }
    } catch (error) {
      // No maintenance file exists, which is fine
    }
  }

  /**
   * Load scheduled maintenances
   */
  private async loadScheduledMaintenances(): Promise<void> {
    if (!this.supabase) return;

    try {
      const { data: schedules, error } = await this.supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('enabled', true);

      if (error) throw error;

      if (schedules) {
        schedules.forEach((schedule: any) => {
          this.scheduledMaintenances.set(schedule.id, {
            id: schedule.id,
            name: schedule.name,
            description: schedule.description,
            enabled: schedule.enabled,
            schedule: schedule.schedule,
            config: schedule.config,
            notifications: schedule.notifications,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load scheduled maintenances:', error);
    }
  }

  /**
   * Store maintenance event
   */
  private async storeMaintenanceEvent(maintenance: MaintenanceEvent): Promise<void> {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('maintenance_events')
        .insert({
          id: maintenance.id,
          config: maintenance.config,
          status: maintenance.status,
          created_by: maintenance.createdBy,
          created_at: maintenance.createdAt.toISOString(),
          started_at: maintenance.startedAt?.toISOString(),
          ended_at: maintenance.endedAt?.toISOString(),
          reason: maintenance.reason,
          impact: maintenance.impact,
          affected_services: maintenance.affectedServices,
          metadata: maintenance.metadata,
        });
    } catch (error) {
      console.error('Failed to store maintenance event:', error);
    }
  }

  /**
   * Update maintenance event
   */
  private async updateMaintenanceEvent(maintenance: MaintenanceEvent): Promise<void> {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('maintenance_events')
        .update({
          status: maintenance.status,
          ended_at: maintenance.endedAt?.toISOString(),
        })
        .eq('id', maintenance.id);
    } catch (error) {
      console.error('Failed to update maintenance event:', error);
    }
  }

  /**
   * Send maintenance notifications
   */
  private async sendMaintenanceNotifications(
    type: 'start' | 'end',
    maintenance: MaintenanceEvent
  ): Promise<void> {
    const config = maintenance.config;
    const message = type === 'start' 
      ? `Maintenance mode started: ${maintenance.reason}`
      : `Maintenance mode ended: ${maintenance.reason}`;

    // Send email notifications
    if (config.notifications.email.length > 0) {
      await this.sendEmailNotification(config.notifications.email, message, maintenance);
    }

    // Send webhook notifications
    if (config.notifications.webhook.length > 0) {
      await this.sendWebhookNotification(config.notifications.webhook, message, maintenance);
    }

    // Send Slack notifications
    if (config.notifications.slack) {
      await this.sendSlackNotification(config.notifications.slack, message, maintenance);
    }
  }

  /**
   * Send schedule notification
   */
  private async sendScheduleNotification(
    type: 'before_start' | 'start' | 'cancel',
    schedule: MaintenanceSchedule,
    cancelledBy?: string
  ): Promise<void> {
    let message: string;
    
    switch (type) {
      case 'before_start':
        message = `Scheduled maintenance starting soon: ${schedule.name}`;
        break;
      case 'start':
        message = `Scheduled maintenance started: ${schedule.name}`;
        break;
      case 'cancel':
        message = `Scheduled maintenance cancelled: ${schedule.name}${cancelledBy ? ` by ${cancelledBy}` : ''}`;
        break;
    }

    // Send notifications via configured channels
    console.log(`Schedule notification: ${message}`);
  }

  /**
   * Check if request is read-only
   */
  private isReadOnlyRequest(path?: string): boolean {
    if (!path) return false;

    // Allow GET requests and specific read-only paths
    const readOnlyPaths = [
      '/api/health',
      '/api/status',
      '/api/readonly',
      '/static',
      '/assets',
    ];

    return readOnlyPaths.some(readOnlyPath => path.startsWith(readOnlyPath));
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(recipients: string[], message: string, maintenance: MaintenanceEvent): Promise<void> {
    // Implementation would send email notifications
    console.log(`Email notification sent to ${recipients.join(', ')}: ${message}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(webhooks: string[], message: string, maintenance: MaintenanceEvent): Promise<void> {
    const payload = {
      type: 'maintenance',
      message,
      maintenance: {
        id: maintenance.id,
        reason: maintenance.reason,
        impact: maintenance.impact,
        startTime: maintenance.startedAt,
        endTime: maintenance.config.endTime,
      },
    };

    for (const webhook of webhooks) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error(`Failed to send webhook notification to ${webhook}:`, error);
      }
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(webhookUrl: string, message: string, maintenance: MaintenanceEvent): Promise<void> {
    const slackMessage = {
      text: `🔧 Maintenance Alert`,
      attachments: [
        {
          color: maintenance.impact === 'critical' ? 'danger' : 'warning',
          fields: [
            {
              title: 'Message',
              value: message,
              short: false,
            },
            {
              title: 'Reason',
              value: maintenance.reason,
              short: true,
            },
            {
              title: 'Impact',
              value: maintenance.impact.toUpperCase(),
              short: true,
            },
            {
              title: 'Start Time',
              value: maintenance.startedAt?.toISOString() || 'N/A',
              short: true,
            },
            {
              title: 'End Time',
              value: maintenance.config.endTime?.toISOString() || 'TBD',
              short: true,
            },
          ],
        },
      ],
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Generate maintenance ID
   */
  private generateMaintenanceId(): string {
    return `maintenance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate schedule ID
   */
  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create maintenance manager instance
 */
export function createMaintenanceManager(): MaintenanceManager {
  return new MaintenanceManager();
}

/**
 * Global maintenance manager instance
 */
export const maintenanceManager = createMaintenanceManager();
