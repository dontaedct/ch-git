/**
 * HMAC Signing for Webhook Emitters
 * 
 * Provides HMAC signature generation for outgoing webhook requests
 * with configurable algorithms and formats
 */

import { createHmac } from 'crypto';

export interface HmacSignatureOptions {
  /** HMAC algorithm */
  algorithm?: 'sha256' | 'sha1';
  /** Signature prefix (e.g., 'sha256=', 'v1=') */
  prefix?: string;
  /** Encoding for signature output */
  encoding?: 'hex' | 'base64';
  /** Include timestamp in payload */
  includeTimestamp?: boolean;
  /** Timestamp to use (defaults to current time) */
  timestamp?: number;
}

export interface SignedPayload {
  /** Original payload */
  payload: string;
  /** Generated signature */
  signature: string;
  /** Timestamp used (if includeTimestamp was true) */
  timestamp?: number;
  /** Headers to include in webhook request */
  headers: Record<string, string>;
}

/**
 * Generate HMAC signature for webhook payload
 */
export function generateHmacSignature(
  payload: string,
  secret: string,
  options: HmacSignatureOptions = {}
): SignedPayload {
  const {
    algorithm = 'sha256',
    prefix = 'sha256=',
    encoding = 'hex',
    includeTimestamp = false,
    timestamp = Math.floor(Date.now() / 1000)
  } = options;

  if (!secret) {
    throw new Error('HMAC secret is required');
  }

  let signaturePayload = payload;
  
  // If including timestamp, prepend it to payload (Stripe-style)
  if (includeTimestamp) {
    signaturePayload = `${timestamp}.${payload}`;
  }

  // Generate HMAC signature
  const hmac = createHmac(algorithm, secret);
  hmac.update(signaturePayload, 'utf8');
  const signatureValue = hmac.digest(encoding);
  
  // Format signature with prefix
  const signature = `${prefix}${signatureValue}`;
  
  // Determine signature header name based on algorithm
  const signatureHeaderMap = {
    sha256: 'X-Hub-Signature-256',
    sha1: 'X-Hub-Signature'
  };
  
  const headers: Record<string, string> = {
    [signatureHeaderMap[algorithm]]: signature,
    'Content-Type': 'application/json',
    'User-Agent': 'OSS-Hero-Webhooks/1.0'
  };
  
  // Add timestamp header if used
  if (includeTimestamp) {
    headers['X-Timestamp'] = timestamp.toString();
  }

  return {
    payload,
    signature,
    timestamp: includeTimestamp ? timestamp : undefined,
    headers
  };
}

/**
 * Generate Stripe-style HMAC signature with timestamp
 */
export function generateStripeStyleSignature(
  payload: string,
  secret: string,
  timestamp?: number
): SignedPayload {
  const actualTimestamp = timestamp ?? Math.floor(Date.now() / 1000);
  
  return generateHmacSignature(payload, secret, {
    algorithm: 'sha256',
    prefix: 'v1=',
    encoding: 'hex',
    includeTimestamp: true,
    timestamp: actualTimestamp
  });
}

/**
 * Generate GitHub-style HMAC signature
 */
export function generateGitHubStyleSignature(
  payload: string,
  secret: string
): SignedPayload {
  return generateHmacSignature(payload, secret, {
    algorithm: 'sha256',
    prefix: 'sha256=',
    encoding: 'hex',
    includeTimestamp: false
  });
}

/**
 * Generate custom HMAC signature based on webhook config
 */
export function generateCustomSignature(
  payload: string,
  secret: string,
  config: {
    algorithm?: 'sha256' | 'sha1';
    prefix?: string;
    includeTimestamp?: boolean;
  }
): SignedPayload {
  return generateHmacSignature(payload, secret, {
    algorithm: config.algorithm ?? 'sha256',
    prefix: config.prefix ?? 'sha256=',
    encoding: 'hex',
    includeTimestamp: config.includeTimestamp ?? false
  });
}

/**
 * Verify that our signature matches expected format
 */
export function validateSignature(signature: string, expectedPrefix: string): boolean {
  if (!signature || !expectedPrefix) {
    return false;
  }
  
  return signature.startsWith(expectedPrefix);
}

/**
 * Extract signature value from prefixed signature
 */
export function extractSignatureValue(signature: string, prefix: string): string {
  if (!signature.startsWith(prefix)) {
    throw new Error(`Signature does not start with expected prefix: ${prefix}`);
  }
  
  return signature.slice(prefix.length);
}

/**
 * Generate multiple signatures (useful for rotation scenarios)
 */
export function generateMultipleSignatures(
  payload: string,
  secrets: string[],
  options: HmacSignatureOptions = {}
): Array<SignedPayload> {
  return secrets.map(secret => 
    generateHmacSignature(payload, secret, options)
  );
}

/**
 * Create signature verification function for testing
 */
export function createVerificationFunction(
  secret: string,
  options: HmacSignatureOptions = {}
) {
  return (payload: string, receivedSignature: string): boolean => {
    const { signature } = generateHmacSignature(payload, secret, options);
    return signature === receivedSignature;
  };
}