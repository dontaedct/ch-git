/**
 * Webhook Marketplace & Templates API
 * 
 * Provides webhook templates, marketplace functionality, and
 * pre-configured integrations for common services.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

interface WebhookTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Category (e.g., 'payment', 'notification', 'integration') */
  category: string;
  /** Provider (e.g., 'stripe', 'github', 'slack') */
  provider: string;
  /** Template configuration */
  config: {
    /** Endpoint URL pattern */
    urlPattern: string;
    /** Required headers */
    headers: Record<string, string>;
    /** HMAC configuration */
    hmac: {
      headerName: string;
      signaturePrefix: string;
      algorithm: 'sha256' | 'sha1';
    };
    /** Event types this template handles */
    eventTypes: string[];
    /** Sample payload */
    samplePayload: Record<string, unknown>;
    /** Validation rules */
    validation: {
      requiredFields: string[];
      optionalFields: string[];
      fieldTypes: Record<string, string>;
    };
  };
  /** Template tags */
  tags: string[];
  /** Whether template is verified/tested */
  verified: boolean;
  /** Usage count */
  usageCount: number;
  /** Last updated */
  lastUpdated: string;
  /** Template author */
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface WebhookIntegration {
  /** Integration ID */
  id: string;
  /** Integration name */
  name: string;
  /** Integration description */
  description: string;
  /** Service provider */
  provider: string;
  /** Integration type */
  type: 'incoming' | 'outgoing' | 'bidirectional';
  /** Configuration requirements */
  requirements: {
    /** Required environment variables */
    envVars: string[];
    /** Required API keys */
    apiKeys: string[];
    /** Required permissions */
    permissions: string[];
  };
  /** Setup instructions */
  setupInstructions: string[];
  /** Template ID for this integration */
  templateId: string;
  /** Documentation URL */
  documentationUrl?: string;
  /** Support URL */
  supportUrl?: string;
  /** Whether integration is active */
  active: boolean;
  /** Popularity score */
  popularityScore: number;
}

/**
 * Get webhook templates and marketplace data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const provider = searchParams.get('provider');
    const verified = searchParams.get('verified') === 'true';
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    // Get templates
    const templates = getWebhookTemplates();
    let filteredTemplates = templates;

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    if (provider) {
      filteredTemplates = filteredTemplates.filter(t => t.provider === provider);
    }
    if (verified) {
      filteredTemplates = filteredTemplates.filter(t => t.verified);
    }

    filteredTemplates = filteredTemplates.slice(0, limit);

    // Get integrations
    const integrations = getWebhookIntegrations();
    let filteredIntegrations = integrations;

    if (provider) {
      filteredIntegrations = filteredIntegrations.filter(i => i.provider === provider);
    }

    // Get categories
    const categories = getCategories(templates);
    
    // Get providers
    const providers = getProviders(templates);

    return NextResponse.json(ok({
      templates: filteredTemplates,
      integrations: filteredIntegrations,
      categories,
      providers,
      totalTemplates: templates.length,
      totalIntegrations: integrations.length,
      generatedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Webhook marketplace error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'WEBHOOK_MARKETPLACE_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Create a new webhook template
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const template: Omit<WebhookTemplate, 'id' | 'usageCount' | 'lastUpdated'> = await request.json();

    // Validate template
    if (!template.name || !template.description || !template.config) {
      return NextResponse.json(
        fail('Missing required fields: name, description, config'),
        { status: 400 }
      );
    }

    // Generate template ID
    const id = generateTemplateId(template.name, template.provider);
    
    // Create new template
    const newTemplate: WebhookTemplate = {
      ...template,
      id,
      usageCount: 0,
      lastUpdated: new Date().toISOString()
    };

    // In a real implementation, this would save to database
    // For now, we'll just return the created template
    return NextResponse.json(ok({
      template: newTemplate,
      message: 'Template created successfully'
    }));

  } catch (error) {
    console.error('Webhook template creation error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'WEBHOOK_TEMPLATE_CREATION_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Get webhook templates
 */
function getWebhookTemplates(): WebhookTemplate[] {
  return [
    {
      id: 'stripe-payment-success',
      name: 'Stripe Payment Success',
      description: 'Handle successful payment events from Stripe',
      category: 'payment',
      provider: 'stripe',
      config: {
        urlPattern: '/api/webhooks/stripe',
        headers: {
          'Content-Type': 'application/json'
        },
        hmac: {
          headerName: 'Stripe-Signature',
          signaturePrefix: '',
          algorithm: 'sha256'
        },
        eventTypes: [
          'payment_intent.succeeded',
          'payment_intent.payment_failed',
          'invoice.payment_succeeded'
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
              status: 'succeeded'
            }
          }
        },
        validation: {
          requiredFields: ['id', 'type', 'data'],
          optionalFields: ['created', 'livemode'],
          fieldTypes: {
            id: 'string',
            type: 'string',
            data: 'object'
          }
        }
      },
      tags: ['payment', 'stripe', 'ecommerce'],
      verified: true,
      usageCount: 1250,
      lastUpdated: '2024-01-15T10:30:00Z',
      author: {
        name: 'Stripe Team',
        email: 'support@stripe.com',
        avatar: 'https://stripe.com/favicon.ico'
      }
    },
    {
      id: 'github-push-event',
      name: 'GitHub Push Event',
      description: 'Handle code push events from GitHub repositories',
      category: 'development',
      provider: 'github',
      config: {
        urlPattern: '/api/webhooks/github',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Event': 'push'
        },
        hmac: {
          headerName: 'X-Hub-Signature-256',
          signaturePrefix: 'sha256=',
          algorithm: 'sha256'
        },
        eventTypes: ['push', 'pull_request', 'issues'],
        samplePayload: {
          ref: 'refs/heads/main',
          repository: {
            name: 'my-repo',
            full_name: 'user/my-repo',
            html_url: 'https://github.com/user/my-repo'
          },
          commits: [
            {
              id: 'abc123',
              message: 'Fix bug in authentication',
              author: {
                name: 'John Doe',
                email: 'john@example.com'
              }
            }
          ]
        },
        validation: {
          requiredFields: ['ref', 'repository', 'commits'],
          optionalFields: ['head_commit', 'pusher'],
          fieldTypes: {
            ref: 'string',
            repository: 'object',
            commits: 'array'
          }
        }
      },
      tags: ['github', 'git', 'ci-cd', 'development'],
      verified: true,
      usageCount: 890,
      lastUpdated: '2024-01-10T14:20:00Z',
      author: {
        name: 'GitHub Team',
        email: 'support@github.com',
        avatar: 'https://github.com/favicon.ico'
      }
    },
    {
      id: 'slack-notification',
      name: 'Slack Notification',
      description: 'Send notifications to Slack channels',
      category: 'notification',
      provider: 'slack',
      config: {
        urlPattern: '/api/webhooks/slack',
        headers: {
          'Content-Type': 'application/json'
        },
        hmac: {
          headerName: 'X-Slack-Signature',
          signaturePrefix: 'v0=',
          algorithm: 'sha256'
        },
        eventTypes: ['message', 'notification', 'alert'],
        samplePayload: {
          text: 'Hello from webhook!',
          channel: '#general',
          username: 'webhook-bot',
          icon_emoji: ':robot_face:',
          attachments: [
            {
              color: 'good',
              fields: [
                {
                  title: 'Status',
                  value: 'Success',
                  short: true
                }
              ]
            }
          ]
        },
        validation: {
          requiredFields: ['text'],
          optionalFields: ['channel', 'username', 'attachments'],
          fieldTypes: {
            text: 'string',
            channel: 'string',
            username: 'string'
          }
        }
      },
      tags: ['slack', 'notification', 'team-communication'],
      verified: true,
      usageCount: 650,
      lastUpdated: '2024-01-08T09:15:00Z',
      author: {
        name: 'Slack Team',
        email: 'support@slack.com',
        avatar: 'https://slack.com/favicon.ico'
      }
    },
    {
      id: 'zapier-generic',
      name: 'Zapier Generic Webhook',
      description: 'Generic webhook template for Zapier integrations',
      category: 'integration',
      provider: 'zapier',
      config: {
        urlPattern: '/api/webhooks/zapier',
        headers: {
          'Content-Type': 'application/json'
        },
        hmac: {
          headerName: 'X-Zapier-Signature',
          signaturePrefix: 'sha256=',
          algorithm: 'sha256'
        },
        eventTypes: ['trigger', 'action', 'search'],
        samplePayload: {
          event: 'user.created',
          data: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
            created_at: '2024-01-15T10:30:00Z'
          },
          metadata: {
            source: 'api',
            version: '1.0'
          }
        },
        validation: {
          requiredFields: ['event', 'data'],
          optionalFields: ['metadata', 'timestamp'],
          fieldTypes: {
            event: 'string',
            data: 'object',
            metadata: 'object'
          }
        }
      },
      tags: ['zapier', 'automation', 'integration'],
      verified: true,
      usageCount: 420,
      lastUpdated: '2024-01-05T16:45:00Z',
      author: {
        name: 'Zapier Team',
        email: 'support@zapier.com',
        avatar: 'https://zapier.com/favicon.ico'
      }
    }
  ];
}

/**
 * Get webhook integrations
 */
function getWebhookIntegrations(): WebhookIntegration[] {
  return [
    {
      id: 'stripe-payments',
      name: 'Stripe Payments Integration',
      description: 'Complete Stripe payment processing with webhook handling',
      provider: 'stripe',
      type: 'incoming',
      requirements: {
        envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
        apiKeys: ['stripe_secret_key'],
        permissions: ['read:payments', 'write:payments']
      },
      setupInstructions: [
        '1. Create a Stripe account and get your API keys',
        '2. Set up webhook endpoints in Stripe dashboard',
        '3. Configure environment variables',
        '4. Test webhook delivery'
      ],
      templateId: 'stripe-payment-success',
      documentationUrl: 'https://stripe.com/docs/webhooks',
      supportUrl: 'https://support.stripe.com',
      active: true,
      popularityScore: 95
    },
    {
      id: 'github-ci-cd',
      name: 'GitHub CI/CD Integration',
      description: 'Automate deployments and notifications with GitHub webhooks',
      provider: 'github',
      type: 'incoming',
      requirements: {
        envVars: ['GITHUB_WEBHOOK_SECRET'],
        apiKeys: ['github_personal_token'],
        permissions: ['repo', 'workflow']
      },
      setupInstructions: [
        '1. Create a GitHub personal access token',
        '2. Set up webhook in repository settings',
        '3. Configure webhook secret',
        '4. Test with sample events'
      ],
      templateId: 'github-push-event',
      documentationUrl: 'https://docs.github.com/en/webhooks',
      supportUrl: 'https://support.github.com',
      active: true,
      popularityScore: 88
    },
    {
      id: 'slack-notifications',
      name: 'Slack Notifications',
      description: 'Send real-time notifications to Slack channels',
      provider: 'slack',
      type: 'outgoing',
      requirements: {
        envVars: ['SLACK_WEBHOOK_URL', 'SLACK_SIGNING_SECRET'],
        apiKeys: ['slack_bot_token'],
        permissions: ['chat:write', 'channels:read']
      },
      setupInstructions: [
        '1. Create a Slack app in your workspace',
        '2. Get webhook URL and signing secret',
        '3. Configure bot permissions',
        '4. Test message delivery'
      ],
      templateId: 'slack-notification',
      documentationUrl: 'https://api.slack.com/messaging/webhooks',
      supportUrl: 'https://slack.com/help',
      active: true,
      popularityScore: 82
    }
  ];
}

/**
 * Get categories from templates
 */
function getCategories(templates: WebhookTemplate[]): string[] {
  const categories = new Set(templates.map(t => t.category));
  return Array.from(categories).sort();
}

/**
 * Get providers from templates
 */
function getProviders(templates: WebhookTemplate[]): string[] {
  const providers = new Set(templates.map(t => t.provider));
  return Array.from(providers).sort();
}

/**
 * Generate template ID
 */
function generateTemplateId(name: string, provider: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanProvider = provider.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${cleanProvider}-${cleanName}-${Date.now()}`;
}
