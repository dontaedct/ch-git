import { DynamicEmailRenderer } from '../../../lib/branding/email-templates';
import { DEFAULT_BRAND_CONFIG } from '../../../lib/branding/logo-manager';

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString()
}

export function renderConfirmation(args: { session: { title: string; starts_at: string; location?: string } }): { subject: string; html: string } {
  const emailRenderer = new DynamicEmailRenderer(DEFAULT_BRAND_CONFIG.brandName);
  const when = fmtWhen(args.session.starts_at);
  
  const context = {
    sessionTitle: args.session.title,
    sessionDate: when,
    sessionLocation: args.session.location
  };
  
  return emailRenderer.renderConfirmation(context);
}

