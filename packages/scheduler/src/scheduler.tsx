import * as React from 'react'
import { isTier } from '../../../lib/flags'
import { validateSchedulerUrl, isAllowedForTier } from './validate'

export type SchedulerMode = 'link' | 'embed'

export interface SchedulerProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string
  mode?: SchedulerMode
  title?: string
  height?: number
  allowedDomains?: string[]
}

export function Scheduler(props: SchedulerProps) {
  const { url, mode = 'embed', title = 'Schedule', height = 640, allowedDomains, ...rest } = props

  const result = validateSchedulerUrl(url, { allowedDomains })
  const canEmbed = isTier('pro') && isAllowedForTier(result, allowedDomains)

  // starter: link-only, pro/advanced: embed per validation; advanced implicitly passes isTier('pro') check
  const useEmbed = mode === 'embed' && canEmbed

  if (!useEmbed) {
    // graceful fallback to secure link
    return (
      <div {...rest}>
        <a
          href={result.safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={title}
        >
          {title}
        </a>
      </div>
    )
  }

  // Responsive container
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: height,
    border: '0',
  }

  const iframeStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: height,
    border: '0',
  }

  return (
    <div {...rest} style={{ ...containerStyle, ...(rest.style || {}) }}>
      <iframe
        src={result.safeUrl}
        title={title}
        style={iframeStyle}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  )
}
