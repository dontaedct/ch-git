/**
 * @fileoverview HT-008.5.4: Comprehensive User Guidance System
 * @module components/ui/user-guidance
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.4 - Implement proper error states and user guidance
 * Focus: Vercel/Apply-level user guidance with comprehensive help system
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and guidance)
 */

'use client'

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { 
  HelpCircle, 
  Info, 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';

// HT-008.5.4: Enhanced User Guidance System
// Comprehensive help and guidance with Vercel/Apply-level UX

/**
 * Guidance Types
 */
export type GuidanceType = 'tip' | 'warning' | 'info' | 'success' | 'tutorial' | 'help';

/**
 * Guidance Context Types
 */
export type GuidanceContext = 'form' | 'page' | 'feature' | 'workflow' | 'general';

/**
 * Guidance Component Variants
 */
const guidanceVariants = cva(
  "flex items-start gap-3 p-4 rounded-lg border",
  {
    variants: {
      type: {
        tip: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
        warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100",
        info: "bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
        success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
        tutorial: "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100",
        help: "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100",
      },
      size: {
        sm: "p-3 text-sm",
        md: "p-4 text-sm",
        lg: "p-6 text-base",
      },
      layout: {
        horizontal: "flex-row",
        vertical: "flex-col",
      }
    },
    defaultVariants: {
      type: "info",
      size: "md",
      layout: "horizontal",
    },
  }
);

/**
 * Guidance Props Interface
 */
interface GuidanceProps extends VariantProps<typeof guidanceVariants> {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Base Guidance Component
 */
export function Guidance({
  type,
  size,
  layout,
  title,
  message,
  icon,
  dismissible = false,
  onDismiss,
  className,
  children,
}: GuidanceProps) {
  const iconMap = {
    tip: <Lightbulb className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />,
    tutorial: <Play className="w-5 h-5" />,
    help: <HelpCircle className="w-5 h-5" />,
  };

  const displayIcon = icon || iconMap[type || 'info'];

  return (
    <div className={cn(guidanceVariants({ type, size, layout }), className)}>
      <div className="flex-shrink-0">
        {displayIcon}
      </div>
      
      <div className="flex-1 space-y-2">
        {title && (
          <h4 className="font-medium">{title}</h4>
        )}
        <p className="leading-relaxed">{message}</p>
        {children}
      </div>
      
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="flex-shrink-0 h-6 w-6 p-0 opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Tooltip Component
 * For contextual help and information
 */
interface TooltipProps {
  content: string;
  title?: string;
  variant?: 'default' | 'warning' | 'info';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({
  content,
  title,
  variant = 'default',
  placement = 'top',
  children,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const placementClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const variantClasses = {
    default: "bg-gray-900 text-white",
    warning: "bg-amber-600 text-white",
    info: "bg-blue-600 text-white",
  };

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className={cn(
          "absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg max-w-xs",
          placementClasses[placement],
          variantClasses[variant],
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          {title && (
            <div className="font-medium mb-1">{title}</div>
          )}
          <div>{content}</div>
          
          {/* Arrow */}
          <div className={cn(
            "absolute w-2 h-2 transform rotate-45",
            placement === 'top' && "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            placement === 'bottom' && "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2",
            placement === 'left' && "left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2",
            placement === 'right' && "right-full top-1/2 transform -translate-y-1/2 translate-x-1/2",
            variantClasses[variant]
          )} />
        </div>
      )}
    </div>
  );
}

/**
 * Help Panel Component
 * For comprehensive help and documentation
 */
interface HelpPanelProps {
  title: string;
  description?: string;
  sections: Array<{
    title: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
  }>;
  resources?: Array<{
    title: string;
    url: string;
    description?: string;
    type?: 'documentation' | 'video' | 'tutorial' | 'support';
  }>;
  className?: string;
}

export function HelpPanel({
  title,
  description,
  sections,
  resources,
  className,
}: HelpPanelProps) {
  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sections */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guide">Guide</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {section.content}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="guide" className="space-y-4">
            <div className="space-y-4">
              {sections.map((section, index) => (
                <Collapsible key={index}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <span className="font-medium">{section.title}</span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-3 text-sm text-muted-foreground">
                    {section.content}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Frequently asked questions about this feature.
              </p>
              {/* FAQ content would go here */}
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            {resources && resources.length > 0 ? (
              <div className="grid gap-3">
                {resources.map((resource, index) => (
                  <Link
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{resource.title}</div>
                      {resource.description && (
                        <div className="text-xs text-muted-foreground">
                          {resource.description}
                        </div>
                      )}
                      {resource.type && (
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No additional resources available at this time.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Interactive Tutorial Component
 * For step-by-step guidance
 */
interface TutorialStep {
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface InteractiveTutorialProps {
  title: string;
  description?: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function InteractiveTutorial({
  title,
  description,
  steps,
  onComplete,
  onSkip,
  className,
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      setIsActive(false);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    setIsActive(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  if (!isActive) {
    return (
      <div className={cn("flex items-center gap-3 p-4 rounded-lg border bg-purple-50 border-purple-200", className)}>
        <Play className="w-5 h-5 text-purple-600" />
        <div className="flex-1">
          <h4 className="font-medium text-purple-900">{title}</h4>
          {description && (
            <p className="text-sm text-purple-700">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="text-purple-600 border-purple-300 hover:bg-purple-100"
          >
            Start Tutorial
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-purple-600 hover:bg-purple-100"
          >
            Skip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4", className)}>
      <div className="bg-background rounded-lg border shadow-lg max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h4 className="font-medium">{currentStepData.title}</h4>
          <p className="text-sm text-muted-foreground">
            {currentStepData.content}
          </p>
          
          {currentStepData.action && (
            <Button
              variant="outline"
              size="sm"
              onClick={currentStepData.action.onClick}
              className="w-full"
            >
              {currentStepData.action.label}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
            >
              Skip Tutorial
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
            >
              {isLastStep ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Contextual Help Component
 * For inline help and tips
 */
interface ContextualHelpProps {
  content: string;
  title?: string;
  variant?: 'tooltip' | 'popover' | 'inline';
  trigger?: React.ReactNode;
  className?: string;
}

export function ContextualHelp({
  content,
  title,
  variant = 'tooltip',
  trigger,
  className,
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => setIsOpen(!isOpen)}
    >
      <HelpCircle className="w-4 h-4" />
    </Button>
  );

  if (variant === 'inline') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2">
          {trigger || defaultTrigger}
          {title && <span className="text-sm font-medium">{title}</span>}
        </div>
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {trigger || defaultTrigger}
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 p-4 bg-background border rounded-lg shadow-lg">
          {title && (
            <h4 className="font-medium mb-2">{title}</h4>
          )}
          <p className="text-sm text-muted-foreground">{content}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Feature Announcement Component
 * For new features and updates
 */
interface FeatureAnnouncementProps {
  title: string;
  description: string;
  image?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function FeatureAnnouncement({
  title,
  description,
  image,
  action,
  dismissible = true,
  onDismiss,
  className,
}: FeatureAnnouncementProps) {
  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200",
      className
    )}>
      {image && (
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">✨</span>
        </div>
      )}
      
      <div className="flex-1 space-y-2">
        <h4 className="font-semibold text-blue-900">{title}</h4>
        <p className="text-sm text-blue-700">{description}</p>
        
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            {action.label}
          </Button>
        )}
      </div>
      
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="flex-shrink-0 h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export default {
  Guidance,
  Tooltip,
  HelpPanel,
  InteractiveTutorial,
  ContextualHelp,
  FeatureAnnouncement,
};
