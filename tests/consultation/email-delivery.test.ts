import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock Resend
const mockResend = {
  emails: {
    send: jest.fn(),
  },
};

jest.mock('resend', () => ({
  Resend: jest.fn(() => mockResend),
}));

// Mock Nodemailer
const mockNodemailer = {
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
    verify: jest.fn(() => Promise.resolve(true)),
  })),
};

jest.mock('nodemailer', () => mockNodemailer);

// Mock Handlebars for email templates
jest.mock('handlebars', () => ({
  compile: jest.fn((template) => (data: any) =>
    template.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => data[key] || match)
  ),
}));

// Mock file system for template reading
jest.mock('fs', () => ({
  readFileSync: jest.fn((path: string) => {
    if (path.includes('consultation-report.hbs')) {
      return `
        <h1>Consultation Report for {{client_name}}</h1>
        <p>Company: {{company}}</p>
        <p>Business Type: {{business_type}}</p>
        <h2>Analysis</h2>
        <p>{{analysis}}</p>
        <h2>Recommendations</h2>
        {{#each recommendations}}
        <div>
          <h3>{{title}}</h3>
          <p>{{description}}</p>
          <p>Price: {{price}}</p>
        </div>
        {{/each}}
      `;
    }
    if (path.includes('follow-up.hbs')) {
      return `
        <h1>Thank you for your consultation, {{client_name}}!</h1>
        <p>We've prepared your consultation report and next steps.</p>
        <p>Next Steps:</p>
        <ul>
        {{#each next_steps}}
        <li>{{this}}</li>
        {{/each}}
        </ul>
      `;
    }
    return 'Default template content';
  }),
  existsSync: jest.fn(() => true),
}));

describe('Email Delivery Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'test-password';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Consultation Report Email Delivery', () => {
    it('should send consultation report email via Resend', async () => {
      mockResend.emails.send.mockResolvedValueOnce({
        id: 'email-123',
        from: 'noreply@example.com',
        to: 'client@example.com',
        subject: 'Your Consultation Report',
      });

      const { sendConsultationReport } = await import('../../lib/email/consultation-templates');

      const consultationData = {
        id: 'test-consultation-id',
        client: {
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Corp'
        },
        responses: {
          business_type: 'SaaS',
          team_size: '10-50',
          budget: '$10k-50k'
        },
        analysis: 'Your SaaS business shows strong growth potential.',
        recommendations: [
          {
            title: 'Enterprise Growth Package',
            description: 'Comprehensive solution for scaling',
            price: '$25,000',
            timeline: '3-4 months'
          }
        ],
        next_steps: [
          'Schedule discovery call',
          'Review technical requirements'
        ],
        pdf_attachment: Buffer.from('mock-pdf-content'),
        created_at: new Date().toISOString()
      };

      const result = await sendConsultationReport(consultationData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          to: 'john@example.com',
          subject: expect.stringContaining('Consultation Report'),
          html: expect.stringContaining('John Doe'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: expect.stringContaining('.pdf'),
              content: expect.any(Buffer)
            })
          ])
        })
      );
    });

    it('should use proper email templates with client data', async () => {
      mockResend.emails.send.mockResolvedValueOnce({
        id: 'email-123',
      });

      const { sendConsultationReport } = await import('../../lib/email/consultation-templates');

      const consultationData = {
        id: 'test-consultation-id',
        client: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          company: 'Tech Startup Inc'
        },
        responses: {
          business_type: 'E-commerce',
          team_size: '5-10'
        },
        analysis: 'E-commerce optimization needed.',
        recommendations: [
          {
            title: 'E-commerce Package',
            description: 'Specialized e-commerce solution',
            price: '$15,000'
          }
        ],
        next_steps: ['Review current setup'],
        pdf_attachment: Buffer.from('mock-pdf-content'),
        created_at: new Date().toISOString()
      };

      await sendConsultationReport(consultationData);

      const emailCall = mockResend.emails.send.mock.calls[0][0];
      expect(emailCall.html).toContain('Jane Smith');
      expect(emailCall.html).toContain('Tech Startup Inc');
      expect(emailCall.html).toContain('E-commerce');
      expect(emailCall.html).toContain('E-commerce optimization needed');
    });

    it('should handle email template customization for different business types', async () => {
      mockResend.emails.send.mockResolvedValueOnce({
        id: 'email-123',
      });

      const { sendConsultationReportWithTemplate } = await import('../../lib/email/consultation-templates');

      const consultationData = {
        id: 'test-consultation-id',
        client: {
          name: 'Enterprise Client',
          email: 'enterprise@example.com',
          company: 'Big Corp'
        },
        responses: {
          business_type: 'Enterprise',
          team_size: '100+'
        },
        analysis: 'Enterprise-level transformation needed.',
        recommendations: [],
        next_steps: [],
        pdf_attachment: Buffer.from('mock-pdf-content'),
        created_at: new Date().toISOString()
      };

      const template = 'enterprise';
      await sendConsultationReportWithTemplate(consultationData, template);

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Enterprise')
        })
      );
    });
  });

  describe('Follow-up Email Automation', () => {
    it('should send automated follow-up emails', async () => {
      mockResend.emails.send.mockResolvedValueOnce({
        id: 'followup-email-123',
      });

      const { sendFollowUpEmail } = await import('../../lib/consultation/email-automation');

      const consultationData = {
        id: 'test-consultation-id',
        client: {
          name: 'Follow Up Client',
          email: 'followup@example.com',
          company: 'Follow Up Corp'
        },
        next_steps: [
          'Review the consultation report',
          'Schedule a follow-up call',
          'Prepare technical requirements'
        ],
        created_at: new Date().toISOString()
      };

      const result = await sendFollowUpEmail(consultationData, 1); // Day 1 follow-up

      expect(result.success).toBe(true);
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'followup@example.com',
          subject: expect.stringContaining('Follow-up'),
          html: expect.stringContaining('Follow Up Client')
        })
      );
    });

    it('should schedule multiple follow-up emails in sequence', async () => {
      const { scheduleFollowUpSequence } = await import('../../lib/consultation/email-automation');

      const consultationData = {
        id: 'test-consultation-id',
        client: {
          name: 'Sequence Client',
          email: 'sequence@example.com',
          company: 'Sequence Corp'
        },
        next_steps: ['Step 1', 'Step 2', 'Step 3'],
        created_at: new Date().toISOString()
      };

      const sequence = await scheduleFollowUpSequence(consultationData);

      expect(sequence).toBeDefined();
      expect(sequence.emails).toHaveLength(3); // Day 1, 3, 7 follow-ups
      expect(sequence.emails[0].delay_hours).toBe(24);
      expect(sequence.emails[1].delay_hours).toBe(72);
      expect(sequence.emails[2].delay_hours).toBe(168);
    });
  });

  describe('Email Template System', () => {
    it('should load and compile email templates correctly', async () => {
      const { loadEmailTemplate } = await import('../../lib/email/consultation-templates');

      const template = await loadEmailTemplate('consultation-report');

      expect(template).toBeDefined();
      expect(typeof template).toBe('function');

      const rendered = template({
        client_name: 'Test Client',
        company: 'Test Company',
        business_type: 'SaaS',
        analysis: 'Test analysis'
      });

      expect(rendered).toContain('Test Client');
      expect(rendered).toContain('Test Company');
      expect(rendered).toContain('SaaS');
    });

    it('should support template inheritance and customization', async () => {
      const { customizeEmailTemplate } = await import('../../lib/email/consultation-templates');

      const baseTemplate = 'consultation-report';
      const customizations = {
        header_color: '#007bff',
        company_logo: 'https://example.com/logo.png',
        footer_text: 'Custom footer text'
      };

      const customTemplate = await customizeEmailTemplate(baseTemplate, customizations);

      expect(customTemplate).toBeDefined();
      expect(typeof customTemplate).toBe('function');
    });

    it('should handle template variables and conditional content', async () => {
      const { renderEmailWithConditions } = await import('../../lib/email/consultation-templates');

      const templateData = {
        client_name: 'Conditional Client',
        company: 'Conditional Corp',
        business_type: 'SaaS',
        recommendations: [
          { title: 'Rec 1', show_pricing: true, price: '$10,000' },
          { title: 'Rec 2', show_pricing: false }
        ],
        show_next_steps: true,
        next_steps: ['Step 1', 'Step 2']
      };

      const rendered = await renderEmailWithConditions('consultation-report', templateData);

      expect(rendered).toContain('Conditional Client');
      expect(rendered).toContain('$10,000'); // Should show pricing for Rec 1
      expect(rendered).toContain('Step 1'); // Should show next steps
    });
  });

  describe('Multi-provider Email Delivery', () => {
    it('should fallback to SMTP when Resend fails', async () => {
      mockResend.emails.send.mockRejectedValueOnce(new Error('Resend API error'));

      const mockSendMail = jest.fn().mockResolvedValueOnce({
        messageId: 'smtp-message-123',
        accepted: ['fallback@example.com']
      });

      mockNodemailer.createTransport.mockReturnValueOnce({
        sendMail: mockSendMail,
        verify: jest.fn(() => Promise.resolve(true))
      });

      const { sendEmailWithFallback } = await import('../../lib/email/consultation-templates');

      const emailData = {
        to: 'fallback@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        attachments: []
      };

      const result = await sendEmailWithFallback(emailData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('smtp');
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'fallback@example.com',
          subject: 'Test Email',
          html: '<p>Test content</p>'
        })
      );
    });

    it('should handle multiple email provider configurations', async () => {
      const { configureEmailProviders } = await import('../../lib/email/consultation-templates');

      const providers = [
        { name: 'resend', priority: 1, api_key: 'resend-key' },
        { name: 'smtp', priority: 2, config: { host: 'smtp.example.com' } },
        { name: 'sendgrid', priority: 3, api_key: 'sendgrid-key' }
      ];

      const configuration = await configureEmailProviders(providers);

      expect(configuration.primary).toBe('resend');
      expect(configuration.fallbacks).toHaveLength(2);
      expect(configuration.fallbacks[0]).toBe('smtp');
    });
  });

  describe('Email Delivery Tracking', () => {
    it('should track email delivery status', async () => {
      mockResend.emails.send.mockResolvedValueOnce({
        id: 'tracked-email-123',
      });

      const { sendConsultationReportWithTracking } = await import('../../lib/email/consultation-templates');

      const consultationData = {
        id: 'test-consultation-id',
        client: {
          name: 'Tracked Client',
          email: 'tracked@example.com',
          company: 'Tracked Corp'
        },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [],
        next_steps: [],
        pdf_attachment: Buffer.from('mock-pdf-content'),
        created_at: new Date().toISOString()
      };

      const result = await sendConsultationReportWithTracking(consultationData);

      expect(result.tracking_id).toBe('tracked-email-123');
      expect(result.status).toBe('sent');
      expect(result.sent_at).toBeDefined();
    });

    it('should log email delivery events', async () => {
      const { logEmailEvent } = await import('../../lib/email/consultation-templates');

      const event = {
        email_id: 'test-email-123',
        event_type: 'delivered',
        timestamp: new Date().toISOString(),
        recipient: 'log@example.com',
        metadata: { provider: 'resend' }
      };

      const logged = await logEmailEvent(event);

      expect(logged.success).toBe(true);
      expect(logged.event_id).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle email delivery failures gracefully', async () => {
      mockResend.emails.send.mockRejectedValueOnce(new Error('Email delivery failed'));
      mockNodemailer.createTransport().sendMail.mockRejectedValueOnce(new Error('SMTP failed'));

      const { sendConsultationReport } = await import('../../lib/email/consultation-templates');

      const consultationData = {
        id: 'test-consultation-id',
        client: {
          name: 'Failed Client',
          email: 'failed@example.com',
          company: 'Failed Corp'
        },
        responses: { business_type: 'SaaS' },
        analysis: 'Test analysis',
        recommendations: [],
        next_steps: [],
        pdf_attachment: Buffer.from('mock-pdf-content'),
        created_at: new Date().toISOString()
      };

      const result = await sendConsultationReport(consultationData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email delivery failed');
    });

    it('should validate email addresses before sending', async () => {
      const { validateEmailAddress } = await import('../../lib/email/consultation-templates');

      expect(validateEmailAddress('valid@example.com')).toBe(true);
      expect(validateEmailAddress('invalid-email')).toBe(false);
      expect(validateEmailAddress('missing@')).toBe(false);
      expect(validateEmailAddress('')).toBe(false);
    });

    it('should handle template rendering errors', async () => {
      const { renderEmailTemplate } = await import('../../lib/email/consultation-templates');

      // Template with syntax error
      const invalidTemplate = '{{invalid syntax}}{{';
      const templateData = { client_name: 'Test' };

      await expect(
        renderEmailTemplate(invalidTemplate, templateData)
      ).rejects.toThrow();
    });
  });

  describe('Performance and Limits', () => {
    it('should send emails within time constraints', async () => {
      mockResend.emails.send.mockResolvedValueOnce({
        id: 'performance-email-123',
      });

      const { sendConsultationReport } = await import('../../lib/email/consultation-templates');

      const consultationData = {
        id: 'performance-test',
        client: {
          name: 'Performance Client',
          email: 'performance@example.com',
          company: 'Performance Corp'
        },
        responses: { business_type: 'SaaS' },
        analysis: 'Performance test analysis',
        recommendations: [],
        next_steps: [],
        pdf_attachment: Buffer.from('mock-pdf-content'),
        created_at: new Date().toISOString()
      };

      const startTime = Date.now();
      await sendConsultationReport(consultationData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // <5 seconds target
    });

    it('should handle rate limiting and queuing', async () => {
      const { queueEmailDelivery } = await import('../../lib/email/consultation-templates');

      const emails = Array.from({ length: 10 }, (_, i) => ({
        to: `user${i}@example.com`,
        subject: `Test Email ${i}`,
        html: `<p>Test content ${i}</p>`,
        priority: i < 5 ? 'high' : 'normal'
      }));

      const queuedEmails = await queueEmailDelivery(emails);

      expect(queuedEmails).toHaveLength(10);
      expect(queuedEmails.filter(e => e.priority === 'high')).toHaveLength(5);
    });

    it('should respect email size limits', async () => {
      const { checkEmailSizeLimits } = await import('../../lib/email/consultation-templates');

      const largeAttachment = Buffer.alloc(30 * 1024 * 1024); // 30MB
      const normalAttachment = Buffer.alloc(5 * 1024 * 1024); // 5MB

      const emailWithLargeAttachment = {
        to: 'test@example.com',
        subject: 'Large Email',
        html: '<p>Test</p>',
        attachments: [{ filename: 'large.pdf', content: largeAttachment }]
      };

      const emailWithNormalAttachment = {
        to: 'test@example.com',
        subject: 'Normal Email',
        html: '<p>Test</p>',
        attachments: [{ filename: 'normal.pdf', content: normalAttachment }]
      };

      expect(checkEmailSizeLimits(emailWithLargeAttachment)).toBe(false);
      expect(checkEmailSizeLimits(emailWithNormalAttachment)).toBe(true);
    });
  });
});