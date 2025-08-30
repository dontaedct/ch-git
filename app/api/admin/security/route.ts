/**
 * Security Monitoring API
 * 
 * Admin endpoint for monitoring security events, rate limiting statistics,
 * and managing security configurations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRateLimitStats, getBlockedIPs, blockIP, unblockIP, clearRateLimit } from '../../../../lib/rate-limit';
import { getSecuritySummary, getSecurityMetrics, resetSecurityMetrics } from '../../../../lib/security/logging';

// This would normally check admin authentication
function isAuthorized(request: NextRequest): boolean {
  // TODO: Implement proper admin authentication
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.ADMIN_API_KEY}` || process.env.NODE_ENV === 'development';
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'dashboard';

  try {
    switch (action) {
      case 'dashboard':
        return NextResponse.json({
          security: getSecuritySummary(),
          rateLimits: getRateLimitStats(),
          blockedIPs: getBlockedIPs(),
          timestamp: new Date().toISOString()
        });

      case 'rate-limits':
        return NextResponse.json({
          stats: getRateLimitStats(),
          timestamp: new Date().toISOString()
        });

      case 'security-metrics':
        return NextResponse.json({
          metrics: getSecurityMetrics(),
          timestamp: new Date().toISOString()
        });

      case 'security-summary':
        return NextResponse.json({
          summary: getSecuritySummary(),
          timestamp: new Date().toISOString()
        });

      case 'blocked-ips':
        return NextResponse.json({
          blockedIPs: getBlockedIPs(),
          count: getBlockedIPs().length,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action', 
            availableActions: ['dashboard', 'rate-limits', 'security-metrics', 'security-summary', 'blocked-ips'] 
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'block-ip':
        const { ip, reason } = params;
        if (!ip) {
          return NextResponse.json(
            { error: 'IP address required', code: 'MISSING_PARAM' },
            { status: 400 }
          );
        }
        
        blockIP(ip, reason || 'Manual block via API');
        
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been blocked`,
          blockedIPs: getBlockedIPs()
        });

      case 'unblock-ip':
        const { ip: unblockIp } = params;
        if (!unblockIp) {
          return NextResponse.json(
            { error: 'IP address required', code: 'MISSING_PARAM' },
            { status: 400 }
          );
        }
        
        unblockIP(unblockIp);
        
        return NextResponse.json({
          success: true,
          message: `IP ${unblockIp} has been unblocked`,
          blockedIPs: getBlockedIPs()
        });

      case 'clear-rate-limit':
        const { tenantId } = params;
        if (!tenantId) {
          return NextResponse.json(
            { error: 'Tenant ID required', code: 'MISSING_PARAM' },
            { status: 400 }
          );
        }
        
        clearRateLimit(tenantId);
        
        return NextResponse.json({
          success: true,
          message: `Rate limit cleared for tenant ${tenantId}`,
          stats: getRateLimitStats()
        });

      case 'reset-security-metrics':
        resetSecurityMetrics();
        
        return NextResponse.json({
          success: true,
          message: 'Security metrics have been reset',
          metrics: getSecurityMetrics()
        });

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action', 
            availableActions: ['block-ip', 'unblock-ip', 'clear-rate-limit', 'reset-security-metrics']
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return NextResponse.json(
      { error: 'IP address required', code: 'MISSING_PARAM' },
      { status: 400 }
    );
  }

  try {
    unblockIP(ip);
    
    return NextResponse.json({
      success: true,
      message: `IP ${ip} has been unblocked`,
      blockedIPs: getBlockedIPs()
    });
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}