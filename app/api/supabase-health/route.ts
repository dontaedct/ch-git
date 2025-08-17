/**
 * 🚀 MIT HERO SYSTEM - SUPABASE HEALTH CHECK API
 * 
 * Provides real-time health monitoring for Supabase connections
 * and database operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkSupabaseHealth } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(_request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = logger.withOperation('api:supabase-health:GET');
  
  try {
    routeLogger.info('Starting Supabase health check');
    
    // Perform health check
    const health: { healthy: boolean; errors: string[]; connectionCount: number } = await checkSupabaseHealth();
    const responseTime = Date.now() - startTime;
    
    // Log health status
    if (health.healthy) {
      routeLogger.info('Supabase health check passed', { 
        responseTime, 
        connectionCount: health.connectionCount 
      });
    } else {
      routeLogger.warn('Supabase health check failed', { 
        errors: health.errors, 
        responseTime 
      });
    }
    
    // Return health status with appropriate HTTP status code
    const statusCode = health.healthy ? 200 : 503; // 503 Service Unavailable if unhealthy
    
    return NextResponse.json({
      healthy: health.healthy,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      connectionCount: health.connectionCount,
      errors: health.errors,
      status: health.healthy ? 'healthy' : 'unhealthy'
    }, { status: statusCode });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    routeLogger.error('Supabase health check failed with exception', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime 
    });
    
    return NextResponse.json({
      healthy: false,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = logger.withOperation('api:supabase-health:POST');
  
  try {
    const body = await request.json();
    const { detailed = false } = body;
    
    routeLogger.info('Starting detailed Supabase health check', { detailed });
    
    // Perform health check
    const health: { healthy: boolean; errors: string[]; connectionCount: number } = await checkSupabaseHealth();
    const responseTime = Date.now() - startTime;
    
    // Enhanced response for detailed checks
    const response = {
      healthy: health.healthy,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      connectionCount: health.connectionCount,
      errors: health.errors,
      status: health.healthy ? 'healthy' : 'unhealthy',
      details: detailed ? {
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      } : undefined
    };
    
    const statusCode = health.healthy ? 200 : 503;
    
    routeLogger.info('Detailed Supabase health check completed', { 
      healthy: health.healthy, 
      responseTime 
    });
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    routeLogger.error('Detailed Supabase health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime 
    });
    
    return NextResponse.json({
      healthy: false,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}
