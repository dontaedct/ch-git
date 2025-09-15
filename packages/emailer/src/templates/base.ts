import { DynamicEmailRenderer } from '../../../../lib/branding/email-templates';
import { DEFAULT_BRAND_CONFIG } from '../../../../lib/branding/logo-manager';

export function wrapHtml(inner: string) {
  const emailRenderer = new DynamicEmailRenderer(DEFAULT_BRAND_CONFIG.brandName);
  return emailRenderer.wrapHtml(inner);
}

