import { DynamicEmailRenderer } from '../../../../lib/branding/email-templates';
import { DEFAULT_BRAND_CONFIG } from '../../../../lib/branding/logo-manager';

export function renderCheckInReminder(args: { link?: string }): { subject: string; html: string } {
  const emailRenderer = new DynamicEmailRenderer(DEFAULT_BRAND_CONFIG.brandName);
  
  const context = {
    checkInLink: args.link
  };
  
  return emailRenderer.renderCheckInReminder(context);
}

