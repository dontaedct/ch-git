/**
 * @fileoverview Dynamic Email Template System
 * @module lib/branding/email-templates
 * @author OSS Hero System
 * @version 1.0.0
 */

import { BrandNameConfig } from './logo-manager';
import { BrandAwareEmailRenderer, EmailStylingConfig } from './email-styling';

export interface EmailTemplateContext {
  brandNames: BrandNameConfig;
  clientName?: string;
  coachName?: string;
  sessionTitle?: string;
  sessionDate?: string;
  sessionLocation?: string;
  stripeLink?: string;
  planTitle?: string;
  weekStart?: string;
  viewUrl?: string;
  checkInLink?: string;
  summaryHtml?: string;
  date?: string;
  // Marketing variables
  campaignName?: string;
  offerCode?: string;
  discountPercent?: string;
  expirationDate?: string;
  ctaText?: string;
  ctaUrl?: string;
  unsubscribeUrl?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  time?: string;
  location?: string;
  [key: string]: string | object | undefined;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Process email template with brand and context variables
 */
export function processEmailTemplate(
  template: string,
  context: EmailTemplateContext
): string {
  const { brandNames, ...variables } = context;
  
  let processedTemplate = template
    // Brand variables
    .replace(/\{brandName\}/g, brandNames.appName)
    .replace(/\{organizationName\}/g, brandNames.organizationName)
    .replace(/\{fullBrand\}/g, brandNames.fullBrand)
    .replace(/\{shortBrand\}/g, brandNames.shortBrand)
    .replace(/\{navBrand\}/g, brandNames.navBrand)
    // Legacy variables for backward compatibility
    .replace(/\{session_title\}/g, variables.sessionTitle || '')
    .replace(/\{coach_name\}/g, variables.coachName || '')
    .replace(/\{week_start\}/g, variables.weekStart || '')
    .replace(/\{view_url\}/g, variables.viewUrl || '')
    .replace(/\{check_in_link\}/g, variables.checkInLink || '')
    // Custom variables (camelCase)
    .replace(/\{clientName\}/g, variables.clientName || '')
    .replace(/\{coachName\}/g, variables.coachName || '')
    .replace(/\{planTitle\}/g, variables.planTitle || '')
    .replace(/\{sessionDate\}/g, variables.sessionDate || '')
    .replace(/\{sessionLocation\}/g, variables.sessionLocation || '')
    .replace(/\{stripeLink\}/g, variables.stripeLink || '')
    .replace(/\{summaryHtml\}/g, variables.summaryHtml || '')
    .replace(/\{date\}/g, variables.date || '')
    .replace(/\{sessionTitle\}/g, variables.sessionTitle || '')
    .replace(/\{weekStart\}/g, variables.weekStart || '')
    .replace(/\{viewUrl\}/g, variables.viewUrl || '')
    .replace(/\{checkInLink\}/g, variables.checkInLink || '')
    // Marketing variables
    .replace(/\{campaignName\}/g, variables.campaignName || '')
    .replace(/\{offerCode\}/g, variables.offerCode || '')
    .replace(/\{discountPercent\}/g, variables.discountPercent || '')
    .replace(/\{expirationDate\}/g, variables.expirationDate || '')
    .replace(/\{ctaText\}/g, variables.ctaText || '')
    .replace(/\{ctaUrl\}/g, variables.ctaUrl || '#')
    .replace(/\{unsubscribeUrl\}/g, variables.unsubscribeUrl || '#')
    .replace(/\{socialLinks\}/g, (variables.socialLinks as any) || '')
    .replace(/\{time\}/g, variables.time || '')
    .replace(/\{location\}/g, variables.location || '')
    // Social links
    .replace(/\{socialLinks\.facebook\}/g, variables.socialLinks?.facebook || '')
    .replace(/\{socialLinks\.twitter\}/g, variables.socialLinks?.twitter || '')
    .replace(/\{socialLinks\.linkedin\}/g, variables.socialLinks?.linkedin || '')
    .replace(/\{socialLinks\.instagram\}/g, variables.socialLinks?.instagram || '')
    // Other variables
    .replace(/\{time\}/g, variables.time || '')
    .replace(/\{location\}/g, variables.location || '');
  
  // Process conditional statements
  processedTemplate = processedTemplate
    // Handle conditional statements like {sessionLocation ? '...' : ''}
    .replace(/\{sessionLocation \? '([^']*)' : ''\}/g, (match, content) => {
      return variables.sessionLocation ? content.replace(/\{sessionLocation\}/g, variables.sessionLocation || '') : '';
    })
    .replace(/\{stripeLink \? '([^']*)' : ''\}/g, (match, content) => {
      return variables.stripeLink ? content.replace(/\{stripeLink\}/g, variables.stripeLink || '') : '';
    })
    .replace(/\{viewUrl \? '([^']*)' : ''\}/g, (match, content) => {
      return variables.viewUrl ? content.replace(/\{viewUrl\}/g, variables.viewUrl || '') : '';
    })
    .replace(/\{checkInLink \? '([^']*)' : ''\}/g, (match, content) => {
      return variables.checkInLink ? content.replace(/\{checkInLink\}/g, variables.checkInLink || '') : '';
    });
  
  return processedTemplate;
}

/**
 * Generate dynamic email from address
 */
export function generateEmailFrom(brandNames: BrandNameConfig): string {
  return `${brandNames.appName} <no-reply@example.com>`;
}

/**
 * Generate dynamic transactional footer
 */
export function generateTransactionalFooter(brandNames: BrandNameConfig): string {
  return `This is a transactional message from ${brandNames.appName}.`;
}

/**
 * Generate dynamic welcome message
 */
export function generateWelcomeMessage(brandNames: BrandNameConfig): string {
  return `Welcome to ${brandNames.appName}`;
}

/**
 * Generate dynamic page title
 */
export function generatePageTitle(brandNames: BrandNameConfig): string {
  return `${brandNames.appName} Template`;
}

/**
 * Generate dynamic page description
 */
export function generatePageDescription(brandNames: BrandNameConfig): string {
  return `A modern micro web application template for ${brandNames.organizationName}`;
}

/**
 * Dynamic email template renderer
 */
export class DynamicEmailRenderer {
  private brandNames: BrandNameConfig;
  private emailStyler: BrandAwareEmailRenderer;
  
  constructor(brandNames: BrandNameConfig, stylingConfig?: Partial<EmailStylingConfig>) {
    this.brandNames = brandNames;
    this.emailStyler = new BrandAwareEmailRenderer({
      brandNames,
      ...stylingConfig
    });
  }
  
  /**
   * Render welcome email template
   */
  renderWelcome(context: Partial<EmailTemplateContext> = {}): EmailTemplate {
    const fullContext = { brandNames: this.brandNames, ...context };
    
    const subject = processEmailTemplate('Welcome to {brandName}', fullContext);
    const html = processEmailTemplate(`
      <h2>Welcome to {brandName}</h2>
      <p>{coachName} will follow up with your next steps shortly.</p>
    `, fullContext);
    
    return {
      subject,
      html,
    };
  }
  
  /**
   * Render invite email template
   */
  renderInvite(context: Partial<EmailTemplateContext> = {}): EmailTemplate {
    const fullContext = { brandNames: this.brandNames, ...context };
    
    const subject = processEmailTemplate('You\'re invited: {sessionTitle} - {brandName}', fullContext);
    let html = processEmailTemplate(`
      <h2>You're invited: {sessionTitle}</h2>
      <p><strong>When:</strong> {sessionDate}</p>
      <p>From {brandName}</p>
    `, fullContext);
    
    // Add conditional content manually
    if (fullContext.sessionLocation) {
      html += `<p><strong>Where:</strong> ${fullContext.sessionLocation}</p>`;
    }
    if (fullContext.stripeLink) {
      html += `<p><a href="${fullContext.stripeLink}">Pay to reserve your spot</a></p>`;
    }
    
    return {
      subject,
      html,
    };
  }
  
  /**
   * Render confirmation email template
   */
  renderConfirmation(context: Partial<EmailTemplateContext> = {}): EmailTemplate {
    const fullContext = { brandNames: this.brandNames, ...context };
    
    const subject = processEmailTemplate('Confirmed: {sessionTitle}', fullContext);
    let html = processEmailTemplate(`
      <h2>Confirmed: {sessionTitle}</h2>
      <p><strong>When:</strong> {sessionDate}</p>
    `, fullContext);
    
    // Add conditional content manually
    if (fullContext.sessionLocation) {
      html += `<p><strong>Where:</strong> ${fullContext.sessionLocation}</p>`;
    }
    
    return {
      subject,
      html,
    };
  }
  
  /**
   * Render plan ready email template
   */
  renderPlanReady(context: Partial<EmailTemplateContext> = {}): EmailTemplate {
    const fullContext = { brandNames: this.brandNames, ...context };
    
    const subject = processEmailTemplate('Your plan is ready - {brandName}', fullContext);
    let html = processEmailTemplate(`
      <h2>Your plan is ready!</h2>
      <p>Week starting {weekStart}.</p>
    `, fullContext);
    
    // Add conditional content manually
    if (fullContext.viewUrl) {
      html += `<p><a href="${fullContext.viewUrl}">View your plan</a></p>`;
    }
    
    return {
      subject,
      html,
    };
  }
  
  /**
   * Render check-in reminder email template
   */
  renderCheckInReminder(context: Partial<EmailTemplateContext> = {}): EmailTemplate {
    const fullContext = { brandNames: this.brandNames, ...context };
    
    const subject = processEmailTemplate('Please check in - {brandName}', fullContext);
    let html = processEmailTemplate(`
      <h2>Quick check-in</h2>
      <p>How did this week go?</p>
    `, fullContext);
    
    // Add conditional content manually
    if (fullContext.checkInLink) {
      html += `<p><a href="${fullContext.checkInLink}">Submit check-in</a></p>`;
    }
    
    return {
      subject,
      html,
    };
  }
  
  /**
   * Render weekly recap email template
   */
  renderWeeklyRecap(context: Partial<EmailTemplateContext> = {}): EmailTemplate {
    const fullContext = { brandNames: this.brandNames, ...context };
    
    const subject = processEmailTemplate('Your weekly recap - {brandName}', fullContext);
    const html = processEmailTemplate(`
      <h2>Your weekly recap</h2>
      {summaryHtml}
    `, fullContext);
    
    return {
      subject,
      html,
    };
  }
  
  /**
   * Wrap HTML with dynamic branding and styling
   */
  wrapHtml(innerHtml: string, title?: string): string {
    return this.emailStyler.renderEmail(innerHtml, title);
  }
  
  /**
   * Render email button
   */
  renderButton(text: string, href: string): string {
    return this.emailStyler.renderButton(text, href);
  }
  
  /**
   * Render email link
   */
  renderLink(text: string, href: string): string {
    return this.emailStyler.renderLink(text, href);
  }
  
  /**
   * Update brand configuration
   */
  updateBrandConfig(brandNames: BrandNameConfig): void {
    this.brandNames = brandNames;
    this.emailStyler.updateBrandConfig(brandNames);
  }
  
  /**
   * Update styling configuration
   */
  updateStylingConfig(stylingConfig: Partial<EmailStylingConfig>): void {
    this.emailStyler.updateStylingConfig(stylingConfig);
  }
}
