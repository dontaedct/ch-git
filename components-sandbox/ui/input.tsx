/**
 * @fileoverview HT-006 Token-Driven Input Component
 * @module components-sandbox/ui/input
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 2 - Elements & CVA Variants
 * Purpose: Token-driven Input with comprehensive CVA variants and validation states
 * Safety: Sandbox-isolated, no production impact
 * Status: Phase 2 implementation
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    // Base styles using CSS variables from tokens
    "flex w-full min-w-0 border transition-colors",
    "text-[--input-text-size] text-[--semantic-foreground]",
    "bg-[--semantic-background] border-[--input-border-color]",
    "rounded-[--input-border-radius]",
    "placeholder:text-[--semantic-muted-foreground]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--input-focus-ring] focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-[--input-text-size] file:font-medium",
    "selection:bg-[--semantic-primary] selection:text-[--semantic-primary-foreground]"
  ],
  {
    variants: {
      variant: {
        outline: [
          "border-[--semantic-border]",
          "hover:border-[--semantic-border]/80",
          "focus-visible:border-[--semantic-primary]",
          "[--input-border-color:var(--semantic-border)]",
          "[--input-focus-ring:var(--semantic-primary)]"
        ],
        filled: [
          "border-transparent bg-[--semantic-muted]",
          "hover:bg-[--semantic-muted]/80",
          "focus-visible:bg-[--semantic-background] focus-visible:border-[--semantic-primary]",
          "[--input-border-color:transparent]",
          "[--input-focus-ring:var(--semantic-primary)]"
        ]
      },
      size: {
        sm: [
          "h-8 px-2 py-1",
          "[--input-text-size:var(--font-size-xs)]",
          "[--input-border-radius:var(--border-radius-sm)]"
        ],
        md: [
          "h-9 px-3 py-2",
          "[--input-text-size:var(--font-size-sm)]",
          "[--input-border-radius:var(--border-radius-md)]"
        ],
        lg: [
          "h-10 px-4 py-3",
          "[--input-text-size:var(--font-size-base)]",
          "[--input-border-radius:var(--border-radius-md)]"
        ]
      },
      state: {
        default: "",
        invalid: [
          "border-[--color-danger-500] bg-[--color-danger-50]/50",
          "focus-visible:border-[--color-danger-500] focus-visible:ring-[--color-danger-500]",
          "[--input-border-color:var(--color-danger-500)]",
          "[--input-focus-ring:var(--color-danger-500)]",
          "dark:bg-[--color-danger-950]/20"
        ],
        success: [
          "border-[--color-success-500] bg-[--color-success-50]/50",
          "focus-visible:border-[--color-success-500] focus-visible:ring-[--color-success-500]",
          "[--input-border-color:var(--color-success-500)]",
          "[--input-focus-ring:var(--color-success-500)]",
          "dark:bg-[--color-success-950]/20"
        ],
        warning: [
          "border-[--color-warning-500] bg-[--color-warning-50]/50",
          "focus-visible:border-[--color-warning-500] focus-visible:ring-[--color-warning-500]",
          "[--input-border-color:var(--color-warning-500)]",
          "[--input-focus-ring:var(--color-warning-500)]",
          "dark:bg-[--color-warning-950]/20"
        ]
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      state: "default"
    }
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helper?: string
  error?: string
  success?: string
  warning?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  required?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    variant,
    size,
    state,
    label,
    helper,
    error,
    success,
    warning,
    icon,
    iconPosition = 'left',
    id,
    required,
    ...props
  }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`
    
    // Determine state based on validation messages
    const effectiveState = error ? 'invalid' : success ? 'success' : warning ? 'warning' : state
    const validationMessage = error ?? success ?? warning
    const hasIcon = Boolean(icon)
    
    const inputElement = (
      <div className="relative">
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[--semantic-muted-foreground] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            inputVariants({ variant, size, state: effectiveState, className }),
            hasIcon && iconPosition === 'left' && "pl-10",
            hasIcon && iconPosition === 'right' && "pr-10"
          )}
          aria-describedby={cn(
            helper && helperId,
            validationMessage && errorId
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          {...props}
        />
        {hasIcon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[--semantic-muted-foreground] pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    )
    
    // Return just the input if no labels or messages
    if (!label && !helper && !validationMessage) {
      return inputElement
    }
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-[--font-size-sm] font-[--font-weight-medium] text-[--semantic-foreground] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && (
              <span className="text-[--color-danger-500] ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        {inputElement}
        {helper && !validationMessage && (
          <p id={helperId} className="text-[--font-size-xs] text-[--semantic-muted-foreground]">
            {helper}
          </p>
        )}
        {validationMessage && (
          <p 
            id={errorId} 
            className={cn(
              "text-[--font-size-xs] font-[--font-weight-medium]",
              error && "text-[--color-danger-500]",
              success && "text-[--color-success-500]",
              warning && "text-[--color-warning-500]"
            )}
            role={error ? "alert" : "status"}
          >
            {validationMessage}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
