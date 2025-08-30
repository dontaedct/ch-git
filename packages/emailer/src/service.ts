import { Resend } from 'resend'
import { wrapHtml } from './templates/base'
import { renderInvite } from './templates/invite'
import { renderConfirmation } from './templates/confirmation'
import { renderWelcome } from './templates/welcome'
import { renderWeeklyRecap } from './templates/weekly-recap'
import { renderPlanReady } from './templates/plan-ready'
import { renderCheckInReminder } from './templates/check-in'

export type EmailResult = { ok: true; id?: string; skipped?: true } | { ok: false; code: string; message: string }

export type EmailProvider = {
  send: (args: { from: string; to: string; subject: string; html: string }) => Promise<{ id?: string; error?: unknown }>
}

function getEnv(key?: string, from?: string) {
  const apiKey = key ?? process.env.RESEND_API_KEY
  const sender = from ?? process.env.RESEND_FROM
  return { apiKey, sender }
}

async function doSend(args: { to: string; subject: string; html: string; apiKey?: string; from?: string; provider?: EmailProvider }): Promise<EmailResult> {
  const { apiKey, sender } = getEnv(args.apiKey, args.from)
  if (!apiKey || !sender) return { ok: true, skipped: true }

  try {
    const provider = args.provider ?? new Resend(apiKey)
    const res = await provider.send({ from: sender, to: args.to, subject: args.subject, html: args.html })
    if ((res as any)?.error) return { ok: false, code: 'RESEND_ERROR', message: String((res as any).error) }
    return { ok: true, id: (res as any)?.id }
  } catch (e: any) {
    return { ok: false, code: 'SEND_FAILED', message: e?.message ?? 'send failed' }
  }
}

export async function sendRaw(args: { to: string; subject: string; html: string; apiKey?: string; from?: string; provider?: EmailProvider }): Promise<EmailResult> {
  return doSend({ ...args, html: wrapHtml(args.html) })
}

export async function sendInvite(args: { to: string; session: { title: string; starts_at: string; location?: string }; stripe_link?: string; apiKey?: string; from?: string; provider?: EmailProvider }): Promise<EmailResult> {
  const { subject, html } = renderInvite({ session: args.session, stripe_link: args.stripe_link })
  return doSend({ to: args.to, subject, html, apiKey: args.apiKey, from: args.from, provider: args.provider })
}

export async function sendConfirmation(args: { to: string; session: { title: string; starts_at: string; location?: string }; apiKey?: string; from?: string; provider?: EmailProvider }): Promise<EmailResult> {
  const { subject, html } = renderConfirmation({ session: args.session })
  return doSend({ to: args.to, subject, html, apiKey: args.apiKey, from: args.from, provider: args.provider })
}

export async function sendWelcome(args: { to: string; coachName?: string; apiKey?: string; from?: string; provider?: EmailProvider }): Promise<EmailResult> {
  const { subject, html } = renderWelcome({ coachName: args.coachName })
  return doSend({ to: args.to, subject, html, apiKey: args.apiKey, from: args.from, provider: args.provider })
}

export async function sendWeeklyRecap(args: { to: string; summaryHtml: string; apiKey?: string; from?: string; provider?: EmailProvider }): Promise<EmailResult> {
  const { subject, html } = renderWeeklyRecap({ summaryHtml: args.summaryHtml })
  return doSend({ to: args.to, subject, html, apiKey: args.apiKey, from: args.from, provider: args.provider })
}

export async function sendPlanReady(args: { to: string; weekStartISO: string; viewUrl?: string; apiKey?: string; from?: string; provider?: EmailProvider }): Promise<EmailResult> {
  const { subject, html } = renderPlanReady({ weekStartISO: args.weekStartISO, viewUrl: args.viewUrl })
  return doSend({ to: args.to, subject, html, apiKey: args.apiKey, from: args.from, provider: args.provider })
}

export async function sendCheckInReminder(args: { to: string; link?: string; apiKey?: string; from?: string; provider?: EmailProvider }): Promise<EmailResult> {
  const { subject, html } = renderCheckInReminder({ link: args.link })
  return doSend({ to: args.to, subject, html, apiKey: args.apiKey, from: args.from, provider: args.provider })
}

