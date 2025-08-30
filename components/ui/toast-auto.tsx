'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToastAutoProps {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  duration?: number
  onClose?: () => void
  className?: string
  children?: React.ReactNode
}

const ToastAuto = React.forwardRef<HTMLDivElement, ToastAutoProps>(
  (
    {
      title,
      description,
      variant = 'default',
      duration = 5000,
      onClose,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300) // Wait for exit animation
        }, duration)
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [duration, onClose])

    const handleClose = React.useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for exit animation
    }, [onClose])

    if (!isVisible) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          'group pointer-events-auto relative flex w-full max-w-[var(--toast-max-width)]',
          'items-center justify-between space-x-4 overflow-hidden',
          'rounded-[var(--toast-border-radius)] border p-[var(--toast-padding)]',
          'shadow-[var(--toast-shadow)] transition-all duration-300',
          'animate-in slide-in-from-right-full',
          !isVisible && 'animate-out slide-out-to-right-full fade-out-80',
          variant === 'default' && 'border-border bg-background text-foreground',
          variant === 'success' && 'border-success bg-success text-success-foreground',
          variant === 'warning' && 'border-warning bg-warning text-warning-foreground',
          variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground',
          className
        )}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        {...props}
      >
        <div className="flex-1 grid gap-1">
          {title && (
            <div className="text-sm font-semibold leading-none tracking-tight">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
          {children}
        </div>

        <button
          type="button"
          onClick={handleClose}
          className={cn(
            'absolute right-2 top-2 rounded-md p-1 transition-opacity',
            'opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            variant === 'default' && 'text-foreground/50 hover:text-foreground',
            variant === 'success' && 'text-success-foreground/70 hover:text-success-foreground',
            variant === 'warning' && 'text-warning-foreground/70 hover:text-warning-foreground',
            variant === 'destructive' && 'text-destructive-foreground/70 hover:text-destructive-foreground'
          )}
          aria-label="Close"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    )
  }
)

ToastAuto.displayName = 'ToastAuto'

// Toast Container for positioning
interface ToastAutoContainerProps {
  children: React.ReactNode
  className?: string
}

const ToastAutoContainer = React.forwardRef<HTMLDivElement, ToastAutoContainerProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4',
        'sm:top-4 sm:right-4 sm:left-auto sm:w-auto sm:flex-col',
        'pointer-events-none',
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {children}
      </div>
    </div>
  )
)

ToastAutoContainer.displayName = 'ToastAutoContainer'

// Hook for managing toasts
interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  duration?: number
}

export function useToastAuto() {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  }
}

export { ToastAuto, ToastAutoContainer }
export type { ToastAutoProps, ToastData }