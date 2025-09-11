import { DynamicEmailRenderer } from '../../../lib/branding/email-templates';
import { DEFAULT_BRAND_CONFIG } from '../../../lib/branding/logo-manager';

export function renderWeeklyRecap(args: { summaryHtml: string }): { subject: string; html: string } {
  const emailRenderer = new DynamicEmailRenderer(DEFAULT_BRAND_CONFIG.brandName);
  
  const context = {
    summaryHtml: args.summaryHtml
  };
  
  return emailRenderer.renderWeeklyRecap(context);
}

