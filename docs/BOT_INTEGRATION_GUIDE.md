/**
 * @fileoverview Bot Integration Documentation
 * @module docs/BOT_INTEGRATION_GUIDE.md
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

# Bot Integration Guide - HT-004.4.4

## Overview

This document provides comprehensive guidance for integrating and using the Slack and Discord bot integrations for the Hero Tasks system. The bots enable real-time task notifications, interactive commands, and seamless task management directly from communication platforms.

## Features Implemented

### ✅ Slack Bot Integration
- **Real-time Notifications**: Task created, updated, completed, assigned, due soon, overdue
- **Interactive Commands**: Slash commands for task management
- **Button Interactions**: Quick actions (complete, start, view task)
- **Rich Messages**: Formatted notifications with task details
- **Daily Summaries**: Automated daily task reports

### ✅ Discord Bot Integration
- **Real-time Notifications**: Task created, updated, completed, assigned, due soon, overdue
- **Slash Commands**: Modern Discord slash command interface
- **Button Interactions**: Quick actions (complete, start, view task)
- **Rich Embeds**: Beautiful Discord embeds with task information
- **Daily Summaries**: Automated daily task reports

### ✅ Bot Manager
- **Unified Interface**: Single API for managing all bot platforms
- **Event Routing**: Automatic notification routing to enabled platforms
- **Status Monitoring**: Bot health and availability monitoring
- **Test Functionality**: Built-in testing capabilities

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Slack Bot Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_APP_TOKEN=xapp-your-slack-app-token
SLACK_DEFAULT_CHANNEL=#hero-tasks
SLACK_ENABLE_NOTIFICATIONS=true
SLACK_ENABLE_COMMANDS=true

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_GUILD_ID=your-discord-guild-id
DISCORD_DEFAULT_CHANNEL_ID=your-discord-channel-id
DISCORD_ENABLE_NOTIFICATIONS=true
DISCORD_ENABLE_COMMANDS=true

# Bot Manager Configuration
SLACK_ENABLED=true
DISCORD_ENABLED=true
NOTIFY_TASK_CREATED=true
NOTIFY_TASK_UPDATED=true
NOTIFY_TASK_COMPLETED=true
NOTIFY_TASK_ASSIGNED=true
NOTIFY_TASK_DUE_SOON=true
NOTIFY_TASK_OVERDUE=true
```

### 2. Slack App Setup

1. **Create Slack App**:
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Enter app name and select workspace

2. **Configure Bot Token Scopes**:
   - Go to "OAuth & Permissions"
   - Add the following Bot Token Scopes:
     - `chat:write`
     - `commands`
     - `app_mentions:read`
     - `channels:read`
     - `groups:read`
     - `im:read`
     - `mpim:read`
     - `users:read`

3. **Install App to Workspace**:
   - Click "Install to Workspace"
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)

4. **Configure Slash Commands**:
   - Go to "Slash Commands"
   - Create command `/hero-tasks`
   - Request URL: `https://your-domain.com/api/bots/slack`
   - Short Description: "Manage Hero Tasks"
   - Usage Hint: "list, create, status, assign, help"

5. **Configure Event Subscriptions**:
   - Go to "Event Subscriptions"
   - Enable Events
   - Request URL: `https://your-domain.com/api/bots/slack`
   - Subscribe to Bot Events:
     - `app_mention`
     - `message.im`

6. **Configure Interactive Components**:
   - Go to "Interactive Components"
   - Request URL: `https://your-domain.com/api/bots/slack`

### 3. Discord Bot Setup

1. **Create Discord Application**:
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Enter application name

2. **Create Bot**:
   - Go to "Bot" section
   - Click "Add Bot"
   - Copy the "Token" (starts with `MT...`)

3. **Configure Bot Permissions**:
   - Go to "OAuth2" → "URL Generator"
   - Select Scopes: `bot`, `applications.commands`
   - Select Bot Permissions:
     - Send Messages
     - Use Slash Commands
     - Embed Links
     - Read Message History
     - Add Reactions

4. **Invite Bot to Server**:
   - Use the generated URL to invite bot to your Discord server
   - Copy the Guild ID from the URL after `/guild/`

5. **Register Slash Commands**:
   - The bot automatically registers slash commands on startup
   - Commands will appear in Discord after bot is online

## API Usage

### Bot Manager API

#### Send Task Notification
```typescript
POST /api/bots/notifications
Content-Type: application/json

{
  "event": "created",
  "task": {
    "id": "task-id",
    "task_number": "HT-001",
    "title": "Task Title",
    "description": "Task Description",
    "status": "draft",
    "priority": "high",
    "type": "feature"
  },
  "userId": "user-id",
  "metadata": {
    "assigneeId": "assignee-id"
  }
}
```

#### Get Bot Status
```typescript
GET /api/bots/notifications

Response:
{
  "success": true,
  "status": {
    "initialized": true,
    "platforms": {
      "slack": { "enabled": true, "available": true },
      "discord": { "enabled": true, "available": true }
    }
  }
}
```

#### Test Bot Functionality
```typescript
POST /api/bots/test
Content-Type: application/json

{
  "platform": "all" // or "slack" or "discord"
}
```

#### Send Daily Summary
```typescript
GET /api/bots/test?action=daily-summary
```

### Programmatic Usage

```typescript
import { getBotManager } from '@/lib/bots/bot-manager';
import { HeroTask } from '@/types/hero-tasks';

// Initialize bot manager
const botManager = getBotManager();
await botManager.initialize();

// Send task notification
const task: HeroTask = {
  id: 'task-id',
  task_number: 'HT-001',
  title: 'New Task',
  status: 'draft',
  priority: 'high',
  type: 'feature',
  // ... other task properties
};

await botManager.notifyTaskCreated(task, 'user-id');

// Send daily summary
await botManager.sendDailySummary();

// Test notifications
const testResult = await botManager.testNotification('all');
console.log('Test results:', testResult);
```

## Slack Commands

### Available Commands

#### List Tasks
```
/hero-tasks list [--status <status>] [--priority <priority>] [--assignee <@user>]
```

Examples:
- `/hero-tasks list`
- `/hero-tasks list --status in_progress`
- `/hero-tasks list --priority high --assignee @john.doe`

#### Create Task
```
/hero-tasks create "Task Title" [description]
```

Examples:
- `/hero-tasks create "Fix login bug"`
- `/hero-tasks create "Implement new feature" "Add user authentication"`

#### Update Task Status
```
/hero-tasks status <task-number> <new-status>
```

Examples:
- `/hero-tasks status HT-001 completed`
- `/hero-tasks status HT-002 in_progress`

#### Assign Task
```
/hero-tasks assign <task-number> <@user>
```

Examples:
- `/hero-tasks assign HT-001 @john.doe`
- `/hero-tasks assign HT-002 @jane.smith`

#### Help
```
/hero-tasks help
```

## Discord Commands

### Available Slash Commands

#### List Tasks
```
/hero-tasks list [status] [priority]
```

#### Create Task
```
/hero-tasks create title:"Task Title" [description] [priority]
```

#### Update Task Status
```
/hero-tasks status task-number:"HT-001" new-status:"completed"
```

#### Assign Task
```
/hero-tasks assign task-number:"HT-001" user:@john.doe
```

#### Get Summary
```
/hero-tasks summary
```

## Notification Types

### Task Created
- **Trigger**: New task created
- **Content**: Task details, assignee, priority
- **Actions**: Start task, view details

### Task Updated
- **Trigger**: Task modified
- **Content**: Updated fields, change summary
- **Actions**: View details

### Task Completed
- **Trigger**: Task marked as completed
- **Content**: Completion confirmation, duration
- **Actions**: View details

### Task Assigned
- **Trigger**: Task assigned to user
- **Content**: Task details, assignee notification
- **Actions**: Start task, view details

### Task Due Soon
- **Trigger**: Task due within 24 hours
- **Content**: Due date warning, task details
- **Actions**: Start task, view details

### Task Overdue
- **Trigger**: Task past due date
- **Content**: Overdue warning, task details
- **Actions**: Start task, view details

## Interactive Features

### Slack Button Actions
- **Complete Task**: Mark task as completed
- **Start Task**: Change status to in_progress
- **View Task**: Open task in web interface

### Discord Button Actions
- **Complete**: Mark task as completed
- **Start**: Change status to in_progress
- **View Details**: Show full task information

## Error Handling

### Common Issues

#### Bot Not Responding
1. Check bot token validity
2. Verify bot permissions
3. Ensure bot is online
4. Check webhook URL configuration

#### Commands Not Working
1. Verify slash command registration
2. Check bot permissions in channel
3. Ensure command syntax is correct
4. Check bot logs for errors

#### Notifications Not Sending
1. Verify notification settings
2. Check channel permissions
3. Ensure bot is in target channel
4. Verify webhook configuration

### Debugging

#### Enable Debug Logging
```bash
# Add to environment
DEBUG=true
NODE_ENV=development
```

#### Check Bot Status
```typescript
const botManager = getBotManager();
const status = botManager.getStatus();
console.log('Bot status:', status);
```

#### Test Notifications
```typescript
const result = await botManager.testNotification('all');
console.log('Test results:', result);
```

## Security Considerations

### Token Security
- Store bot tokens securely
- Use environment variables
- Rotate tokens regularly
- Never commit tokens to version control

### Webhook Security
- Verify webhook signatures
- Use HTTPS endpoints
- Implement rate limiting
- Validate request payloads

### Permission Management
- Use minimal required permissions
- Regularly audit bot permissions
- Implement user access controls
- Monitor bot activity

## Performance Optimization

### Rate Limiting
- Respect platform rate limits
- Implement exponential backoff
- Queue notifications during high load
- Batch similar notifications

### Caching
- Cache bot status
- Store user mappings
- Cache channel information
- Implement notification deduplication

### Monitoring
- Track notification delivery rates
- Monitor bot response times
- Log command usage
- Alert on failures

## Troubleshooting

### Slack Issues

#### Bot Not Responding to Commands
```bash
# Check bot token
curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  https://slack.com/api/auth.test
```

#### Webhook Verification Failed
- Ensure signing secret is correct
- Verify request URL is accessible
- Check timestamp validation

### Discord Issues

#### Slash Commands Not Appearing
- Verify bot permissions
- Check command registration
- Ensure bot is online
- Verify guild ID

#### Bot Not Receiving Events
- Check bot permissions
- Verify event subscriptions
- Ensure bot is in correct server
- Check bot token validity

## Future Enhancements

### Planned Features
- **Thread Support**: Reply in threads for better organization
- **Modal Forms**: Rich form inputs for task creation
- **Custom Commands**: User-defined command shortcuts
- **Integration Webhooks**: Connect with external tools
- **Analytics Dashboard**: Bot usage statistics
- **Multi-language Support**: Localized commands and messages

### API Improvements
- **Webhook Signatures**: Enhanced security validation
- **Rate Limiting**: Built-in rate limiting
- **Retry Logic**: Automatic retry for failed notifications
- **Batch Operations**: Bulk notification support

## Support

For issues or questions regarding bot integration:

1. Check this documentation
2. Review bot logs
3. Test with `/hero-tasks help` command
4. Verify environment configuration
5. Contact development team

---

**Implementation Status**: ✅ COMPLETED  
**Task**: HT-004.4.4 - Communication Platform Bots  
**Completion Date**: 2025-09-08T17:10:48.000Z  
**Estimated Hours**: 5  
**Actual Hours**: 5
