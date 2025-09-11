/**
 * @fileoverview Comprehensive Test Suite for Brand-Specific Email Templates
 * @module tests/branding/email-templates.test
 * @author OSS Hero System
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { DynamicEmailRenderer, EmailTemplateContext } from '@/lib/branding/email-templates';
import { MarketingEmailRenderer, MarketingEmailContext } from '@/lib/branding/marketing-templates';
import { BrandAwareEmailRenderer, EmailStylingConfig } from '@/lib/branding/email-styling';
import { EmailCustomizationManager } from '@/lib/branding/email-customization';
import { DEFAULT_BRAND_CONFIG } from '@/lib/branding/logo-manager';

describe('HT-011.3.5: Brand-Specific Email Templates', () => {
  let emailRenderer: DynamicEmailRenderer;
  let marketingRenderer: MarketingEmailRenderer;
  let emailStyler: BrandAwareEmailRenderer;
  let customizationManager: EmailCustomizationManager;
  
  beforeEach(() => {
    emailRenderer = new DynamicEmailRenderer(DEFAULT_BRAND_CONFIG.brandName);
    marketingRenderer = new MarketingEmailRenderer(DEFAULT_BRAND_CONFIG.brandName);
    emailStyler = new BrandAwareEmailRenderer({
      brandNames: DEFAULT_BRAND_CONFIG.brandName,
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b'
    });
    customizationManager = new EmailCustomizationManager();
  });

  describe('DynamicEmailRenderer', () => {
    describe('Transactional Email Templates', () => {
      it('should render welcome email with brand variables', () => {
        const context: Partial<EmailTemplateContext> = {
          coachName: 'John Doe'
        };
        
        const result = emailRenderer.renderWelcome(context);
        
        expect(result.subject).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
        expect(result.html).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
        expect(result.html).toContain('John Doe');
        expect(result.subject).toBe('Welcome to ' + DEFAULT_BRAND_CONFIG.brandName.appName);
      });

      it('should render invite email with session details', () => {
        const context: Partial<EmailTemplateContext> = {
          sessionTitle: 'Weekly Planning Session',
          sessionDate: '2025-09-10 2:00 PM',
          sessionLocation: 'Conference Room A',
          stripeLink: 'https://stripe.com/pay'
        };
        
        const result = emailRenderer.renderInvite(context);
        
        expect(result.subject).toContain('Weekly Planning Session');
        expect(result.html).toContain('Weekly Planning Session');
        expect(result.html).toContain('2025-09-10 2:00 PM');
        expect(result.html).toContain('Conference Room A');
        expect(result.html).toContain('https://stripe.com/pay');
      });

      it('should render confirmation email with session details', () => {
        const context: Partial<EmailTemplateContext> = {
          sessionTitle: 'Team Meeting',
          sessionDate: '2025-09-11 10:00 AM',
          sessionLocation: 'Main Office'
        };
        
        const result = emailRenderer.renderConfirmation(context);
        
        expect(result.subject).toContain('Team Meeting');
        expect(result.html).toContain('Team Meeting');
        expect(result.html).toContain('2025-09-11 10:00 AM');
        expect(result.html).toContain('Main Office');
      });

      it('should render plan ready email with week details', () => {
        const context: Partial<EmailTemplateContext> = {
          weekStart: 'September 9, 2025',
          viewUrl: 'https://app.example.com/plan'
        };
        
        const result = emailRenderer.renderPlanReady(context);
        
        expect(result.subject).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
        expect(result.html).toContain('September 9, 2025');
        expect(result.html).toContain('https://app.example.com/plan');
      });

      it('should render check-in reminder email with link', () => {
        const context: Partial<EmailTemplateContext> = {
          checkInLink: 'https://app.example.com/checkin'
        };
        
        const result = emailRenderer.renderCheckInReminder(context);
        
        expect(result.subject).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
        expect(result.html).toContain('https://app.example.com/checkin');
      });

      it('should render weekly recap email with summary', () => {
        const context: Partial<EmailTemplateContext> = {
          summaryHtml: '<p>Great progress this week!</p>'
        };
        
        const result = emailRenderer.renderWeeklyRecap(context);
        
        expect(result.subject).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
        expect(result.html).toContain('<p>Great progress this week!</p>');
      });
    });

    describe('Email Wrapping and Styling', () => {
      it('should wrap HTML with brand-aware styling', () => {
        const innerHtml = '<h2>Test Email</h2><p>This is a test.</p>';
        const title = 'Test Email';
        
        const result = emailRenderer.wrapHtml(innerHtml, title);
        
        expect(result).toContain('<!DOCTYPE html>');
        expect(result).toContain('<title>Test Email</title>');
        expect(result).toContain('<h2>Test Email</h2>');
        expect(result).toContain('<p>This is a test.</p>');
        expect(result).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
      });

      it('should render email button with brand styling', () => {
        const result = emailRenderer.renderButton('Click Here', 'https://example.com');
        
        expect(result).toContain('Click Here');
        expect(result).toContain('https://example.com');
        expect(result).toContain('background-color');
        expect(result).toContain('text-align: center');
      });

      it('should render email link with brand styling', () => {
        const result = emailRenderer.renderLink('Visit Site', 'https://example.com');
        
        expect(result).toContain('Visit Site');
        expect(result).toContain('https://example.com');
        expect(result).toContain('color:');
      });
    });

    describe('Brand Configuration Updates', () => {
      it('should update brand configuration', () => {
        const newBrandConfig = {
          appName: 'New App',
          organizationName: 'New Org',
          fullBrand: 'New App by New Org',
          shortBrand: 'New App',
          navBrand: 'New App',
          initials: 'NA'
        };
        
        emailRenderer.updateBrandConfig(newBrandConfig);
        
        const result = emailRenderer.renderWelcome();
        expect(result.subject).toContain('New App');
        expect(result.html).toContain('New App');
      });

      it('should update styling configuration', () => {
        const newStylingConfig: Partial<EmailStylingConfig> = {
          primaryColor: '#ef4444',
          secondaryColor: '#6b7280'
        };
        
        emailRenderer.updateStylingConfig(newStylingConfig);
        
        const result = emailRenderer.renderButton('Test', 'https://example.com');
        expect(result).toContain('#ef4444');
      });
    });
  });

  describe('MarketingEmailRenderer', () => {
    describe('Marketing Email Templates', () => {
      it('should render newsletter email with marketing content', () => {
        const context: Partial<MarketingEmailContext> = {
          campaignName: 'Monthly Newsletter',
          ctaText: 'Read More',
          ctaUrl: 'https://example.com/newsletter',
          unsubscribeUrl: 'https://example.com/unsubscribe'
        };
        
        const result = marketingRenderer.renderNewsletter(context);
        
        expect(result.subject).toContain('Monthly Newsletter');
        expect(result.html).toContain('Monthly Newsletter');
        expect(result.html).toContain('Read More');
        expect(result.html).toContain('https://example.com/newsletter');
        expect(result.html).toContain('https://example.com/unsubscribe');
      });

      it('should render promotional email with offer details', () => {
        const context: Partial<MarketingEmailContext> = {
          offerCode: 'SAVE20',
          discountPercent: '20',
          expirationDate: 'December 31, 2025',
          ctaText: 'Claim Discount',
          ctaUrl: 'https://example.com/offer',
          socialLinks: {
            facebook: 'https://facebook.com/example',
            twitter: 'https://twitter.com/example'
          }
        };
        
        const result = marketingRenderer.renderPromotional(context);
        
        expect(result.subject).toContain('SAVE20');
        expect(result.html).toContain('20%');
        expect(result.html).toContain('SAVE20');
        expect(result.html).toContain('December 31, 2025');
        expect(result.html).toContain('Claim Discount');
        expect(result.html).toContain('https://example.com/offer');
        expect(result.html).toContain('Facebook');
        expect(result.html).toContain('Twitter');
      });

      it('should render product announcement email', () => {
        const context: Partial<MarketingEmailContext> = {
          campaignName: 'New Feature Launch',
          ctaText: 'Try Now',
          ctaUrl: 'https://example.com/new-feature',
          unsubscribeUrl: 'https://example.com/unsubscribe'
        };
        
        const result = marketingRenderer.renderProductAnnouncement(context);
        
        expect(result.subject).toContain('New Feature Launch');
        expect(result.html).toContain('New Feature Launch');
        expect(result.html).toContain('Try Now');
        expect(result.html).toContain('https://example.com/new-feature');
      });

      it('should render event invitation email', () => {
        const context: Partial<MarketingEmailContext> = {
          campaignName: 'Annual Conference 2025',
          date: 'March 15, 2025',
          time: '9:00 AM - 5:00 PM',
          location: 'Convention Center',
          ctaText: 'RSVP Now',
          ctaUrl: 'https://example.com/rsvp',
          expirationDate: 'March 1, 2025'
        };
        
        const result = marketingRenderer.renderEventInvitation(context);
        
        expect(result.subject).toContain('Annual Conference 2025');
        expect(result.html).toContain('Annual Conference 2025');
        expect(result.html).toContain('March 15, 2025');
        expect(result.html).toContain('9:00 AM - 5:00 PM');
        expect(result.html).toContain('Convention Center');
        expect(result.html).toContain('RSVP Now');
        expect(result.html).toContain('March 1, 2025');
      });
    });
  });

  describe('BrandAwareEmailRenderer', () => {
    describe('Email Styling System', () => {
      it('should generate brand-aware email styles', () => {
        const config: EmailStylingConfig = {
          brandNames: DEFAULT_BRAND_CONFIG.brandName,
          primaryColor: '#8b5cf6',
          secondaryColor: '#6b7280',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          linkColor: '#8b5cf6',
          borderColor: '#e5e7eb',
          fontFamily: 'Inter, sans-serif'
        };
        
        const customEmailStyler = new BrandAwareEmailRenderer(config);
        const result = customEmailStyler.renderEmail('<h2>Test</h2>', 'Test Email');
        
        expect(result).toContain('#8b5cf6');
        expect(result).toContain('#6b7280');
        expect(result).toContain('#ffffff');
        expect(result).toContain('#1f2937');
        expect(result).toContain('Inter, sans-serif');
        expect(result).toContain('Test Email');
      });

      it('should render email with custom styling', () => {
        const customConfig: Partial<EmailStylingConfig> = {
          primaryColor: '#ef4444',
          backgroundColor: '#fef2f2'
        };
        
        emailStyler.updateStylingConfig(customConfig);
        
        const result = emailStyler.renderEmail('<h2>Test</h2>', 'Test Email');
        
        expect(result).toContain('#ef4444');
        expect(result).toContain('#fef2f2');
      });
    });
  });

  describe('EmailCustomizationManager', () => {
    describe('Template Management', () => {
      it('should get all templates', () => {
        const templates = customizationManager.getAllTemplates();
        
        expect(templates).toHaveLength(10);
        expect(templates.some(t => t.id === 'welcome')).toBe(true);
        expect(templates.some(t => t.id === 'newsletter')).toBe(true);
      });

      it('should get template by ID', () => {
        const template = customizationManager.getTemplate('welcome');
        
        expect(template).toBeDefined();
        expect(template?.id).toBe('welcome');
        expect(template?.category).toBe('transactional');
      });

      it('should update template configuration', () => {
        const success = customizationManager.updateTemplate('welcome', {
          customSubject: 'Custom Welcome Subject',
          enabled: false
        });
        
        expect(success).toBe(true);
        
        const template = customizationManager.getTemplate('welcome');
        expect(template?.customSubject).toBe('Custom Welcome Subject');
        expect(template?.enabled).toBe(false);
      });

      it('should create custom template', () => {
        const customTemplate = {
          id: 'custom-template',
          name: 'Custom Template',
          description: 'A custom email template',
          category: 'transactional' as const,
          variables: ['customVar'],
          enabled: true
        };
        
        const success = customizationManager.createTemplate(customTemplate);
        
        expect(success).toBe(true);
        
        const template = customizationManager.getTemplate('custom-template');
        expect(template).toBeDefined();
        expect(template?.name).toBe('Custom Template');
      });

      it('should delete template', () => {
        const success = customizationManager.deleteTemplate('welcome');
        
        expect(success).toBe(true);
        
        const template = customizationManager.getTemplate('welcome');
        expect(template).toBeUndefined();
      });
    });

    describe('Preset Management', () => {
      it('should get all presets', () => {
        const presets = customizationManager.getAllPresets();
        
        expect(presets).toHaveLength(4);
        expect(presets.some(p => p.id === 'professional')).toBe(true);
        expect(presets.some(p => p.id === 'modern')).toBe(true);
      });

      it('should get preset by ID', () => {
        const preset = customizationManager.getPreset('professional');
        
        expect(preset).toBeDefined();
        expect(preset?.id).toBe('professional');
        expect(preset?.name).toBe('Professional');
      });

      it('should set active preset', () => {
        const success = customizationManager.setActivePreset('modern');
        
        expect(success).toBe(true);
        
        const activePreset = customizationManager.getActivePreset();
        expect(activePreset?.id).toBe('modern');
      });

      it('should create custom preset', () => {
        const customPreset = {
          id: 'custom-preset',
          name: 'Custom Preset',
          description: 'A custom email preset',
          templates: [],
          styling: {
            brandNames: DEFAULT_BRAND_CONFIG.brandName,
            primaryColor: '#10b981'
          },
          brandNames: DEFAULT_BRAND_CONFIG.brandName
        };
        
        const success = customizationManager.createPreset(customPreset);
        
        expect(success).toBe(true);
        
        const preset = customizationManager.getPreset('custom-preset');
        expect(preset).toBeDefined();
        expect(preset?.name).toBe('Custom Preset');
      });
    });

    describe('Template Filtering', () => {
      it('should get templates by category', () => {
        const transactionalTemplates = customizationManager.getTemplatesByCategory('transactional');
        const marketingTemplates = customizationManager.getTemplatesByCategory('marketing');
        
        expect(transactionalTemplates.length).toBeGreaterThan(0);
        expect(marketingTemplates.length).toBeGreaterThan(0);
        expect(transactionalTemplates.every(t => t.category === 'transactional')).toBe(true);
        expect(marketingTemplates.every(t => t.category === 'marketing')).toBe(true);
      });

      it('should get enabled templates', () => {
        const enabledTemplates = customizationManager.getEnabledTemplates();
        
        expect(enabledTemplates.length).toBeGreaterThan(0);
        expect(enabledTemplates.every(t => t.enabled)).toBe(true);
      });
    });

    describe('Configuration Import/Export', () => {
      it('should export configuration', () => {
        const config = customizationManager.exportConfiguration();
        
        expect(config.templates).toBeDefined();
        expect(config.presets).toBeDefined();
        expect(config.activePreset).toBeDefined();
        expect(Array.isArray(config.templates)).toBe(true);
        expect(Array.isArray(config.presets)).toBe(true);
      });

      it('should import configuration', () => {
        const config = {
          templates: [
            {
              id: 'imported-template',
              name: 'Imported Template',
              description: 'An imported template',
              category: 'transactional' as const,
              variables: ['test'],
              enabled: true
            }
          ],
          presets: [
            {
              id: 'imported-preset',
              name: 'Imported Preset',
              description: 'An imported preset',
              templates: [],
              styling: {
                brandNames: DEFAULT_BRAND_CONFIG.brandName,
                primaryColor: '#f59e0b'
              },
              brandNames: DEFAULT_BRAND_CONFIG.brandName
            }
          ],
          activePreset: 'imported-preset'
        };
        
        const success = customizationManager.importConfiguration(config);
        
        expect(success).toBe(true);
        
        const template = customizationManager.getTemplate('imported-template');
        const preset = customizationManager.getPreset('imported-preset');
        const activePreset = customizationManager.getActivePreset();
        
        expect(template).toBeDefined();
        expect(preset).toBeDefined();
        expect(activePreset?.id).toBe('imported-preset');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should integrate all email systems together', () => {
      // Test transactional email with custom styling
      const transactionalResult = emailRenderer.renderWelcome({ coachName: 'Jane Doe' });
      expect(transactionalResult.subject).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
      
      // Test marketing email with custom styling
      const marketingResult = marketingRenderer.renderNewsletter({
        campaignName: 'Test Campaign',
        ctaText: 'Learn More',
        ctaUrl: 'https://example.com'
      });
      expect(marketingResult.subject).toContain('Test Campaign');
      
      // Test email styling
      const styledResult = emailStyler.renderEmail('<h2>Test</h2>', 'Test Title');
      expect(styledResult).toContain('Test Title');
      
      // Test customization manager
      const templates = customizationManager.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should handle missing variables gracefully', () => {
      const result = emailRenderer.renderWelcome({});
      
      expect(result.subject).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
      expect(result.html).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
      expect(result.html).not.toContain('undefined');
      expect(result.html).not.toContain('null');
    });

    it('should maintain brand consistency across all templates', () => {
      const templates = [
        emailRenderer.renderWelcome(),
        emailRenderer.renderInvite({ sessionTitle: 'Test Session' }),
        marketingRenderer.renderNewsletter({ campaignName: 'Test Campaign' })
      ];
      
      templates.forEach(template => {
        expect(template.subject).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
        expect(template.html).toContain(DEFAULT_BRAND_CONFIG.brandName.appName);
      });
    });
  });
});
