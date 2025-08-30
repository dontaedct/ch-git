import { wrapHtml } from '../templates/base'
import { renderInvite } from '../templates/invite'
import { renderConfirmation } from '../templates/confirmation'
import { renderWelcome } from '../templates/welcome'
import { renderWeeklyRecap } from '../templates/weekly-recap'
import { renderPlanReady } from '../templates/plan-ready'
import { renderCheckInReminder } from '../templates/check-in'
import { sendRaw, sendInvite, sendConfirmation, sendWelcome, sendWeeklyRecap, sendPlanReady, sendCheckInReminder, type EmailProvider } from '../service'

const fakeProvider: EmailProvider = {
  async send({ from, to, subject, html }) {
    if (!from || !to || !subject || !html) return { error: 'missing' }
    return { id: 'stub-123' }
  }
}

describe('@dct/emailer templates', () => {
  const session = { title: 'Intro Call', starts_at: new Date('2024-01-01T12:00:00Z').toISOString(), location: 'Zoom' }

  test('wrapHtml wraps content', () => {
    const out = wrapHtml('<p>x</p>')
    expect(out).toContain('<!doctype html>')
    expect(out).toContain('<p>x</p>')
  })

  test('invite template includes details', () => {
    const { subject, html } = renderInvite({ session, stripe_link: 'https://pay' })
    expect(subject).toContain("You're invited: Intro Call")
    expect(html).toContain('Zoom')
    expect(html).toContain('https://pay')
  })

  test('confirmation template includes when/where', () => {
    const { subject, html } = renderConfirmation({ session })
    expect(subject).toContain('Confirmed: Intro Call')
    expect(html).toContain('Zoom')
  })

  test('welcome template mentions coach when provided', () => {
    const { subject, html } = renderWelcome({ coachName: 'Alex' })
    expect(subject).toBe('Welcome to Your Micro App')
    expect(html).toContain('Alex')
  })

  test('weekly recap passes through summary', () => {
    const { subject, html } = renderWeeklyRecap({ summaryHtml: '<ul><li>A</li></ul>' })
    expect(subject).toBe('Your weekly recap')
    expect(html).toContain('<li>A</li>')
  })

  test('plan ready can include link', () => {
    const { subject, html } = renderPlanReady({ weekStartISO: new Date('2024-01-01').toISOString(), viewUrl: 'https://view' })
    expect(subject).toBe('Your plan is ready')
    expect(html).toContain('https://view')
  })

  test('check-in can include link', () => {
    const { subject, html } = renderCheckInReminder({ link: 'https://check' })
    expect(subject).toBe('Please check in')
    expect(html).toContain('https://check')
  })
})

describe('@dct/emailer sending (contract)', () => {
  const session = { title: 'Intro Call', starts_at: new Date('2024-01-01T12:00:00Z').toISOString(), location: 'Zoom' }

  test('sendRaw returns skipped when not configured', async () => {
    const res = await sendRaw({ to: 'a@b.com', subject: 'Hi', html: '<p>Hi</p>' })
    expect(res.ok).toBe(true)
    expect((res as any).skipped).toBe(true)
  })

  test('sendRaw uses injected provider', async () => {
    const res = await sendRaw({ to: 'a@b.com', subject: 'Hi', html: '<p>Hi</p>', apiKey: 'x', from: 'noreply@test', provider: fakeProvider })
    expect(res.ok).toBe(true)
    expect((res as any).id).toBe('stub-123')
  })

  test('template senders produce ok with provider', async () => {
    const common = { to: 'a@b.com', apiKey: 'x', from: 'noreply@test', provider: fakeProvider }
    expect((await sendInvite({ ...common, session })).ok).toBe(true)
    expect((await sendConfirmation({ ...common, session })).ok).toBe(true)
    expect((await sendWelcome({ ...common, coachName: 'Alex' })).ok).toBe(true)
    expect((await sendWeeklyRecap({ ...common, summaryHtml: '<p>A</p>' })).ok).toBe(true)
    expect((await sendPlanReady({ ...common, weekStartISO: new Date('2024-01-01').toISOString() })).ok).toBe(true)
    expect((await sendCheckInReminder({ ...common, link: 'https://x' })).ok).toBe(true)
  })
})

