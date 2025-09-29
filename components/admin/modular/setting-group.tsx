/**
 * @fileoverview Setting Group Organization Components - HT-032.1.4
 * @module components/admin/modular/setting-group
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Setting group organization components that provide consistent grouping,
 * collapsible behavior, and structured layout for template settings.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronDown,
  ChevronUp,
  Settings,
  Shield,
  Bell,
  Palette,
  Database,
  Users,
  Globe,
  Code,
  Zap,
  Lock,
  Mail,
  Server,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { SettingsGroup, TemplateSettings, ValidationResult } from '@/types/admin/template-registry';
import { DynamicSettingInput } from './setting-input';

// Icon mapping for common setting groups
const GROUP_ICONS: Record<string, React.ComponentType<any>> = {
  general: Settings,
  security: Shield,
  notifications: Bell,
  branding: Palette,
  database: Database,
  users: Users,
  api: Globe,
  development: Code,
  performance: Zap,
  authentication: Lock,
  email: Mail,
  system: Server,
  appearance: Palette,
  integration: Globe,
  analytics: Database,
  backup: Server,
  monitoring: Zap
};

// Setting Group Props
export interface SettingGroupProps {
  group: SettingsGroup;
  settings: Record<string, any>;
  validation?: ValidationResult;
  onSettingChange: (settingId: string, value: any) => void;
  onGroupToggle?: (groupId: string, expanded: boolean) => void;
  disabled?: boolean;
  className?: string;
}

// Setting Group Header Props
export interface SettingGroupHeaderProps {
  group: SettingsGroup;
  isExpanded: boolean;
  onToggle: () => void;
  validation?: ValidationResult;
  completionPercentage: number;
  disabled?: boolean;
}

// Setting Group Content Props
export interface SettingGroupContentProps {
  group: SettingsGroup;
  settings: Record<string, any>;
  validation?: ValidationResult;
  onSettingChange: (settingId: string, value: any) => void;
  disabled?: boolean;
}

/**
 * Setting Group Header Component
 * Displays group title, description, status, and toggle controls
 */
export function SettingGroupHeader({
  group,
  isExpanded,
  onToggle,
  validation,
  completionPercentage,
  disabled
}: SettingGroupHeaderProps) {
  const IconComponent = group.icon || GROUP_ICONS[group.id] || Settings;
  
  // Calculate validation status for this group
  const groupErrors = validation?.errors.filter(error => 
    group.settings.some(setting => error.includes(setting.name))
  ) || [];
  
  const groupWarnings = validation?.warnings.filter(warning => 
    group.settings.some(setting => warning.includes(setting.name))
  ) || [];

  const hasErrors = groupErrors.length > 0;
  const hasWarnings = groupWarnings.length > 0;
  const isComplete = completionPercentage === 100;

  return (
    <CardHeader 
      className={cn(
        "pb-4 transition-colors",
        group.collapsible && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={group.collapsible && !disabled ? onToggle : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Group Icon */}
          <div className={cn(
            "flex-shrink-0 p-2 rounded-lg",
            hasErrors ? "bg-red-100 dark:bg-red-900/20" :
            hasWarnings ? "bg-yellow-100 dark:bg-yellow-900/20" :
            isComplete ? "bg-green-100 dark:bg-green-900/20" :
            "bg-gray-100 dark:bg-gray-800"
          )}>
            <IconComponent className={cn(
              "w-5 h-5",
              hasErrors ? "text-red-600 dark:text-red-400" :
              hasWarnings ? "text-yellow-600 dark:text-yellow-400" :
              isComplete ? "text-green-600 dark:text-green-400" :
              "text-gray-600 dark:text-gray-400"
            )} />
          </div>

          {/* Group Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg truncate">{group.name}</CardTitle>
              
              {/* Status Badges */}
              <div className="flex items-center space-x-1">
                {hasErrors && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="destructive" className="text-xs">
                          {groupErrors.length} Error{groupErrors.length !== 1 ? 's' : ''}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          {groupErrors.slice(0, 3).map((error, index) => (
                            <p key={index} className="text-sm">{error}</p>
                          ))}
                          {groupErrors.length > 3 && (
                            <p className="text-sm">+{groupErrors.length - 3} more...</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {hasWarnings && !hasErrors && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          {groupWarnings.length} Warning{groupWarnings.length !== 1 ? 's' : ''}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          {groupWarnings.slice(0, 3).map((warning, index) => (
                            <p key={index} className="text-sm">{warning}</p>
                          ))}
                          {groupWarnings.length > 3 && (
                            <p className="text-sm">+{groupWarnings.length - 3} more...</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {isComplete && !hasErrors && !hasWarnings && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Complete
                  </Badge>
                )}
              </div>
            </div>
            
            {group.description && (
              <CardDescription className="mt-1 truncate">
                {group.description}
              </CardDescription>
            )}
            
            {/* Progress Bar */}
            {group.settings.length > 0 && (
              <div className="mt-2 space-y-1">
                <Progress 
                  value={completionPercentage} 
                  className="h-1"
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{Math.round(completionPercentage)}% complete</span>
                  <span>{group.settings.length} setting{group.settings.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        {group.collapsible && (
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-shrink-0 ml-2"
            disabled={disabled}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </CardHeader>
  );
}

/**
 * Setting Group Content Component
 * Renders the settings within a group with proper organization
 */
export function SettingGroupContent({
  group,
  settings,
  validation,
  onSettingChange,
  disabled
}: SettingGroupContentProps) {
  // Sort settings by order
  const sortedSettings = [...group.settings].sort((a, b) => a.order - b.order);

  // Group settings by sub-categories if needed
  const settingsByCategory = sortedSettings.reduce((acc, setting) => {
    const category = setting.group || 'default';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, TemplateSettings[]>);

  return (
    <CardContent className="pt-0">
      <div className="space-y-6">
        {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
          <div key={category} className="space-y-4">
            {/* Sub-category Header */}
            {Object.keys(settingsByCategory).length > 1 && category !== 'default' && (
              <div className="border-b pb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {category.replace('_', ' ')}
                </h4>
              </div>
            )}

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categorySettings.map((setting) => {
                const settingValue = settings[setting.id];
                const settingErrors = validation?.errors.filter(error => 
                  error.includes(setting.name)
                ) || [];
                const settingWarnings = validation?.warnings.filter(warning => 
                  warning.includes(setting.name)
                ) || [];

                // Check if setting should be shown based on conditional logic
                const shouldShow = !setting.conditional || 
                  checkConditionalDisplay(setting, settings);

                if (!shouldShow) {
                  return null;
                }

                return (
                  <div 
                    key={setting.id}
                    className={cn(
                      "transition-all duration-200",
                      setting.type === 'object' || setting.type === 'array' ? "lg:col-span-2" : ""
                    )}
                  >
                    <DynamicSettingInput
                      setting={setting}
                      value={settingValue}
                      onChange={(value) => onSettingChange(setting.id, value)}
                      error={settingErrors[0]}
                      warning={settingWarnings[0]}
                      disabled={disabled}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {sortedSettings.length === 0 && (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Settings Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This group doesn't have any configurable settings yet.
            </p>
          </div>
        )}
      </div>
    </CardContent>
  );
}

/**
 * Main Setting Group Component
 * Combines header and content with collapsible behavior
 */
export function SettingGroupComponent({
  group,
  settings,
  validation,
  onSettingChange,
  onGroupToggle,
  disabled,
  className
}: SettingGroupProps) {
  const [isExpanded, setIsExpanded] = useState(group.defaultExpanded);

  // Calculate completion percentage
  const requiredSettings = group.settings.filter(s => s.required);
  const completedRequired = requiredSettings.filter(s => {
    const value = settings[s.id];
    return value !== undefined && value !== null && value !== '';
  });
  const completionPercentage = requiredSettings.length > 0 
    ? (completedRequired.length / requiredSettings.length) * 100
    : 100;

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onGroupToggle?.(group.id, newExpanded);
  };

  // Auto-expand if there are errors
  const hasErrors = validation?.errors.some(error => 
    group.settings.some(setting => error.includes(setting.name))
  );
  
  useEffect(() => {
    if (hasErrors && group.collapsible) {
      setIsExpanded(true);
    }
  }, [hasErrors, group.collapsible]);

  return (
    <Card className={cn("", className)}>
      <SettingGroupHeader
        group={group}
        isExpanded={isExpanded}
        onToggle={handleToggle}
        validation={validation}
        completionPercentage={completionPercentage}
        disabled={disabled}
      />
      
      <AnimatePresence>
        {(!group.collapsible || isExpanded) && (
          <motion.div
            initial={group.collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <SettingGroupContent
              group={group}
              settings={settings}
              validation={validation}
              onSettingChange={onSettingChange}
              disabled={disabled}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/**
 * Settings Group List Component
 * Renders multiple setting groups with consistent spacing and organization
 */
export interface SettingsGroupListProps {
  groups: SettingsGroup[];
  settings: Record<string, any>;
  validation?: ValidationResult;
  onSettingChange: (settingId: string, value: any) => void;
  onGroupToggle?: (groupId: string, expanded: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function SettingsGroupList({
  groups,
  settings,
  validation,
  onSettingChange,
  onGroupToggle,
  disabled,
  className
}: SettingsGroupListProps) {
  // Sort groups by order
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("space-y-6", className)}>
      {sortedGroups.map((group) => (
        <SettingGroupComponent
          key={group.id}
          group={group}
          settings={settings}
          validation={validation}
          onSettingChange={onSettingChange}
          onGroupToggle={onGroupToggle}
          disabled={disabled}
        />
      ))}

      {/* Empty State */}
      {sortedGroups.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Setting Groups Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no setting groups configured for this template.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper Functions

/**
 * Check if a setting should be displayed based on conditional logic
 */
function checkConditionalDisplay(
  setting: TemplateSettings, 
  allSettings: Record<string, any>
): boolean {
  if (!setting.conditional) {
    return true;
  }

  const { field, operator, value: conditionalValue } = setting.conditional;
  const fieldValue = allSettings[field];

  switch (operator) {
    case 'equals':
      return fieldValue === conditionalValue;
    case 'not_equals':
      return fieldValue !== conditionalValue;
    case 'contains':
      return Array.isArray(fieldValue) && fieldValue.includes(conditionalValue);
    case 'not_contains':
      return !Array.isArray(fieldValue) || !fieldValue.includes(conditionalValue);
    case 'greater_than':
      return typeof fieldValue === 'number' && fieldValue > conditionalValue;
    case 'less_than':
      return typeof fieldValue === 'number' && fieldValue < conditionalValue;
    default:
      return true;
  }
}

/**
 * Calculate group completion percentage
 */
export function calculateGroupCompletion(
  group: SettingsGroup, 
  settings: Record<string, any>
): number {
  const requiredSettings = group.settings.filter(s => s.required);
  
  if (requiredSettings.length === 0) {
    return 100;
  }

  const completedRequired = requiredSettings.filter(s => {
    const value = settings[s.id];
    return value !== undefined && value !== null && value !== '';
  });

  return (completedRequired.length / requiredSettings.length) * 100;
}

/**
 * Get group validation status
 */
export function getGroupValidationStatus(
  group: SettingsGroup, 
  validation?: ValidationResult
): 'error' | 'warning' | 'success' | 'pending' {
  if (!validation) return 'pending';

  const groupErrors = validation.errors.filter(error => 
    group.settings.some(setting => error.includes(setting.name))
  );

  const groupWarnings = validation.warnings.filter(warning => 
    group.settings.some(setting => warning.includes(setting.name))
  );

  if (groupErrors.length > 0) return 'error';
  if (groupWarnings.length > 0) return 'warning';
  return 'success';
}
