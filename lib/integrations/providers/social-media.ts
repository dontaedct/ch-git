/**
 * Social Media Integrations
 * 
 * Integration with social media platforms for content sharing,
 * social login, and social media management.
 */

import { IntegrationProvider, IntegrationTest } from '../types';
import { getIntegrationRegistry } from '../registry';

/**
 * Twitter/X Social Media Provider
 */
export const TWITTER_PROVIDER: IntegrationProvider = {
  id: 'twitter',
  name: 'Twitter/X',
  description: 'Social media platform for microblogging and real-time communication',
  category: 'social_media',
  logoUrl: 'https://abs.twimg.com/favicons/twitter.3.ico',
  websiteUrl: 'https://twitter.com',
  documentationUrl: 'https://developer.twitter.com',
  verified: true,
  popularityScore: 88,
  status: 'active',
  features: [
    {
      id: 'tweet_posting',
      name: 'Tweet Posting',
      description: 'Post tweets and media content',
      available: true
    },
    {
      id: 'user_timeline',
      name: 'User Timeline',
      description: 'Access user timelines and feeds',
      available: true
    },
    {
      id: 'social_login',
      name: 'Social Login',
      description: 'Authenticate users with Twitter accounts',
      available: true
    },
    {
      id: 'mentions',
      name: 'Mentions & Replies',
      description: 'Handle mentions and reply to tweets',
      available: true
    },
    {
      id: 'analytics',
      name: 'Tweet Analytics',
      description: 'Track tweet performance and engagement',
      available: true
    },
    {
      id: 'webhooks',
      name: 'Real-time Webhooks',
      description: 'Receive real-time tweet events',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'TWITTER_API_KEY',
        description: 'Twitter API key for authentication',
        required: true,
        type: 'string',
        securityLevel: 'private'
      },
      {
        name: 'TWITTER_API_SECRET',
        description: 'Twitter API secret key',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'TWITTER_ACCESS_TOKEN',
        description: 'Twitter access token for user authentication',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'TWITTER_ACCESS_TOKEN_SECRET',
        description: 'Twitter access token secret',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'TWITTER_BEARER_TOKEN',
        description: 'Twitter bearer token for app-only authentication',
        required: false,
        type: 'string',
        securityLevel: 'critical'
      }
    ],
    apiKeys: [
      {
        id: 'api_credentials',
        name: 'API Credentials',
        description: 'Twitter API key and secret',
        required: true,
        type: 'secret',
        obtainFrom: 'Twitter Developer Portal > Apps > API Keys',
        securityLevel: 'critical'
      },
      {
        id: 'access_tokens',
        name: 'Access Tokens',
        description: 'User access tokens for authenticated requests',
        required: true,
        type: 'token',
        obtainFrom: 'Twitter Developer Portal > Apps > Keys and Tokens',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'read_tweets',
        name: 'Read Tweets',
        description: 'Read tweets and user information',
        required: true,
        scope: 'tweet.read',
        grantFrom: 'Twitter Developer Portal > App Settings'
      },
      {
        id: 'write_tweets',
        name: 'Write Tweets',
        description: 'Post tweets and manage content',
        required: true,
        scope: 'tweet.write',
        grantFrom: 'Twitter Developer Portal > App Settings'
      },
      {
        id: 'read_users',
        name: 'Read Users',
        description: 'Read user profiles and information',
        required: true,
        scope: 'users.read',
        grantFrom: 'Twitter Developer Portal > App Settings'
      },
      {
        id: 'follow_users',
        name: 'Follow Users',
        description: 'Follow and unfollow users',
        required: false,
        scope: 'follows.write',
        grantFrom: 'Twitter Developer Portal > App Settings'
      }
    ],
    oauth: {
      authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      scopes: ['tweet.read', 'tweet.write', 'users.read', 'follows.write'],
      clientIdEnvVar: 'TWITTER_API_KEY',
      clientSecretEnvVar: 'TWITTER_API_SECRET',
      redirectUri: '/api/integrations/twitter/callback'
    },
    webhooks: {
      endpoint: '/api/webhooks/twitter',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-Twitter-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'tweet.created',
        'tweet.deleted',
        'user.followed',
        'user.unfollowed',
        'mention.received'
      ],
      samplePayload: {
        id: '1234567890123456789',
        text: 'Hello Twitter!',
        author_id: '1234567890',
        created_at: '2024-01-15T10:30:00.000Z',
        public_metrics: {
          retweet_count: 0,
          like_count: 0,
          reply_count: 0,
          quote_count: 0
        }
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create Twitter Developer Account',
      description: 'Apply for a Twitter Developer account',
      type: 'action',
      actionUrl: 'https://developer.twitter.com/en/portal/dashboard'
    },
    {
      step: 2,
      title: 'Create Twitter App',
      description: 'Create a new app in the Twitter Developer Portal',
      type: 'action',
      actionUrl: 'https://developer.twitter.com/en/portal/dashboard'
    },
    {
      step: 3,
      title: 'Get API Keys',
      description: 'Copy your API keys and secrets from the app settings',
      type: 'info'
    },
    {
      step: 4,
      title: 'Generate Access Tokens',
      description: 'Generate access tokens for your app',
      type: 'info'
    },
    {
      step: 5,
      title: 'Configure OAuth Settings',
      description: 'Set up OAuth 2.0 settings for social login',
      type: 'info'
    },
    {
      step: 6,
      title: 'Configure Environment Variables',
      description: 'Add your Twitter configuration to environment variables',
      type: 'info'
    },
    {
      step: 7,
      title: 'Test Integration',
      description: 'Test the Twitter integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/twitter/test'
    }
  ],
  pricing: {
    model: 'freemium',
    freeTier: {
      requests: 500000,
      features: ['Basic API access', 'Tweet posting', 'User data'],
      limitations: ['Rate limits', 'Limited advanced features']
    },
    paidTier: {
      startingPrice: 100,
      currency: 'USD',
      billingPeriod: 'month',
      features: ['Higher rate limits', 'Advanced analytics', 'Premium support']
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * LinkedIn Social Media Provider
 */
export const LINKEDIN_PROVIDER: IntegrationProvider = {
  id: 'linkedin',
  name: 'LinkedIn',
  description: 'Professional networking platform for business connections and content sharing',
  category: 'social_media',
  logoUrl: 'https://static-exp1.licdn.com/sc/h/1bt1uwq5akv756knzdj4l6cdc',
  websiteUrl: 'https://www.linkedin.com',
  documentationUrl: 'https://docs.microsoft.com/en-us/linkedin',
  verified: true,
  popularityScore: 85,
  status: 'active',
  features: [
    {
      id: 'content_sharing',
      name: 'Content Sharing',
      description: 'Share posts and articles on LinkedIn',
      available: true
    },
    {
      id: 'company_pages',
      name: 'Company Pages',
      description: 'Manage company pages and content',
      available: true
    },
    {
      id: 'social_login',
      name: 'Social Login',
      description: 'Authenticate users with LinkedIn accounts',
      available: true
    },
    {
      id: 'profile_data',
      name: 'Profile Data',
      description: 'Access user profile information',
      available: true
    },
    {
      id: 'messaging',
      name: 'Messaging',
      description: 'Send and receive LinkedIn messages',
      available: true
    },
    {
      id: 'analytics',
      name: 'Content Analytics',
      description: 'Track content performance and engagement',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'LINKEDIN_CLIENT_ID',
        description: 'LinkedIn app client ID',
        required: true,
        type: 'string',
        securityLevel: 'private'
      },
      {
        name: 'LINKEDIN_CLIENT_SECRET',
        description: 'LinkedIn app client secret',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'LINKEDIN_ACCESS_TOKEN',
        description: 'LinkedIn access token for API calls',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      }
    ],
    apiKeys: [
      {
        id: 'client_credentials',
        name: 'Client Credentials',
        description: 'LinkedIn app client ID and secret',
        required: true,
        type: 'secret',
        obtainFrom: 'LinkedIn Developer Portal > Apps',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'read_profile',
        name: 'Read Profile',
        description: 'Read user profile information',
        required: true,
        scope: 'r_liteprofile',
        grantFrom: 'LinkedIn Developer Portal > App Settings'
      },
      {
        id: 'read_email',
        name: 'Read Email',
        description: 'Read user email address',
        required: true,
        scope: 'r_emailaddress',
        grantFrom: 'LinkedIn Developer Portal > App Settings'
      },
      {
        id: 'share_content',
        name: 'Share Content',
        description: 'Share content on behalf of users',
        required: true,
        scope: 'w_member_social',
        grantFrom: 'LinkedIn Developer Portal > App Settings'
      },
      {
        id: 'read_company',
        name: 'Read Company',
        description: 'Read company information',
        required: false,
        scope: 'r_organization_social',
        grantFrom: 'LinkedIn Developer Portal > App Settings'
      }
    ],
    oauth: {
      authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
      clientIdEnvVar: 'LINKEDIN_CLIENT_ID',
      clientSecretEnvVar: 'LINKEDIN_CLIENT_SECRET',
      redirectUri: '/api/integrations/linkedin/callback'
    },
    webhooks: {
      endpoint: '/api/webhooks/linkedin',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-LinkedIn-Signature',
        signaturePrefix: '',
        algorithm: 'sha256'
      },
      events: [
        'profile.updated',
        'post.created',
        'post.updated',
        'connection.created',
        'message.received'
      ],
      samplePayload: {
        id: 'urn:li:activity:1234567890',
        actor: 'urn:li:person:1234567890',
        verb: 'share',
        object: 'urn:li:ugcPost:1234567890',
        created: {
          time: 1234567890000
        },
        content: {
          title: 'Shared Post',
          description: 'This is a shared post on LinkedIn'
        }
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create LinkedIn Developer Account',
      description: 'Sign up for a LinkedIn Developer account',
      type: 'action',
      actionUrl: 'https://www.linkedin.com/developers'
    },
    {
      step: 2,
      title: 'Create LinkedIn App',
      description: 'Create a new app in the LinkedIn Developer Portal',
      type: 'action',
      actionUrl: 'https://www.linkedin.com/developers/apps'
    },
    {
      step: 3,
      title: 'Configure OAuth Settings',
      description: 'Set up OAuth 2.0 redirect URLs and scopes',
      type: 'info'
    },
    {
      step: 4,
      title: 'Get Client Credentials',
      description: 'Copy your client ID and secret from the app settings',
      type: 'info'
    },
    {
      step: 5,
      title: 'Request Product Access',
      description: 'Request access to LinkedIn products (Share on LinkedIn, etc.)',
      type: 'action',
      actionUrl: 'https://www.linkedin.com/developers/apps'
    },
    {
      step: 6,
      title: 'Configure Environment Variables',
      description: 'Add your LinkedIn configuration to environment variables',
      type: 'info'
    },
    {
      step: 7,
      title: 'Test Integration',
      description: 'Test the LinkedIn integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/linkedin/test'
    }
  ],
  pricing: {
    model: 'freemium',
    freeTier: {
      requests: 100000,
      features: ['Basic API access', 'Profile data', 'Content sharing'],
      limitations: ['Rate limits', 'Limited advanced features']
    },
    paidTier: {
      startingPrice: 50,
      currency: 'USD',
      billingPeriod: 'month',
      features: ['Higher rate limits', 'Advanced analytics', 'Premium support']
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Facebook/Meta Social Media Provider
 */
export const FACEBOOK_PROVIDER: IntegrationProvider = {
  id: 'facebook',
  name: 'Facebook/Meta',
  description: 'Social media platform for connecting people and sharing content',
  category: 'social_media',
  logoUrl: 'https://static.xx.fbcdn.net/rsrc.php/v3/yx/r/pyNVUg5EM0j.png',
  websiteUrl: 'https://www.facebook.com',
  documentationUrl: 'https://developers.facebook.com',
  verified: true,
  popularityScore: 90,
  status: 'active',
  features: [
    {
      id: 'page_management',
      name: 'Page Management',
      description: 'Manage Facebook pages and content',
      available: true
    },
    {
      id: 'social_login',
      name: 'Social Login',
      description: 'Authenticate users with Facebook accounts',
      available: true
    },
    {
      id: 'messaging',
      name: 'Messaging',
      description: 'Send and receive Facebook messages',
      available: true
    },
    {
      id: 'analytics',
      name: 'Page Analytics',
      description: 'Track page performance and insights',
      available: true
    },
    {
      id: 'advertising',
      name: 'Advertising API',
      description: 'Manage Facebook advertising campaigns',
      available: true
    },
    {
      id: 'webhooks',
      name: 'Real-time Webhooks',
      description: 'Receive real-time Facebook events',
      available: true
    }
  ],
  configuration: {
    envVars: [
      {
        name: 'FACEBOOK_APP_ID',
        description: 'Facebook app ID',
        required: true,
        type: 'string',
        securityLevel: 'public'
      },
      {
        name: 'FACEBOOK_APP_SECRET',
        description: 'Facebook app secret',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'FACEBOOK_ACCESS_TOKEN',
        description: 'Facebook access token for API calls',
        required: true,
        type: 'string',
        securityLevel: 'critical'
      },
      {
        name: 'FACEBOOK_PAGE_ID',
        description: 'Facebook page ID for page management',
        required: false,
        type: 'string',
        securityLevel: 'private'
      }
    ],
    apiKeys: [
      {
        id: 'app_credentials',
        name: 'App Credentials',
        description: 'Facebook app ID and secret',
        required: true,
        type: 'secret',
        obtainFrom: 'Facebook Developer Portal > Apps',
        securityLevel: 'critical'
      }
    ],
    permissions: [
      {
        id: 'read_user_profile',
        name: 'Read User Profile',
        description: 'Read user profile information',
        required: true,
        scope: 'public_profile',
        grantFrom: 'Facebook Developer Portal > App Settings'
      },
      {
        id: 'read_user_email',
        name: 'Read User Email',
        description: 'Read user email address',
        required: true,
        scope: 'email',
        grantFrom: 'Facebook Developer Portal > App Settings'
      },
      {
        id: 'manage_pages',
        name: 'Manage Pages',
        description: 'Manage Facebook pages',
        required: true,
        scope: 'pages_manage_posts',
        grantFrom: 'Facebook Developer Portal > App Settings'
      },
      {
        id: 'read_insights',
        name: 'Read Insights',
        description: 'Read page insights and analytics',
        required: false,
        scope: 'pages_read_insights',
        grantFrom: 'Facebook Developer Portal > App Settings'
      }
    ],
    oauth: {
      authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      scopes: ['public_profile', 'email', 'pages_manage_posts'],
      clientIdEnvVar: 'FACEBOOK_APP_ID',
      clientSecretEnvVar: 'FACEBOOK_APP_SECRET',
      redirectUri: '/api/integrations/facebook/callback'
    },
    webhooks: {
      endpoint: '/api/webhooks/facebook',
      headers: {
        'Content-Type': 'application/json'
      },
      hmac: {
        headerName: 'X-Hub-Signature-256',
        signaturePrefix: 'sha256=',
        algorithm: 'sha256'
      },
      events: [
        'page.feed',
        'page.messaging',
        'page.mention',
        'page.rating',
        'page.review'
      ],
      samplePayload: {
        object: 'page',
        entry: [
          {
            id: '1234567890',
            time: 1234567890,
            changes: [
              {
                value: {
                  from: {
                    id: '1234567890',
                    name: 'John Doe'
                  },
                  item: 'post',
                  post_id: '1234567890_1234567890',
                  verb: 'add',
                  created_time: 1234567890
                },
                field: 'feed'
              }
            ]
          }
        ]
      }
    }
  },
  setupInstructions: [
    {
      step: 1,
      title: 'Create Facebook Developer Account',
      description: 'Sign up for a Facebook Developer account',
      type: 'action',
      actionUrl: 'https://developers.facebook.com'
    },
    {
      step: 2,
      title: 'Create Facebook App',
      description: 'Create a new app in the Facebook Developer Portal',
      type: 'action',
      actionUrl: 'https://developers.facebook.com/apps'
    },
    {
      step: 3,
      title: 'Add Products',
      description: 'Add required products (Facebook Login, Pages API, etc.)',
      type: 'info'
    },
    {
      step: 4,
      title: 'Configure OAuth Settings',
      description: 'Set up OAuth redirect URLs and permissions',
      type: 'info'
    },
    {
      step: 5,
      title: 'Get App Credentials',
      description: 'Copy your app ID and secret from the app settings',
      type: 'info'
    },
    {
      step: 6,
      title: 'Configure Environment Variables',
      description: 'Add your Facebook configuration to environment variables',
      type: 'info'
    },
    {
      step: 7,
      title: 'Test Integration',
      description: 'Test the Facebook integration',
      type: 'verification',
      verificationEndpoint: '/api/integrations/facebook/test'
    }
  ],
  pricing: {
    model: 'freemium',
    freeTier: {
      requests: 200,
      features: ['Basic API access', 'Social login', 'Page management'],
      limitations: ['Rate limits', 'Limited advanced features']
    },
    paidTier: {
      startingPrice: 0,
      currency: 'USD',
      billingPeriod: 'month',
      features: ['Higher rate limits', 'Advanced features', 'Premium support']
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Social Media Integration Tests
 */
export const SOCIAL_MEDIA_TESTS: IntegrationTest[] = [
  {
    id: 'twitter-connection',
    providerId: 'twitter',
    name: 'Connection Test',
    description: 'Test connection to Twitter API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'twitter-post-tweet',
    providerId: 'twitter',
    name: 'Post Tweet Test',
    description: 'Test posting a tweet',
    type: 'api_call',
    configuration: {
      text: 'Test tweet from integration! 🚀'
    }
  },
  {
    id: 'linkedin-connection',
    providerId: 'linkedin',
    name: 'Connection Test',
    description: 'Test connection to LinkedIn API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'linkedin-share-post',
    providerId: 'linkedin',
    name: 'Share Post Test',
    description: 'Test sharing a post on LinkedIn',
    type: 'api_call',
    configuration: {
      text: 'Test post from integration!',
      visibility: 'PUBLIC'
    }
  },
  {
    id: 'facebook-connection',
    providerId: 'facebook',
    name: 'Connection Test',
    description: 'Test connection to Facebook API',
    type: 'connection',
    configuration: {}
  },
  {
    id: 'facebook-page-post',
    providerId: 'facebook',
    name: 'Page Post Test',
    description: 'Test posting to Facebook page',
    type: 'api_call',
    configuration: {
      message: 'Test post from integration!',
      access_token: 'page_access_token'
    }
  }
];

/**
 * Register social media providers with the integration registry
 */
export function registerSocialMediaProviders(): void {
  const registry = getIntegrationRegistry();
  
  registry.registerProvider(TWITTER_PROVIDER);
  registry.registerProvider(LINKEDIN_PROVIDER);
  registry.registerProvider(FACEBOOK_PROVIDER);
  
  // Register tests
  SOCIAL_MEDIA_TESTS.forEach(test => {
    registry['tests'].set(test.id, test);
  });
}
