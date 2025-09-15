/**
 * @fileoverview Slack Bot Integration for Hero Tasks
 * @module lib/bots/slack-bot
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

import { WebClient } from '@slack/web-api';
import { createClient } from '@/lib/supabase/client';
import { 
  HeroTask, 
  TaskStatus, 
  TaskPriority, 
  TaskType,
  WorkflowPhase 
} from '@/types/hero-tasks';

// =============================================================================
// SLACK BOT CONFIGURATION
// =============================================================================

interface SlackBotConfig {
  token: string;
  signingSecret: string;
  appToken: string;
  defaultChannel?: string;
  enableNotifications: boolean;
  enableCommands: boolean;
}

interface SlackTaskNotification {
  task: HeroTask;
  event: 'created' | 'updated' | 'completed' | 'assigned' | 'due_soon' | 'overdue';
  user?: string;
  channel?: string;
}

interface SlackCommand {
  command: string;
  text: string;
  user_id: string;
  channel_id: string;
  response_url: string;
}

// =============================================================================
// SLACK BOT CLASS
// =============================================================================

export class HeroTasksSlackBot {
  private client: WebClient;
  private supabase = createClient();
  private config: SlackBotConfig;

  constructor(config: SlackBotConfig) {
    this.config = config;
    this.client = new WebClient(config.token);
  }

  // =============================================================================
  // NOTIFICATION METHODS
  // =============================================================================

  /**
   * Send task notification to Slack channel
   */
  async sendTaskNotification(notification: SlackTaskNotification): Promise<boolean> {
    if (!this.config.enableNotifications) {
      console.log('Slack notifications disabled');
      return false;
    }

    try {
      const channel = notification.channel || this.config.defaultChannel;
      if (!channel) {
        console.error('No channel specified for Slack notification');
        return false;
      }

      const message = this.buildTaskMessage(notification);
      
      const result = await this.client.chat.postMessage({
        channel,
        text: message.text,
        blocks: message.blocks,
        username: 'Hero Tasks Bot',
        icon_emoji: ':robot_face:'
      });

      return result.ok;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return false;
    }
  }

  /**
   * Build task notification message
   */
  private buildTaskMessage(notification: SlackTaskNotification) {
    const { task, event } = notification;
    const emoji = this.getEventEmoji(event);
    const color = this.getPriorityColor(task.priority);

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} Task ${event.charAt(0).toUpperCase() + event.slice(1)}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Task:* ${task.task_number} - ${task.title}`
          },
          {
            type: 'mrkdwn',
            text: `*Status:* ${task.status}`
          },
          {
            type: 'mrkdwn',
            text: `*Priority:* ${task.priority}`
          },
          {
            type: 'mrkdwn',
            text: `*Type:* ${task.type}`
          }
        ]
      }
    ];

    if (task.description) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${task.description}`
        }
      });
    }

    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const isOverdue = dueDate < new Date();
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Due Date:* ${dueDate.toLocaleDateString()} ${isOverdue ? '⚠️ OVERDUE' : ''}`
        }
      });
    }

    if (task.assignee_id) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Assigned to:* <@${task.assignee_id}>`
        }
      });
    }

    // Add action buttons for quick actions
    const actions = this.buildActionButtons(task);
    if (actions.length > 0) {
      blocks.push({
        type: 'actions',
        elements: actions
      } as any);
    }

    return {
      text: `${emoji} Task ${event}: ${task.task_number} - ${task.title}`,
      blocks
    };
  }

  /**
   * Build action buttons for task interactions
   */
  private buildActionButtons(task: HeroTask) {
    const buttons = [];

    // Status update buttons
    if (task.status !== 'completed') {
      buttons.push({
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Mark Complete'
        },
        style: 'primary',
        action_id: 'complete_task',
        value: task.id
      });
    }

    if (task.status !== 'in_progress') {
      buttons.push({
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Start Task'
        },
        action_id: 'start_task',
        value: task.id
      });
    }

    // View task button
    buttons.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'View Task'
      },
      action_id: 'view_task',
      value: task.id,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/hero-tasks/${task.id}`
    });

    return buttons.slice(0, 5); // Slack limit
  }

  /**
   * Get emoji for event type
   */
  private getEventEmoji(event: string): string {
    const emojis = {
      created: ':new:',
      updated: ':pencil2:',
      completed: ':white_check_mark:',
      assigned: ':bust_in_silhouette:',
      due_soon: ':clock1:',
      overdue: ':warning:'
    };
    return emojis[event as keyof typeof emojis] || ':information_source:';
  }

  /**
   * Get color for priority level
   */
  private getPriorityColor(priority: TaskPriority): string {
    const colors = {
      critical: '#FF0000',
      high: '#FF8C00',
      medium: '#FFD700',
      low: '#32CD32'
    };
    return colors[priority] || '#808080';
  }

  // =============================================================================
  // COMMAND HANDLING
  // =============================================================================

  /**
   * Handle Slack slash commands
   */
  async handleCommand(command: SlackCommand): Promise<string> {
    if (!this.config.enableCommands) {
      return 'Commands are disabled for this bot.';
    }

    const [action, ...args] = command.text.split(' ');

    try {
      switch (action.toLowerCase()) {
        case 'list':
          return await this.handleListCommand(args);
        case 'create':
          return await this.handleCreateCommand(args, command.user_id);
        case 'status':
          return await this.handleStatusCommand(args);
        case 'assign':
          return await this.handleAssignCommand(args);
        case 'help':
          return this.getHelpMessage();
        default:
          return `Unknown command: ${action}. Use \`/hero-tasks help\` for available commands.`;
      }
    } catch (error) {
      console.error('Command handling error:', error);
      return 'Sorry, there was an error processing your command.';
    }
  }

  /**
   * Handle list command
   */
  private async handleListCommand(args: string[]): Promise<string> {
    const filters = this.parseListFilters(args);
    const { data: tasks, error } = await this.supabase
      .from('hero_tasks')
      .select('*')
      .match(filters)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return 'Error fetching tasks.';
    }

    if (!tasks || tasks.length === 0) {
      return 'No tasks found.';
    }

    const taskList = tasks.map((task: HeroTask) => 
      `• ${task.task_number}: ${task.title} (${task.status})`
    ).join('\n');

    return `*Recent Tasks:*\n${taskList}`;
  }

  /**
   * Handle create command
   */
  private async handleCreateCommand(args: string[], userId: string): Promise<string> {
    if (args.length < 1) {
      return 'Usage: `/hero-tasks create "Task Title" [description]`';
    }

    const title = args[0];
    const description = args.slice(1).join(' ');

    const { data: task, error } = await this.supabase
      .from('hero_tasks')
      .insert({
        title,
        description: description || null,
        assignee_id: userId,
        priority: 'medium',
        type: 'feature',
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      return 'Error creating task.';
    }

    return `✅ Created task ${task.task_number}: ${task.title}`;
  }

  /**
   * Handle status command
   */
  private async handleStatusCommand(args: string[]): Promise<string> {
    if (args.length < 2) {
      return 'Usage: `/hero-tasks status <task-number> <new-status>`';
    }

    const taskNumber = args[0];
    const newStatus = args[1] as TaskStatus;

    const { data: task, error } = await this.supabase
      .from('hero_tasks')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('task_number', taskNumber)
      .select()
      .single();

    if (error) {
      return 'Error updating task status.';
    }

    return `✅ Updated ${task.task_number} status to ${newStatus}`;
  }

  /**
   * Handle assign command
   */
  private async handleAssignCommand(args: string[]): Promise<string> {
    if (args.length < 2) {
      return 'Usage: `/hero-tasks assign <task-number> <@user>`';
    }

    const taskNumber = args[0];
    const userId = args[1].replace('<@', '').replace('>', '');

    const { data: task, error } = await this.supabase
      .from('hero_tasks')
      .update({ 
        assignee_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('task_number', taskNumber)
      .select()
      .single();

    if (error) {
      return 'Error assigning task.';
    }

    return `✅ Assigned ${task.task_number} to <@${userId}>`;
  }

  /**
   * Parse filters for list command
   */
  private parseListFilters(args: string[]): Record<string, any> {
    const filters: Record<string, any> = {};

    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];

      switch (key) {
        case '--status':
          filters.status = value;
          break;
        case '--priority':
          filters.priority = value;
          break;
        case '--assignee':
          filters.assignee_id = value.replace('<@', '').replace('>', '');
          break;
      }
    }

    return filters;
  }

  /**
   * Get help message
   */
  private getHelpMessage(): string {
    return `*Hero Tasks Bot Commands:*

\`/hero-tasks list [--status <status>] [--priority <priority>] [--assignee <@user>]\`
List recent tasks with optional filters

\`/hero-tasks create "Task Title" [description]\`
Create a new task

\`/hero-tasks status <task-number> <new-status>\`
Update task status (draft, ready, in_progress, completed, blocked, cancelled)

\`/hero-tasks assign <task-number> <@user>\`
Assign task to a user

\`/hero-tasks help\`
Show this help message

*Examples:*
• \`/hero-tasks list --status in_progress\`
• \`/hero-tasks create "Fix login bug" "Users can't log in with Google"\`
• \`/hero-tasks status HT-001 completed\`
• \`/hero-tasks assign HT-002 @john.doe\``;
  }

  // =============================================================================
  // INTERACTION HANDLING
  // =============================================================================

  /**
   * Handle button interactions
   */
  async handleInteraction(payload: any): Promise<void> {
    const { type, actions, user, channel } = payload;

    if (type !== 'block_actions') return;

    for (const action of actions) {
      const { action_id, value } = action;

      switch (action_id) {
        case 'complete_task':
          await this.completeTask(value, user.id, channel.id);
          break;
        case 'start_task':
          await this.startTask(value, user.id, channel.id);
          break;
        case 'view_task':
          // This is handled by the URL button
          break;
      }
    }
  }

  /**
   * Complete task from Slack interaction
   */
  private async completeTask(taskId: string, userId: string, channelId: string): Promise<void> {
    const { data: task, error } = await this.supabase
      .from('hero_tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      await this.client.chat.postMessage({
        channel: channelId,
        text: `❌ Error completing task: ${error.message}`
      });
      return;
    }

    await this.client.chat.postMessage({
      channel: channelId,
      text: `✅ Task ${task.task_number} completed by <@${userId}>!`
    });
  }

  /**
   * Start task from Slack interaction
   */
  private async startTask(taskId: string, userId: string, channelId: string): Promise<void> {
    const { data: task, error } = await this.supabase
      .from('hero_tasks')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      await this.client.chat.postMessage({
        channel: channelId,
        text: `❌ Error starting task: ${error.message}`
      });
      return;
    }

    await this.client.chat.postMessage({
      channel: channelId,
      text: `🚀 Task ${task.task_number} started by <@${userId}>!`
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Send daily task summary
   */
  async sendDailySummary(channel: string): Promise<void> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const { data: tasks, error } = await this.supabase
      .from('hero_tasks')
      .select('*')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (error) {
      console.error('Error fetching daily tasks:', error);
      return;
    }

    const completedToday = tasks?.filter(t => t.status === 'completed') || [];
    const inProgress = tasks?.filter(t => t.status === 'in_progress') || [];
    const overdue = tasks?.filter(t => 
      t.due_date && new Date(t.due_date) < today && t.status !== 'completed'
    ) || [];

    const message = {
      channel,
      text: `📊 Daily Task Summary - ${today.toLocaleDateString()}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📊 Daily Task Summary - ${today.toLocaleDateString()}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Tasks Created Today:*\n${tasks?.length || 0}`
            },
            {
              type: 'mrkdwn',
              text: `*Completed Today:*\n${completedToday.length}`
            },
            {
              type: 'mrkdwn',
              text: `*In Progress:*\n${inProgress.length}`
            },
            {
              type: 'mrkdwn',
              text: `*Overdue:*\n${overdue.length}`
            }
          ]
        }
      ]
    };

    if (overdue.length > 0) {
      const overdueList = overdue.map(t => `• ${t.task_number}: ${t.title}`).join('\n');
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*⚠️ Overdue Tasks:*\n${overdueList}`
        }
      });
    }

    await this.client.chat.postMessage(message);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createSlackBot(): HeroTasksSlackBot {
  const config: SlackBotConfig = {
    token: process.env.SLACK_BOT_TOKEN || '',
    signingSecret: process.env.SLACK_SIGNING_SECRET || '',
    appToken: process.env.SLACK_APP_TOKEN || '',
    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL,
    enableNotifications: process.env.SLACK_ENABLE_NOTIFICATIONS === 'true',
    enableCommands: process.env.SLACK_ENABLE_COMMANDS === 'true'
  };

  return new HeroTasksSlackBot(config);
}
