@dct/emailer

Lightweight email helper with Resend provider integration and reusable HTML templates.

- Wraps messages in a consistent HTML shell
- Provides common templates (invite, confirmation, welcome, weekly recap, plan ready, check-in)
- Safe dev mode: returns { ok: true, skipped: true } when not configured
- Contract-friendly API with injectable provider for testing

Quick start

import { sendRaw, sendInvite, renderInvite } from '@dct/emailer'

await sendRaw({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' })

await sendInvite({ to: 'user@example.com', session: { title: 'Intro Call', starts_at: new Date().toISOString() } })

const { subject, html } = renderInvite({ session: { title: 'Intro', starts_at: new Date().toISOString() } })

Configuration

- Reads RESEND_API_KEY and RESEND_FROM from process.env by default
- Or pass apiKey/from per call
- Or inject a provider: { send: ({ from, to, subject, html }) => Promise<{ id?: string, error?: unknown }> }

