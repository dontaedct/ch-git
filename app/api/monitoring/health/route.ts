/**
 * @fileoverview HT-008.8.7: Enhanced Health Monitoring API Endpoint
 * @module app/api/monitoring/health/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.7 - Implement health checks and status monitoring
 * Focus: API endpoint for enhanced health monitoring and management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production health monitoring, system reliability)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  healthMonitor, 
  HealthCheckResult, 
  UptimeStats,
  HealthHistoryEntry 
} from '@/lib/monitoring/health-monitor';
import { Logger } from '@/lib/logger';
import { withSentry } from '@/lib/sentry-wrapper';
import { z } from 'zod';

const logger = Logger.create({ component: 'health-monitoring-api' });

// Request schemas
const RegisterHealthCheckSchema = z.object({
  service: z.string().min(1),
  checkFunction: z.string(), // Base64 encoded function
  timeout: z.number().min(1000).max(30000).optional(),
});

const GetHealthHistorySchema = z.object({
  hours: z.number().min(1).max(168).optional(), // Max 1 week
  service: z.string().optional(),
});

const GetServiceHealthSchema = z.object({
  service: z.string().min(1),
});

/**
 * Perform comprehensive health checks
 */
export const POST = withSentry(async (request: NextRequest) => {
  try {
    const result = await healthMonitor.performHealthChecks();

    logger.info('Health checks performed', {
      overallHealth: result.overallHealth,
      serviceCount: Object.keys(result.serviceHealth).length,
      alertCount: result.alerts.length,
    });

    return NextResponse.json({
      success: true,
      overallHealth: result.overallHealth,
      serviceHealth: result.serviceHealth,
      dependencies: result.dependencies,
      systemMetrics: result.systemMetrics,
      alerts: result.alerts,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to perform health checks', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to perform health checks',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Get health status and statistics
 */
export const GET = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const hours = searchParams.get('hours');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const includeUptime = searchParams.get('includeUptime') === 'true';

    // Validate parameters
    const validatedData = GetHealthHistorySchema.parse({
      hours: hours ? parseInt(hours) : undefined,
      service,
    });

    if (validatedData.service) {
      // Get specific service health
      const serviceHealth = await healthMonitor.getServiceHealth(validatedData.service);
      
      if (!serviceHealth) {
        return NextResponse.json({
          success: false,
          error: 'Service not found',
        }, { status: 404 });
      }

      logger.info('Service health retrieved', {
        service: validatedData.service,
        healthy: serviceHealth.healthy,
        status: serviceHealth.status,
      });

      return NextResponse.json({
        success: true,
        service: validatedData.service,
        health: serviceHealth,
        timestamp: new Date().toISOString(),
      });

    } else {
      // Get overall health status
      const overallHealth = healthMonitor.getOverallHealthScore();
      const healthTrends = healthMonitor.getHealthTrends();
      const uptimeStats = includeUptime ? healthMonitor.getUptimeStats() : {};
      const healthHistory = includeHistory ? healthMonitor.getHealthHistory(validatedData.hours) : [];

      logger.info('Health status retrieved', {
        overallHealth,
        trend: healthTrends.trend,
        uptimeStats: Object.keys(uptimeStats).length,
        historyEntries: healthHistory.length,
      });

      return NextResponse.json({
        success: true,
        overallHealth,
        healthTrends,
        uptimeStats,
        healthHistory,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    logger.error('Failed to get health status', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get health status',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Register a new health check
 */
export const PUT = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = RegisterHealthCheckSchema.parse(body);

    // This is a placeholder - in a real implementation, you'd decode and register the function
    // For now, we'll just log the registration attempt
    logger.info('Health check registration attempted', {
      service: validatedData.service,
      timeout: validatedData.timeout,
    });

    return NextResponse.json({
      success: true,
      service: validatedData.service,
      message: 'Health check registration not implemented in API',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to register health check', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to register health check',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Unregister a health check
 */
export const DELETE = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service name is required',
      }, { status: 400 });
    }

    // Validate parameters
    const validatedData = GetServiceHealthSchema.parse({ service });

    healthMonitor.unregisterHealthCheck(validatedData.service);

    logger.info('Health check unregistered', {
      service: validatedData.service,
    });

    return NextResponse.json({
      success: true,
      service: validatedData.service,
      message: 'Health check unregistered',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to unregister health check', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to unregister health check',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Health check endpoint for load balancers
 */
export const HEAD = withSentry(async (request: NextRequest) => {
  try {
    const overallHealth = healthMonitor.getOverallHealthScore();
    const isHealthy = overallHealth >= 70;
    const status = isHealthy ? 200 : 503;

    return new NextResponse(null, {
      status,
      headers: {
        'X-Health-Score': overallHealth.toString(),
        'X-Health-Status': isHealthy ? 'healthy' : 'unhealthy',
        'X-Timestamp': new Date().toISOString(),
        'X-Uptime': process.uptime().toString(),
      }
    });

  } catch (error) {
    return new NextResponse(null, {
      status: 500,
      headers: {
        'X-Health-Status': 'error',
        'X-Timestamp': new Date().toISOString(),
      }
    });
  }
});
