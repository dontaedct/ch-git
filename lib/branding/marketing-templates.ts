/**
 * @fileoverview Brand-Specific Marketing Email Templates
 * @module lib/branding/marketing-templates
 * @author OSS Hero System
 * @version 1.0.0
 */

import { DynamicEmailRenderer, EmailTemplateContext, EmailTemplate, processEmailTemplate } from './email-templates';
import { BrandNameConfig } from './logo-manager';

export interface MarketingEmailContext extends EmailTemplateContext {
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
}

/**
 * Marketing email template renderer
 */
export class MarketingEmailRenderer extends DynamicEmailRenderer {
  
  /**
   * Render newsletter email template
   */
  renderNewsletter(context: Partial<MarketingEmailContext> = {}): any {
    const fullContext = { brandNames: (this as any).brandNames, ...context };
    
    const subject = processEmailTemplate('{brandName} Newsletter - {campaignName}', fullContext);
    const html = `
      <h2>Welcome to the {brandName} Newsletter!</h2>
      <p>Thank you for subscribing to our newsletter. Here's what's new:</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>{campaignName}</h3>
        <p>Stay up to date with the latest features and improvements.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{ctaUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          {ctaText}
        </a>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <div style="text-align: center; font-size: 14px; color: #6b7280;">
        <p>You're receiving this because you subscribed to {brandName} updates.</p>
        <p><a href="{unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a> | <a href="#" style="color: #6b7280;">Update Preferences</a></p>
      </div>
    `;
    
    return {
      subject,
      html: processEmailTemplate(html, fullContext),
    };
  }
  
  /**
   * Render promotional email template
   */
  renderPromotional(context: Partial<MarketingEmailContext> = {}): any {
    const fullContext = { brandNames: (this as any).brandNames, ...context };
    
    const subject = processEmailTemplate('Special Offer from {brandName} - {offerCode}', fullContext);
    const html = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
        <h1 style="margin: 0; font-size: 28px;">Special Offer!</h1>
        <p style="margin: 10px 0; font-size: 18px;">Get {discountPercent}% off your next purchase</p>
        <p style="margin: 5px 0; font-size: 16px;">Use code: <strong>{offerCode}</strong></p>
        <p style="margin: 5px 0; font-size: 14px;">Expires: {expirationDate}</p>
      </div>
      
      <div style="padding: 20px;">
        <h2>Why Choose {brandName}?</h2>
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 10px 0;">✓ Premium quality products</li>
          <li style="margin: 10px 0;">✓ Fast and reliable service</li>
          <li style="margin: 10px 0;">✓ 24/7 customer support</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
        <a href="{ctaUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          {ctaText}
        </a>
        </div>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Follow Us</h3>
        <div style="text-align: center;">
          {socialLinks?.facebook ? '<a href="{socialLinks.facebook}" style="margin: 0 10px;">Facebook</a>' : ''}
          {socialLinks?.twitter ? '<a href="{socialLinks.twitter}" style="margin: 0 10px;">Twitter</a>' : ''}
          {socialLinks?.linkedin ? '<a href="{socialLinks.linkedin}" style="margin: 0 10px;">LinkedIn</a>' : ''}
          {socialLinks?.instagram ? '<a href="{socialLinks.instagram}" style="margin: 0 10px;">Instagram</a>' : ''}
        </div>
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px;">
        <p>This offer is valid until {expirationDate}. Terms and conditions apply.</p>
        <p><a href="{unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a></p>
      </div>
    `;
    
    return {
      subject,
      html: processEmailTemplate(html, fullContext),
    };
  }
  
  /**
   * Render product announcement email template
   */
  renderProductAnnouncement(context: Partial<MarketingEmailContext> = {}): EmailTemplate {
    const fullContext = { brandNames: (this as any).brandNames, ...context };
    
    const subject = processEmailTemplate('New Product Launch: {campaignName} - {brandName}', fullContext);
    const html = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1f2937; margin: 0;">🎉 New Product Launch!</h1>
        <p style="font-size: 18px; color: #6b7280; margin: 10px 0;">Introducing {campaignName}</p>
      </div>
      
      <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #0369a1; margin-top: 0;">What's New?</h2>
        <p>We're excited to announce the launch of our latest product that will revolutionize your experience with {brandName}.</p>
        
        <h3>Key Features:</h3>
        <ul>
          <li>Enhanced user experience</li>
          <li>Improved performance</li>
          <li>New innovative features</li>
          <li>Better integration capabilities</li>
        </ul>
      </div>
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-weight: 600; color: #92400e;">
          🚀 Early Bird Special: Get 20% off for the first 30 days!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{ctaUrl}" style="display: inline-block; background-color: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          {ctaText}
        </a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
        <p style="text-align: center; font-size: 14px; color: #6b7280;">
          Questions? Contact us at support@{brandName.toLowerCase()}.com
        </p>
        <p style="text-align: center; font-size: 12px; color: #9ca3af;">
          <a href="{unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a> from these emails
        </p>
      </div>
    `;
    
    return {
      subject,
      html: processEmailTemplate(html, fullContext),
    };
  }
  
  /**
   * Render event invitation email template
   */
  renderEventInvitation(context: Partial<MarketingEmailContext> = {}): EmailTemplate {
    const fullContext = { brandNames: (this as any).brandNames, ...context };
    
    const subject = processEmailTemplate('You\'re Invited: {campaignName} - {brandName}', fullContext);
    const html = `
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
        <h1 style="margin: 0; font-size: 28px;">You're Invited!</h1>
        <h2 style="margin: 10px 0; font-size: 22px;">{campaignName}</h2>
        <p style="margin: 5px 0; font-size: 16px;">Join us for an exclusive event</p>
      </div>
      
      <div style="padding: 20px;">
        <h3>Event Details</h3>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Time:</strong> {time}</p>
          <p><strong>Location:</strong> {location}</p>
        </div>
        
        <h3>What to Expect</h3>
        <ul>
          <li>Networking opportunities</li>
          <li>Expert presentations</li>
          <li>Q&A sessions</li>
          <li>Refreshments and snacks</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{ctaUrl}" style="display: inline-block; background-color: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            {ctaText || 'RSVP Now'}
          </a>
        </div>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b; font-weight: 600;">
            ⚠️ Limited seats available. RSVP by {expirationDate} to secure your spot.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px;">
        <p>Can't make it? <a href="{unsubscribeUrl}" style="color: #6b7280;">Update your preferences</a></p>
      </div>
    `;
    
    return {
      subject,
      html: processEmailTemplate(html, fullContext),
    };
  }
}
