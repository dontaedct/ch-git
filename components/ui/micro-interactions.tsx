/**
 * @fileoverview HT-008.5.7: Micro-Interaction Components
 * @module components/ui/micro-interactions
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.7 - Add micro-interactions and advanced UX patterns
 * Focus: Vercel/Apply-level micro-interaction components
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and accessibility)
 */

'use client'

import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  useMicroInteraction,
  useScrollAnimation,
  useIntersectionAnimation,
  useGestureInteraction,
  useKeyboardInteraction,
  useRippleEffect,
  useMagneticEffect,
} from '@/lib/motion/interactions'

// HT-008.5.7: Enhanced Micro-Interaction Components
// Sophisticated interaction patterns following Vercel/Apply design principles

/**
 * Interactive Button with Micro-Interactions
 */
const interactiveButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-theme-primary text-theme-inverse hover:bg-theme-primary-hover active:bg-theme-primary-active focus:ring-theme-primary",
        secondary: "bg-theme-surface text-theme border border-theme-border hover:bg-theme-elevated focus:ring-theme-primary",
        ghost: "text-theme hover:bg-theme-elevated focus:ring-theme-primary",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
      interaction: {
        lift: "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        scale: "hover:scale-105 active:scale-95",
        glow: "hover:shadow-lg hover:shadow-theme-primary/25",
        magnetic: "transform-gpu",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      interaction: "lift",
    },
  }
)

export interface InteractiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof interactiveButtonVariants> {
  children: React.ReactNode
  loading?: boolean
  ripple?: boolean
}

export const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ className, variant, size, interaction, loading, ripple = true, children, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false)
    const { ripples, createRipple } = useRippleEffect()
    const { magneticOffset, elementRef } = useMagneticEffect(0.2)
    const { hover } = useMicroInteraction()
    
    const handleMouseDown = (event: React.MouseEvent) => {
      if (ripple) {
        createRipple(event)
      }
      setIsPressed(true)
    }
    
    const handleMouseUp = () => {
      setIsPressed(false)
    }
    
    const handleMouseLeave = () => {
      setIsPressed(false)
    }
    
    return (
      <button
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') ref(node)
            else if (ref.current !== undefined) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
          }
          if (elementRef && elementRef.current !== undefined) {
            (elementRef as React.MutableRefObject<HTMLElement | null>).current = node
          }
        }}
        className={cn(interactiveButtonVariants({ variant, size, interaction }), className)}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        disabled={loading}
        style={{
          transform: interaction === 'magnetic' 
            ? `translate(${magneticOffset.x}px, ${magneticOffset.y}px)` 
            : undefined,
          transition: hover.scale,
        }}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        
        <span className={cn(loading && "opacity-0")}>
          {children}
        </span>
        
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none rounded-full bg-white/30 animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
      </button>
    )
  }
)
InteractiveButton.displayName = "InteractiveButton"

/**
 * Hover Card with Micro-Interactions
 */
export interface InteractiveHoverCardProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
}

export const InteractiveHoverCard = forwardRef<HTMLDivElement, InteractiveHoverCardProps>(
  ({ children, content, side = 'bottom', align = 'center', delayDuration = 200, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const triggerRef = useRef<HTMLDivElement>(null)
    const { hover } = useMicroInteraction()
    
    const handleMouseEnter = () => {
      setIsOpen(true)
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({ x: rect.left, y: rect.top })
      }
    }
    
    const handleMouseLeave = () => {
      setIsOpen(false)
    }
    
    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={triggerRef}>
          {children}
        </div>
        
        {isOpen && (
          <div
            className="absolute z-50 rounded-lg border border-theme-border bg-theme-surface p-3 shadow-theme-elevated"
            style={{
              [side]: '100%',
              left: align === 'start' ? 0 : align === 'end' ? 'auto' : '50%',
              right: align === 'end' ? 0 : 'auto',
              transform: align === 'center' ? 'translateX(-50%)' : undefined,
              transition: hover.scale,
            }}
          >
            {content}
          </div>
        )}
      </div>
    )
  }
)
InteractiveHoverCard.displayName = "InteractiveHoverCard"

/**
 * Animated Card with Scroll Effects
 */
export interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade' | 'slide' | 'scale' | 'parallax'
  delay?: number
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, animation = 'fade', delay = 0 }, ref) => {
    const { isIntersecting, elementRef } = useIntersectionAnimation()
    const { scrollY } = useScrollAnimation()
    const { transition } = useMicroInteraction()
    
    const getAnimationStyle = () => {
      const baseStyle = {
        transition: transition.enter,
        transitionDelay: `${delay}ms`,
      }
      
      if (!isIntersecting) {
        switch (animation) {
          case 'fade':
            return { ...baseStyle, opacity: 0 }
          case 'slide':
            return { ...baseStyle, opacity: 0, transform: 'translateY(20px)' }
          case 'scale':
            return { ...baseStyle, opacity: 0, transform: 'scale(0.95)' }
          case 'parallax':
            return { ...baseStyle, transform: `translateY(${scrollY * 0.1}px)` }
          default:
            return baseStyle
        }
      }
      
      return {
        ...baseStyle,
        opacity: 1,
        transform: animation === 'parallax' ? `translateY(${scrollY * 0.1}px)` : 'none',
      }
    }
    
    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') ref(node)
            else if (ref.current !== undefined) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
          }
          if (elementRef && elementRef.current !== undefined) {
            (elementRef as React.MutableRefObject<HTMLElement | null>).current = node
          }
        }}
        className={cn("card-theme rounded-lg p-6", className)}
        style={getAnimationStyle()}
      >
        {children}
      </div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

/**
 * Interactive Input with Micro-Interactions
 */
export interface InteractiveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  loading?: boolean
}

export const InteractiveInput = forwardRef<HTMLInputElement, InteractiveInputProps>(
  ({ className, label, error, success, loading, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const { focus, active } = useMicroInteraction()
    const { isKeyboardUser } = useKeyboardInteraction()
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }
    
    return (
      <div className="relative">
        {label && (
          <label className={cn(
            "absolute left-3 transition-all duration-200 pointer-events-none",
            isFocused || hasValue
              ? "top-1 text-xs text-theme-primary"
              : "top-3 text-sm text-theme-muted"
          )}>
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-3 rounded-lg border transition-all duration-200 focus:outline-none",
            "bg-theme-surface text-theme border-theme-border",
            "focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            success && "border-green-500 focus:border-green-500 focus:ring-green-500/20",
            loading && "opacity-50",
            isKeyboardUser && "focus:ring-2 focus:ring-offset-2",
            className
          )}
          style={{
            transition: focus.outline,
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-theme-primary border-t-transparent" />
          </div>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
InteractiveInput.displayName = "InteractiveInput"

/**
 * Loading Spinner with Micro-Interactions
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'shimmer'
  className?: string
}

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', variant = 'spinner', className }, ref) => {
    const { loading } = useMicroInteraction()
    
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    }
    
    if (variant === 'spinner') {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-full border-2 border-theme-border border-t-theme-primary",
            sizeClasses[size],
            className
          )}
          style={{
            animation: `spin ${loading.spin}`,
          }}
        />
      )
    }
    
    if (variant === 'dots') {
      return (
        <div ref={ref} className={cn("flex space-x-1", className)}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-theme-primary",
                size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
              )}
              style={{
                animation: `pulse ${loading.pulse}`,
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      )
    }
    
    if (variant === 'pulse') {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-full bg-theme-primary",
            sizeClasses[size],
            className
          )}
          style={{
            animation: `pulse ${loading.pulse}`,
          }}
        />
      )
    }
    
    if (variant === 'shimmer') {
      return (
        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden rounded-lg bg-theme-border",
            sizeClasses[size],
            className
          )}
        >
          <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              animation: `shimmer ${loading.shimmer}`,
            }}
          />
        </div>
      )
    }
    
    return null
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

/**
 * Progress Bar with Micro-Interactions
 */
export interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  animated?: boolean
  className?: string
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, size = 'md', variant = 'default', animated = true, className }, ref) => {
    const [displayValue, setDisplayValue] = useState(0)
    const { transition } = useMicroInteraction()
    
    useEffect(() => {
      if (animated) {
        const timer = setTimeout(() => {
          setDisplayValue(value)
        }, 100)
        return () => clearTimeout(timer)
      } else {
        setDisplayValue(value)
      }
    }, [value, animated])
    
    const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }
    
    const variantClasses = {
      default: 'bg-theme-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-full bg-theme-border overflow-hidden",
          sizeClasses[size],
          className
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[variant]
          )}
          style={{
            width: `${percentage}%`,
            transition: transition.enter,
          }}
        />
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

/**
 * Floating Action Button with Micro-Interactions
 */
export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  tooltip?: string
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, icon, size = 'md', position = 'bottom-right', tooltip, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const { hover, active } = useMicroInteraction()
    const { magneticOffset, elementRef } = useMagneticEffect(0.3)
    
    useEffect(() => {
      setIsVisible(true)
    }, [])
    
    const sizeClasses = {
      sm: 'h-10 w-10',
      md: 'h-12 w-12',
      lg: 'h-14 w-14',
    }
    
    const positionClasses = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
    }
    
    return (
      <button
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') ref(node)
            else if (ref.current !== undefined) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
          }
          if (elementRef && elementRef.current !== undefined) {
            (elementRef as React.MutableRefObject<HTMLElement | null>).current = node
          }
        }}
        className={cn(
          "fixed z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
          "bg-theme-primary text-theme-inverse hover:bg-theme-primary-hover",
          "focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2",
          "hover:scale-110 active:scale-95",
          sizeClasses[size],
          positionClasses[position],
          !isVisible && "opacity-0 scale-0",
          className
        )}
        style={{
          transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`,
          transition: hover.scale,
        }}
        title={tooltip}
        {...props}
      >
        {icon}
      </button>
    )
  }
)
FloatingActionButton.displayName = "FloatingActionButton"

// All components are already exported as const above
