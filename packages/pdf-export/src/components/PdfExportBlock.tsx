"use client"

import React, { useCallback, useId, useMemo, useRef } from 'react'
import { generatePdfFromElement } from '../utils/generatePdf'

export interface PdfExportBlockProps {
  title?: string
  filename?: string
  targetId?: string
  className?: string
  onSuccess?: (blob: Blob) => void
  onError?: (error: Error) => void
  actions?: {
    downloadButtonLabel?: string
    extraActions?: React.ReactNode
  }
  children: React.ReactNode
}

export function PdfExportBlock({
  title = 'Export Preview',
  filename = 'export.pdf',
  targetId,
  className,
  onSuccess,
  onError,
  actions,
  children,
}: PdfExportBlockProps) {
  const autoId = useId().replace(/[:]/g, '-')
  const contentId = useMemo(() => targetId ?? `pdf-export-${autoId}`, [targetId, autoId])
  const busyRef = useRef(false)

  const handleDownload = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    try {
      const blob = await generatePdfFromElement(contentId, { filename })
      onSuccess?.(blob)
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error')
      onError?.(err)
      // eslint-disable-next-line no-console
      console.error('[PdfExportBlock] export failed:', err)
    } finally {
      busyRef.current = false
    }
  }, [contentId, filename, onSuccess, onError])

  return (
    <div className={className}>
      <div className="print-hidden flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Download as PDF"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download PDF</span>
          </button>
          {actions?.extraActions}
        </div>
      </div>

      <div id={contentId} className="bg-white print-keep-together">
        {children}
      </div>
    </div>
  )
}

