/**
 * @fileoverview Secure Navigation Utilities
 * @module lib/security/navigation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.1.1 - Fix XSS vulnerabilities in SearchInput and dynamic content
 * Focus: Secure navigation utilities to prevent XSS attacks
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (XSS vulnerabilities)
 */

import { z } from 'zod';

/**
 * URL validation schema for secure navigation
 */
const urlSchema = z.string()
  .min(1, 'URL cannot be empty')
  .max(2048, 'URL too long')
  .refine((url) => {
    try {
      const parsed = new URL(url, window.location.origin);
      // Only allow same-origin URLs or trusted domains
      const allowedDomains = [
        window.location.hostname,
        'stripe.com',
        'js.stripe.com',
        'hooks.stripe.com'
      ];
      return allowedDomains.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  }, 'Invalid or untrusted URL');

/**
 * Path validation schema for internal navigation
 */
const pathSchema = z.string()
  .min(1, 'Path cannot be empty')
  .max(1000, 'Path too long')
  .refine((path) => {
    // Prevent path traversal attacks
    return !path.includes('..') && 
           !path.includes('<') && 
           !path.includes('>') && 
           !path.includes('script') &&
           !path.includes('javascript:') &&
           !path.includes('data:');
  }, 'Invalid path - potential security risk');

/**
 * Secure navigation utilities to prevent XSS attacks
 */
export class SecureNavigation {
  /**
   * Safely navigate to a URL with validation
   */
  static navigateToUrl(url: string): boolean {
    try {
      const validatedUrl = urlSchema.parse(url);
      window.location.href = validatedUrl;
      return true;
    } catch (error) {
      console.error('Navigation blocked due to security validation:', error);
      return false;
    }
  }

  /**
   * Safely navigate to an internal path
   */
  static navigateToPath(path: string): boolean {
    try {
      const validatedPath = pathSchema.parse(path);
      const fullUrl = new URL(validatedPath, window.location.origin).toString();
      return this.navigateToUrl(fullUrl);
    } catch (error) {
      console.error('Path navigation blocked due to security validation:', error);
      return false;
    }
  }

  /**
   * Safely redirect to a URL (for auth flows)
   */
  static redirectToUrl(url: string): boolean {
    try {
      const validatedUrl = urlSchema.parse(url);
      window.location.replace(validatedUrl);
      return true;
    } catch (error) {
      console.error('Redirect blocked due to security validation:', error);
      return false;
    }
  }

  /**
   * Safely open a URL in a new window/tab
   */
  static openUrl(url: string, target: '_blank' | '_self' = '_blank'): boolean {
    try {
      const validatedUrl = urlSchema.parse(url);
      window.open(validatedUrl, target, 'noopener,noreferrer');
      return true;
    } catch (error) {
      console.error('URL opening blocked due to security validation:', error);
      return false;
    }
  }

  /**
   * Get safe redirect URL from search params
   */
  static getSafeRedirectUrl(searchParams: URLSearchParams, fallback: string = '/'): string {
    const redirectTo = searchParams.get('redirectTo');
    if (!redirectTo) return fallback;

    try {
      const validatedPath = pathSchema.parse(redirectTo);
      return validatedPath;
    } catch {
      console.warn('Invalid redirect URL, using fallback');
      return fallback;
    }
  }

  /**
   * Validate and sanitize URL for display
   */
  static sanitizeUrlForDisplay(url: string): string {
    try {
      const validatedUrl = urlSchema.parse(url);
      return validatedUrl;
    } catch {
      return '#';
    }
  }
}

/**
 * React hook for secure navigation
 */
export function useSecureNavigation() {
  return {
    navigateToUrl: SecureNavigation.navigateToUrl,
    navigateToPath: SecureNavigation.navigateToPath,
    redirectToUrl: SecureNavigation.redirectToUrl,
    openUrl: SecureNavigation.openUrl,
    getSafeRedirectUrl: SecureNavigation.getSafeRedirectUrl,
    sanitizeUrlForDisplay: SecureNavigation.sanitizeUrlForDisplay,
  };
}

export default SecureNavigation;
