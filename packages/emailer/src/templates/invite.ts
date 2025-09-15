import { DynamicEmailRenderer } from '../../../../lib/branding/email-templates';
import { DEFAULT_BRAND_CONFIG } from '../../../../lib/branding/logo-manager';

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString()
}

export function renderInvite(args: { session: { title: string; starts_at: string; location?: string }; stripe_link?: string }): { subject: string; html: string } {
  const emailRenderer = new DynamicEmailRenderer(DEFAULT_BRAND_CONFIG.brandName);
  const when = fmtWhen(args.session.starts_at);
  
  const context = {
    sessionTitle: args.session.title,
    sessionDate: when,
    sessionLocation: args.session.location,
    stripeLink: args.stripe_link
  };
  
  return emailRenderer.renderInvite(context);
}

