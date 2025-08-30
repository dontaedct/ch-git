import { getCurrentTier } from '../../../lib/flags'

export type UrlValidation = {
  input: string
  safeUrl: string
  isHttps: boolean
  hostname: string | null
}

export function isHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

export function sanitizeUrl(url: string): string {
  // Only allow valid HTTPS URLs; otherwise, return about:blank
  return isHttpsUrl(url) ? url : 'about:blank'
}

export function validateSchedulerUrl(url: string, opts?: { allowedDomains?: string[] }): UrlValidation {
  const safeUrl = sanitizeUrl(url)
  const hostname = getHostname(safeUrl)
  return {
    input: url,
    safeUrl,
    isHttps: isHttpsUrl(safeUrl),
    hostname,
  }
}

const DEFAULT_PRO_ALLOWED = ['cal.com', 'calendly.com', 'youcanbook.me']

export function isAllowedForTier(v: UrlValidation, allowedDomains?: string[]): boolean {
  const tier = getCurrentTier()
  if (!v.isHttps || !v.hostname) return false

  if (tier === 'starter') return false // link-only

  if (tier === 'pro') {
    const domains = (allowedDomains && allowedDomains.length > 0) ? allowedDomains : DEFAULT_PRO_ALLOWED
    return domains.some(d => v.hostname === d || v.hostname.endsWith(`.${d}`))
  }

  // advanced: any HTTPS hostname allowed
  return true
}
