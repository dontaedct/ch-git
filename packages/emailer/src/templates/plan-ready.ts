import { DynamicEmailRenderer } from '../../../lib/branding/email-templates';
import { DEFAULT_BRAND_CONFIG } from '../../../lib/branding/logo-manager';

export function renderPlanReady(args: { weekStartISO: string; viewUrl?: string }): { subject: string; html: string } {
  const emailRenderer = new DynamicEmailRenderer(DEFAULT_BRAND_CONFIG.brandName);
  const day = new Date(args.weekStartISO).toLocaleDateString();
  
  const context = {
    weekStart: day,
    viewUrl: args.viewUrl
  };
  
  return emailRenderer.renderPlanReady(context);
}

