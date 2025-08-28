import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y",
  {
    variants: {
      variant: {
        default: "border-input hover:border-input/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
        error: "border-destructive bg-destructive/5 focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/20",
        success: "border-green-500 bg-green-50 dark:bg-green-950 focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20",
        warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950 focus-visible:border-yellow-500 focus-visible:ring-2 focus-visible:ring-yellow-500/20",
      },
      size: {
        sm: "min-h-12 px-2 py-1 text-xs",
        default: "min-h-16 px-3 py-2 text-sm",
        lg: "min-h-20 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {
  label?: string
  helper?: string
  error?: string
  success?: string
  warning?: string
}

function Textarea({
  className,
  variant,
  size,
  label,
  helper,
  error,
  success,
  warning,
  id,
  ...props
}: TextareaProps) {
  const generatedId = React.useId()
  const textareaId = id ?? generatedId
  const helperId = `${textareaId}-helper`
  const errorId = `${textareaId}-error`
  
  // Determine variant based on validation state
  const effectiveVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant
  const validationMessage = error ?? success ?? warning
  
  const textareaElement = (
    <textarea
      id={textareaId}
      data-slot="textarea"
      className={cn(textareaVariants({ variant: effectiveVariant, size, className }))}
      aria-describedby={cn(
        helper && helperId,
        validationMessage && errorId
      )}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  )
  
  if (!label && !helper && !validationMessage) {
    return textareaElement
  }
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      {textareaElement}
      {helper && !validationMessage && (
        <p id={helperId} className="text-xs text-muted-foreground">
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

export { Textarea, textareaVariants }
