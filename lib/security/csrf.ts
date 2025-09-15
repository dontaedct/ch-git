'use client';

/**
 * @fileoverview HT-008.1.2: CSRF Protection Client-Side Implementation
 * @module lib/security/csrf
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.1.2 - Implement CSRF protection across all forms
 * Focus: Client-side CSRF protection with token management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (CSRF vulnerabilities)
 */

import { useState, useEffect } from 'react';
import { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';

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
 * Client-side CSRF token hook
 */
export function useCSRFToken(config: CSRFConfig = DEFAULT_CSRF_CONFIG) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch CSRF token from server
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCSRFToken();
  }, [config]);

  return { token, isLoading };
}

/**
 * Add CSRF token to form data
 */
export function addCSRFTokenToFormData(formData: FormData, token: string, config: CSRFConfig = DEFAULT_CSRF_CONFIG): FormData {
  formData.append(config.fieldName, token);
  return formData;
}

/**
 * Add CSRF token to headers
 */
export function addCSRFTokenToHeaders(headers: HeadersInit, token: string, config: CSRFConfig = DEFAULT_CSRF_CONFIG): HeadersInit {
  return {
    ...headers,
    [config.headerName]: token,
  };
}

/**
 * CSRF protected fetch wrapper
 */
export async function csrfFetch(url: string, options: RequestInit = {}, token: string, config: CSRFConfig = DEFAULT_CSRF_CONFIG): Promise<Response> {
  const csrfHeaders = addCSRFTokenToHeaders(options.headers || {}, token, config);
  
  return fetch(url, {
    ...options,
    headers: csrfHeaders,
    credentials: 'include',
  });
}

/**
 * CSRF form submission helper
 */
export async function submitFormWithCSRF(
  url: string,
  formData: FormData,
  token: string,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<Response> {
  const csrfFormData = addCSRFTokenToFormData(formData, token, config);
  
  return fetch(url, {
    method: 'POST',
    body: csrfFormData,
    credentials: 'include',
  });
}

/**
 * CSRF token utilities
 */
export class CSRFProtection {
  public config: CSRFConfig;

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = { ...DEFAULT_CSRF_CONFIG, ...config };
  }

  /**
   * Generate a secure CSRF token
   */
  generateToken(): string {
    return randomBytes(this.config.tokenLength).toString('hex');
  }

  /**
   * Create a hash of the token for storage
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Set CSRF token in cookie
   */
  setTokenCookie(token: string): string {
    const cookieValue = `${token}:${this.hashToken(token)}`;
    return `${this.config.cookieName}=${cookieValue}; Path=/; Max-Age=${this.config.maxAge}; SameSite=${this.config.sameSite}${this.config.secure ? '; Secure' : ''}; HttpOnly`;
  }

  /**
   * Extract and validate CSRF token from cookie
   */
  extractTokenFromCookie(cookieHeader: string): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map(c => c.trim());
    const csrfCookie = cookies.find(c => c.startsWith(`${this.config.cookieName}=`));
    
    if (!csrfCookie) return null;

    const cookieValue = csrfCookie.split('=')[1];
    if (!cookieValue) return null;

    const [token, hash] = cookieValue.split(':');
    if (!token || !hash) return null;

    // Verify the hash
    if (this.hashToken(token) !== hash) return null;

    return token;
  }

  /**
   * Validate CSRF token from request
   */
  validateToken(request: NextRequest): { valid: boolean; token?: string; cookie?: string } {
    const cookieToken = this.extractTokenFromCookie(request.headers.get('cookie') || '');
    if (!cookieToken) return { valid: false };

    // Check header first (preferred for AJAX requests)
    const headerToken = request.headers.get(this.config.headerName);
    if (headerToken && headerToken === cookieToken) return { valid: true };

    // Check form data (for traditional form submissions)
    // Note: formData() returns a Promise in Next.js, so we can't sync validate form data
    // This validation should be done in the API route handler

    return { valid: false };
  }

  /**
   * Get CSRF token for client-side use (browser only)
   */
  getTokenForClient(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(c => c.trim().startsWith(`${this.config.cookieName}=`));

    if (!csrfCookie) return null;

    const cookieValue = csrfCookie.split('=')[1];
    if (!cookieValue) return null;

    const [token] = cookieValue.split(':');
    return token;
  }

  /**
   * Create CSRF token and set cookie (server-side)
   */
  createTokenWithCookie(): { token: string; cookie: string } {
    const token = this.generateToken();
    const cookie = this.setTokenCookie(token);
    return { token, cookie };
  }
}

/**
 * Global CSRF protection instance
 */
export const csrfProtection = new CSRFProtection();

/**
 * CSRF middleware for API routes
 */
export function csrfMiddleware(request: NextRequest): { valid: boolean; token?: string; cookie?: string } {
  // Skip CSRF validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true };
  }

  const isValid = csrfProtection.validateToken(request);
  
  if (!isValid) {
    // Generate new token for retry
    const { token, cookie } = csrfProtection.createTokenWithCookie();
    return { valid: false, token, cookie };
  }

  return { valid: true };
}

/**
 * React hook for CSRF protection
 */
export function useCSRF() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/csrf/token', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  const getCSRFHeaders = () => {
    if (!token) return {};
    return { [csrfProtection.config.headerName]: token };
  };

  const getCSRFField = () => {
    if (!token) return null;
    return {
      type: 'input',
      props: {
        type: 'hidden',
        name: csrfProtection.config.fieldName,
        value: token,
      }
    };
  };

  return {
    token,
    loading,
    getCSRFHeaders,
    getCSRFField,
  };
}

export default CSRFProtection;
