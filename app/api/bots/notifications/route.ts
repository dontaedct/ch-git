/**
 * @fileoverview Bot Integration API Routes
 * @module app/api/bots/notifications/route
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBotManager } from '@/lib/bots/bot-manager';
import { HeroTask } from '@/types/hero-tasks';

export const runtime = 'nodejs';

// =============================================================================
// NOTIFICATION API HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, task, userId, metadata } = body;

    // Validate required fields
    if (!event || !task) {
      return NextResponse.json(
        { error: 'Missing required fields: event, task' },
        { status: 400 }
      );
    }

    // Validate event type
    const validEvents = ['created', 'updated', 'completed', 'assigned', 'due_soon', 'overdue'];
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` },
        { status: 400 }
      );
    }

    const botManager = getBotManager();
    
    // Initialize bot manager if not already done
    if (!botManager.getStatus().initialized) {
      await botManager.initialize();
    }

    // Send notification based on event type
    let result: any;
    switch (event) {
      case 'created':
        result = await botManager.notifyTaskCreated(task as HeroTask, userId);
        break;
      case 'updated':
        result = await botManager.notifyTaskUpdated(task as HeroTask, userId);
        break;
      case 'completed':
        result = await botManager.notifyTaskCompleted(task as HeroTask, userId);
        break;
      case 'assigned':
        const assigneeId = metadata?.assigneeId;
        if (!assigneeId) {
          return NextResponse.json(
            { error: 'assigneeId required for assigned event' },
            { status: 400 }
          );
        }
        result = await botManager.notifyTaskAssigned(task as HeroTask, assigneeId, userId);
        break;
      case 'due_soon':
        result = await botManager.notifyTaskDueSoon(task as HeroTask);
        break;
      case 'overdue':
        result = await botManager.notifyTaskOverdue(task as HeroTask);
        break;
      default:
        return NextResponse.json(
          { error: 'Unhandled event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      platforms: result?.platforms || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// BOT STATUS ENDPOINT
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const botManager = getBotManager();
    const status = botManager.getStatus();

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
