/**
 * @fileoverview HT-008.1.2: CSRF Protection Server-Side Implementation
 * @module lib/security/csrf-server
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Security System Integration
 * Task: HT-008.1.2 - Implement CSRF protection across all forms
 * Focus: Server-side CSRF protection with token validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (CSRF vulnerabilities)
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createHash, randomBytes } from 'crypto';

/**
 * CSRF token configuration
 */
export interface CSRFConfig {
  tokenLength: number;
  cookieName: string;
  headerName: string;
  fieldName: string;
  maxAge: number; // in seconds
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
}

/**
 * Default CSRF configuration
 */
export const DEFAULT_CSRF_CONFIG: CSRFConfig = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  fieldName: '_csrf',
  maxAge: 3600, // 1 hour
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Generate a secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(DEFAULT_CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Hash a CSRF token for storage
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Set CSRF token in cookies (server-side)
 */
export async function setCSRFTokenCookie(token: string, config: CSRFConfig = DEFAULT_CSRF_CONFIG): Promise<void> {
  const cookieStore = await cookies();
  const hashedToken = hashCSRFToken(token);
  
  cookieStore.set(config.cookieName, hashedToken, {
    httpOnly: true,
    secure: config.secure,
    sameSite: config.sameSite,
    maxAge: config.maxAge,
    path: '/',
  });
}

/**
 * Get CSRF token from cookies (server-side)
 */
export async function getCSRFTokenFromCookie(config: CSRFConfig = DEFAULT_CSRF_CONFIG): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(config.cookieName);
  return token?.value || null;
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFToken(
  request: NextRequest,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<boolean> {
  try {
    // Get token from cookie
    const cookieToken = await getCSRFTokenFromCookie(config);
    if (!cookieToken) {
      return false;
    }

    // Get token from request (header or form field)
    const requestToken = request.headers.get(config.headerName) || 
                        request.nextUrl.searchParams.get(config.fieldName);
    
    if (!requestToken) {
      return false;
    }

    // Compare hashed tokens
    const hashedRequestToken = hashCSRFToken(requestToken);
    return hashedRequestToken === cookieToken;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

/**
 * Generate and set CSRF token for a request
 */
export async function generateAndSetCSRFToken(config: CSRFConfig = DEFAULT_CSRF_CONFIG): Promise<string> {
  const token = generateCSRFToken();
  await setCSRFTokenCookie(token, config);
  return token;
}

/**
 * CSRF middleware for API routes
 */
export async function csrfMiddleware(
  request: NextRequest,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<{ isValid: boolean; token?: string }> {
  // Skip CSRF for GET requests
  if (request.method === 'GET') {
    return { isValid: true };
  }

  // Validate CSRF token
  const isValid = await validateCSRFToken(request, config);
  
  if (!isValid) {
    return { isValid: false };
  }

  return { isValid: true };
}
