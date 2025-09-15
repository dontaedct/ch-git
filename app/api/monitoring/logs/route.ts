/**
 * @fileoverview HT-008.8.5: Comprehensive Logging API Endpoint
 * @module app/api/monitoring/logs/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.5 - Implement comprehensive logging system
 * Focus: API endpoint for comprehensive logging and log management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production logging, data retention, compliance)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  comprehensiveLogger, 
  LogEntry, 
  LogMetrics, 
  LogAnalysis,
  LogRetentionPolicy 
} from '@/lib/monitoring/comprehensive-logger';
import { Logger } from '@/lib/logger';
import { withSentry } from '@/lib/sentry-wrapper';
import { z } from 'zod';

const logger = Logger.create({ component: 'comprehensive-logging-api' });

// Request schemas
const LogMessageSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  context: z.object({
    component: z.string().optional(),
    operation: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    requestId: z.string().optional(),
    correlationId: z.string().optional(),
    traceId: z.string().optional(),
    spanId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    performance: z.object({
      duration: z.number().optional(),
      memoryUsage: z.number().optional(),
      cpuUsage: z.number().optional(),
    }).optional(),
  }).optional(),
});

const SearchLogsSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).optional(),
  component: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  correlationId: z.string().optional(),
  message: z.string().optional(),
  tags: z.array(z.string()).optional(),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  limit: z.number().min(1).max(1000).optional(),
});

const RetentionPolicySchema = z.object({
  component: z.string(),
  policy: z.object({
    retentionDays: z.number().min(1),
    archivalDays: z.number().min(1),
    compressionEnabled: z.boolean(),
    encryptionEnabled: z.boolean(),
    deletionPolicy: z.enum(['soft', 'hard']),
    backupEnabled: z.boolean(),
    complianceRequirements: z.array(z.string()),
  }),
});

const LogFilterSchema = z.object({
  name: z.string().min(1),
  filter: z.string(), // JSON string representation of the filter function
});

/**
 * Log a message
 */
export const POST = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = LogMessageSchema.parse(body);

    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Enhance context with server-side information
    const enhancedContext = {
      ...validatedData.context,
      clientIP,
      userAgent,
      serverTimestamp: new Date().toISOString(),
    };

    comprehensiveLogger.log(
      validatedData.level,
      validatedData.message,
      validatedData.metadata,
      enhancedContext
    );

    logger.info('Log message received', {
      level: validatedData.level,
      component: validatedData.context?.component || 'unknown',
      messageLength: validatedData.message.length,
    });

    return NextResponse.json({
      success: true,
      level: validatedData.level,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to log message', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to log message',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Get log analytics
 */
export const GET = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' || '24h';
    const includeAnalysis = searchParams.get('includeAnalysis') === 'true';

    const analytics = comprehensiveLogger.getLogAnalytics(timeRange);
    const statistics = comprehensiveLogger.getLogStatistics();
    
    let analysis: LogAnalysis | null = null;
    if (includeAnalysis) {
      analysis = comprehensiveLogger.getLogAnalysis();
    }

    logger.info('Log analytics retrieved', {
      timeRange,
      totalLogs: analytics.totalLogs,
      errorRate: analytics.errorRate,
      includeAnalysis,
    });

    return NextResponse.json({
      success: true,
      timeRange,
      analytics,
      statistics,
      analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to get log analytics', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get log analytics',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Search logs
 */
export const PUT = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = SearchLogsSchema.parse(body);

    // Convert time range strings to Date objects
    const searchQuery = {
      ...validatedData,
      timeRange: validatedData.timeRange ? {
        start: new Date(validatedData.timeRange.start),
        end: new Date(validatedData.timeRange.end),
      } : undefined,
    };

    const logs = comprehensiveLogger.searchLogs(searchQuery);

    logger.info('Log search performed', {
      query: validatedData,
      resultCount: logs.length,
    });

    return NextResponse.json({
      success: true,
      query: validatedData,
      logs,
      count: logs.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to search logs', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to search logs',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Export logs
 */
export const DELETE = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') as 'json' | 'csv' | 'log' || 'json';
    const level = searchParams.get('level') as LogEntry['level'] || undefined;
    const component = searchParams.get('component') || undefined;
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    const filters: any = {};
    if (level) filters.level = level;
    if (component) filters.component = component;
    if (startTime && endTime) {
      filters.timeRange = {
        start: new Date(startTime),
        end: new Date(endTime),
      };
    }

    const data = comprehensiveLogger.exportLogs(format, filters);

    logger.info('Logs exported', {
      format,
      filters,
      dataSize: data.length,
    });

    return new NextResponse(data, {
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : 
                      format === 'log' ? 'text/plain' : 'application/json',
        'Content-Disposition': `attachment; filename="logs-${new Date().toISOString().split('T')[0]}.${format}"`,
      },
    });

  } catch (error) {
    logger.error('Failed to export logs', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to export logs',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Set retention policy
 */
export const PATCH = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = RetentionPolicySchema.parse(body);

    comprehensiveLogger.setRetentionPolicy(
      validatedData.component,
      validatedData.policy
    );

    logger.info('Retention policy set', {
      component: validatedData.component,
      retentionDays: validatedData.policy.retentionDays,
      archivalDays: validatedData.policy.archivalDays,
    });

    return NextResponse.json({
      success: true,
      component: validatedData.component,
      policy: validatedData.policy,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to set retention policy', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to set retention policy',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Add log filter
 */
export const HEAD = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = LogFilterSchema.parse(body);

    // Parse the filter function from JSON string
    let filterFunction: (entry: LogEntry) => boolean;
    try {
      filterFunction = eval(`(${validatedData.filter})`);
    } catch (parseError) {
      throw new Error('Invalid filter function syntax');
    }

    comprehensiveLogger.addLogFilter(validatedData.name, filterFunction);

    logger.info('Log filter added', {
      filterName: validatedData.name,
    });

    return NextResponse.json({
      success: true,
      filterName: validatedData.name,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to add log filter', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to add log filter',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});
