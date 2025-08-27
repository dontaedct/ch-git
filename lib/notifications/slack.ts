/**
 * Slack Notification Utilities
 * 
 * Provides server-side Slack notifications for Guardian failures
 * and other critical system events.
 */

interface SlackMessage {
  text: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

interface SlackNotificationOptions {
  webhookUrl?: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

/**
 * Send notification to Slack webhook
 */
export async function sendSlackNotification(
  message: string,
  options: SlackNotificationOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = options.webhookUrl ?? process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return { success: false, error: 'SLACK_WEBHOOK_URL not configured' };
  }
  
  try {
    const payload: SlackMessage = {
      text: message,
      ...(options.channel && { channel: options.channel }),
      ...(options.username && { username: options.username }),
      ...(options.iconEmoji && { icon_emoji: options.iconEmoji }),
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `Slack API error: ${response.status} ${errorText}` 
      };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send Guardian failure notification
 */
export async function sendGuardianFailureNotification(
  operation: string,
  error: string,
  tenantId: string,
  durationMs: number
): Promise<{ success: boolean; error?: string }> {
  const message = `🚨 Guardian Failure Alert\n\n` +
    `**Operation:** ${operation}\n` +
    `**Tenant:** ${tenantId}\n` +
    `**Duration:** ${durationMs}ms\n` +
    `**Error:** ${error}\n` +
    `**Time:** ${new Date().toISOString()}`;
  
  return sendSlackNotification(message, {
    username: 'Guardian Bot',
    iconEmoji: ':shield:',
  });
}

/**
 * Send Guardian success notification (optional, for monitoring)
 */
export async function sendGuardianSuccessNotification(
  operation: string,
  tenantId: string,
  durationMs: number,
  details?: string
): Promise<{ success: boolean; error?: string }> {
  const message = `✅ Guardian Success\n\n` +
    `**Operation:** ${operation}\n` +
    `**Tenant:** ${tenantId}\n` +
    `**Duration:** ${durationMs}ms\n` +
    `**Time:** ${new Date().toISOString()}` +
    (details ? `\n**Details:** ${details}` : '');
  
  return sendSlackNotification(message, {
    username: 'Guardian Bot',
    iconEmoji: ':white_check_mark:',
  });
}

/**
 * Send system health alert
 */
export async function sendSystemHealthAlert(
  status: 'warning' | 'critical',
  message: string,
  details?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const emoji = status === 'critical' ? '🚨' : '⚠️';
  
  const alertMessage = `${emoji} System Health Alert\n\n` +
    `**Status:** ${status.toUpperCase()}\n` +
    `**Message:** ${message}\n` +
    `**Time:** ${new Date().toISOString()}` +
    (details ? `\n**Details:** ${JSON.stringify(details, null, 2)}` : '');
  
  return sendSlackNotification(alertMessage, {
    username: 'System Monitor',
    iconEmoji: emoji,
  });
}
