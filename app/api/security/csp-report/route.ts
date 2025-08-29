/**
 * CSP Violation Report Handler
 * 
 * Endpoint to receive and process Content Security Policy violation reports.
 * This helps monitor and improve CSP configuration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityRequest } from '../../../../lib/security/logging';

interface CSPReport {
  'csp-report': {
    'document-uri': string;
    'referrer'?: string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': 'enforce' | 'report';
    'blocked-uri': string;
    'line-number'?: number;
    'column-number'?: number;
    'source-file'?: string;
    'status-code'?: number;
    'script-sample'?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse CSP violation report
    const report: CSPReport = await request.json();
    const cspReport = report['csp-report'];
    
    if (!cspReport) {
      return NextResponse.json(
        { error: 'Invalid CSP report format' },
        { status: 400 }
      );
    }
    
    // Extract request information
    const ip = (request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown').split(',')[0].trim();
    
    const userAgent = request.headers.get('user-agent') || '';
    
    // Determine severity based on violation type
    let severity: 'low' | 'medium' | 'high' = 'medium';
    
    // High severity violations
    if (
      cspReport['blocked-uri'].includes('javascript:') ||
      cspReport['blocked-uri'].includes('data:') ||
      cspReport['violated-directive'].includes('script-src') ||
      cspReport['blocked-uri'].match(/https?:\/\/(?!.*\.(googleapis|gstatic|supabase|stripe|resend|sentry)\.)/i)
    ) {
      severity = 'high';
    }
    
    // Low severity for common development issues
    if (
      cspReport['blocked-uri'].includes('chrome-extension:') ||
      cspReport['blocked-uri'].includes('moz-extension:') ||
      cspReport['blocked-uri'].includes('about:') ||
      cspReport['document-uri'].includes('localhost') ||
      cspReport['document-uri'].includes('127.0.0.1')
    ) {
      severity = 'low';
    }
    
    // Log CSP violation as security event
    logSecurityRequest(
      'csp_violation',
      {
        ip,
        userAgent,
        route: new URL(cspReport['document-uri']).pathname,
        method: 'GET', // CSP violations are typically from page loads
        origin: request.headers.get('origin') || undefined,
        referer: cspReport['referrer'] || undefined,
      },
      {
        requestId: crypto.randomUUID(),
        isBot: /bot|crawler|spider|scraper/i.test(userAgent),
        riskLevel: severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low',
      },
      'suspicious',
      {
        metadata: {
          cspViolation: {
            violatedDirective: cspReport['violated-directive'],
            effectiveDirective: cspReport['effective-directive'],
            blockedUri: cspReport['blocked-uri'],
            originalPolicy: cspReport['original-policy'],
            disposition: cspReport['disposition'],
            sourceFile: cspReport['source-file'],
            lineNumber: cspReport['line-number'],
            columnNumber: cspReport['column-number'],
            scriptSample: cspReport['script-sample'],
            statusCode: cspReport['status-code'],
          },
          severity,
          documentUri: cspReport['document-uri'],
          timestamp: new Date().toISOString()
        }
      }
    );
    
    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('CSP Violation Report:', {
        violatedDirective: cspReport['violated-directive'],
        blockedUri: cspReport['blocked-uri'],
        documentUri: cspReport['document-uri'],
        severity
      });
    }
    
    // Return success response (CSP expects 204 or 2xx)
    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    console.error('CSP report processing error:', error);
    
    // Log the error as a security event
    const ip = (request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown').split(',')[0].trim();
    
    logSecurityRequest(
      'csp_violation',
      {
        ip,
        userAgent: request.headers.get('user-agent') || '',
        route: '/api/security/csp-report',
        method: 'POST',
      },
      {
        requestId: crypto.randomUUID(),
        isBot: false,
        riskLevel: 'medium',
      },
      'suspicious',
      {
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          parseError: true
        }
      }
    );
    
    // Still return success to avoid client-side errors
    return new NextResponse(null, { status: 204 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests for CSP violation reports'
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests for CSP violation reports'
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests for CSP violation reports'
    },
    { status: 405 }
  );
}