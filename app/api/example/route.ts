/**
 * Example API Route with Observability Integration
 * 
 * Demonstrates how to use the observability middleware for automatic
 * request tracking, metrics collection, and performance monitoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/observability/middleware';
import { Observing } from '@/lib/observability';
import { Logger } from '@/lib/logger';

export const runtime = 'nodejs';

const exampleLogger = Logger.create({ component: 'example-api' });

/**
 * Example API handler with observability integration
 */
async function exampleHandler(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') ?? 'default';
    const delay = parseInt(searchParams.get('delay') ?? '0', 10);
    
    // Simulate some work
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Record business metrics based on action
    switch (action) {
      case 'register':
        Observing.recordUserRegistration('example-user-123', {
          source: 'api-example',
          method: 'GET',
        });
        break;
      case 'submit':
        Observing.recordFormSubmission('example-form', 'example-user-123', {
          formType: 'demo',
          method: 'GET',
        });
        break;
      case 'upload':
        Observing.recordFileUpload('example-file', 1024, 'example-user-123', {
          fileType: 'demo',
          method: 'GET',
        });
        break;
    }
    
    // Simulate potential errors
    if (action === 'error') {
      throw new Error('Simulated error for testing observability');
    }
    
    const responseTime = Date.now() - startTime;
    
    // Log successful operation
    exampleLogger.info('Example API operation completed', {
      action,
      delay,
      responseTime,
      success: true,
    });
    
    return NextResponse.json({
      success: true,
      action,
      delay,
      responseTime,
      timestamp: new Date().toISOString(),
      message: `Successfully processed ${action} action`,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;
    
    // Log error with full context
    exampleLogger.error('Example API operation failed', {
      action: new URL(request.url).searchParams.get('action'),
      error: errorMessage,
      responseTime,
    });
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      responseTime,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Export the handler wrapped with observability middleware
 */
export const GET = withObservability(exampleHandler, {
  trackPerformance: true,
  trackSecurity: true,
  trackBusinessMetrics: true,
  sampleRate: 1.0, // Track all requests for this example
});

/**
 * POST handler with different observability options
 */
export const POST = withObservability(async (request: NextRequest) => {
  const body = await request.json();
  
  // Record form submission
  Observing.recordFormSubmission('api-example', undefined, {
    method: 'POST',
    contentType: request.headers.get('content-type'),
  });
  
  return NextResponse.json({
    success: true,
    received: body,
    timestamp: new Date().toISOString(),
  });
}, {
  trackPerformance: true,
  trackBusinessMetrics: true,
  sampleRate: 0.5, // Only track 50% of POST requests
});
