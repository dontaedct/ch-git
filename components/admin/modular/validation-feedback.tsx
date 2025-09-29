/**
 * @fileoverview Validation and Error Feedback Components - HT-032.1.4
 * @module components/admin/modular/validation-feedback
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Validation and error feedback components that provide consistent validation display,
 * error messaging, and user guidance for the modular admin interface.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Shield,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ValidationResult } from '@/types/admin/template-registry';

// Validation Message Types
export interface ValidationMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  field?: string;
  code?: string;
  suggestion?: string;
  helpUrl?: string;
  timestamp?: Date;
  dismissible?: boolean;
}

// Validation Feedback Props
export interface ValidationFeedbackProps {
  validation?: ValidationResult;
  messages?: ValidationMessage[];
  showSummary?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  dismissible?: boolean;
  onDismiss?: (messageId: string) => void;
  onRetry?: () => void;
  className?: string;
}

// Inline Validation Props
export interface InlineValidationProps {
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
  loading?: boolean;
  className?: string;
}

// Validation Summary Props
export interface ValidationSummaryProps {
  validation: ValidationResult;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Inline Validation Component
 * Displays validation feedback inline with form fields
 */
export function InlineValidation({
  error,
  warning,
  success,
  info,
  loading,
  className
}: InlineValidationProps) {
  if (loading) {
    return (
      <div className={cn("flex items-center space-x-2 text-sm text-gray-500", className)}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Validating...</span>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn("flex items-center space-x-2 text-sm text-red-600 dark:text-red-400", className)}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </motion.div>
    );
  }

  if (warning) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn("flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400", className)}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>{warning}</span>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn("flex items-center space-x-2 text-sm text-green-600 dark:text-green-400", className)}
      >
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
        <span>{success}</span>
      </motion.div>
    );
  }

  if (info) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn("flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400", className)}
      >
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>{info}</span>
      </motion.div>
    );
  }

  return null;
}

/**
 * Validation Summary Component
 * Displays a summary of validation results with statistics and actions
 */
export function ValidationSummary({
  validation,
  onRetry,
  onDismiss,
  compact = false,
  className
}: ValidationSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [dismissed, setDismissed] = useState(false);

  const errorCount = validation.errors.length;
  const warningCount = validation.warnings.length;
  const hasIssues = errorCount > 0 || warningCount > 0;

  if (dismissed || !hasIssues) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (compact) {
    return (
      <Alert className={cn("", className)}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span>Validation Issues</span>
          <div className="flex items-center space-x-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </AlertTitle>
        <AlertDescription>
          Please review and fix the validation issues before saving.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={cn("border-red-200 bg-red-50 dark:bg-red-900/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <CardTitle className="text-red-900 dark:text-red-100">
              Validation Issues Found
            </CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            {errorCount > 0 && (
              <Badge variant="destructive">
                {errorCount} Error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {warningCount} Warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
            
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
            
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <CardDescription className="text-red-700 dark:text-red-300">
          Please review and resolve the following issues before proceeding.
        </CardDescription>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between px-6 py-2">
            <span>View Details</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertTriangle className="w-4 h-4" />
            </motion.div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Errors */}
              {errorCount > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-900 dark:text-red-100 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Errors ({errorCount})</span>
                  </h4>
                  <div className="space-y-1">
                    {validation.errors.map((error, index) => (
                      <div 
                        key={index}
                        className="flex items-start space-x-2 text-sm text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/40 p-2 rounded"
                      >
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {warningCount > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 flex items-center space-x-1">
                    <Info className="w-4 h-4" />
                    <span>Warnings ({warningCount})</span>
                  </h4>
                  <div className="space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <div 
                        key={index}
                        className="flex items-start space-x-2 text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded"
                      >
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

/**
 * Validation Message Component
 * Displays individual validation messages with rich formatting and actions
 */
export function ValidationMessage({
  message,
  onDismiss,
  className
}: {
  message: ValidationMessage;
  onDismiss?: (messageId: string) => void;
  className?: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.(message.id);
  };

  if (dismissed) {
    return null;
  }

  const getIcon = () => {
    switch (message.type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'info':
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getVariant = () => {
    switch (message.type) {
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      case 'warning':
      case 'info':
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
    >
      <Alert variant={getVariant()}>
        {getIcon()}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <AlertTitle className="flex items-center space-x-2">
                <span>{message.title}</span>
                {message.field && (
                  <Badge variant="outline" className="text-xs">
                    {message.field}
                  </Badge>
                )}
                {message.code && (
                  <Badge variant="secondary" className="text-xs font-mono">
                    {message.code}
                  </Badge>
                )}
              </AlertTitle>
              
              <div className="flex items-center space-x-2">
                {message.timestamp && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Clock className="w-3 h-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {message.timestamp.toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {(message.dismissible ?? true) && onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <AlertDescription className="mt-1">
            <p>{message.message}</p>
            
            {message.suggestion && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Suggestion:</p>
                    <p className="text-blue-800 dark:text-blue-200">{message.suggestion}</p>
                  </div>
                </div>
              </div>
            )}
            
            {message.helpUrl && (
              <div className="mt-2">
                <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" asChild>
                  <a href={message.helpUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Learn more
                  </a>
                </Button>
              </div>
            )}
          </AlertDescription>
        </div>
      </Alert>
    </motion.div>
  );
}

/**
 * Validation Progress Component
 * Shows validation progress with detailed status
 */
export function ValidationProgress({
  total,
  validated,
  errors,
  warnings,
  inProgress,
  className
}: {
  total: number;
  validated: number;
  errors: number;
  warnings: number;
  inProgress?: boolean;
  className?: string;
}) {
  const percentage = total > 0 ? (validated / total) * 100 : 0;
  const hasErrors = errors > 0;
  const hasWarnings = warnings > 0;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Validation Progress</span>
            <div className="flex items-center space-x-2">
              {inProgress && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Validating...</span>
                </div>
              )}
              <span className="text-sm text-gray-500">
                {validated} of {total}
              </span>
            </div>
          </div>
          
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
              hasErrors ? "bg-red-100" : hasWarnings ? "bg-yellow-100" : "bg-green-100"
            )}
          />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {Math.round(percentage)}% validated
            </span>
            
            <div className="flex items-center space-x-3">
              {hasErrors && (
                <span className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{errors} error{errors !== 1 ? 's' : ''}</span>
                </span>
              )}
              
              {hasWarnings && (
                <span className="flex items-center space-x-1 text-yellow-600">
                  <Info className="w-3 h-3" />
                  <span>{warnings} warning{warnings !== 1 ? 's' : ''}</span>
                </span>
              )}
              
              {!hasErrors && !hasWarnings && validated === total && total > 0 && (
                <span className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>All valid</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Validation Feedback Component
 * Combines multiple validation feedback components with flexible display options
 */
export function ValidationFeedback({
  validation,
  messages = [],
  showSummary = true,
  showDetails = true,
  compact = false,
  dismissible = true,
  onDismiss,
  onRetry,
  className
}: ValidationFeedbackProps) {
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());

  const handleMessageDismiss = (messageId: string) => {
    setDismissedMessages(prev => new Set([...prev, messageId]));
    onDismiss?.(messageId);
  };

  const visibleMessages = messages.filter(msg => !dismissedMessages.has(msg.id));
  const hasValidationIssues = validation && (validation.errors.length > 0 || validation.warnings.length > 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Validation Summary */}
      {hasValidationIssues && showSummary && (
        <ValidationSummary
          validation={validation}
          onRetry={onRetry}
          onDismiss={dismissible ? () => {} : undefined}
          compact={compact}
        />
      )}

      {/* Individual Messages */}
      {showDetails && visibleMessages.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleMessages.map((message) => (
              <ValidationMessage
                key={message.id}
                message={message}
                onDismiss={dismissible ? handleMessageDismiss : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Utility functions for creating validation messages
export function createValidationMessage(
  type: ValidationMessage['type'],
  title: string,
  message: string,
  options: Partial<ValidationMessage> = {}
): ValidationMessage {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date(),
    dismissible: true,
    ...options
  };
}

export function createErrorMessage(title: string, message: string, options?: Partial<ValidationMessage>): ValidationMessage {
  return createValidationMessage('error', title, message, options);
}

export function createWarningMessage(title: string, message: string, options?: Partial<ValidationMessage>): ValidationMessage {
  return createValidationMessage('warning', title, message, options);
}

export function createSuccessMessage(title: string, message: string, options?: Partial<ValidationMessage>): ValidationMessage {
  return createValidationMessage('success', title, message, options);
}

export function createInfoMessage(title: string, message: string, options?: Partial<ValidationMessage>): ValidationMessage {
  return createValidationMessage('info', title, message, options);
}
