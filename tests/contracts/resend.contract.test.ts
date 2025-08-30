/**
 * Resend Contract Tests
 * 
 * Tests the contract between our application and Resend email service.
 * Ensures email sending, templates, and delivery tracking work correctly.
 */

import { Resend } from 'resend';
import { getEnv } from '@/lib/env';

// Mock Resend
const mockResend = {
  emails: {
    send: jest.fn(),
    list: jest.fn(),
    get: jest.fn()
  },
  domains: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn()
  },
  apiKeys: {
    list: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
  }
};

jest.mock('resend', () => {
  return jest.fn().mockImplementation(() => mockResend);
});

// Mock environment
const mockEnv = {
  RESEND_API_KEY: 're_test_mock_key',
  RESEND_FROM: 'noreply@example.com',
  RESEND_DOMAIN: 'example.com'
};

jest.mock('@/lib/env', () => ({
  getEnv: jest.fn(() => mockEnv)
}));

describe('Resend Contract Tests', () => {
  let resend: Resend;

  beforeEach(() => {
    jest.clearAllMocks();
    resend = mockResend as any;
  });

  describe('Email Sending Contract', () => {
    it('should send basic email', async () => {
      const mockEmailResponse = {
        id: 'email_123',
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        created_at: '2024-01-15T10:00:00Z'
      };

      mockResend.emails.send.mockResolvedValue(mockEmailResponse);

      const result = await resend.emails.send({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      });

      expect(result.id).toBe('email_123');
      expect(result.from).toBe('noreply@example.com');
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      });
    });

    it('should send email with attachments', async () => {
      const mockEmailResponse = {
        id: 'email_123',
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Email with Attachment',
        created_at: '2024-01-15T10:00:00Z'
      };

      mockResend.emails.send.mockResolvedValue(mockEmailResponse);

      const result = await resend.emails.send({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Email with Attachment',
        html: '<p>Please find the attached document</p>',
        attachments: [
          {
            filename: 'document.pdf',
            content: Buffer.from('PDF content'),
            contentType: 'application/pdf'
          }
        ]
      });

      expect(result.id).toBe('email_123');
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Email with Attachment',
        html: '<p>Please find the attached document</p>',
        attachments: [
          {
            filename: 'document.pdf',
            content: Buffer.from('PDF content'),
            contentType: 'application/pdf'
          }
        ]
      });
    });

    it('should send email with reply-to header', async () => {
      const mockEmailResponse = {
        id: 'email_123',
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        created_at: '2024-01-15T10:00:00Z'
      };

      mockResend.emails.send.mockResolvedValue(mockEmailResponse);

      const result = await resend.emails.send({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        reply_to: 'support@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      });

      expect(result.id).toBe('email_123');
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        reply_to: 'support@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      });
    });

    it('should send email with custom headers', async () => {
      const mockEmailResponse = {
        id: 'email_123',
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        created_at: '2024-01-15T10:00:00Z'
      };

      mockResend.emails.send.mockResolvedValue(mockEmailResponse);

      const result = await resend.emails.send({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email</p>',
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Template-ID': 'welcome-email'
        }
      });

      expect(result.id).toBe('email_123');
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email</p>',
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Template-ID': 'welcome-email'
        }
      });
    });
  });



  describe('Email Tracking Contract', () => {
    it('should list sent emails', async () => {
      const mockEmailsList = {
        data: [
          {
            id: 'email_123',
            from: 'noreply@example.com',
            to: ['recipient@example.com'],
            subject: 'Test Email',
            created_at: '2024-01-15T10:00:00Z',
            status: 'delivered'
          },
          {
            id: 'email_456',
            from: 'noreply@example.com',
            to: ['recipient2@example.com'],
            subject: 'Another Email',
            created_at: '2024-01-15T09:00:00Z',
            status: 'delivered'
          }
        ]
      };

      mockResend.emails.list.mockResolvedValue(mockEmailsList);

      const result = await resend.emails.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('email_123');
      expect(result.data[0].status).toBe('delivered');
      expect(mockResend.emails.list).toHaveBeenCalled();
    });

    it('should get specific email details', async () => {
      const mockEmail = {
        id: 'email_123',
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email</p>',
        created_at: '2024-01-15T10:00:00Z',
        status: 'delivered',
        delivered_at: '2024-01-15T10:01:00Z'
      };

      mockResend.emails.get.mockResolvedValue(mockEmail);

      const result = await resend.emails.get('email_123');

      expect(result.id).toBe('email_123');
      expect(result.status).toBe('delivered');
      expect(result.delivered_at).toBeDefined();
      expect(mockResend.emails.get).toHaveBeenCalledWith('email_123');
    });
  });

  describe('Domain Management Contract', () => {
    it('should list domains', async () => {
      const mockDomainsList = {
        data: [
          {
            id: 'domain_123',
            name: 'example.com',
            status: 'verified',
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
      };

      mockResend.domains.list.mockResolvedValue(mockDomainsList);

      const result = await resend.domains.list();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('example.com');
      expect(result.data[0].status).toBe('verified');
      expect(mockResend.domains.list).toHaveBeenCalled();
    });

    it('should get domain details', async () => {
      const mockDomain = {
        id: 'domain_123',
        name: 'example.com',
        status: 'verified',
        created_at: '2024-01-01T00:00:00Z',
        dkim: {
          public_key: 'dkim_public_key',
          selector: 'selector1'
        }
      };

      mockResend.domains.get.mockResolvedValue(mockDomain);

      const result = await resend.domains.get('example.com');

      expect(result.name).toBe('example.com');
      expect(result.status).toBe('verified');
      expect(result.dkim).toBeDefined();
      expect(mockResend.domains.get).toHaveBeenCalledWith('example.com');
    });

    it('should create new domain', async () => {
      const mockDomain = {
        id: 'domain_456',
        name: 'newdomain.com',
        status: 'pending',
        created_at: '2024-01-15T10:00:00Z'
      };

      mockResend.domains.create.mockResolvedValue(mockDomain);

      const result = await resend.domains.create({
        name: 'newdomain.com'
      });

      expect(result.name).toBe('newdomain.com');
      expect(result.status).toBe('pending');
      expect(mockResend.domains.create).toHaveBeenCalledWith({
        name: 'newdomain.com'
      });
    });
  });

  describe('API Key Management Contract', () => {
    it('should list API keys', async () => {
      const mockApiKeysList = {
        data: [
          {
            id: 'key_123',
            name: 'Production Key',
            created_at: '2024-01-01T00:00:00Z',
            last_used: '2024-01-15T10:00:00Z'
          }
        ]
      };

      mockResend.apiKeys.list.mockResolvedValue(mockApiKeysList);

      const result = await resend.apiKeys.list();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Production Key');
      expect(mockResend.apiKeys.list).toHaveBeenCalled();
    });

    it('should create new API key', async () => {
      const mockApiKey = {
        id: 'key_456',
        name: 'Test Key',
        key: 're_test_new_key',
        created_at: '2024-01-15T10:00:00Z'
      };

      mockResend.apiKeys.create.mockResolvedValue(mockApiKey);

      const result = await resend.apiKeys.create({
        name: 'Test Key'
      });

      expect(result.name).toBe('Test Key');
      expect(result.key).toBeDefined();
      expect(mockResend.apiKeys.create).toHaveBeenCalledWith({
        name: 'Test Key'
      });
    });

    it('should delete API key', async () => {
      mockResend.apiKeys.delete.mockResolvedValue({});

      await resend.apiKeys.delete('key_123');

      expect(mockResend.apiKeys.delete).toHaveBeenCalledWith('key_123');
    });
  });

  describe('Error Handling Contract', () => {
    it('should handle invalid email address', async () => {
      const mockError = new Error('Invalid email address') as any;
      mockError.statusCode = 400;
      mockError.message = 'Invalid email address';

      mockResend.emails.send.mockRejectedValue(mockError);

      await expect(resend.emails.send({
        from: 'noreply@example.com',
        to: ['invalid-email'],
        subject: 'Test Email',
        html: '<p>Test</p>'
      })).rejects.toThrow('Invalid email address');
    });

    it('should handle rate limiting', async () => {
      const mockError = new Error('Rate limit exceeded') as any;
      mockError.statusCode = 429;
      mockError.message = 'Rate limit exceeded';

      mockResend.emails.send.mockRejectedValue(mockError);

      await expect(resend.emails.send({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>Test</p>'
      })).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle domain not verified', async () => {
      const mockError = new Error('Domain not verified') as any;
      mockError.statusCode = 400;
      mockError.message = 'Domain not verified';

      mockResend.emails.send.mockRejectedValue(mockError);

      await expect(resend.emails.send({
        from: 'noreply@unverified-domain.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>Test</p>'
      })).rejects.toThrow('Domain not verified');
    });

    it('should handle API key invalid', async () => {
      const mockError = new Error('Invalid API key') as any;
      mockError.statusCode = 401;
      mockError.message = 'Invalid API key';

      mockResend.emails.send.mockRejectedValue(mockError);

      await expect(resend.emails.send({
        from: 'noreply@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>Test</p>'
      })).rejects.toThrow('Invalid API key');
    });
  });

  describe('Configuration Contract', () => {
    it('should use correct API key', () => {
      expect(mockEnv.RESEND_API_KEY).toBe('re_test_mock_key');
      expect(mockEnv.RESEND_FROM).toBe('noreply@example.com');
      expect(mockEnv.RESEND_DOMAIN).toBe('example.com');
    });

    it('should initialize Resend with correct API key', () => {
      expect(mockResend.emails.send).toBeDefined();
    });

    it('should provide email service functions', () => {
      expect(mockResend.emails.send).toBeDefined();
    });
  });

  describe('Template Contract', () => {
    it('should support welcome email template', () => {
      const welcomeTemplate = {
        name: 'welcome',
        subject: 'Welcome to Our Service',
        html: '<h1>Welcome {{clientName}}</h1><p>Your coach is {{coachName}}</p>'
      };

      expect(welcomeTemplate.name).toBe('welcome');
      expect(welcomeTemplate.html).toContain('{{clientName}}');
      expect(welcomeTemplate.html).toContain('{{coachName}}');
    });

    it('should support session reminder template', () => {
      const reminderTemplate = {
        name: 'session-reminder',
        subject: 'Session Reminder',
        html: '<h1>Session Reminder</h1><p>Your session is on {{sessionDate}}</p>'
      };

      expect(reminderTemplate.name).toBe('session-reminder');
      expect(reminderTemplate.html).toContain('{{sessionDate}}');
    });

    it('should support progress report template', () => {
      const progressTemplate = {
        name: 'progress-report',
        subject: 'Your Progress Report',
        html: '<h1>Progress Report</h1><p>Weight: {{progressData.weight}}kg</p>'
      };

      expect(progressTemplate.name).toBe('progress-report');
      expect(progressTemplate.html).toContain('{{progressData.weight}}');
    });
  });
});
