# @dct/scheduler

Scheduler block supporting link and embed modes with tier-based gating and URL validation.

## Features

- Link or embed scheduling experiences (e.g., Cal.com, Calendly)
- Tier-based gating:
  - starter: link-only (embed gracefully degrades to link)
  - pro: embed allowed for approved domains
  - advanced: embed allowed for any HTTPS domain
- URL validation and sanitization (no javascript:, HTTPS required)
- Accessible, responsive iframe with safe sandbox defaults

## Usage

```tsx
import { Scheduler } from '@dct/scheduler'

export default function Page() {
  return (
    <Scheduler
      url="https://cal.com/acme/intro-call"
      mode="embed" // 'embed' | 'link'
      title="Book a call"
      height={700}
    />
  )
}
```

If the current tier does not allow `embed`, the component will render a secure link fallback.

## Props

- `url`: HTTPS scheduling URL
- `mode`: `'link' | 'embed'` desired mode
- `title`: accessible title for the iframe/link (default: `Schedule`)
- `height`: iframe height in pixels (default: 640)
- `allowedDomains`: optional override for approved domains in Pro tier

## Validation

`validateSchedulerUrl(url)` ensures HTTPS scheme and a safe hostname. Pro tier allows only approved domains. Advanced allows any HTTPS domain. Starter always links.

## Notes

- This package relies on the app's tier via `lib/flags.ts`.
- No external provider SDK is required; embedding uses a generic iframe.

