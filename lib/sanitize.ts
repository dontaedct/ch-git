export function sanitizeText(s?: string | null): string {
  if (!s) return ''
  return s.replace(/<[^>]*>/g, '').trim()
}
