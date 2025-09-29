/**
 * @fileoverview Setting Panel Layout Components - HT-032.1.4
 * @module components/admin/modular/setting-panel
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Setting panel layout components that provide consistent panel structure,
 * navigation, actions, and status display for the modular admin interface.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  X,
  ArrowLeft,
  MoreHorizontal,
  Download,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SettingsGroup, ValidationResult } from '@/types/admin/template-registry';
import { SettingsGroupList } from './setting-group';

// Setting Panel Props
export interface SettingPanelProps {
  title: string;
  description?: string;
  groups: SettingsGroup[];
  settings: Record<string, any>;
  validation?: ValidationResult;
  onSettingChange: (settingId: string, value: any) => void;
  onSave?: () => Promise<void>;
  onReset?: () => Promise<void>;
  onExport?: () => Promise<string>;
  onImport?: (data: string) => Promise<void>;
  onBack?: () => void;
  loading?: boolean;
  saving?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

// Panel Header Props
export interface SettingPanelHeaderProps {
  title: string;
  description?: string;
  validation?: ValidationResult;
  completionPercentage: number;
  onBack?: () => void;
  onSave?: () => Promise<void>;
  onReset?: () => Promise<void>;
  onExport?: () => Promise<string>;
  onImport?: (data: string) => Promise<void>;
  loading?: boolean;
  saving?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  onTogglePreview?: (show: boolean) => void;
}

// Panel Status Props
export interface SettingPanelStatusProps {
  validation?: ValidationResult;
  completionPercentage: number;
  totalSettings: number;
  completedSettings: number;
  className?: string;
}

/**
 * Setting Panel Status Component
 * Displays validation status, completion progress, and summary information
 */
export function SettingPanelStatus({
  validation,
  completionPercentage,
  totalSettings,
  completedSettings,
  className
}: SettingPanelStatusProps) {
  const hasErrors = validation?.errors.length ?? 0 > 0;
  const hasWarnings = validation?.warnings.length ?? 0 > 0;
  const isComplete = completionPercentage === 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Validation Alerts */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">
                {validation!.errors.length} validation error{validation!.errors.length !== 1 ? 's' : ''} found
              </p>
              <ul className="text-sm space-y-1 ml-4">
                {validation!.errors.slice(0, 3).map((error, index) => (
                  <li key={index} className="list-disc">{error}</li>
                ))}
                {validation!.errors.length > 3 && (
                  <li className="list-disc">+{validation!.errors.length - 3} more errors...</li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasWarnings && !hasErrors && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">
                {validation!.warnings.length} warning{validation!.warnings.length !== 1 ? 's' : ''} found
              </p>
              <ul className="text-sm space-y-1 ml-4">
                {validation!.warnings.slice(0, 3).map((warning, index) => (
                  <li key={index} className="list-disc">{warning}</li>
                ))}
                {validation!.warnings.length > 3 && (
                  <li className="list-disc">+{validation!.warnings.length - 3} more warnings...</li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isComplete && !hasErrors && !hasWarnings && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            All settings are configured correctly and validation passed.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Section */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Configuration Progress</span>
              <span className="text-sm text-gray-500">
                {completedSettings} of {totalSettings} settings
              </span>
            </div>
            
            <Progress value={completionPercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{Math.round(completionPercentage)}% complete</span>
              <div className="flex items-center space-x-4">
                {hasErrors && (
                  <span className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{validation!.errors.length} errors</span>
                  </span>
                )}
                {hasWarnings && (
                  <span className="flex items-center space-x-1 text-yellow-600">
                    <Info className="w-3 h-3" />
                    <span>{validation!.warnings.length} warnings</span>
                  </span>
                )}
                {isComplete && !hasErrors && !hasWarnings && (
                  <span className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Complete</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Setting Panel Header Component
 * Displays panel title, description, actions, and navigation
 */
export function SettingPanelHeader({
  title,
  description,
  validation,
  completionPercentage,
  onBack,
  onSave,
  onReset,
  onExport,
  onImport,
  loading,
  saving,
  disabled,
  showPreview,
  onTogglePreview
}: SettingPanelHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    if (!onExport) return;
    
    try {
      setIsExporting(true);
      const data = await onExport();
      
      // Create download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-settings.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    if (!onImport) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        setIsImporting(true);
        const text = await file.text();
        await onImport(text);
      } catch (error) {
        console.error('Import failed:', error);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const hasErrors = validation?.errors.length ?? 0 > 0;
  const canSave = !hasErrors && !loading && !saving && !disabled;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                disabled={loading || saving}
                className="flex-shrink-0 mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              )}
              
              {/* Status Badges */}
              <div className="flex items-center space-x-2 mt-2">
                {hasErrors && (
                  <Badge variant="destructive" className="text-xs">
                    {validation!.errors.length} Error{validation!.errors.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                
                {validation?.warnings.length ?? 0 > 0 && !hasErrors && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    {validation!.warnings.length} Warning{validation!.warnings.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                
                {completionPercentage === 100 && !hasErrors && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Complete
                  </Badge>
                )}
                
                {loading && (
                  <Badge variant="outline" className="text-xs">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Loading
                  </Badge>
                )}
                
                {saving && (
                  <Badge variant="outline" className="text-xs">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Saving
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Preview Toggle */}
            {onTogglePreview && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTogglePreview(!showPreview)}
                      disabled={loading || saving}
                    >
                      {showPreview ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Save Button */}
            {onSave && (
              <Button
                onClick={onSave}
                disabled={!canSave}
                size="sm"
                className="flex items-center space-x-1"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </Button>
            )}

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading || saving}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExport && (
                  <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export Settings'}
                  </DropdownMenuItem>
                )}
                
                {onImport && (
                  <DropdownMenuItem onClick={handleImport} disabled={isImporting}>
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Settings'}
                  </DropdownMenuItem>
                )}
                
                {(onExport || onImport) && onReset && <DropdownMenuSeparator />}
                
                {onReset && (
                  <DropdownMenuItem 
                    onClick={onReset} 
                    disabled={loading || saving}
                    className="text-red-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem disabled>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Documentation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

/**
 * Main Setting Panel Component
 * Combines header, status, and content with consistent layout and behavior
 */
export function SettingPanel({
  title,
  description,
  groups,
  settings,
  validation,
  onSettingChange,
  onSave,
  onReset,
  onExport,
  onImport,
  onBack,
  loading,
  saving,
  disabled,
  showPreview,
  className
}: SettingPanelProps) {
  const [previewMode, setPreviewMode] = useState(showPreview ?? false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Calculate completion statistics
  const allSettings = groups.flatMap(group => group.settings);
  const requiredSettings = allSettings.filter(s => s.required);
  const completedRequired = requiredSettings.filter(s => {
    const value = settings[s.id];
    return value !== undefined && value !== null && value !== '';
  });
  
  const totalSettings = allSettings.length;
  const completedSettings = allSettings.filter(s => {
    const value = settings[s.id];
    return value !== undefined && value !== null && value !== '';
  }).length;
  
  const completionPercentage = requiredSettings.length > 0 
    ? (completedRequired.length / requiredSettings.length) * 100
    : totalSettings > 0 
      ? (completedSettings / totalSettings) * 100 
      : 100;

  const handleGroupToggle = (groupId: string, expanded: boolean) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: expanded
    }));
  };

  // Auto-expand groups with errors
  useEffect(() => {
    if (validation?.errors.length) {
      const newExpandedGroups = { ...expandedGroups };
      let hasChanges = false;

      groups.forEach(group => {
        const hasGroupErrors = validation.errors.some(error => 
          group.settings.some(setting => error.includes(setting.name))
        );
        
        if (hasGroupErrors && !newExpandedGroups[group.id]) {
          newExpandedGroups[group.id] = true;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setExpandedGroups(newExpandedGroups);
      }
    }
  }, [validation?.errors, groups, expandedGroups]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Panel Header */}
      <SettingPanelHeader
        title={title}
        description={description}
        validation={validation}
        completionPercentage={completionPercentage}
        onBack={onBack}
        onSave={onSave}
        onReset={onReset}
        onExport={onExport}
        onImport={onImport}
        loading={loading}
        saving={saving}
        disabled={disabled}
        showPreview={previewMode}
        onTogglePreview={setPreviewMode}
      />

      {/* Panel Status */}
      <SettingPanelStatus
        validation={validation}
        completionPercentage={completionPercentage}
        totalSettings={totalSettings}
        completedSettings={completedSettings}
      />

      {/* Panel Content */}
      <div className={cn(
        "grid gap-6",
        previewMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Settings Groups */}
        <div className="space-y-6">
          <SettingsGroupList
            groups={groups}
            settings={settings}
            validation={validation}
            onSettingChange={onSettingChange}
            onGroupToggle={handleGroupToggle}
            disabled={disabled || loading || saving}
          />
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {previewMode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Live Preview</span>
                  </CardTitle>
                  <CardDescription>
                    Preview how your settings will appear in the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Preview Mode</h3>
                      <p className="text-sm">
                        Live preview functionality would be implemented here
                        based on the specific template and settings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(settings).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {key}
                        </span>
                        <span className="text-gray-500 truncate max-w-32">
                          {typeof value === 'object' 
                            ? JSON.stringify(value).substring(0, 20) + '...'
                            : String(value || 'Not set')
                          }
                        </span>
                      </div>
                    ))}
                    
                    {Object.keys(settings).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No settings configured yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
