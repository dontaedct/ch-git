/**
 * @fileoverview Communication Platform Bot Manager
 * @module lib/bots/bot-manager
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

import { HeroTasksSlackBot, createSlackBot } from './slack-bot';
import { HeroTasksDiscordBot, createDiscordBot } from './discord-bot';
import { HeroTask, TaskStatus, WorkflowPhase, TaskPriority, TaskType } from '@/types/hero-tasks';

// =============================================================================
// BOT MANAGER CONFIGURATION
// =============================================================================

interface BotManagerConfig {
  slack: {
    enabled: boolean;
    webhookUrl?: string;
    defaultChannel?: string;
  };
  discord: {
    enabled: boolean;
    defaultChannelId?: string;
  };
  notifications: {
    taskCreated: boolean;
    taskUpdated: boolean;
    taskCompleted: boolean;
    taskAssigned: boolean;
    taskDueSoon: boolean;
    taskOverdue: boolean;
  };
}

interface TaskNotificationEvent {
  task: HeroTask;
  event: 'created' | 'updated' | 'completed' | 'assigned' | 'due_soon' | 'overdue';
  userId?: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// BOT MANAGER CLASS
// =============================================================================

export class CommunicationBotManager {
  private slackBot?: HeroTasksSlackBot;
  private discordBot?: HeroTasksDiscordBot;
  private config: BotManagerConfig;
  private isInitialized = false;

  constructor(config: BotManagerConfig) {
    this.config = config;
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Bot manager already initialized');
      return;
    }

    try {
      // Initialize Slack bot if enabled
      if (this.config.slack.enabled) {
        this.slackBot = createSlackBot();
        console.log('Slack bot initialized');
      }

      // Initialize Discord bot if enabled
      if (this.config.discord.enabled) {
        const discordConfig = {
          token: process.env.DISCORD_BOT_TOKEN || '',
          clientId: process.env.DISCORD_CLIENT_ID || '',
          guildId: process.env.DISCORD_GUILD_ID,
          defaultChannelId: this.config.discord.defaultChannelId,
          enableNotifications: true,
          enableCommands: true,
        };
        this.discordBot = createDiscordBot(discordConfig);
        await this.discordBot.start();
        console.log('Discord bot initialized and started');
      }

      this.isInitialized = true;
      console.log('Communication bot manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize bot manager:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      if (this.discordBot) {
        await this.discordBot.stop();
        console.log('Discord bot stopped');
      }
      this.isInitialized = false;
      console.log('Bot manager shutdown complete');
    } catch (error) {
      console.error('Error during bot manager shutdown:', error);
    }
  }

  // =============================================================================
  // NOTIFICATION METHODS
  // =============================================================================

  /**
   * Send task notification to all enabled platforms
   */
  async sendTaskNotification(event: TaskNotificationEvent): Promise<{
    success: boolean;
    platforms: {
      slack?: boolean;
      discord?: boolean;
    };
    errors?: string[];
  }> {
    if (!this.isInitialized) {
      return {
        success: false,
        platforms: {},
        errors: ['Bot manager not initialized']
      };
    }

    const results = {
      success: true,
      platforms: {} as { slack?: boolean; discord?: boolean },
      errors: [] as string[]
    };

    // Check if this event type is enabled
    const eventKey = `task${event.event.charAt(0).toUpperCase() + event.event.slice(1)}` as keyof typeof this.config.notifications;
    if (!this.config.notifications[eventKey]) {
      console.log(`Notifications disabled for event: ${event.event}`);
      return results;
    }

    // Send to Slack
    if (this.slackBot && this.config.slack.enabled) {
      try {
        const success = await this.slackBot.sendTaskNotification({
          task: event.task,
          event: event.event,
          user: event.userId,
          channel: this.config.slack.defaultChannel
        });
        results.platforms.slack = success;
        if (!success) {
          results.errors.push('Slack notification failed');
        }
      } catch (error) {
        results.platforms.slack = false;
        results.errors.push(`Slack error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Send to Discord
    if (this.discordBot && this.config.discord.enabled) {
      try {
        await this.discordBot.sendTaskNotification({
          task: event.task,
          event: event.event,
          userId: event.userId,
          channelId: this.config.discord.defaultChannelId
        });
        results.platforms.discord = true;
      } catch (error) {
        results.platforms.discord = false;
        results.errors.push(`Discord error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    results.success = results.errors.length === 0;
    return results;
  }

  /**
   * Send task created notification
   */
  async notifyTaskCreated(task: HeroTask, userId?: string): Promise<void> {
    await this.sendTaskNotification({
      task,
      event: 'created',
      userId
    });
  }

  /**
   * Send task updated notification
   */
  async notifyTaskUpdated(task: HeroTask, userId?: string): Promise<void> {
    await this.sendTaskNotification({
      task,
      event: 'updated',
      userId
    });
  }

  /**
   * Send task completed notification
   */
  async notifyTaskCompleted(task: HeroTask, userId?: string): Promise<void> {
    await this.sendTaskNotification({
      task,
      event: 'completed',
      userId
    });
  }

  /**
   * Send task assigned notification
   */
  async notifyTaskAssigned(task: HeroTask, assigneeId: string, assignedBy?: string): Promise<void> {
    await this.sendTaskNotification({
      task,
      event: 'assigned',
      userId: assignedBy,
      metadata: { assigneeId }
    });
  }

  /**
   * Send task due soon notification
   */
  async notifyTaskDueSoon(task: HeroTask): Promise<void> {
    await this.sendTaskNotification({
      task,
      event: 'due_soon'
    });
  }

  /**
   * Send task overdue notification
   */
  async notifyTaskOverdue(task: HeroTask): Promise<void> {
    await this.sendTaskNotification({
      task,
      event: 'overdue'
    });
  }

  // =============================================================================
  // BULK NOTIFICATIONS
  // =============================================================================

  /**
   * Send daily task summary to all platforms
   */
  async sendDailySummary(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Bot manager not initialized, skipping daily summary');
      return;
    }

    try {
      const promises = [];

      if (this.slackBot && this.config.slack.enabled && this.config.slack.defaultChannel) {
        promises.push(
          this.slackBot.sendDailySummary(this.config.slack.defaultChannel)
        );
      }

      if (this.discordBot && this.config.discord.enabled && this.config.discord.defaultChannelId) {
        promises.push(
          this.discordBot.sendDailySummary(this.config.discord.defaultChannelId)
        );
      }

      await Promise.allSettled(promises);
      console.log('Daily summary sent to all platforms');
    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  }

  /**
   * Send weekly task report
   */
  async sendWeeklyReport(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Bot manager not initialized, skipping weekly report');
      return;
    }

    // This would be implemented similar to daily summary but with weekly data
    console.log('Weekly report functionality not yet implemented');
  }

  // =============================================================================
  // STATUS AND HEALTH CHECKS
  // =============================================================================

  /**
   * Get bot manager status
   */
  getStatus(): {
    initialized: boolean;
    platforms: {
      slack: { enabled: boolean; available: boolean };
      discord: { enabled: boolean; available: boolean };
    };
  } {
    return {
      initialized: this.isInitialized,
      platforms: {
        slack: {
          enabled: this.config.slack.enabled,
          available: !!this.slackBot
        },
        discord: {
          enabled: this.config.discord.enabled,
          available: !!this.discordBot
        }
      }
    };
  }

  /**
   * Test notification delivery
   */
  async testNotification(platform: 'slack' | 'discord' | 'all'): Promise<{
    success: boolean;
    results: Record<string, boolean>;
    errors?: string[];
  }> {
    const testTask: HeroTask = {
      id: 'test-task-id',
      task_number: 'HT-TEST',
      title: 'Test Notification',
      description: 'This is a test notification to verify bot functionality',
      status: TaskStatus.DRAFT,
      priority: TaskPriority.MEDIUM,
      type: TaskType.TEST,
      current_phase: WorkflowPhase.AUDIT,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['test'],
      metadata: {},
      audit_trail: []
    };

    const results: Record<string, boolean> = {};
    const errors: string[] = [];

    if (platform === 'all' || platform === 'slack') {
      if (this.slackBot && this.config.slack.enabled) {
        try {
          const success = await this.slackBot.sendTaskNotification({
            task: testTask,
            event: 'created',
            channel: this.config.slack.defaultChannel
          });
          results.slack = success;
          if (!success) {
            errors.push('Slack test notification failed');
          }
        } catch (error) {
          results.slack = false;
          errors.push(`Slack test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        results.slack = false;
        errors.push('Slack bot not available');
      }
    }

    if (platform === 'all' || platform === 'discord') {
      if (this.discordBot && this.config.discord.enabled) {
        try {
          await this.discordBot.sendTaskNotification({
            task: testTask,
            event: 'created',
            channelId: this.config.discord.defaultChannelId
          });
          results.discord = true;
        } catch (error) {
          results.discord = false;
          errors.push(`Discord test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        results.discord = false;
        errors.push('Discord bot not available');
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createBotManager(): CommunicationBotManager {
  const config: BotManagerConfig = {
    slack: {
      enabled: process.env.SLACK_ENABLED === 'true',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      defaultChannel: process.env.SLACK_DEFAULT_CHANNEL
    },
    discord: {
      enabled: process.env.DISCORD_ENABLED === 'true',
      defaultChannelId: process.env.DISCORD_DEFAULT_CHANNEL_ID
    },
    notifications: {
      taskCreated: process.env.NOTIFY_TASK_CREATED !== 'false',
      taskUpdated: process.env.NOTIFY_TASK_UPDATED !== 'false',
      taskCompleted: process.env.NOTIFY_TASK_COMPLETED !== 'false',
      taskAssigned: process.env.NOTIFY_TASK_ASSIGNED !== 'false',
      taskDueSoon: process.env.NOTIFY_TASK_DUE_SOON !== 'false',
      taskOverdue: process.env.NOTIFY_TASK_OVERDUE !== 'false'
    }
  };

  return new CommunicationBotManager(config);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let botManagerInstance: CommunicationBotManager | null = null;

export function getBotManager(): CommunicationBotManager {
  if (!botManagerInstance) {
    botManagerInstance = createBotManager();
  }
  return botManagerInstance;
}
