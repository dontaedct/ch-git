/**
 * @fileoverview HT-008.5.3: Comprehensive Loading States and Feedback System
 * @module components/ui/loading-states
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.3 - Add comprehensive loading states and feedback
 * Focus: Vercel/Apply-level loading states with comprehensive user feedback
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and feedback)
 */

'use client'

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

// HT-008.5.3: Enhanced Loading States System
// Comprehensive loading indicators with Vercel/Apply-level UX

/**
 * Loading Spinner Component
 * Multiple variants for different contexts
 */
const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        xs: "w-3 h-3",
        sm: "w-4 h-4", 
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        white: "text-white",
        destructive: "text-destructive",
        success: "text-success",
        warning: "text-warning",
        info: "text-info",
      },
      speed: {
        slow: "animate-spin",
        normal: "animate-spin",
        fast: "animate-spin",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      speed: "normal",
    },
  }
);

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  'aria-label'?: string;
}

export function Spinner({ size, variant, speed, className, ...props }: SpinnerProps) {
  return (
    <Loader2 
      className={cn(spinnerVariants({ size, variant, speed }), className)}
      aria-label={props['aria-label'] || 'Loading'}
      {...props}
    />
  );
}

/**
 * Pulse Loading Animation
 * For skeleton-like loading states
 */
const pulseVariants = cva(
  "animate-pulse bg-muted rounded",
  {
    variants: {
      size: {
        xs: "h-2",
        sm: "h-3",
        md: "h-4",
        lg: "h-6",
        xl: "h-8",
      },
      width: {
        full: "w-full",
        '3/4': "w-3/4",
        '1/2': "w-1/2",
        '1/4': "w-1/4",
        '1/3': "w-1/3",
        '2/3': "w-2/3",
      },
      shape: {
        rectangle: "rounded",
        circle: "rounded-full",
        pill: "rounded-full",
      }
    },
    defaultVariants: {
      size: "md",
      width: "full",
      shape: "rectangle",
    },
  }
);

interface PulseProps extends VariantProps<typeof pulseVariants> {
  className?: string;
}

export function Pulse({ size, width, shape, className }: PulseProps) {
  return (
    <div 
      className={cn(pulseVariants({ size, width, shape }), className)}
      aria-hidden="true"
    />
  );
}

/**
 * Loading State Component
 * Comprehensive loading states with different contexts
 */
const loadingStateVariants = cva(
  "flex flex-col items-center justify-center gap-4 p-8 text-center",
  {
    variants: {
      size: {
        sm: "min-h-[120px] p-4",
        md: "min-h-[200px] p-6",
        lg: "min-h-[300px] p-8",
        xl: "min-h-[400px] p-12",
      },
      variant: {
        default: "bg-background border border-border rounded-lg",
        card: "bg-card border border-border rounded-lg shadow-sm",
        minimal: "bg-transparent",
        overlay: "bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg",
      },
      layout: {
        vertical: "flex-col",
        horizontal: "flex-row",
        centered: "flex-col items-center justify-center",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      layout: "vertical",
    },
  }
);

interface LoadingStateProps extends VariantProps<typeof loadingStateVariants> {
  title?: string;
  description?: string;
  showSpinner?: boolean;
  showProgress?: boolean;
  progress?: number;
  estimatedTime?: string;
  className?: string;
  children?: React.ReactNode;
}

export function LoadingState({
  title = "Loading...",
  description,
  showSpinner = true,
  showProgress = false,
  progress,
  estimatedTime,
  size,
  variant,
  layout,
  className,
  children,
}: LoadingStateProps) {
  return (
    <div className={cn(loadingStateVariants({ size, variant, layout }), className)}>
      {showSpinner && (
        <div className="flex items-center justify-center">
          <Spinner size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} />
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {estimatedTime && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {estimatedTime}
          </p>
        )}
      </div>
      
      {showProgress && progress !== undefined && (
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}

/**
 * Skeleton Loading Components
 * For content placeholders
 */
export function SkeletonCard() {
  return (
    <div className="space-y-4 p-6 border border-border rounded-lg">
      <div className="flex items-center space-x-4">
        <Pulse size="lg" width="1/4" shape="circle" />
        <div className="space-y-2 flex-1">
          <Pulse size="sm" width="3/4" />
          <Pulse size="xs" width="1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Pulse size="sm" width="full" />
        <Pulse size="sm" width="3/4" />
        <Pulse size="sm" width="2/3" />
      </div>
      <div className="flex space-x-2">
        <Pulse size="sm" width="1/4" />
        <Pulse size="sm" width="1/4" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
          <Pulse size="md" width="1/4" shape="circle" />
          <div className="space-y-2 flex-1">
            <Pulse size="sm" width="3/4" />
            <Pulse size="xs" width="1/2" />
          </div>
          <Pulse size="sm" width="1/4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Pulse key={i} size="sm" width="1/4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Pulse key={colIndex} size="sm" width="1/4" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Status Indicator Component
 * For showing different states (loading, success, error, etc.)
 */
const statusVariants = cva(
  "flex items-center gap-2 text-sm font-medium",
  {
    variants: {
      status: {
        loading: "text-muted-foreground",
        success: "text-success",
        error: "text-destructive",
        warning: "text-warning",
        info: "text-info",
        idle: "text-muted-foreground",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      }
    },
    defaultVariants: {
      status: "idle",
      size: "md",
    },
  }
);

interface StatusIndicatorProps extends VariantProps<typeof statusVariants> {
  message?: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  size, 
  message, 
  showIcon = true, 
  className 
}: StatusIndicatorProps) {
  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (status) {
      case 'loading':
        return <Spinner size="sm" variant="muted" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'info':
        return <AlertCircle className="w-4 h-4 text-info" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(statusVariants({ status, size }), className)}>
      {getIcon()}
      {message && <span>{message}</span>}
    </div>
  );
}

/**
 * Loading Button Component
 * Button with integrated loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-background text-foreground hover:bg-muted",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  
  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" variant="white" />}
      {loading ? loadingText || 'Loading...' : children}
    </button>
  );
}

/**
 * Progress Loading Component
 * For operations with known progress
 */
interface ProgressLoadingProps {
  progress: number;
  title?: string;
  description?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressLoading({
  progress,
  title,
  description,
  showPercentage = true,
  size = 'md',
  className,
}: ProgressLoadingProps) {
  const sizeClasses = {
    sm: "space-y-2",
    md: "space-y-3",
    lg: "space-y-4",
  };

  const progressSizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", sizeClasses[size], className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-medium text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          {showPercentage && <span>{Math.round(progress)}%</span>}
        </div>
        <div className={cn("w-full bg-muted rounded-full overflow-hidden", progressSizeClasses[size])}>
          <div 
            className={cn(
              "bg-primary transition-all duration-300 ease-out rounded-full",
              progressSizeClasses[size]
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Loading Component
 * For small loading indicators within content
 */
interface InlineLoadingProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'default' | 'muted' | 'primary';
  className?: string;
}

export function InlineLoading({
  text = "Loading...",
  size = 'sm',
  variant = 'default',
  className,
}: InlineLoadingProps) {
  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
  };

  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner size={size} variant={variant === 'primary' ? 'default' : variant} />
      <span className={cn(textSizeClasses[size], variantClasses[variant])}>
        {text}
      </span>
    </div>
  );
}

/**
 * Loading Overlay Component
 * For full-screen or section loading states
 */
interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
  description?: string;
  showProgress?: boolean;
  progress?: number;
  zIndex?: number;
  className?: string;
}

export function LoadingOverlay({
  visible,
  title,
  description,
  showProgress,
  progress,
  zIndex = 50,
  className,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center",
        className
      )}
      style={{ zIndex }}
    >
      <LoadingState
        title={title}
        description={description}
        showProgress={showProgress}
        progress={progress}
        variant="overlay"
        size="lg"
      />
    </div>
  );
}

export default {
  Spinner,
  Pulse,
  LoadingState,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  StatusIndicator,
  LoadingButton,
  ProgressLoading,
  InlineLoading,
  LoadingOverlay,
};
