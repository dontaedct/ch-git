/**
 * @fileoverview CSRF Token API Endpoint
 * @module app/api/csrf/token/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.1.2 - Implement CSRF protection across all forms
 * Focus: CSRF token generation and validation endpoint
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (CSRF vulnerabilities)
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '@/lib/security/csrf';

/**
 * GET /api/csrf/token
 * Generate and return a CSRF token for client-side use
 */
export async function GET(request: NextRequest) {
  try {
    const { token, cookie } = csrfProtection.createTokenWithCookie();
    
    const response = NextResponse.json({ 
      token,
      success: true 
    });
    
    // Set the CSRF token cookie
    response.headers.set('Set-Cookie', cookie);
    
    return response;
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/csrf/validate
 * Validate a CSRF token
 */
export async function POST(request: NextRequest) {
  try {
    const { valid, token, cookie } = csrfProtection.validateToken(request);
    
    if (!valid) {
      const response = NextResponse.json(
        { valid: false, error: 'Invalid CSRF token' },
        { status: 403 }
      );
      
      // Set new token cookie for retry
      if (token && cookie) {
        response.headers.set('Set-Cookie', cookie);
      }
      
      return response;
    }
    
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('CSRF validation failed:', error);
    return NextResponse.json(
      { valid: false, error: 'CSRF validation failed' },
      { status: 500 }
    );
  }
}
