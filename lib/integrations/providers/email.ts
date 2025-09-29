/**
 * Email Service Providers Integration
 * 
 * Integration with email service providers including SendGrid, Mailgun,
 * and Resend for transactional and marketing emails.
 */

import { IntegrationProvider, IntegrationTest } from '../types';
import { getIntegrationRegistry } from '../registry';

/**
 * SendGrid Email Provider
 */
export const SENDGRID_PROVIDER: IntegrationProvider = {
  id: 'sendgrid',
  name: 'SendGrid',
  description: 'Cloud-based email delivery service with advanced analytics and deliverability',
  category: 'email',
  logoUrl: 'https://sendgrid.com/brand/sg-logo-300.png',
  websiteUrl: 'https://sendgrid.com',
  documentationUrl: 'https://docs.sendgrid.com',
  verified: true,
  popularityScore: 88,
  status: 'active',
  features: [
    {
      id: 'transactional',
      name: 'Transactional Emails',
      description: 'Send automated emails like receipts and notifications',
      available: true
    },
    {
      id: 'marketing',
      name: 'Marketing Campaigns',
      description: 'Create and send marketing email campaigns',
      available: true
    },
    {
      id: 'templates',
      name: 'Email Templates',
      description: 'Design and manage email templates',
      available: true
    },
    {
      id: 'analytics',
      name: 'Email Analytics',
      description: 'Track opens, clicks, and engagement metrics',
      available: true
    },
    {
      id: 'webhooks',
      name: 'Event Webhooks',
      description: 'Real-time email event notifications',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'SENDGRID_API_KEY',
        description: 'SendGrid API key for email sending',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'SENDGRID_FROM_EMAIL',
        description: 'Default sender email address',
        required: true,
        type: 'email',
        securityLevel: 'private'
      },
      {
        name: 'SENDGRID_FROM_NAME',
        description: 'Default sender name',
        required: false,
        type: 'string',
        securityLevel: 'public'
      }
    ],
    apiKeys: [
      {
        id: 'api_key',
        name: 'API Key',
        description: 'SendGrid API key for authentication',
        required: true,
        type: 'secret',
        obtainFrom: 'SendGrid Dashboard > Settings > API Keys',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'send_emails',
        name: 'Send Emails',
        description: 'Permission to send emails through SendGrid',
        required: true,
        scope: 'mail.send',
        grantFrom: 'SendGrid Dashboard > API Keys'
      },
      {
        id: 'read_analytics',
        name: 'Read Analytics',
        description: 'Access to email analytics and statistics',
        required: false,
        scope: 'stats.read',
        grantFrom: 'SendGrid Dashboard > API Keys'
      }
    ],
    webhooks: {
      endpoint: '/api/webhooks/sendgrid',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-Twilio-Email-Event-Webhook-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'delivered',
        'processed',
        'dropped',
        'bounce',
        'open',
        'click',
        'spam_report',
        'unsubscribe'
      ],
      samplePayload: {
        email: 'user@example.com',
        timestamp: 1234567890,
        event: 'delivered',
        sg_event_id: 'sg_event_id',
        sg_message_id: 'sg_message_id'
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create SendGrid Account',
      description: 'Sign up for a SendGrid account',
      type: 'action',
      actionUrl: 'https://signup.sendgrid.com'
    },
    {
      step: 2,
      title: 'Verify Sender Identity',
      description: 'Verify your sender email address or domain',
      type: 'action',
      actionUrl: 'https://app.sendgrid.com/settings/sender_auth'
    },
    {
      step: 3,
      title: 'Generate API Key',
      description: 'Create an API key with mail.send permissions',
      type: 'action',
      actionUrl: 'https://app.sendgrid.com/settings/api_keys'
    },
    {
      step: 4,
      title: 'Configure Environment Variables',
      description: 'Add your SendGrid configuration to environment variables',
      type: 'info'
    },
    {
      step: 5,
      title: 'Test Email Sending',
      description: 'Send a test email to verify the integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/sendgrid/test'
    }
  ],
  pricing: {
    model: 'usage_based',
    freeTier: {
      requests: 100,
      features: ['Basic email sending', 'Email templates'],
      limitations: ['100 emails/day', 'No advanced analytics']
    },
    usageBased: {
      unit: 'email',
      pricePerUnit: 0.0006,
      currency: 'USD',
      freeUnits: 100
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Mailgun Email Provider
 */
export const MAILGUN_PROVIDER: IntegrationProvider = {
  id: 'mailgun',
  name: 'Mailgun',
  description: 'Developer-friendly email service with powerful APIs and analytics',
  category: 'email',
  logoUrl: 'https://www.mailgun.com/img/mailgun-logo.png',
  websiteUrl: 'https://www.mailgun.com',
  documentationUrl: 'https://documentation.mailgun.com',
  verified: true,
  popularityScore: 82,
  status: 'active',
  features: [
    {
      id: 'transactional',
      name: 'Transactional Emails',
      description: 'Send automated emails with high deliverability',
      available: true
    },
    {
      id: 'routing',
      name: 'Email Routing',
      description: 'Route emails based on rules and conditions',
      available: true
    },
    {
      id: 'validation',
      name: 'Email Validation',
      description: 'Validate email addresses before sending',
      available: true
    },
    {
      id: 'analytics',
      name: 'Email Analytics',
      description: 'Track email performance and engagement',
      available: true
    },
    {
      id: 'webhooks',
      name: 'Event Webhooks',
      description: 'Real-time email event notifications',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'MAILGUN_API_KEY',
        description: 'Mailgun API key for authentication',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'MAILGUN_DOMAIN',
        description: 'Mailgun domain for sending emails',
        required: true,
        type: 'string',
        securityLevel: 'private'
      },
      {
        name: 'MAILGUN_FROM_EMAIL',
        description: 'Default sender email address',
        required: true,
        type: 'email',
        securityLevel: 'private'
      }
    ],
    apiKeys: [
      {
        id: 'api_key',
        name: 'API Key',
        description: 'Mailgun API key for authentication',
        required: true,
        type: 'secret',
        obtainFrom: 'Mailgun Dashboard > Settings > API Keys',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'send_emails',
        name: 'Send Emails',
        description: 'Permission to send emails through Mailgun',
        required: true,
        scope: 'messages:send',
        grantFrom: 'Mailgun Dashboard > API Keys'
      },
      {
        id: 'read_events',
        name: 'Read Events',
        description: 'Access to email events and analytics',
        required: false,
        scope: 'events:read',
        grantFrom: 'Mailgun Dashboard > API Keys'
      }
    ],
    webhooks: {
      endpoint: '/api/webhooks/mailgun',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      hmac: {
        headerName: 'X-Mailgun-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'delivered',
        'accepted',
        'rejected',
        'failed',
        'opened',
        'clicked',
        'unsubscribed',
        'complained'
      ],
      samplePayload: {
        signature: {
          timestamp: '1234567890',
          token: 'token',
          signature: 'signature'
        },
        'event-data': {
          event: 'delivered',
          timestamp: 1234567890,
          message: {
            headers: {
              'message-id': 'message-id'
            }
          },
          recipient: 'user@example.com'
        }
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create Mailgun Account',
      description: 'Sign up for a Mailgun account',
      type: 'action',
      actionUrl: 'https://signup.mailgun.com'
    },
    {
      step: 2,
      title: 'Add Domain',
      description: 'Add and verify your sending domain',
      type: 'action',
      actionUrl: 'https://app.mailgun.com/app/domains'
    },
    {
      step: 3,
      title: 'Generate API Key',
      description: 'Create an API key for authentication',
      type: 'action',
      actionUrl: 'https://app.mailgun.com/app/account/security/api_keys'
    },
    {
      step: 4,
      title: 'Configure Environment Variables',
      description: 'Add your Mailgun configuration to environment variables',
      type: 'info'
    },
    {
      step: 5,
      title: 'Test Email Sending',
      description: 'Send a test email to verify the integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/mailgun/test'
    }
  ],
  pricing: {
    model: 'usage_based',
    freeTier: {
      requests: 5000,
      features: ['Email sending', 'Basic analytics'],
      limitations: ['5,000 emails/month', 'No advanced features']
    },
    usageBased: {
      unit: 'email',
      pricePerUnit: 0.0008,
      currency: 'USD',
      freeUnits: 5000
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Resend Email Provider
 */
export const RESEND_PROVIDER: IntegrationProvider = {
  id: 'resend',
  name: 'Resend',
  description: 'Modern email API for developers with React email support',
  category: 'email',
  logoUrl: 'https://resend.com/logo.png',
  websiteUrl: 'https://resend.com',
  documentationUrl: 'https://resend.com/docs',
  verified: true,
  popularityScore: 75,
  status: 'active',
  features: [
    {
      id: 'transactional',
      name: 'Transactional Emails',
      description: 'Send automated emails with modern APIs',
      available: true
    },
    {
      id: 'react_email',
      name: 'React Email Support',
      description: 'Build emails with React components',
      available: true
    },
    {
      id: 'templates',
      name: 'Email Templates',
      description: 'Create and manage email templates',
      available: true
    },
    {
      id: 'analytics',
      name: 'Email Analytics',
      description: 'Track email delivery and engagement',
      available: true
    },
    {
      id: 'webhooks',
      name: 'Event Webhooks',
      description: 'Real-time email event notifications',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'RESEND_API_KEY',
        description: 'Resend API key for email sending',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'RESEND_FROM_EMAIL',
        description: 'Default sender email address',
        required: true,
        type: 'email',
        securityLevel: 'private'
      }
    ],
    apiKeys: [
      {
        id: 'api_key',
        name: 'API Key',
        description: 'Resend API key for authentication',
        required: true,
        type: 'secret',
        obtainFrom: 'Resend Dashboard > API Keys',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'send_emails',
        name: 'Send Emails',
        description: 'Permission to send emails through Resend',
        required: true,
        scope: 'emails:send',
        grantFrom: 'Resend Dashboard > API Keys'
      },
      {
        id: 'read_analytics',
        name: 'Read Analytics',
        description: 'Access to email analytics and statistics',
        required: false,
        scope: 'emails:read',
        grantFrom: 'Resend Dashboard > API Keys'
      }
    ],
    webhooks: {
      endpoint: '/api/webhooks/resend',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'Resend-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'email.sent',
        'email.delivered',
        'email.bounced',
        'email.complained',
        'email.opened',
        'email.clicked'
      ],
      samplePayload: {
        type: 'email.sent',
        created_at: '2024-01-15T10:30:00Z',
        data: {
          id: 'email-id',
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          subject: 'Test Email'
        }
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create Resend Account',
      description: 'Sign up for a Resend account',
      type: 'action',
      actionUrl: 'https://resend.com/signup'
    },
    {
      step: 2,
      title: 'Add Domain',
      description: 'Add and verify your sending domain',
      type: 'action',
      actionUrl: 'https://resend.com/domains'
    },
    {
      step: 3,
      title: 'Generate API Key',
      description: 'Create an API key for authentication',
      type: 'action',
      actionUrl: 'https://resend.com/api-keys'
    },
    {
      step: 4,
      title: 'Configure Environment Variables',
      description: 'Add your Resend configuration to environment variables',
      type: 'info'
    },
    {
      step: 5,
      title: 'Test Email Sending',
      description: 'Send a test email to verify the integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/resend/test'
    }
  ],
  pricing: {
    model: 'usage_based',
    freeTier: {
      requests: 3000,
      features: ['Email sending', 'Basic analytics'],
      limitations: ['3,000 emails/month', 'No advanced features']
    },
    usageBased: {
      unit: 'email',
      pricePerUnit: 0.0004,
      currency: 'USD',
      freeUnits: 3000
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Email Integration Tests
 */
export const EMAIL_TESTS: IntegrationTest[] = [
  {
    id: 'sendgrid-connection',
    providerId: 'sendgrid',
    name: 'Connection Test',
    description: 'Test connection to SendGrid API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'sendgrid-send',
    providerId: 'sendgrid',
    name: 'Send Email Test',
    description: 'Send a test email through SendGrid',
    type: 'api_call',
    configuration: {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from SendGrid integration'
    }
  },
  {
    id: 'mailgun-connection',
    providerId: 'mailgun',
    name: 'Connection Test',
    description: 'Test connection to Mailgun API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'mailgun-send',
    providerId: 'mailgun',
    name: 'Send Email Test',
    description: 'Send a test email through Mailgun',
    type: 'api_call',
    configuration: {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from Mailgun integration'
    }
  },
  {
    id: 'resend-connection',
    providerId: 'resend',
    name: 'Connection Test',
    description: 'Test connection to Resend API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'resend-send',
    providerId: 'resend',
    name: 'Send Email Test',
    description: 'Send a test email through Resend',
    type: 'api_call',
    configuration: {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from Resend integration'
    }
  }
];

/**
 * Register email providers with the integration registry
 */
export function registerEmailProviders(): void {
  const registry = getIntegrationRegistry();
  
  registry.registerProvider(SENDGRID_PROVIDER);
  registry.registerProvider(MAILGUN_PROVIDER);
  registry.registerProvider(RESEND_PROVIDER);
  
  // Register tests
  EMAIL_TESTS.forEach(test => {
    registry['tests'].set(test.id, test);
  });
}
