/**
 * @fileoverview Secure Clipboard Hook for Brand-Aware Components
 * @module hooks/use-secure-clipboard
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { useState, useCallback } from 'react';

interface UseSecureClipboardOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseSecureClipboardResult {
  copyToClipboard: (text: string) => Promise<void>;
  isCopying: boolean;
  error: Error | null;
}

/**
 * Hook for secure clipboard operations with brand-aware error handling
 */
export function useSecureClipboard(options: UseSecureClipboardOptions = {}): UseSecureClipboardResult {
  const { timeout = 2000, onSuccess, onError } = options;
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copyToClipboard = useCallback(async (text: string) => {
    if (!text) {
      const error = new Error('No text provided to copy');
      setError(error);
      onError?.(error);
      return;
    }

    setIsCopying(true);
    setError(null);

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }

      // Validate that we're in a secure context
      if (!window.isSecureContext) {
        throw new Error('Clipboard API requires secure context (HTTPS)');
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(text);
      onSuccess?.();
      
      // Reset copying state after timeout
      setTimeout(() => {
        setIsCopying(false);
      }, timeout);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy to clipboard');
      setError(error);
      setIsCopying(false);
      onError?.(error);
    }
  }, [timeout, onSuccess, onError]);

  return {
    copyToClipboard,
    isCopying,
    error
  };
}

export default useSecureClipboard;