/**
 * Consultation Email Templates
 *
 * Professional email templates for consultation delivery, follow-ups,
 * and client communication with customizable branding and content.
 */

import type { ConsultationReport } from '@/lib/consultation/report-generator';
import type { ServicePackage } from '@/lib/ai/consultation-generator';

export interface EmailBranding {
  brand_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  website_url?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
}

export interface EmailTemplateData {
  subject: string;
  html: string;
  text: string;
}

/**
 * Consultation email template generator
 */
export class ConsultationEmailTemplates {
  private defaultBranding: EmailBranding = {
    brand_name: 'Business Consultation Platform',
    primary_color: '#1e40af',
    secondary_color: '#3b82f6',
    website_url: 'https://consultation.example.com',
    contact_email: 'support@consultation.example.com'
  };

  /**
   * Generate consultation report delivery email
   */
  generateReportDelivery(
    report: ConsultationReport,
    attachmentName: string,
    branding?: Partial<EmailBranding>
  ): EmailTemplateData {
    const brand = { ...this.defaultBranding, ...branding };
    const clientName = this.getFirstName(report.client_info.name);

    const subject = `Your Business Consultation Report is Ready - ${clientName}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, ${brand.primary_color} 0%, ${brand.secondary_color} 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { max-height: 40px; margin-bottom: 20px; }
        .content { padding: 40px 30px; }
        .highlight-box { background-color: #f1f5f9; border-left: 4px solid ${brand.primary_color}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .recommendation-card { background-color: #ffffff; border: 2px solid ${brand.primary_color}20; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .service-badge { display: inline-block; background-color: ${brand.primary_color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
        .cta-button { display: inline-block; background-color: ${brand.primary_color}; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; }
        .social-links { margin: 20px 0; }
        .attachment-info { background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0; display: flex; align-items: center; }
        .attachment-icon { background-color: #10b981; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
        @media (max-width: 600px) {
            .container { width: 100% !important; }
            .content, .header, .footer { padding: 20px !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            ${brand.logo_url ? `<img src="${brand.logo_url}" alt="${brand.brand_name}" class="logo">` : ''}
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Your Consultation Report is Ready!</h1>
            <p style="margin: 16px 0 0 0; font-size: 18px; opacity: 0.9;">Personalized recommendations for ${report.client_info.name}</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p style="font-size: 18px; color: #374151; margin-bottom: 24px;">
                Dear <strong>${clientName}</strong>,
            </p>

            <p style="color: #4b5563; margin-bottom: 24px;">
                Thank you for completing our business consultation assessment. We've analyzed your responses and prepared a comprehensive report with personalized recommendations tailored specifically to your business needs.
            </p>

            <!-- Attachment Info -->
            <div class="attachment-info">
                <div class="attachment-icon">📄</div>
                <div>
                    <h4 style="margin: 0 0 4px 0; color: #065f46;">Attached Report</h4>
                    <p style="margin: 0; color: #047857; font-weight: 500;">${attachmentName}</p>
                </div>
            </div>

            <!-- Primary Recommendation -->
            <div class="recommendation-card">
                <div class="service-badge">PRIMARY RECOMMENDATION</div>
                <h3 style="color: ${brand.primary_color}; margin: 0 0 12px 0; font-size: 22px;">
                    ${report.recommendations.primary.title}
                </h3>
                <p style="color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
                    ${report.recommendations.primary.description}
                </p>

                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 16px;">Why This Fits Your Business:</h4>
                    <p style="margin: 0; color: #6b7280; font-style: italic;">
                        ${report.recommendations.reasoning.slice(0, 2).join(' ')}
                    </p>
                </div>

                ${report.customization.show_pricing && report.recommendations.primary.price_band ? `
                <div style="display: flex; gap: 20px; margin: 16px 0; font-size: 14px;">
                    <span style="color: #6b7280;"><strong>Investment:</strong> ${report.recommendations.primary.price_band}</span>
                    ${report.recommendations.primary.timeline ? `<span style="color: #6b7280;"><strong>Timeline:</strong> ${report.recommendations.primary.timeline}</span>` : ''}
                </div>
                ` : ''}
            </div>

            <!-- Key Insights -->
            <div class="highlight-box">
                <h3 style="color: ${brand.primary_color}; margin: 0 0 16px 0; font-size: 18px;">Key Insights from Your Assessment</h3>
                <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                    ${report.recommendations.reasoning.map(insight => `<li style="margin-bottom: 8px;">${insight}</li>`).join('')}
                </ul>
            </div>

            <!-- Executive Summary -->
            <div style="margin: 32px 0;">
                <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 18px;">Executive Summary</h3>
                <p style="color: #4b5563; line-height: 1.7;">
                    ${report.executive_summary}
                </p>
            </div>

            <!-- Next Steps -->
            <div style="margin: 32px 0;">
                <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 18px;">Recommended Next Steps</h3>
                <ol style="color: #4b5563; padding-left: 20px;">
                    ${report.next_steps.map(step => `<li style="margin-bottom: 12px;">${step}</li>`).join('')}
                </ol>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
                <h3 style="color: #374151; margin: 0 0 16px 0;">Ready to Get Started?</h3>
                <p style="color: #6b7280; margin-bottom: 24px;">
                    Let's discuss how we can help you implement these recommendations and achieve your business goals.
                </p>
                <a href="${brand.website_url || '#'}" class="cta-button" style="color: white;">
                    Schedule Your Strategy Session
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <h4 style="color: #374151; margin: 0 0 16px 0;">${brand.brand_name}</h4>

            ${brand.contact_email || brand.phone ? `
            <div style="margin-bottom: 16px;">
                ${brand.contact_email ? `<p style="margin: 4px 0;"><a href="mailto:${brand.contact_email}" style="color: ${brand.primary_color};">${brand.contact_email}</a></p>` : ''}
                ${brand.phone ? `<p style="margin: 4px 0; color: #64748b;">${brand.phone}</p>` : ''}
            </div>
            ` : ''}

            <p style="margin: 16px 0; font-size: 12px; color: #9ca3af;">
                This consultation report was generated based on your assessment responses on ${new Date(report.client_info.generated_date).toLocaleDateString()}.
                If you have any questions about your report, please don't hesitate to reach out.
            </p>

            <p style="margin: 16px 0; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} ${brand.brand_name}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Your Business Consultation Report is Ready!

Dear ${clientName},

Thank you for completing our business consultation assessment. We've analyzed your responses and prepared a comprehensive report with personalized recommendations tailored specifically to your business needs.

PRIMARY RECOMMENDATION: ${report.recommendations.primary.title}
${report.recommendations.primary.description}

Key Insights:
${report.recommendations.reasoning.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

Executive Summary:
${report.executive_summary}

Next Steps:
${report.next_steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Please find your detailed consultation report attached as a PDF.

Ready to get started? Let's discuss how we can help you implement these recommendations.

Best regards,
${brand.brand_name}
${brand.contact_email || ''}
${brand.website_url || ''}

---
This consultation report was generated on ${new Date(report.client_info.generated_date).toLocaleDateString()}.
    `;

    return { subject, html, text };
  }

  /**
   * Generate follow-up email after consultation delivery
   */
  generateFollowUp(
    clientName: string,
    reportTitle: string,
    daysAfterDelivery: number,
    branding?: Partial<EmailBranding>
  ): EmailTemplateData {
    const brand = { ...this.defaultBranding, ...branding };
    const firstName = this.getFirstName(clientName);

    const subject = `Following up on your consultation report - ${firstName}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, ${brand.primary_color} 0%, ${brand.secondary_color} 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .cta-button { display: inline-block; background-color: ${brand.primary_color}; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">How are your recommendations working out?</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${firstName}</strong>,</p>

            <p>It's been ${daysAfterDelivery} days since we delivered your consultation report, and I wanted to check in to see how things are progressing.</p>

            <p>Have you had a chance to review the recommendations? Do you have any questions about implementing the suggested strategies?</p>

            <p>I'm here to help you get the most value from your consultation. Whether you need clarification on any recommendations or want to discuss next steps, I'd be happy to schedule a brief call.</p>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${brand.website_url || '#'}" class="cta-button" style="color: white;">
                    Schedule a Follow-up Call
                </a>
            </div>

            <p>Best regards,<br>
            ${brand.brand_name} Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${brand.brand_name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
How are your recommendations working out?

Dear ${firstName},

It's been ${daysAfterDelivery} days since we delivered your consultation report, and I wanted to check in to see how things are progressing.

Have you had a chance to review the recommendations? Do you have any questions about implementing the suggested strategies?

I'm here to help you get the most value from your consultation. Whether you need clarification on any recommendations or want to discuss next steps, I'd be happy to schedule a brief call.

Best regards,
${brand.brand_name} Team
    `;

    return { subject, html, text };
  }

  /**
   * Generate welcome email for new consultation clients
   */
  generateWelcome(
    clientName: string,
    estimatedDeliveryTime: string,
    branding?: Partial<EmailBranding>
  ): EmailTemplateData {
    const brand = { ...this.defaultBranding, ...branding };
    const firstName = this.getFirstName(clientName);

    const subject = `Welcome ${firstName}! Your consultation is being prepared`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, ${brand.primary_color} 0%, ${brand.secondary_color} 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .timeline-item { display: flex; align-items: center; margin: 20px 0; }
        .timeline-number { background-color: ${brand.primary_color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 16px; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Welcome, ${firstName}!</h1>
            <p style="margin: 16px 0 0 0; font-size: 18px; opacity: 0.9;">Your business consultation is being prepared</p>
        </div>
        <div class="content">
            <p style="font-size: 18px; color: #374151;">Thank you for choosing us for your business consultation!</p>

            <p>We're currently analyzing your assessment responses and preparing personalized recommendations for your business. Our AI-powered system is working alongside our expert consultants to ensure you receive the most accurate and actionable insights.</p>

            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
                <h3 style="color: ${brand.primary_color}; margin: 0 0 16px 0;">What happens next?</h3>

                <div class="timeline-item">
                    <div class="timeline-number">1</div>
                    <div>
                        <strong>Analysis in Progress</strong><br>
                        <span style="color: #6b7280;">We're evaluating your responses and matching them with our service portfolio</span>
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-number">2</div>
                    <div>
                        <strong>Report Generation</strong><br>
                        <span style="color: #6b7280;">Creating your personalized consultation report with recommendations</span>
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-number">3</div>
                    <div>
                        <strong>Delivery</strong><br>
                        <span style="color: #6b7280;">Your comprehensive report will be delivered via email</span>
                    </div>
                </div>
            </div>

            <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h4 style="color: #065f46; margin: 0 0 8px 0;">⏱️ Estimated Delivery Time</h4>
                <p style="margin: 0; color: #047857; font-weight: 500;">${estimatedDeliveryTime}</p>
            </div>

            <p>In the meantime, if you have any questions or need to provide additional information, please don't hesitate to reach out.</p>

            <p>We're excited to help you achieve your business goals!</p>

            <p>Best regards,<br>
            The ${brand.brand_name} Team</p>
        </div>
        <div class="footer">
            <p>Questions? Contact us at ${brand.contact_email || 'support@example.com'}</p>
            <p>&copy; ${new Date().getFullYear()} ${brand.brand_name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Welcome, ${firstName}!

Thank you for choosing us for your business consultation!

We're currently analyzing your assessment responses and preparing personalized recommendations for your business. Our AI-powered system is working alongside our expert consultants to ensure you receive the most accurate and actionable insights.

What happens next?
1. Analysis in Progress - We're evaluating your responses and matching them with our service portfolio
2. Report Generation - Creating your personalized consultation report with recommendations
3. Delivery - Your comprehensive report will be delivered via email

Estimated Delivery Time: ${estimatedDeliveryTime}

In the meantime, if you have any questions or need to provide additional information, please don't hesitate to reach out.

We're excited to help you achieve your business goals!

Best regards,
The ${brand.brand_name} Team

Questions? Contact us at ${brand.contact_email || 'support@example.com'}
    `;

    return { subject, html, text };
  }

  /**
   * Generate service package upsell email
   */
  generateServiceUpsell(
    clientName: string,
    currentService: ServicePackage,
    upgradeService: ServicePackage,
    branding?: Partial<EmailBranding>
  ): EmailTemplateData {
    const brand = { ...this.defaultBranding, ...branding };
    const firstName = this.getFirstName(clientName);

    const subject = `Maximize your results with ${upgradeService.title} - ${firstName}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, ${brand.primary_color} 0%, ${brand.secondary_color} 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .service-comparison { display: flex; gap: 20px; margin: 24px 0; }
        .service-card { flex: 1; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .service-card.upgrade { border-color: ${brand.primary_color}; background-color: ${brand.primary_color}10; }
        .cta-button { display: inline-block; background-color: ${brand.primary_color}; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Ready to take your business to the next level?</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${firstName}</strong>,</p>

            <p>I hope you're finding value in the ${currentService.title} recommendations we provided. Based on your business profile and goals, I wanted to share an opportunity that could accelerate your results significantly.</p>

            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
                <h3 style="color: ${brand.primary_color}; margin: 0 0 16px 0;">Upgrade to ${upgradeService.title}</h3>
                <p style="margin: 0;">${upgradeService.description}</p>
            </div>

            <h3>What you'll get with the upgrade:</h3>
            <ul>
                ${upgradeService.includes.map(feature => `<li>${feature}</li>`).join('')}
            </ul>

            <p>This enhanced service package is specifically designed for businesses like yours that are ready to make significant strides toward their goals.</p>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${brand.website_url || '#'}" class="cta-button" style="color: white;">
                    Learn More About ${upgradeService.title}
                </a>
            </div>

            <p>If you have any questions about how this upgrade could benefit your specific situation, I'd be happy to discuss it with you personally.</p>

            <p>Best regards,<br>
            ${brand.brand_name} Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${brand.brand_name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Ready to take your business to the next level?

Dear ${firstName},

I hope you're finding value in the ${currentService.title} recommendations we provided. Based on your business profile and goals, I wanted to share an opportunity that could accelerate your results significantly.

Upgrade to ${upgradeService.title}
${upgradeService.description}

What you'll get with the upgrade:
${upgradeService.includes.map((feature, i) => `${i + 1}. ${feature}`).join('\n')}

This enhanced service package is specifically designed for businesses like yours that are ready to make significant strides toward their goals.

If you have any questions about how this upgrade could benefit your specific situation, I'd be happy to discuss it with you personally.

Best regards,
${brand.brand_name} Team
    `;

    return { subject, html, text };
  }

  /**
   * Extract first name from full name
   */
  private getFirstName(fullName: string): string {
    return fullName.split(' ')[0] || fullName;
  }
}

/**
 * Default consultation email templates instance
 */
export const consultationEmailTemplates = new ConsultationEmailTemplates();

/**
 * Convenience functions for generating consultation emails
 */
export const consultationEmails = {
  reportDelivery: (report: ConsultationReport, attachmentName: string, branding?: Partial<EmailBranding>) =>
    consultationEmailTemplates.generateReportDelivery(report, attachmentName, branding),

  followUp: (clientName: string, reportTitle: string, daysAfter: number, branding?: Partial<EmailBranding>) =>
    consultationEmailTemplates.generateFollowUp(clientName, reportTitle, daysAfter, branding),

  welcome: (clientName: string, estimatedDelivery: string, branding?: Partial<EmailBranding>) =>
    consultationEmailTemplates.generateWelcome(clientName, estimatedDelivery, branding),

  serviceUpsell: (clientName: string, currentService: ServicePackage, upgradeService: ServicePackage, branding?: Partial<EmailBranding>) =>
    consultationEmailTemplates.generateServiceUpsell(clientName, currentService, upgradeService, branding)
};