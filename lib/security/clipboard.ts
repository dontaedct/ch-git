/**
 * @fileoverview Secure Clipboard API Utilities
 * @module lib/security/clipboard
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.1.3 - Secure clipboard API usage with proper validation
 * Focus: Secure clipboard operations with permission checks and validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (clipboard security vulnerabilities)
 */

import { useState, useEffect } from 'react';
export type ClipboardPermissionState = 'granted' | 'denied' | 'prompt';

/**
 * Secure clipboard utilities with permission validation
 */
export class SecureClipboard {
  /**
   * Check if clipboard API is available and secure
   */
  static isAvailable(): boolean {
    return typeof navigator !== 'undefined' && 
           'clipboard' in navigator && 
           'writeText' in navigator.clipboard &&
           window.isSecureContext;
  }

  /**
   * Check clipboard permission status
   */
  static async checkPermission(): Promise<ClipboardPermissionState> {
    if (!this.isAvailable()) {
      return 'denied';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      return permission.state as ClipboardPermissionState;
    } catch (error) {
      console.warn('Failed to check clipboard permission:', error);
      return 'denied';
    }
  }

  /**
   * Request clipboard permission
   */
  static async requestPermission(): Promise<ClipboardPermissionState> {
    if (!this.isAvailable()) {
      throw new Error('Clipboard API not available');
    }

    try {
      // Try to write empty string to trigger permission prompt
      await navigator.clipboard.writeText('');
      return 'granted';
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        return 'denied';
      }
      throw error;
    }
  }

  /**
   * Securely write text to clipboard with validation
   */
  static async writeText(text: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Clipboard API not available');
    }

    // Validate input
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }

    if (text.length > 10000) {
      throw new Error('Text too long for clipboard');
    }

    // Check for potentially malicious content
    if (this.containsMaliciousContent(text)) {
      throw new Error('Text contains potentially malicious content');
    }

    try {
      const permission = await this.checkPermission();
      
      if (permission === 'denied') {
        throw new Error('Clipboard permission denied');
      }

      if (permission === 'prompt') {
        const newPermission = await this.requestPermission();
        if (newPermission === 'denied') {
          throw new Error('Clipboard permission denied');
        }
      }

      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to write to clipboard:', error);
      throw error;
    }
  }

  /**
   * Securely read text from clipboard with validation
   */
  static async readText(): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Clipboard API not available');
    }

    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      
      if (permission.state === 'denied') {
        throw new Error('Clipboard read permission denied');
      }

      const text = await navigator.clipboard.readText();
      
      // Validate read content
      if (this.containsMaliciousContent(text)) {
        throw new Error('Clipboard contains potentially malicious content');
      }

      return text;
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      throw error;
    }
  }

  /**
   * Check if text contains potentially malicious content
   */
  private static containsMaliciousContent(text: string): boolean {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /onmouseover=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
    ];

    return maliciousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Fallback method for copying text when clipboard API fails
   */
  static async fallbackCopyText(text: string): Promise<boolean> {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      return successful;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }
}

/**
 * React hook for secure clipboard operations
 */
export function useSecureClipboard() {
  const [permission, setPermission] = useState<ClipboardPermissionState>('prompt');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const currentPermission = await SecureClipboard.checkPermission();
        setPermission(currentPermission);
      } catch (error) {
        console.error('Failed to check clipboard permission:', error);
        setPermission('denied');
      }
    };

    checkPermission();
  }, []);

  const copyText = async (text: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      return await SecureClipboard.writeText(text);
    } catch (error) {
      // Try fallback method
      try {
        return await SecureClipboard.fallbackCopyText(text);
      } catch (fallbackError) {
        console.error('Both clipboard methods failed:', fallbackError);
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const readText = async (): Promise<string> => {
    setIsLoading(true);
    try {
      return await SecureClipboard.readText();
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<ClipboardPermissionState> => {
    setIsLoading(true);
    try {
      const newPermission = await SecureClipboard.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permission,
    isLoading,
    copyText,
    readText,
    requestPermission,
    isAvailable: SecureClipboard.isAvailable(),
  };
}

export default SecureClipboard;
