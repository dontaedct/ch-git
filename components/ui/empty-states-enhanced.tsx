/**
 * @fileoverview HT-008.5.8: Enhanced Empty States and Onboarding System
 * @module components/ui/empty-states-enhanced
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.8 - Implement proper empty states and onboarding
 * Focus: Vercel/Apply-level empty states with comprehensive onboarding
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and onboarding)
 */

'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  FileText,
  Users,
  Settings,
  Package,
  BarChart3,
  MessageSquare,
  Clock,
  Plus,
  RefreshCw,
  Inbox,
  FolderOpen,
  Search,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  Zap,
  BookOpen,
  HelpCircle,
  Star,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Download,
  Upload,
  Share2,
  Heart,
  ThumbsUp,
  Award,
  Rocket,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Filter,
  Sort,
  Grid,
  List,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { InteractiveButton } from '@/components/ui/micro-interactions'
import { RevealAnimation, StaggeredContainer } from '@/components/ui/ux-patterns'
import Link from 'next/link'

// HT-008.5.8: Enhanced Empty States and Onboarding System
// Comprehensive empty states with sophisticated onboarding experiences

/**
 * Empty State Types
 */
export type EmptyStateType = 
  | 'default'
  | 'welcome'
  | 'onboarding'
  | 'error'
  | 'loading'
  | 'search'
  | 'filter'
  | 'permission'
  | 'maintenance'
  | 'celebration'

/**
 * Empty State Variants
 */
const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed transition-all duration-300",
  {
    variants: {
      type: {
        default: "border-theme-border bg-theme-surface text-theme",
        welcome: "border-blue-200 bg-blue-50/30 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100",
        onboarding: "border-purple-200 bg-purple-50/30 text-purple-900 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-100",
        error: "border-red-200 bg-red-50/30 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100",
        loading: "border-gray-200 bg-gray-50/30 text-gray-900 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-100",
        search: "border-yellow-200 bg-yellow-50/30 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-100",
        filter: "border-orange-200 bg-orange-50/30 text-orange-900 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-100",
        permission: "border-amber-200 bg-amber-50/30 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100",
        maintenance: "border-slate-200 bg-slate-50/30 text-slate-900 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100",
        celebration: "border-green-200 bg-green-50/30 text-green-900 dark:border-green-800 dark:bg-green-950/30 dark:text-green-100",
      },
      size: {
        sm: "p-4 min-h-[200px]",
        md: "p-6 min-h-[300px]",
        lg: "p-8 min-h-[400px]",
        xl: "p-12 min-h-[500px]",
      },
      layout: {
        centered: "text-center",
        left: "text-left items-start",
        right: "text-right items-end",
      }
    },
    defaultVariants: {
      type: "default",
      size: "md",
      layout: "centered",
    },
  }
)

/**
 * Empty State Props Interface
 */
interface EmptyStateProps extends VariantProps<typeof emptyStateVariants> {
  title: string
  description: string
  icon?: React.ReactNode
  image?: string
  actions?: Array<{
    label: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    icon?: React.ReactNode
  }>
  suggestions?: Array<{
    title: string
    description: string
    href?: string
    onClick?: () => void
  }>
  className?: string
  children?: React.ReactNode
}

/**
 * Base Empty State Component
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    type, 
    size, 
    layout, 
    title, 
    description, 
    icon, 
    image, 
    actions, 
    suggestions, 
    className, 
    children 
  }, ref) => {
    const iconMap = {
      default: <Inbox className="w-12 h-12 text-theme-muted" />,
      welcome: <Rocket className="w-12 h-12 text-blue-500" />,
      onboarding: <Target className="w-12 h-12 text-purple-500" />,
      error: <XCircle className="w-12 h-12 text-red-500" />,
      loading: <RefreshCw className="w-12 h-12 text-gray-500 animate-spin" />,
      search: <Search className="w-12 h-12 text-yellow-500" />,
      filter: <Filter className="w-12 h-12 text-orange-500" />,
      permission: <Lock className="w-12 h-12 text-amber-500" />,
      maintenance: <Settings className="w-12 h-12 text-slate-500" />,
      celebration: <Award className="w-12 h-12 text-green-500" />,
    }

    const displayIcon = icon || iconMap[type || 'default']

    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ type, size, layout }), className)}
      >
        {/* Icon or Image */}
        <div className="mb-6">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-theme-elevated rounded-2xl flex items-center justify-center">
              {displayIcon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4 max-w-md">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-theme-secondary leading-relaxed">{description}</p>
          
          {children}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {actions.map((action, index) => (
              <InteractiveButton
                key={index}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                className="min-w-[120px]"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </InteractiveButton>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-8 w-full max-w-md">
            <Separator className="mb-4" />
            <h4 className="text-sm font-medium text-theme-secondary mb-3">
              You might also like:
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-theme-elevated hover:bg-theme-surface transition-colors cursor-pointer"
                  onClick={suggestion.onClick}
                >
                  <div>
                    <div className="font-medium text-sm">{suggestion.title}</div>
                    <div className="text-xs text-theme-muted">{suggestion.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-theme-muted" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

/**
 * Welcome Empty State
 */
export interface WelcomeEmptyStateProps {
  userName?: string
  onGetStarted?: () => void
  onLearnMore?: () => void
  className?: string
}

export const WelcomeEmptyState = forwardRef<HTMLDivElement, WelcomeEmptyStateProps>(
  ({ userName, onGetStarted, onLearnMore, className }, ref) => {
    return (
      <EmptyState
        ref={ref}
        type="welcome"
        size="xl"
        title={`Welcome${userName ? `, ${userName}` : ''}!`}
        description="We're excited to have you here. Let's get you started with your first steps to success."
        icon={<Rocket className="w-16 h-16 text-blue-500" />}
        actions={[
          {
            label: "Get Started",
            onClick: onGetStarted,
            variant: "primary",
            icon: <ArrowRight className="w-4 h-4" />,
          },
          {
            label: "Learn More",
            onClick: onLearnMore,
            variant: "outline",
            icon: <BookOpen className="w-4 h-4" />,
          },
        ]}
        suggestions={[
          {
            title: "Complete your profile",
            description: "Add your information to get personalized recommendations",
          },
          {
            title: "Explore features",
            description: "Discover what you can do with our platform",
          },
          {
            title: "Connect with others",
            description: "Join our community and start networking",
          },
        ]}
        className={className}
      />
    )
  }
)
WelcomeEmptyState.displayName = "WelcomeEmptyState"

/**
 * Onboarding Empty State
 */
export interface OnboardingEmptyStateProps {
  step: number
  totalSteps: number
  title: string
  description: string
  onNext?: () => void
  onSkip?: () => void
  onPrevious?: () => void
  className?: string
}

export const OnboardingEmptyState = forwardRef<HTMLDivElement, OnboardingEmptyStateProps>(
  ({ step, totalSteps, title, description, onNext, onSkip, onPrevious, className }, ref) => {
    const progress = (step / totalSteps) * 100

    return (
      <EmptyState
        ref={ref}
        type="onboarding"
        size="lg"
        title={title}
        description={description}
        icon={<Target className="w-12 h-12 text-purple-500" />}
        className={className}
      >
        {/* Progress */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm text-theme-secondary mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full max-w-xs mt-6">
          <InteractiveButton
            variant="outline"
            onClick={onPrevious}
            disabled={step === 1}
          >
            Previous
          </InteractiveButton>
          
          <div className="flex gap-2">
            <InteractiveButton
              variant="ghost"
              onClick={onSkip}
            >
              Skip
            </InteractiveButton>
            <InteractiveButton
              variant="primary"
              onClick={onNext}
            >
              {step === totalSteps ? 'Complete' : 'Next'}
            </InteractiveButton>
          </div>
        </div>
      </EmptyState>
    )
  }
)
OnboardingEmptyState.displayName = "OnboardingEmptyState"

/**
 * Search Empty State
 */
export interface SearchEmptyStateProps {
  query?: string
  onClearSearch?: () => void
  onNewSearch?: () => void
  suggestions?: string[]
  className?: string
}

export const SearchEmptyState = forwardRef<HTMLDivElement, SearchEmptyStateProps>(
  ({ query, onClearSearch, onNewSearch, suggestions, className }, ref) => {
    return (
      <EmptyState
        ref={ref}
        type="search"
        size="md"
        title={query ? `No results for "${query}"` : "No search results"}
        description={query 
          ? "We couldn't find anything matching your search. Try adjusting your search terms or filters."
          : "Start typing to search for content, users, or anything else."
        }
        icon={<Search className="w-12 h-12 text-yellow-500" />}
        actions={[
          {
            label: "Clear Search",
            onClick: onClearSearch,
            variant: "outline",
            icon: <XCircle className="w-4 h-4" />,
          },
          {
            label: "New Search",
            onClick: onNewSearch,
            variant: "primary",
            icon: <Search className="w-4 h-4" />,
          },
        ]}
        suggestions={suggestions?.map(suggestion => ({
          title: suggestion,
          description: "Try this search term",
        }))}
        className={className}
      />
    )
  }
)
SearchEmptyState.displayName = "SearchEmptyState"

/**
 * Error Empty State
 */
export interface ErrorEmptyStateProps {
  title?: string
  description?: string
  error?: Error
  onRetry?: () => void
  onReport?: () => void
  className?: string
}

export const ErrorEmptyState = forwardRef<HTMLDivElement, ErrorEmptyStateProps>(
  ({ title, description, error, onRetry, onReport, className }, ref) => {
    return (
      <EmptyState
        ref={ref}
        type="error"
        size="md"
        title={title || "Something went wrong"}
        description={description || "We encountered an error while loading this content. Please try again."}
        icon={<XCircle className="w-12 h-12 text-red-500" />}
        actions={[
          {
            label: "Try Again",
            onClick: onRetry,
            variant: "primary",
            icon: <RefreshCw className="w-4 h-4" />,
          },
          {
            label: "Report Issue",
            onClick: onReport,
            variant: "outline",
            icon: <AlertTriangle className="w-4 h-4" />,
          },
        ]}
        className={className}
      >
        {error && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-theme-muted cursor-pointer">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </EmptyState>
    )
  }
)
ErrorEmptyState.displayName = "ErrorEmptyState"

/**
 * Loading Empty State
 */
export interface LoadingEmptyStateProps {
  message?: string
  progress?: number
  className?: string
}

export const LoadingEmptyState = forwardRef<HTMLDivElement, LoadingEmptyStateProps>(
  ({ message = "Loading...", progress, className }, ref) => {
    return (
      <EmptyState
        ref={ref}
        type="loading"
        size="md"
        title={message}
        description="Please wait while we load your content."
        icon={<RefreshCw className="w-12 h-12 text-gray-500 animate-spin" />}
        className={className}
      >
        {progress !== undefined && (
          <div className="w-full max-w-xs">
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-theme-secondary mt-2 text-center">
              {Math.round(progress)}%
            </div>
          </div>
        )}
      </EmptyState>
    )
  }
)
LoadingEmptyState.displayName = "LoadingEmptyState"

/**
 * Permission Empty State
 */
export interface PermissionEmptyStateProps {
  requiredPermission: string
  onRequestAccess?: () => void
  onContactAdmin?: () => void
  className?: string
}

export const PermissionEmptyState = forwardRef<HTMLDivElement, PermissionEmptyStateProps>(
  ({ requiredPermission, onRequestAccess, onContactAdmin, className }, ref) => {
    return (
      <EmptyState
        ref={ref}
        type="permission"
        size="md"
        title="Access Required"
        description={`You need ${requiredPermission} permission to view this content. Contact your administrator to request access.`}
        icon={<Lock className="w-12 h-12 text-amber-500" />}
        actions={[
          {
            label: "Request Access",
            onClick: onRequestAccess,
            variant: "primary",
            icon: <Unlock className="w-4 h-4" />,
          },
          {
            label: "Contact Admin",
            onClick: onContactAdmin,
            variant: "outline",
            icon: <Mail className="w-4 h-4" />,
          },
        ]}
        className={className}
      />
    )
  }
)
PermissionEmptyState.displayName = "PermissionEmptyState"

/**
 * Celebration Empty State
 */
export interface CelebrationEmptyStateProps {
  title: string
  description: string
  achievement?: string
  onContinue?: () => void
  onShare?: () => void
  className?: string
}

export const CelebrationEmptyState = forwardRef<HTMLDivElement, CelebrationEmptyStateProps>(
  ({ title, description, achievement, onContinue, onShare, className }, ref) => {
    return (
      <EmptyState
        ref={ref}
        type="celebration"
        size="lg"
        title={title}
        description={description}
        icon={<Award className="w-16 h-16 text-green-500" />}
        actions={[
          {
            label: "Continue",
            onClick: onContinue,
            variant: "primary",
            icon: <ArrowRight className="w-4 h-4" />,
          },
          {
            label: "Share Achievement",
            onClick: onShare,
            variant: "outline",
            icon: <Share2 className="w-4 h-4" />,
          },
        ]}
        className={className}
      >
        {achievement && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                {achievement}
              </span>
            </div>
          </div>
        )}
      </EmptyState>
    )
  }
)
CelebrationEmptyState.displayName = "CelebrationEmptyState"

/**
 * Generic List Empty State
 */
export interface GenericListEmptyStateProps {
  itemType?: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
  suggestions?: Array<{
    title: string
    description: string
    href?: string
    onClick?: () => void
  }>
  className?: string
}

export const GenericListEmptyState = forwardRef<HTMLDivElement, GenericListEmptyStateProps>(
  ({ 
    itemType = "items", 
    actionLabel = "Add Item", 
    actionHref, 
    actionOnClick,
    suggestions,
    className 
  }, ref) => {
    return (
      <EmptyState
        ref={ref}
        type="default"
        size="md"
        title={`No ${itemType} yet`}
        description={`Get started by creating your first ${itemType.slice(0, -1)}.`}
        icon={<Package className="w-12 h-12 text-theme-muted" />}
        actions={[
          {
            label: actionLabel,
            href: actionHref,
            onClick: actionOnClick,
            variant: "primary",
            icon: <Plus className="w-4 h-4" />,
          },
        ]}
        suggestions={suggestions}
        className={className}
      />
    )
  }
)
GenericListEmptyState.displayName = "GenericListEmptyState"

export {
  WelcomeEmptyState,
  OnboardingEmptyState,
  SearchEmptyState,
  ErrorEmptyState,
  LoadingEmptyState,
  PermissionEmptyState,
  CelebrationEmptyState,
  GenericListEmptyState,
}

export { EmptyState }
