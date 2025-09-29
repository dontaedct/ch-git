/**
 * Analytics Integrations
 * 
 * Integration with analytics platforms including Google Analytics
 * and Mixpanel for user behavior tracking and insights.
 */

import { IntegrationProvider, IntegrationTest } from '../types';
import { getIntegrationRegistry } from '../registry';

/**
 * Google Analytics Provider
 */
export const GOOGLE_ANALYTICS_PROVIDER: IntegrationProvider = {
  id: 'google-analytics',
  name: 'Google Analytics',
  description: 'Comprehensive web analytics platform for tracking user behavior and website performance',
  category: 'analytics',
  logoUrl: 'https://www.google-analytics.com/analytics-web/assets/media/ga4-logo.png',
  websiteUrl: 'https://analytics.google.com',
  documentationUrl: 'https://developers.google.com/analytics',
  verified: true,
  popularityScore: 95,
  status: 'active',
  features: [
    {
      id: 'page_tracking',
      name: 'Page Tracking',
      description: 'Track page views and user navigation',
      available: true
    },
    {
      id: 'event_tracking',
      name: 'Event Tracking',
      description: 'Track custom events and user interactions',
      available: true
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Tracking',
      description: 'Track online transactions and revenue',
      available: true
    },
    {
      id: 'audience_insights',
      name: 'Audience Insights',
      description: 'Understand your audience demographics and behavior',
      available: true
    },
    {
      id: 'conversion_tracking',
      name: 'Conversion Tracking',
      description: 'Track goals and conversion funnels',
      available: true
    },
    {
      id: 'real_time',
      name: 'Real-time Analytics',
      description: 'Monitor user activity in real-time',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'GOOGLE_ANALYTICS_MEASUREMENT_ID',
        description: 'Google Analytics 4 measurement ID',
        required: true,
        type: 'string',
        securityLevel: 'public'
      },
      {
        name: 'GOOGLE_ANALYTICS_API_SECRET',
        description: 'Google Analytics API secret for server-side tracking',
        required: false,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'GOOGLE_ANALYTICS_PROPERTY_ID',
        description: 'Google Analytics property ID',
        required: false,
        type: 'string',
        securityLevel: 'private'
      }
    ],
    apiKeys: [
      {
        id: 'measurement_id',
        name: 'Measurement ID',
        description: 'GA4 measurement ID for tracking',
        required: true,
        type: 'api_key',
        obtainFrom: 'Google Analytics > Admin > Data Streams',
        securityLevel: 'public'
      },
      {
        id: 'api_secret',
        name: 'API Secret',
        description: 'API secret for server-side tracking',
        required: false,
        type: 'secret',
        obtainFrom: 'Google Analytics > Admin > Data Streams > Measurement Protocol',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'read_analytics',
        name: 'Read Analytics Data',
        description: 'Access to read analytics data and reports',
        required: true,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        grantFrom: 'Google Cloud Console > APIs & Services > Credentials'
      },
      {
        id: 'write_analytics',
        name: 'Write Analytics Data',
        description: 'Permission to send data to Google Analytics',
        required: true,
        scope: 'https://www.googleapis.com/auth/analytics',
        grantFrom: 'Google Cloud Console > APIs & Services > Credentials'
      }
    ],
    oauth: {
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/analytics'
      ],
      clientIdEnvVar: 'GOOGLE_ANALYTICS_CLIENT_ID',
      clientSecretEnvVar: 'GOOGLE_ANALYTICS_CLIENT_SECRET',
      redirectUri: '/api/integrations/google-analytics/callback'
    },
    webhooks: {
      endpoint: '/api/webhooks/google-analytics',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-Google-Analytics-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'measurement_protocol',
        'data_import',
        'audience_trigger'
      ],
      samplePayload: {
        measurement_id: 'G-XXXXXXXXXX',
        client_id: '123456789.1234567890',
        events: [
          {
            name: 'page_view',
            params: {
              page_title: 'Home Page',
              page_location: 'https://example.com'
            }
          }
        ]
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create Google Analytics Account',
      description: 'Set up a Google Analytics 4 property',
      type: 'action',
      actionUrl: 'https://analytics.google.com'
    },
    {
      step: 2,
      title: 'Create Data Stream',
      description: 'Create a web data stream for your website',
      type: 'action',
      actionUrl: 'https://support.google.com/analytics/answer/9304153'
    },
    {
      step: 3,
      title: 'Get Measurement ID',
      description: 'Copy your measurement ID from the data stream',
      type: 'info'
    },
    {
      step: 4,
      title: 'Set Up API Secret',
      description: 'Create an API secret for server-side tracking (optional)',
      type: 'action',
      actionUrl: 'https://support.google.com/analytics/answer/9539308'
    },
    {
      step: 5,
      title: 'Configure Environment Variables',
      description: 'Add your Google Analytics configuration to environment variables',
      type: 'info'
    },
    {
      step: 6,
      title: 'Test Integration',
      description: 'Test the Google Analytics integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/google-analytics/test'
    }
  ],
  pricing: {
    model: 'free',
    freeTier: {
      requests: 10000000,
      features: ['Basic analytics', 'Real-time reports', 'Audience insights'],
      limitations: ['Data retention limits', 'Limited custom dimensions']
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Mixpanel Analytics Provider
 */
export const MIXPANEL_PROVIDER: IntegrationProvider = {
  id: 'mixpanel',
  name: 'Mixpanel',
  description: 'Advanced product analytics platform for tracking user behavior and product insights',
  category: 'analytics',
  logoUrl: 'https://mixpanel.com/img/mixpanel-logo.png',
  websiteUrl: 'https://mixpanel.com',
  documentationUrl: 'https://developer.mixpanel.com',
  verified: true,
  popularityScore: 85,
  status: 'active',
  features: [
    {
      id: 'event_tracking',
      name: 'Event Tracking',
      description: 'Track detailed user events and interactions',
      available: true
    },
    {
      id: 'funnel_analysis',
      name: 'Funnel Analysis',
      description: 'Analyze user conversion funnels',
      available: true
    },
    {
      id: 'cohort_analysis',
      name: 'Cohort Analysis',
      description: 'Track user retention and engagement over time',
      available: true
    },
    {
      id: 'user_profiles',
      name: 'User Profiles',
      description: 'Build detailed user profiles and segments',
      available: true
    },
    {
      id: 'a_b_testing',
      name: 'A/B Testing',
      description: 'Run experiments and A/B tests',
      available: true
    },
    {
      id: 'insights',
      name: 'Insights & Alerts',
      description: 'Get automated insights and alerts',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'MIXPANEL_PROJECT_TOKEN',
        description: 'Mixpanel project token for tracking',
        required: true,
        type: 'string',
        securityLevel: 'public'
      },
      {
        name: 'MIXPANEL_API_SECRET',
        description: 'Mixpanel API secret for server-side operations',
        required: false,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'MIXPANEL_SERVICE_ACCOUNT_USERNAME',
        description: 'Mixpanel service account username',
        required: false,
        type: 'string',
        securityLevel: 'private'
      },
      {
        name: 'MIXPANEL_SERVICE_ACCOUNT_SECRET',
        description: 'Mixpanel service account secret',
        required: false,
        type: 'string',
        securityLevel: 'critical'
      }
    ],
    apiKeys: [
      {
        id: 'project_token',
        name: 'Project Token',
        description: 'Mixpanel project token for event tracking',
        required: true,
        type: 'api_key',
        obtainFrom: 'Mixpanel Dashboard > Project Settings',
        securityLevel: 'public'
      },
      {
        id: 'api_secret',
        name: 'API Secret',
        description: 'API secret for server-side operations',
        required: false,
        type: 'secret',
        obtainFrom: 'Mixpanel Dashboard > Project Settings > Service Accounts',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'track_events',
        name: 'Track Events',
        description: 'Permission to send events to Mixpanel',
        required: true,
        scope: 'track',
        grantFrom: 'Mixpanel Project Settings'
      },
      {
        id: 'read_data',
        name: 'Read Data',
        description: 'Access to read analytics data',
        required: false,
        scope: 'read',
        grantFrom: 'Mixpanel Service Account Settings'
      },
      {
        id: 'export_data',
        name: 'Export Data',
        description: 'Permission to export data from Mixpanel',
        required: false,
        scope: 'export',
        grantFrom: 'Mixpanel Service Account Settings'
      }
    ],
    webhooks: {
      endpoint: '/api/webhooks/mixpanel',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-Mixpanel-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'insight_alert',
        'funnel_alert',
        'cohort_alert',
        'retention_alert'
      ],
      samplePayload: {
        alert_id: '12345',
        alert_name: 'High Conversion Rate',
        alert_type: 'insight',
        project_id: 12345,
        timestamp: 1234567890,
        data: {
          metric: 'conversion_rate',
          value: 0.15,
          threshold: 0.10
        }
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create Mixpanel Account',
      description: 'Sign up for a Mixpanel account',
      type: 'action',
      actionUrl: 'https://mixpanel.com/register'
    },
    {
      step: 2,
      title: 'Create Project',
      description: 'Create a new project in Mixpanel',
      type: 'action',
      actionUrl: 'https://mixpanel.com/projects'
    },
    {
      step: 3,
      title: 'Get Project Token',
      description: 'Copy your project token from project settings',
      type: 'info'
    },
    {
      step: 4,
      title: 'Set Up Service Account',
      description: 'Create a service account for server-side operations (optional)',
      type: 'action',
      actionUrl: 'https://developer.mixpanel.com/docs/service-accounts'
    },
    {
      step: 5,
      title: 'Configure Environment Variables',
      description: 'Add your Mixpanel configuration to environment variables',
      type: 'info'
    },
    {
      step: 6,
      title: 'Test Integration',
      description: 'Test the Mixpanel integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/mixpanel/test'
    }
  ],
  pricing: {
    model: 'freemium',
    freeTier: {
      requests: 100000,
      features: ['Event tracking', 'Basic funnels', 'User profiles'],
      limitations: ['Limited data retention', 'Basic support']
    },
    paidTier: {
      startingPrice: 25,
      currency: 'USD',
      billingPeriod: 'month',
      features: ['Advanced analytics', 'Cohort analysis', 'A/B testing', 'Priority support']
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Analytics Integration Tests
 */
export const ANALYTICS_TESTS: IntegrationTest[] = [
  {
    id: 'google-analytics-connection',
    providerId: 'google-analytics',
    name: 'Connection Test',
    description: 'Test connection to Google Analytics API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'google-analytics-tracking',
    providerId: 'google-analytics',
    name: 'Event Tracking Test',
    description: 'Test sending events to Google Analytics',
    type: 'api_call',
    configuration: {
      event: {
        name: 'test_event',
        parameters: {
          page_title: 'Test Page',
          page_location: 'https://example.com/test'
        }
      }
    }
  },
  {
    id: 'google-analytics-measurement',
    providerId: 'google-analytics',
    name: 'Measurement Protocol Test',
    description: 'Test Google Analytics Measurement Protocol',
    type: 'api_call',
    configuration: {
      measurement_id: 'G-XXXXXXXXXX',
      client_id: 'test-client-id',
      events: [
        {
          name: 'page_view',
          params: {
            page_title: 'Test Page',
            page_location: 'https://example.com'
          }
        }
      ]
    }
  },
  {
    id: 'mixpanel-connection',
    providerId: 'mixpanel',
    name: 'Connection Test',
    description: 'Test connection to Mixpanel API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'mixpanel-tracking',
    providerId: 'mixpanel',
    name: 'Event Tracking Test',
    description: 'Test sending events to Mixpanel',
    type: 'api_call',
    configuration: {
      event: 'test_event',
      properties: {
        distinct_id: 'test-user',
        page: 'Test Page',
        timestamp: new Date().toISOString()
      }
    }
  },
  {
    id: 'mixpanel-profile',
    providerId: 'mixpanel',
    name: 'User Profile Test',
    description: 'Test creating user profiles in Mixpanel',
    type: 'api_call',
    configuration: {
      distinct_id: 'test-user',
      properties: {
        $name: 'Test User',
        $email: 'test@example.com',
        plan: 'premium'
      }
    }
  }
];

/**
 * Register analytics providers with the integration registry
 */
export function registerAnalyticsProviders(): void {
  const registry = getIntegrationRegistry();
  
  registry.registerProvider(GOOGLE_ANALYTICS_PROVIDER);
  registry.registerProvider(MIXPANEL_PROVIDER);
  
  // Register tests
  ANALYTICS_TESTS.forEach(test => {
    registry['tests'].set(test.id, test);
  });
}
