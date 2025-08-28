'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface PDFPreviewProps {
  src?: string
  file?: File
  className?: string
  placeholder?: React.ReactNode
  error?: React.ReactNode
  loading?: React.ReactNode
  onLoad?: () => void
  onError?: (error: Error) => void
  width?: number | string
  height?: number | string
  children?: React.ReactNode
}

const PDFPreview = React.forwardRef<HTMLDivElement, PDFPreviewProps>(
  (
    {
      src,
      file,
      className,
      placeholder,
      error,
      loading,
      onLoad,
      onError,
      width = '100%',
      height = '600px',
      children,
      ...props
    },
    ref
  ) => {
    const [loadingState, setLoadingState] = React.useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
    const [objectUrl, setObjectUrl] = React.useState<string | null>(null)

    // Clean up object URL when component unmounts or file changes
    React.useEffect(() => {
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }
      }
    }, [objectUrl])

    // Handle file to object URL conversion
    React.useEffect(() => {
      if (file) {
        setLoadingState('loading')
        
        if (file.type !== 'application/pdf') {
          const error = new Error('Invalid file type. Only PDF files are supported.')
          setErrorMessage(error.message)
          setLoadingState('error')
          onError?.(error)
          return
        }

        const url = URL.createObjectURL(file)
        setObjectUrl(url)
        setLoadingState('loaded')
        onLoad?.()
      }
    }, [file, onLoad, onError])

    // Handle src loading
    React.useEffect(() => {
      if (src && !file) {
        setLoadingState('loading')
        // For now, just set it as loaded since we can't validate the URL without making a request
        setLoadingState('loaded')
        onLoad?.()
      }
    }, [src, file, onLoad])

    const pdfSrc = React.useMemo(() => {
      if (objectUrl) return objectUrl
      if (src) return src
      return null
    }, [objectUrl, src])

    const renderContent = () => {
      switch (loadingState) {
        case 'loading':
          return loading ?? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-8">
              <div className="w-full max-w-md space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
                    <div className="absolute inset-0 rounded-lg border-2 border-muted-foreground/20" />
                    <svg
                      className="absolute inset-2 w-8 h-8 text-muted-foreground/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
                </div>
                
                <div className="space-y-2 mt-6">
                  <div className="h-2 bg-muted rounded animate-pulse" />
                  <div className="h-2 bg-muted rounded animate-pulse w-5/6" />
                  <div className="h-2 bg-muted rounded animate-pulse w-4/6" />
                  <div className="h-2 bg-muted rounded animate-pulse w-3/4" />
                </div>
                
                <div className="flex items-center justify-center pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Loading PDF...</span>
                  </div>
                </div>
              </div>
            </div>
          )

        case 'error':
          return error ?? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="flex flex-col items-center gap-2 text-destructive">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <span className="text-sm font-medium">Failed to load PDF</span>
                {errorMessage && (
                  <span className="text-xs text-muted-foreground text-center">
                    {errorMessage}
                  </span>
                )}
              </div>
            </div>
          )

        case 'loaded':
          if (pdfSrc) {
            return (
              <div className="relative w-full h-full">
                <iframe
                  src={pdfSrc}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                  onLoad={() => {
                    setLoadingState('loaded')
                    onLoad?.()
                  }}
                  onError={() => {
                    const error = new Error('Failed to load PDF')
                    setErrorMessage(error.message)
                    setLoadingState('error')
                    onError?.(error)
                  }}
                />
                {children}
              </div>
            )
          }
          return placeholder ?? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">No PDF selected</span>
              </div>
            </div>
          )

        default:
          return placeholder ?? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">PDF Preview</span>
              </div>
            </div>
          )
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg',
          'border border-border/50 bg-background',
          'shadow-sm transition-shadow hover:shadow-md',
          '[--card-border-radius:0.5rem]',
          className
        )}
        style={{ width, height }}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none" />
        <div className="relative h-full">
          {renderContent()}
        </div>
      </div>
    )
  }
)

PDFPreview.displayName = 'PDFPreview'

export { PDFPreview }
export type { PDFPreviewProps }