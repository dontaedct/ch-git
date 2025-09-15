/**
 * @fileoverview Slack Bot API Routes
 * @module app/api/bots/slack/route
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSlackBot } from '@/lib/bots/slack-bot';
import { getBotManager } from '@/lib/bots/bot-manager';

export const runtime = 'nodejs';

// =============================================================================
// SLACK WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Handle event callbacks
    if (payload.type === 'event_callback') {
      await handleSlackEvent(payload.event);
    }

    // Handle interactive components (buttons, modals)
    if (payload.type === 'interactive_message' || payload.type === 'block_actions') {
      await handleSlackInteraction(payload);
    }

    // Handle slash commands
    if (payload.command) {
      const response = await handleSlackCommand(payload);
      return NextResponse.json({ text: response });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Slack webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

async function handleSlackEvent(event: any): Promise<void> {
  console.log('Received Slack event:', event.type);

  switch (event.type) {
    case 'app_mention':
      await handleAppMention(event);
      break;
    case 'message':
      await handleMessage(event);
      break;
    default:
      console.log(`Unhandled Slack event type: ${event.type}`);
  }
}

async function handleSlackInteraction(payload: any): Promise<void> {
  console.log('Received Slack interaction:', payload.type);

  const botManager = getBotManager();
  const slackBot = createSlackBot();

  try {
    await slackBot.handleInteraction(payload);
  } catch (error) {
    console.error('Error handling Slack interaction:', error);
  }
}

async function handleSlackCommand(payload: any): Promise<string> {
  console.log('Received Slack command:', payload.command);

  const slackBot = createSlackBot();
  
  try {
    return await slackBot.handleCommand({
      command: payload.command,
      text: payload.text || '',
      user_id: payload.user_id,
      channel_id: payload.channel_id,
      response_url: payload.response_url
    });
  } catch (error) {
    console.error('Error handling Slack command:', error);
    return 'Sorry, there was an error processing your command.';
  }
}

async function handleAppMention(event: any): Promise<void> {
  console.log('Bot mentioned in channel:', event.channel);
  
  // Respond to mentions with helpful information
  const response = `Hello! I'm the Hero Tasks bot. Use \`/hero-tasks help\` to see available commands.`;
  
  // This would typically send a message back to the channel
  // Implementation depends on your Slack app configuration
}

async function handleMessage(event: any): Promise<void> {
  // Handle direct messages to the bot
  if (event.channel_type === 'im') {
    console.log('Received DM:', event.text);
    
    // Process direct message and respond
    // Implementation depends on your specific requirements
  }
}
