/**
 * @fileoverview Brand-Aware Email Styling System
 * @module lib/branding/email-styling
 * @author OSS Hero System
 * @version 1.0.0
 */

import { BrandNameConfig } from './logo-manager';

export interface EmailStylingConfig {
  brandNames: BrandNameConfig;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
}

export interface EmailStyles {
  container: string;
  header: string;
  content: string;
  footer: string;
  button: string;
  link: string;
  text: string;
}

/**
 * Generate brand-aware email styles
 */
export function generateEmailStyles(config: EmailStylingConfig): EmailStyles {
  const {
    brandNames,
    primaryColor = '#3b82f6',
    secondaryColor = '#64748b',
    backgroundColor = '#ffffff',
    textColor = '#1f2937',
    linkColor = '#3b82f6',
    borderColor = '#e5e7eb',
    fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize = '16px',
    lineHeight = '1.5'
  } = config;

  return {
    container: `
      max-width: 600px;
      margin: 0 auto;
      background-color: ${backgroundColor};
      font-family: ${fontFamily};
      font-size: ${fontSize};
      line-height: ${lineHeight};
      color: ${textColor};
    `,
    header: `
      background-color: ${primaryColor};
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    `,
    content: `
      padding: 20px;
      background-color: ${backgroundColor};
    `,
    footer: `
      padding: 20px;
      background-color: #f9fafb;
      border-top: 1px solid ${borderColor};
      font-size: 14px;
      color: ${secondaryColor};
      text-align: center;
      border-radius: 0 0 8px 8px;
    `,
    button: `
      display: inline-block;
      background-color: ${primaryColor};
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
    `,
    link: `
      color: ${linkColor};
      text-decoration: none;
    `,
    text: `
      color: ${textColor};
      margin: 10px 0;
    `
  };
}

/**
 * Generate brand-aware email HTML wrapper
 */
export function generateEmailWrapper(
  innerHtml: string,
  config: EmailStylingConfig,
  title?: string
): string {
  const styles = generateEmailStyles(config);
  const { brandNames } = config;
  
  const headerHtml = title ? `
    <div style="${styles.header}">
      <h1 style="margin: 0; font-size: 24px;">${title}</h1>
    </div>
  ` : '';
  
  const footerHtml = `
    <div style="${styles.footer}">
      <p style="margin: 0;">This is a transactional message from ${brandNames.appName}.</p>
      <p style="margin: 5px 0 0 0; font-size: 12px;">
        © ${new Date().getFullYear()} ${brandNames.organizationName}. All rights reserved.
      </p>
    </div>
  `;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || brandNames.appName}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
      <div style="${styles.container}">
        ${headerHtml}
        <div style="${styles.content}">
          ${innerHtml}
        </div>
        ${footerHtml}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate brand-aware button HTML
 */
export function generateEmailButton(
  text: string,
  href: string,
  config: EmailStylingConfig
): string {
  const styles = generateEmailStyles(config);
  
  return `
    <div style="text-align: center; margin: 20px 0;">
      <a href="${href}" style="${styles.button}">${text}</a>
    </div>
  `;
}

/**
 * Generate brand-aware link HTML
 */
export function generateEmailLink(
  text: string,
  href: string,
  config: EmailStylingConfig
): string {
  const styles = generateEmailStyles(config);
  
  return `<a href="${href}" style="${styles.link}">${text}</a>`;
}

/**
 * Enhanced email renderer with brand-aware styling
 */
export class BrandAwareEmailRenderer {
  private config: EmailStylingConfig;
  
  constructor(config: EmailStylingConfig) {
    this.config = config;
  }
  
  /**
   * Render email with brand-aware styling
   */
  renderEmail(
    content: string,
    title?: string,
    includeHeader: boolean = true
  ): string {
    if (includeHeader) {
      return generateEmailWrapper(content, this.config, title);
    }
    
    const styles = generateEmailStyles(this.config);
    return `
      <div style="${styles.container}">
        <div style="${styles.content}">
          ${content}
        </div>
      </div>
    `;
  }
  
  /**
   * Render email button
   */
  renderButton(text: string, href: string): string {
    return generateEmailButton(text, href, this.config);
  }
  
  /**
   * Render email link
   */
  renderLink(text: string, href: string): string {
    return generateEmailLink(text, href, this.config);
  }
  
  /**
   * Update brand configuration
   */
  updateBrandConfig(brandNames: BrandNameConfig): void {
    this.config.brandNames = brandNames;
  }
  
  /**
   * Update styling configuration
   */
  updateStylingConfig(stylingConfig: Partial<EmailStylingConfig>): void {
    this.config = { ...this.config, ...stylingConfig };
  }
}
