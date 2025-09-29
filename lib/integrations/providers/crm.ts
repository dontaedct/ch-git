/**
 * CRM Integrations
 * 
 * Integration with CRM platforms including HubSpot and Salesforce
 * for customer relationship management and data synchronization.
 */

import { IntegrationProvider, IntegrationTest } from '../types';
import { getIntegrationRegistry } from '../registry';

/**
 * HubSpot CRM Provider
 */
export const HUBSPOT_PROVIDER: IntegrationProvider = {
  id: 'hubspot',
  name: 'HubSpot',
  description: 'All-in-one CRM platform with marketing, sales, and service tools',
  category: 'crm',
  logoUrl: 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
  websiteUrl: 'https://www.hubspot.com',
  documentationUrl: 'https://developers.hubspot.com',
  verified: true,
  popularityScore: 90,
  status: 'active',
  features: [
    {
      id: 'contacts',
      name: 'Contact Management',
      description: 'Manage and organize customer contacts',
      available: true
    },
    {
      id: 'deals',
      name: 'Deal Tracking',
      description: 'Track sales opportunities and deals',
      available: true
    },
    {
      id: 'companies',
      name: 'Company Management',
      description: 'Manage company records and relationships',
      available: true
    },
    {
      id: 'automation',
      name: 'Workflow Automation',
      description: 'Automate marketing and sales processes',
      available: true
    },
    {
      id: 'analytics',
      name: 'Analytics & Reporting',
      description: 'Track performance and generate reports',
      available: true
    },
    {
      id: 'webhooks',
      name: 'Real-time Webhooks',
      description: 'Get notified of CRM events in real-time',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'HUBSPOT_ACCESS_TOKEN',
        description: 'HubSpot access token for API authentication',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'HUBSPOT_PORTAL_ID',
        description: 'HubSpot portal ID for your account',
        required: true,
        type: 'string',
        securityLevel: 'private'
      }
    ],
    apiKeys: [
      {
        id: 'access_token',
        name: 'Access Token',
        description: 'HubSpot access token for API authentication',
        required: true,
        type: 'token',
        obtainFrom: 'HubSpot Developer Account > Private Apps',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'read_contacts',
        name: 'Read Contacts',
        description: 'Access to read contact information',
        required: true,
        scope: 'crm.objects.contacts.read',
        grantFrom: 'HubSpot Private App Settings'
      },
      {
        id: 'write_contacts',
        name: 'Write Contacts',
        description: 'Permission to create and update contacts',
        required: true,
        scope: 'crm.objects.contacts.write',
        grantFrom: 'HubSpot Private App Settings'
      },
      {
        id: 'read_deals',
        name: 'Read Deals',
        description: 'Access to read deal information',
        required: false,
        scope: 'crm.objects.deals.read',
        grantFrom: 'HubSpot Private App Settings'
      },
      {
        id: 'write_deals',
        name: 'Write Deals',
        description: 'Permission to create and update deals',
        required: false,
        scope: 'crm.objects.deals.write',
        grantFrom: 'HubSpot Private App Settings'
      }
    ],
    webhooks: {
      endpoint: '/api/webhooks/hubspot',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-HubSpot-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'contact.creation',
        'contact.propertyChange',
        'deal.creation',
        'deal.propertyChange',
        'company.creation',
        'company.propertyChange'
      ],
      samplePayload: {
        eventId: 1234567890,
        subscriptionId: 12345,
        portalId: 12345678,
        appId: 123456,
        occurredAt: 1234567890,
        subscriptionType: 'contact.propertyChange',
        attemptNumber: 0,
        objectId: 123456789,
        changeSource: 'CRM_UI',
        changeFlag: 'NEW',
        propertyName: 'email',
        propertyValue: 'newemail@example.com'
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create HubSpot Account',
      description: 'Sign up for a HubSpot account',
      type: 'action',
      actionUrl: 'https://www.hubspot.com/products/get-started'
    },
    {
      step: 2,
      title: 'Create Private App',
      description: 'Create a private app in your HubSpot account',
      type: 'action',
      actionUrl: 'https://developers.hubspot.com/docs/api/private-apps'
    },
    {
      step: 3,
      title: 'Configure Scopes',
      description: 'Set the required scopes for your private app',
      type: 'info'
    },
    {
      step: 4,
      title: 'Get Access Token',
      description: 'Copy the access token from your private app',
      type: 'action',
      actionUrl: 'https://app.hubspot.com/private-apps'
    },
    {
      step: 5,
      title: 'Configure Environment Variables',
      description: 'Add your HubSpot configuration to environment variables',
      type: 'info'
    },
    {
      step: 6,
      title: 'Test Integration',
      description: 'Test the HubSpot integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/hubspot/test'
    }
  ],
  pricing: {
    model: 'freemium',
    freeTier: {
      requests: 100,
      features: ['Basic CRM', 'Contact management', 'Email tracking'],
      limitations: ['Limited contacts', 'Basic reporting', 'No automation']
    },
    paidTier: {
      startingPrice: 45,
      currency: 'USD',
      billingPeriod: 'month',
      features: ['Advanced CRM', 'Marketing automation', 'Sales analytics', 'Custom properties']
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Salesforce CRM Provider
 */
export const SALESFORCE_PROVIDER: IntegrationProvider = {
  id: 'salesforce',
  name: 'Salesforce',
  description: 'Leading CRM platform with extensive customization and enterprise features',
  category: 'crm',
  logoUrl: 'https://www.salesforce.com/content/dam/web/en_us/www/images/logo-salesforce.png',
  websiteUrl: 'https://www.salesforce.com',
  documentationUrl: 'https://developer.salesforce.com',
  verified: true,
  popularityScore: 92,
  status: 'active',
  features: [
    {
      id: 'leads',
      name: 'Lead Management',
      description: 'Track and manage sales leads',
      available: true
    },
    {
      id: 'opportunities',
      name: 'Opportunity Tracking',
      description: 'Manage sales opportunities and pipeline',
      available: true
    },
    {
      id: 'accounts',
      name: 'Account Management',
      description: 'Manage customer accounts and relationships',
      available: true
    },
    {
      id: 'custom_objects',
      name: 'Custom Objects',
      description: 'Create custom data objects and fields',
      available: true
    },
    {
      id: 'workflows',
      name: 'Process Automation',
      description: 'Automate business processes with workflows',
      available: true
    },
    {
      id: 'reports',
      name: 'Advanced Reporting',
      description: 'Create custom reports and dashboards',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'SALESFORCE_CLIENT_ID',
        description: 'Salesforce connected app client ID',
        required: true,
        type: 'string',
        securityLevel: 'private'
      },
      {
        name: 'SALESFORCE_CLIENT_SECRET',
        description: 'Salesforce connected app client secret',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'SALESFORCE_USERNAME',
        description: 'Salesforce username for authentication',
        required: true,
        type: 'string',
        securityLevel: 'private'
      },
      {
        name: 'SALESFORCE_PASSWORD',
        description: 'Salesforce password for authentication',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'SALESFORCE_SECURITY_TOKEN',
        description: 'Salesforce security token',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'SALESFORCE_INSTANCE_URL',
        description: 'Salesforce instance URL',
        required: true,
        type: 'url',
        securityLevel: 'private'
      }
    ],
    apiKeys: [
      {
        id: 'client_credentials',
        name: 'Client Credentials',
        description: 'Salesforce connected app client ID and secret',
        required: true,
        type: 'secret',
        obtainFrom: 'Salesforce Setup > App Manager > Connected Apps',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'api_access',
        name: 'API Access',
        description: 'Access to Salesforce APIs',
        required: true,
        scope: 'api',
        grantFrom: 'Salesforce User Profile > System Permissions'
      },
      {
        id: 'read_data',
        name: 'Read Data',
        description: 'Permission to read CRM data',
        required: true,
        scope: 'read',
        grantFrom: 'Salesforce User Profile > Object Permissions'
      },
      {
        id: 'write_data',
        name: 'Write Data',
        description: 'Permission to create and update CRM data',
        required: true,
        scope: 'write',
        grantFrom: 'Salesforce User Profile > Object Permissions'
      }
    ],
    oauth: {
      authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
      tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
      scopes: ['api', 'refresh_token'],
      clientIdEnvVar: 'SALESFORCE_CLIENT_ID',
      clientSecretEnvVar: 'SALESFORCE_CLIENT_SECRET',
      redirectUri: '/api/integrations/salesforce/callback'
    },
    webhooks: {
      endpoint: '/api/webhooks/salesforce',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-Salesforce-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'Lead.created',
        'Lead.updated',
        'Opportunity.created',
        'Opportunity.updated',
        'Account.created',
        'Account.updated'
      ],
      samplePayload: {
        id: '00Q000000000000EAA',
        object: 'Lead',
        eventType: 'created',
        createdDate: '2024-01-15T10:30:00.000+0000',
        userId: '005000000000000AAA',
        sobject: {
          Id: '00Q000000000000EAA',
          FirstName: 'John',
          LastName: 'Doe',
          Email: 'john.doe@example.com',
          Company: 'Example Corp'
        }
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create Salesforce Account',
      description: 'Sign up for a Salesforce account or use existing org',
      type: 'action',
      actionUrl: 'https://developer.salesforce.com/signup'
    },
    {
      step: 2,
      title: 'Create Connected App',
      description: 'Create a connected app in Salesforce Setup',
      type: 'action',
      actionUrl: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm'
    },
    {
      step: 3,
      title: 'Configure OAuth Settings',
      description: 'Set up OAuth settings in your connected app',
      type: 'info'
    },
    {
      step: 4,
      title: 'Get User Credentials',
      description: 'Get your Salesforce username, password, and security token',
      type: 'info'
    },
    {
      step: 5,
      title: 'Configure Environment Variables',
      description: 'Add your Salesforce configuration to environment variables',
      type: 'info'
    },
    {
      step: 6,
      title: 'Test Integration',
      description: 'Test the Salesforce integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/salesforce/test'
    }
  ],
  pricing: {
    model: 'paid',
    paidTier: {
      startingPrice: 25,
      currency: 'USD',
      billingPeriod: 'month',
      features: ['Full CRM', 'Custom objects', 'Workflow automation', 'Advanced reporting']
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * CRM Integration Tests
 */
export const CRM_TESTS: IntegrationTest[] = [
  {
    id: 'hubspot-connection',
    providerId: 'hubspot',
    name: 'Connection Test',
    description: 'Test connection to HubSpot API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'hubspot-contacts',
    providerId: 'hubspot',
    name: 'Contacts API Test',
    description: 'Test HubSpot contacts API',
    type: 'api_call',
    configuration: {
      endpoint: '/crm/v3/objects/contacts',
      method: 'GET'
    }
  },
  {
    id: 'hubspot-create-contact',
    providerId: 'hubspot',
    name: 'Create Contact Test',
    description: 'Test creating a contact in HubSpot',
    type: 'api_call',
    configuration: {
      endpoint: '/crm/v3/objects/contacts',
      method: 'POST',
      data: {
        properties: {
          email: 'test@example.com',
          firstname: 'Test',
          lastname: 'User'
        }
      }
    }
  },
  {
    id: 'salesforce-connection',
    providerId: 'salesforce',
    name: 'Connection Test',
    description: 'Test connection to Salesforce API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'salesforce-oauth',
    providerId: 'salesforce',
    name: 'OAuth Test',
    description: 'Test Salesforce OAuth authentication',
    type: 'authentication',
    configuration: {}
  },
  {
    id: 'salesforce-leads',
    providerId: 'salesforce',
    name: 'Leads API Test',
    description: 'Test Salesforce leads API',
    type: 'api_call',
    configuration: {
      endpoint: '/services/data/v58.0/sobjects/Lead',
      method: 'GET'
    }
  }
];

/**
 * Register CRM providers with the integration registry
 */
export function registerCrmProviders(): void {
  const registry = getIntegrationRegistry();
  
  registry.registerProvider(HUBSPOT_PROVIDER);
  registry.registerProvider(SALESFORCE_PROVIDER);
  
  // Register tests
  CRM_TESTS.forEach(test => {
    registry['tests'].set(test.id, test);
  });
}
