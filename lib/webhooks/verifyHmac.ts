/**
 * Webhook HMAC Verification
 * 
 * Provides constant-time signature verification for webhook security.
 * Supports SHA-256 HMAC verification with configurable header names.
 */

import { createHmac, timingSafeEqual } from 'crypto';

export interface HmacConfig {
  /** Header name containing the signature (e.g., 'X-Hub-Signature-256', 'Stripe-Signature') */
  headerName: string;
  /** Environment variable name containing the secret key */
  secretEnv: string;
  /** Expected signature prefix (e.g., 'sha256=', 'v1=') */
  signaturePrefix?: string;
}

export interface HmacVerificationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Verifies HMAC signature using constant-time comparison
 * @param payload - Raw request body as string
 * @param signature - Signature from header
 * @param secret - Secret key for verification
 * @param prefix - Expected signature prefix (optional)
 * @returns Verification result
 */
export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  prefix?: string
): HmacVerificationResult {
  try {
    if (!signature) {
      return { isValid: false, error: 'Missing signature' };
    }

    if (!secret) {
      return { isValid: false, error: 'Missing secret key' };
    }

    // Extract signature value if prefix is provided
    let signatureValue = signature;
    if (prefix) {
      if (!signature.startsWith(prefix)) {
        return { isValid: false, error: `Invalid signature format. Expected prefix: ${prefix}` };
      }
      signatureValue = signature.slice(prefix.length);
    }

    // Generate expected signature
    const expectedSignature = createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(signatureValue, 'hex');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return { isValid: false, error: 'Signature length mismatch' };
    }

    const isValid = timingSafeEqual(expectedBuffer, receivedBuffer);

    return { isValid, error: isValid ? undefined : 'Invalid signature' };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Verifies webhook signature from request headers and body
 * @param request - Incoming request
 * @param config - HMAC configuration
 * @returns Verification result
 */
export async function verifyWebhookHmac(
  request: Request,
  config: HmacConfig
): Promise<HmacVerificationResult> {
  try {
    const signature = request.headers.get(config.headerName);
    const secret = process.env[config.secretEnv];

    if (!signature) {
      return { isValid: false, error: `Missing ${config.headerName} header` };
    }

    if (!secret) {
      return { isValid: false, error: `Missing ${config.secretEnv} environment variable` };
    }

    // Clone request to read body without consuming it
    const clonedRequest = request.clone();
    const payload = await clonedRequest.text();

    return verifyHmacSignature(payload, signature, secret, config.signaturePrefix);
  } catch (error) {
    return { 
      isValid: false, 
      error: `Request processing error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Stripe-specific HMAC verification
 * Stripe uses a different signature format with timestamp and multiple signatures
 */
export async function verifyStripeWebhook(
  request: Request,
  secretEnv: string = 'STRIPE_WEBHOOK_SECRET'
): Promise<HmacVerificationResult> {
  try {
    const signature = request.headers.get('Stripe-Signature');
    const secret = process.env[secretEnv];

    if (!signature) {
      return { isValid: false, error: 'Missing Stripe-Signature header' };
    }

    if (!secret) {
      return { isValid: false, error: `Missing ${secretEnv} environment variable` };
    }

    const clonedRequest = request.clone();
    const payload = await clonedRequest.text();

    // Parse Stripe signature format: "t=timestamp,v1=signature"
    const elements = signature.split(',');
    const timestamp = elements.find(el => el.startsWith('t='))?.split('=')[1];
    const signatures = elements.filter(el => el.startsWith('v1=')).map(el => el.split('=')[1]);

    if (!timestamp || signatures.length === 0) {
      return { isValid: false, error: 'Invalid Stripe signature format' };
    }

    // Verify timestamp is recent (within 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    const eventTime = parseInt(timestamp, 10);
    if (Math.abs(currentTime - eventTime) > 300) {
      return { isValid: false, error: 'Timestamp too old' };
    }

    // Create expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Check if any of the provided signatures match
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const isValid = signatures.some(sig => {
      try {
        const receivedBuffer = Buffer.from(sig, 'hex');
        return expectedBuffer.length === receivedBuffer.length && 
               timingSafeEqual(expectedBuffer, receivedBuffer);
      } catch {
        return false;
      }
    });

    return { isValid, error: isValid ? undefined : 'Invalid Stripe signature' };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Stripe verification error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
