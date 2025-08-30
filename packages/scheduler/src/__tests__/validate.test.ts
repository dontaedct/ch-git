import { validateSchedulerUrl, isAllowedForTier, isHttpsUrl, getHostname } from '../validate'

describe('scheduler validate', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV, NODE_ENV: 'test' }
  })
  afterAll(() => {
    process.env = OLD_ENV
  })

  it('rejects non-HTTPS URLs', () => {
    const v = validateSchedulerUrl('http://cal.com/acme')
    expect(v.isHttps).toBe(false)
    expect(v.safeUrl).toBe('about:blank')
  })

  it('accepts HTTPS URLs and extracts hostname', () => {
    const v = validateSchedulerUrl('https://cal.com/acme')
    expect(v.isHttps).toBe(true)
    expect(v.hostname).toBe('cal.com')
  })

  it('starter tier forbids embed', () => {
    process.env.APP_TIER = 'starter'
    const v = validateSchedulerUrl('https://cal.com/acme')
    expect(isAllowedForTier(v)).toBe(false)
  })

  it('pro tier allows only approved domains by default', () => {
    process.env.APP_TIER = 'pro'
    const allowed = validateSchedulerUrl('https://cal.com/acme')
    expect(isAllowedForTier(allowed)).toBe(true)

    const disallowed = validateSchedulerUrl('https://example.com/anything')
    expect(isAllowedForTier(disallowed)).toBe(false)
  })

  it('pro tier respects custom allowedDomains override', () => {
    process.env.APP_TIER = 'pro'
    const v = validateSchedulerUrl('https://example.org/schedule')
    expect(isAllowedForTier(v, ['example.org'])).toBe(true)
  })

  it('advanced tier allows any HTTPS hostname', () => {
    process.env.APP_TIER = 'advanced'
    const v1 = validateSchedulerUrl('https://cal.com/acme')
    const v2 = validateSchedulerUrl('https://example.com/ok')
    expect(isAllowedForTier(v1)).toBe(true)
    expect(isAllowedForTier(v2)).toBe(true)
  })

  it('utility helpers behave as expected', () => {
    expect(isHttpsUrl('https://a.com')).toBe(true)
    expect(isHttpsUrl('http://a.com')).toBe(false)
    expect(getHostname('https://sub.example.com/path')).toBe('sub.example.com')
    expect(getHostname('not a url')).toBeNull()
  })
})

