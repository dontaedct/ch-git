import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-gray-900 dark:file:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 selection:bg-blue-600 selection:text-white flex w-full min-w-0 rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm transition-all duration-300 ease-out outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 high-tech-input",
  {
    variants: {
      variant: {
        default: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20",
        error: "border-red-500 bg-red-50 dark:bg-red-950 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20",
        success: "border-green-500 bg-green-50 dark:bg-green-950 focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20",
        warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950 focus-visible:border-yellow-500 focus-visible:ring-2 focus-visible:ring-yellow-500/20",
      },
      size: {
        sm: "h-9 px-3 py-2 text-xs",
        default: "h-11 px-4 py-3 text-sm",
        lg: "h-12 px-5 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helper?: string
  error?: string
  success?: string
  warning?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

function Input({
  className,
  type,
  variant,
  size,
  label,
  helper,
  error,
  success,
  warning,
  icon,
  iconPosition = 'left',
  id,
  ...props
}: InputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`
  
  // Determine variant based on validation state
  const effectiveVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant
  const validationMessage = error ?? success ?? warning
  const hasIcon = Boolean(icon)
  
  const inputElement = (
    <div className="relative">
      {hasIcon && iconPosition === 'left' && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <input
        id={inputId}
        type={type}
        data-slot="input"
        className={cn(
          inputVariants({ variant: effectiveVariant, size, className }),
          hasIcon && iconPosition === 'left' && "pl-10",
          hasIcon && iconPosition === 'right' && "pr-10"
        )}
        aria-describedby={cn(
          helper && helperId,
          validationMessage && errorId
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {hasIcon && iconPosition === 'right' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
    </div>
  )
  
  if (!label && !helper && !validationMessage) {
    return inputElement
  }
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      {inputElement}
      {helper && !validationMessage && (
        <p id={helperId} className="text-xs text-gray-600 dark:text-gray-400">
          {helper}
        </p>
      )}
      {validationMessage && (
        <p
          id={errorId}
          className={cn(
            "text-xs font-medium flex items-center gap-1",
            error && "text-destructive",
            success && "text-green-600 dark:text-green-400",
            warning && "text-yellow-600 dark:text-yellow-400"
          )}
        >
          {error && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {success && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {warning && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {validationMessage}
        </p>
      )}
    </div>
  )
}

export { Input, inputVariants }
