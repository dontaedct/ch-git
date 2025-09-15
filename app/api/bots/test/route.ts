/**
 * @fileoverview Bot Test API Routes
 * @module app/api/bots/test/route
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-08T17:10:48.000Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBotManager } from '@/lib/bots/bot-manager';

export const runtime = 'nodejs';

// =============================================================================
// BOT TEST HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform = 'all' } = body;

    // Validate platform parameter
    const validPlatforms = ['slack', 'discord', 'all'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    const botManager = getBotManager();
    
    // Initialize bot manager if not already done
    if (!botManager.getStatus().initialized) {
      await botManager.initialize();
    }

    // Run test notification
    const result = await botManager.testNotification(platform);

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test notification sent successfully' : 'Test notification failed',
      results: result.results,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bot test API error:', error);
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
// DAILY SUMMARY ENDPOINT
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const botManager = getBotManager();
    
    // Initialize bot manager if not already done
    if (!botManager.getStatus().initialized) {
      await botManager.initialize();
    }

    switch (action) {
      case 'daily-summary':
        await botManager.sendDailySummary();
        return NextResponse.json({
          success: true,
          message: 'Daily summary sent successfully',
          timestamp: new Date().toISOString()
        });

      case 'weekly-report':
        await botManager.sendWeeklyReport();
        return NextResponse.json({
          success: true,
          message: 'Weekly report sent successfully',
          timestamp: new Date().toISOString()
        });

      case 'status':
        const status = botManager.getStatus();
        return NextResponse.json({
          success: true,
          status,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: daily-summary, weekly-report, or status' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Bot action API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
