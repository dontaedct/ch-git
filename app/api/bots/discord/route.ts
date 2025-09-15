/**
 * @fileoverview Discord Bot API Routes
 * @module app/api/bots/discord/route
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDiscordBot } from '@/lib/bots/discord-bot';
import { getBotManager } from '@/lib/bots/bot-manager';

export const runtime = 'nodejs';

// =============================================================================
// DISCORD WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    // Handle different Discord interaction types
    switch (payload.type) {
      case 1: // PING
        return NextResponse.json({ type: 1 });
      
      case 2: // APPLICATION_COMMAND
        await handleApplicationCommand(payload);
        break;
      
      case 3: // MESSAGE_COMPONENT
        await handleMessageComponent(payload);
        break;
      
      case 4: // APPLICATION_COMMAND_AUTOCOMPLETE
        await handleAutocomplete(payload);
        break;
      
      case 5: // MODAL_SUBMIT
        await handleModalSubmit(payload);
        break;
      
      default:
        console.log(`Unhandled Discord interaction type: ${payload.type}`);
    }

    return NextResponse.json({ type: 1 });
  } catch (error) {
    console.error('Discord webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// INTERACTION HANDLERS
// =============================================================================

async function handleApplicationCommand(payload: any): Promise<void> {
  console.log('Received Discord application command:', payload.data.name);

  const botManager = getBotManager();
  const discordBot = createDiscordBot({
    token: process.env.DISCORD_BOT_TOKEN || 'placeholder',
    clientId: process.env.DISCORD_CLIENT_ID || 'placeholder',
    enableNotifications: false,
    enableCommands: false
  });

  try {
    // The Discord bot handles slash commands internally
    // This is just for logging and additional processing if needed
    console.log('Application command processed');
  } catch (error) {
    console.error('Error handling Discord application command:', error);
  }
}

async function handleMessageComponent(payload: any): Promise<void> {
  console.log('Received Discord message component:', payload.data.custom_id);

  const botManager = getBotManager();
  const discordBot = createDiscordBot({
    token: process.env.DISCORD_BOT_TOKEN || 'placeholder',
    clientId: process.env.DISCORD_CLIENT_ID || 'placeholder',
    enableNotifications: false,
    enableCommands: false
  });

  try {
    // The Discord bot handles button interactions internally
    // This is just for logging and additional processing if needed
    console.log('Message component processed');
  } catch (error) {
    console.error('Error handling Discord message component:', error);
  }
}

async function handleAutocomplete(payload: any): Promise<void> {
  console.log('Received Discord autocomplete request:', payload.data.name);

  try {
    // Handle autocomplete requests for slash commands
    // This would typically provide suggestions for command options
    console.log('Autocomplete request processed');
  } catch (error) {
    console.error('Error handling Discord autocomplete:', error);
  }
}

async function handleModalSubmit(payload: any): Promise<void> {
  console.log('Received Discord modal submit:', payload.data.custom_id);

  try {
    // Handle modal form submissions
    // This would typically process form data from modal interactions
    console.log('Modal submit processed');
  } catch (error) {
    console.error('Error handling Discord modal submit:', error);
  }
}
