/**
 * @fileoverview HT-008.5.3: Enhanced Skeleton Loading System
 * @module components/ui/skeletons-enhanced
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.3 - Add comprehensive loading states and feedback
 * Focus: Vercel/Apply-level skeleton loading with comprehensive patterns
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and feedback)
 */

'use client'

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// HT-008.5.3: Enhanced Skeleton System
// Comprehensive skeleton patterns for different content types

/**
 * Base Skeleton Component
 * Enhanced with shimmer effect and better animations
 */
const skeletonVariants = cva(
  "relative overflow-hidden bg-muted rounded",
  {
    variants: {
      variant: {
        default: "bg-muted",
        card: "bg-card",
        subtle: "bg-muted/50",
      },
      animation: {
        pulse: "animate-pulse",
        shimmer: "animate-shimmer",
        none: "",
      },
      shape: {
        rectangle: "rounded",
        circle: "rounded-full",
        pill: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "default",
      animation: "pulse",
      shape: "rectangle",
    },
  }
);

interface SkeletonProps extends VariantProps<typeof skeletonVariants> {
  className?: string;
  width?: string | number;
  height?: string | number;
  children?: React.ReactNode;
}

export function Skeleton({ 
  variant, 
  animation, 
  shape, 
  className, 
  width, 
  height, 
  children,
  ...props 
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(skeletonVariants({ variant, animation, shape }), className)}
      style={style}
      {...props}
    >
      {children}
      {animation === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </div>
  );
}

/**
 * Text Skeleton Component
 * For text content placeholders
 */
interface TextSkeletonProps {
  lines?: number;
  className?: string;
  variant?: 'paragraph' | 'heading' | 'caption';
}

export function TextSkeleton({ 
  lines = 3, 
  className,
  variant = 'paragraph' 
}: TextSkeletonProps) {
  const getLineWidth = (index: number) => {
    switch (variant) {
      case 'heading':
        return index === 0 ? 'w-3/4' : 'w-1/2';
      case 'caption':
        return 'w-1/3';
      case 'paragraph':
      default:
        if (index === lines - 1) return 'w-2/3';
        return 'w-full';
    }
  };

  const getLineHeight = () => {
    switch (variant) {
      case 'heading':
        return 'h-6';
      case 'caption':
        return 'h-3';
      case 'paragraph':
      default:
        return 'h-4';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(getLineHeight(), getLineWidth(index))}
          animation="shimmer"
        />
      ))}
    </div>
  );
}

/**
 * Avatar Skeleton Component
 * For user avatars and profile images
 */
interface AvatarSkeletonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarSkeleton({ size = 'md', className }: AvatarSkeletonProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      shape="circle"
      animation="shimmer"
    />
  );
}

/**
 * Card Skeleton Component
 * For card-based content layouts
 */
interface CardSkeletonProps {
  showAvatar?: boolean;
  showActions?: boolean;
  lines?: number;
  className?: string;
}

export function CardSkeleton({ 
  showAvatar = false, 
  showActions = true, 
  lines = 3,
  className 
}: CardSkeletonProps) {
  return (
    <div className={cn("p-6 border border-border rounded-lg space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        {showAvatar && <AvatarSkeleton size="md" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" animation="shimmer" />
          <Skeleton className="h-3 w-1/2" animation="shimmer" />
        </div>
      </div>
      
      {/* Content */}
      <TextSkeleton lines={lines} variant="paragraph" />
      
      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-8 w-20" animation="shimmer" />
          <Skeleton className="h-8 w-16" animation="shimmer" />
        </div>
      )}
    </div>
  );
}

/**
 * List Skeleton Component
 * For list-based content layouts
 */
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export function ListSkeleton({ 
  items = 5, 
  showAvatar = true, 
  showSubtitle = true,
  className 
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
          {showAvatar && <AvatarSkeleton size="sm" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" animation="shimmer" />
            {showSubtitle && <Skeleton className="h-3 w-1/2" animation="shimmer" />}
          </div>
          <Skeleton className="h-4 w-16" animation="shimmer" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton Component
 * For table-based content layouts
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className 
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex space-x-4 pb-2 border-b border-border">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-24" animation="shimmer" />
          ))}
        </div>
      )}
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-20" animation="shimmer" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton Component
 * For form-based content layouts
 */
interface FormSkeletonProps {
  fields?: number;
  showSubmit?: boolean;
  className?: string;
}

export function FormSkeleton({ 
  fields = 4, 
  showSubmit = true,
  className 
}: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-1/4" animation="shimmer" />
          <Skeleton className="h-10 w-full" animation="shimmer" />
        </div>
      ))}
      
      {showSubmit && (
        <div className="flex space-x-3 pt-4">
          <Skeleton className="h-10 w-24" animation="shimmer" />
          <Skeleton className="h-10 w-20" animation="shimmer" />
        </div>
      )}
    </div>
  );
}

/**
 * Dashboard Skeleton Component
 * For dashboard-style layouts
 */
interface DashboardSkeletonProps {
  showSidebar?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function DashboardSkeleton({ 
  showSidebar = true, 
  showHeader = true,
  className 
}: DashboardSkeletonProps) {
  return (
    <div className={cn("flex h-screen", className)}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r border-border p-4 space-y-4">
          <Skeleton className="h-8 w-32" animation="shimmer" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-full" animation="shimmer" />
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {showHeader && (
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" animation="shimmer" />
              <div className="flex space-x-3">
                <Skeleton className="h-8 w-8" shape="circle" animation="shimmer" />
                <Skeleton className="h-8 w-24" animation="shimmer" />
              </div>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton lines={4} />
            <CardSkeleton lines={4} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page Skeleton Component
 * For full page loading states
 */
interface PageSkeletonProps {
  variant?: 'dashboard' | 'content' | 'form' | 'list';
  className?: string;
}

export function PageSkeleton({ variant = 'content', className }: PageSkeletonProps) {
  switch (variant) {
    case 'dashboard':
      return <DashboardSkeleton className={className} />;
    case 'form':
      return <FormSkeleton className={className} />;
    case 'list':
      return <ListSkeleton className={className} />;
    case 'content':
    default:
      return (
        <div className={cn("space-y-6 p-6", className)}>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" animation="shimmer" />
            <Skeleton className="h-4 w-96" animation="shimmer" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      );
  }
}

/**
 * Custom Skeleton Component
 * For specific content patterns
 */
interface CustomSkeletonProps {
  pattern: 'blog-post' | 'product-card' | 'user-profile' | 'notification';
  className?: string;
}

export function CustomSkeleton({ pattern, className }: CustomSkeletonProps) {
  switch (pattern) {
    case 'blog-post':
      return (
        <div className={cn("space-y-4", className)}>
          <Skeleton className="h-8 w-3/4" animation="shimmer" />
          <div className="flex items-center space-x-3">
            <AvatarSkeleton size="sm" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" animation="shimmer" />
              <Skeleton className="h-3 w-16" animation="shimmer" />
            </div>
          </div>
          <TextSkeleton lines={4} />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16" animation="shimmer" />
            <Skeleton className="h-6 w-20" animation="shimmer" />
          </div>
        </div>
      );
      
    case 'product-card':
      return (
        <div className={cn("space-y-3", className)}>
          <Skeleton className="h-48 w-full" animation="shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" animation="shimmer" />
            <Skeleton className="h-3 w-1/2" animation="shimmer" />
            <Skeleton className="h-5 w-20" animation="shimmer" />
          </div>
          <Skeleton className="h-10 w-full" animation="shimmer" />
        </div>
      );
      
    case 'user-profile':
      return (
        <div className={cn("space-y-4", className)}>
          <div className="flex items-center space-x-4">
            <AvatarSkeleton size="xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" animation="shimmer" />
              <Skeleton className="h-4 w-24" animation="shimmer" />
            </div>
          </div>
          <TextSkeleton lines={3} />
          <div className="flex space-x-3">
            <Skeleton className="h-8 w-20" animation="shimmer" />
            <Skeleton className="h-8 w-24" animation="shimmer" />
          </div>
        </div>
      );
      
    case 'notification':
      return (
        <div className={cn("flex items-start space-x-3 p-4 border border-border rounded-lg", className)}>
          <AvatarSkeleton size="sm" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" animation="shimmer" />
            <Skeleton className="h-3 w-1/2" animation="shimmer" />
            <Skeleton className="h-3 w-1/3" animation="shimmer" />
          </div>
          <Skeleton className="h-3 w-12" animation="shimmer" />
        </div>
      );
      
    default:
      return <CardSkeleton className={className} />;
  }
}

export default {
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  PageSkeleton,
  CustomSkeleton,
};
