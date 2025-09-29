/**
 * Stripe Payment Integration
 * 
 * Comprehensive Stripe integration with payment processing,
 * webhook handling, and subscription management.
 */

import { IntegrationProvider, IntegrationTest } from '../types';
import { getIntegrationRegistry } from '../registry';

export const STRIPE_PROVIDER: IntegrationProvider = {
  id: 'stripe',
  name: 'Stripe',
  description: 'Complete payment processing platform with global reach and advanced features',
  category: 'payment',
  logoUrl: 'https://stripe.com/img/v3/home/social.png',
  websiteUrl: 'https://stripe.com',
  documentationUrl: 'https://stripe.com/docs',
  verified: true,
  popularityScore: 95,
  status: 'active',
  features: [
    {
      id: 'payments',
      name: 'Payment Processing',
      description: 'Accept payments from customers worldwide',
      available: true
    },
    {
      id: 'subscriptions',
      name: 'Subscription Management',
      description: 'Handle recurring billing and subscription lifecycle',
      available: true
    },
    {
      id: 'invoicing',
      name: 'Invoicing',
      description: 'Create and send professional invoices',
      available: true
    },
    {
      id: 'webhooks',
      name: 'Webhook Integration',
      description: 'Real-time event notifications',
      available: true
    },
    {
      id: 'connect',
      name: 'Stripe Connect',
      description: 'Multi-party payments and marketplace functionality',
      available: true
    },
    {
      id: 'radar',
      name: 'Fraud Prevention',
      description: 'Advanced fraud detection and prevention',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'STRIPE_SECRET_KEY',
        description: 'Stripe secret API key for server-side operations',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        description: 'Stripe publishable key for client-side operations',
        required: true,
        type: 'string',
        securityLevel: 'public'
      },
      {
        name: 'STRIPE_WEBHOOK_SECRET',
        description: 'Webhook endpoint secret for signature verification',
        required: false,
        type: 'string',
        securityLevel: 'critical'
      }
    ],
    apiKeys: [
      {
        id: 'secret_key',
        name: 'Secret API Key',
        description: 'Server-side API key for payment processing',
        required: true,
        type: 'secret',
        obtainFrom: 'Stripe Dashboard > Developers > API Keys',
        securityLevel: 'critical'
      },
      {
        id: 'publishable_key',
        name: 'Publishable API Key',
        description: 'Client-side API key for payment forms',
        required: true,
        type: 'api_key',
        obtainFrom: 'Stripe Dashboard > Developers > API Keys',
        securityLevel: 'private'
      },
      {
        id: 'webhook_secret',
        name: 'Webhook Endpoint Secret',
        description: 'Secret for webhook signature verification',
        required: false,
        type: 'webhook_secret',
        obtainFrom: 'Stripe Dashboard > Developers > Webhooks',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'read_payments',
        name: 'Read Payments',
        description: 'Access to payment and charge information',
        required: true,
        scope: 'read:payments',
        grantFrom: 'Stripe Dashboard > API Keys'
      },
      {
        id: 'write_payments',
        name: 'Create Payments',
        description: 'Create charges and process payments',
        required: true,
        scope: 'write:payments',
        grantFrom: 'Stripe Dashboard > API Keys'
      },
      {
        id: 'read_customers',
        name: 'Read Customers',
        description: 'Access to customer information',
        required: true,
        scope: 'read:customers',
        grantFrom: 'Stripe Dashboard > API Keys'
      },
      {
        id: 'write_customers',
        name: 'Manage Customers',
        description: 'Create and update customer records',
        required: true,
        scope: 'write:customers',
        grantFrom: 'Stripe Dashboard > API Keys'
      }
    ],
    webhooks: {
      endpoint: '/api/webhooks/stripe',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'Stripe-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'charge.dispute.created'
      ],
      samplePayload: {
        id: 'evt_1234567890',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_1234567890',
            amount: 2000,
            currency: 'usd',
            status: 'succeeded',
            customer: 'cus_1234567890'
          }
        },
        created: 1234567890,
        livemode: false
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create Stripe Account',
      description: 'Sign up for a Stripe account at stripe.com',
      type: 'action',
      actionUrl: 'https://stripe.com/register'
    },
    {
      step: 2,
      title: 'Get API Keys',
      description: 'Navigate to the Stripe Dashboard and copy your API keys',
      type: 'action',
      actionUrl: 'https://dashboard.stripe.com/apikeys'
    },
    {
      step: 3,
      title: 'Configure Environment Variables',
      description: 'Add your Stripe keys to your environment configuration',
      type: 'info'
    },
    {
      step: 4,
      title: 'Set Up Webhooks',
      description: 'Configure webhook endpoints in your Stripe dashboard',
      type: 'action',
      actionUrl: 'https://dashboard.stripe.com/webhooks'
    },
    {
      step: 5,
      title: 'Test Integration',
      description: 'Run the integration test to verify everything is working',
      type: 'verification',
      verificationEndpoint: '/api/integrations/stripe/test'
    }
  ],
  pricing: {
    model: 'usage_based',
    freeTier: {
      requests: 0,
      features: ['Test mode', 'Basic support'],
      limitations: ['No live payments', 'Limited features']
    },
    usageBased: {
      unit: 'transaction',
      pricePerUnit: 0.029,
      currency: 'USD',
      freeUnits: 0
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Stripe Integration Tests
 */
export const STRIPE_TESTS: IntegrationTest[] = [
  {
    id: 'stripe-connection',
    providerId: 'stripe',
    name: 'Connection Test',
    description: 'Test connection to Stripe API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'stripe-authentication',
    providerId: 'stripe',
    name: 'Authentication Test',
    description: 'Verify API key authentication',
    type: 'authentication',
    configuration: {}
  },
  {
    id: 'stripe-permissions',
    providerId: 'stripe',
    name: 'Permissions Test',
    description: 'Check required permissions and scopes',
    type: 'permissions',
    configuration: {}
  },
  {
    id: 'stripe-webhook',
    providerId: 'stripe',
    name: 'Webhook Test',
    description: 'Test webhook endpoint configuration',
    type: 'webhook',
    configuration: {}
  },
  {
    id: 'stripe-payment-intent',
    providerId: 'stripe',
    name: 'Payment Intent Test',
    description: 'Test creating a payment intent',
    type: 'api_call',
    configuration: {
      amount: 2000,
      currency: 'usd',
      testMode: true
    }
  }
];

/**
 * Stripe Integration Service
 */
export class StripeIntegrationService {
  private apiKey: string;
  private publishableKey: string;
  private webhookSecret?: string;

  constructor(config: {
    apiKey: string;
    publishableKey: string;
    webhookSecret?: string;
  }) {
    this.apiKey = config.apiKey;
    this.publishableKey = config.publishableKey;
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Test connection to Stripe API
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const account = await response.json();
      return {
        success: true,
        message: 'Successfully connected to Stripe',
        data: {
          accountId: account.id,
          country: account.country,
          currency: account.default_currency,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Test authentication with Stripe API
   */
  async testAuthentication(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const balance = await response.json();
      return {
        success: true,
        message: 'Authentication successful',
        data: {
          available: balance.available,
          pending: balance.pending
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication test failed'
      };
    }
  }

  /**
   * Test webhook configuration
   */
  async testWebhook(): Promise<{ success: boolean; message: string; data?: any }> {
    if (!this.webhookSecret) {
      return {
        success: false,
        message: 'Webhook secret not configured'
      };
    }

    // Test webhook signature verification
    const testPayload = JSON.stringify({
      id: 'evt_test_webhook',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test' } }
    });

    const testSignature = this.generateTestSignature(testPayload);

    try {
      const isValid = this.verifyWebhookSignature(testPayload, testSignature);
      return {
        success: isValid,
        message: isValid ? 'Webhook signature verification successful' : 'Webhook signature verification failed',
        data: { signatureValid: isValid }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook test failed'
      };
    }
  }

  /**
   * Create a test payment intent
   */
  async testPaymentIntent(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          amount: '2000',
          currency: 'usd',
          automatic_payment_methods: 'enabled'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const paymentIntent = await response.json();
      return {
        success: true,
        message: 'Payment intent created successfully',
        data: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment intent test failed'
      };
    }
  }

  /**
   * Generate test webhook signature
   */
  private generateTestSignature(payload: string): string {
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', this.webhookSecret!)
      .update(signedPayload, 'utf8')
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    
    const elements = signature.split(',');
    const timestamp = elements.find(el => el.startsWith('t='))?.split('=')[1];
    const signatures = elements.filter(el => el.startsWith('v1=')).map(el => el.split('=')[1]);

    if (!timestamp || signatures.length === 0) {
      return false;
    }

    // Verify timestamp is recent (within 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    const eventTime = parseInt(timestamp, 10);
    if (Math.abs(currentTime - eventTime) > 300) {
      return false;
    }

    // Create expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret!)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Check if any of the provided signatures match
    return signatures.some(sig => {
      try {
        const expectedBuffer = Buffer.from(expectedSignature, 'hex');
        const receivedBuffer = Buffer.from(sig, 'hex');
        return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
      } catch {
        return false;
      }
    });
  }
}

/**
 * Register Stripe provider with the integration registry
 */
export function registerStripeProvider(): void {
  const registry = getIntegrationRegistry();
  registry.registerProvider(STRIPE_PROVIDER);
  
  // Register tests
  STRIPE_TESTS.forEach(test => {
    registry['tests'].set(test.id, test);
  });
}
