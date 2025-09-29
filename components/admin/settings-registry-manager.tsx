/**
 * @fileoverview Settings Registry Management Components - HT-032.1.2
 * @module components/admin/settings-registry-manager
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Settings registry management components that provide UI for managing
 * template-specific settings with dynamic validation and real-time updates.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Info, 
  HelpCircle,
  Eye,
  EyeOff,
  Download,
  Upload,
  Copy,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
  Unlock,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  SettingsRegistry, 
  SettingsGroup, 
  TemplateSettings,
  TemplateSettingsValue,
  ValidationResult,
  SettingsRegistryManagerProps
} from '@/types/admin/template-registry';
import { getSettingsRegistryManager } from '@/lib/admin/settings-registry';

interface SettingsRegistryManagerComponentProps {
  templateId: string;
  settings: Record<string, any>;
  onUpdate: (settingId: string, value: any) => Promise<void>;
  onSave: () => Promise<void>;
  loading?: boolean;
  readOnly?: boolean;
  validation?: ValidationResult;
  className?: string;
}

interface SettingFieldProps {
  setting: TemplateSettings;
  value: TemplateSettingsValue;
  onChange: (value: TemplateSettingsValue) => Promise<void>;
  error?: string;
  warning?: string;
  readOnly?: boolean;
  loading?: boolean;
}

interface SettingsGroupProps {
  group: SettingsGroup;
  settings: Record<string, any>;
  onUpdate: (settingId: string, value: any) => Promise<void>;
  readOnly?: boolean;
  loading?: boolean;
  validation?: ValidationResult;
}

/**
 * Individual Setting Field Component
 */
export function SettingField({
  setting,
  value,
  onChange,
  error,
  warning,
  readOnly = false,
  loading = false
}: SettingFieldProps) {
  const [localValue, setLocalValue] = useState<TemplateSettingsValue>(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = async (newValue: TemplateSettingsValue) => {
    setLocalValue(newValue);
    try {
      await onChange(newValue);
    } catch (error) {
      // Revert on error
      setLocalValue(value);
      console.error('Failed to update setting:', error);
    }
  };

  const renderField = () => {
    switch (setting.type) {
      case 'string':
        if (setting.options && setting.options.length > 0) {
          return (
            <Select
              value={localValue as string || ''}
              onValueChange={handleChange}
              disabled={readOnly || loading}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={setting.placeholder || 'Select option'} />
              </SelectTrigger>
              <SelectContent>
                {setting.options.map((option, index) => (
                  <SelectItem key={index} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        return (
          <Input
            value={localValue as string || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.placeholder || `Enter ${setting.name.toLowerCase()}`}
            disabled={readOnly || loading}
            className={error ? 'border-red-500' : ''}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={localValue as number || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            placeholder={setting.placeholder || 'Enter number'}
            disabled={readOnly || loading}
            className={error ? 'border-red-500' : ''}
            min={setting.validation?.min}
            max={setting.validation?.max}
            step="any"
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(localValue)}
              onCheckedChange={handleChange}
              disabled={readOnly || loading}
            />
            <Label className="text-sm">
              {Boolean(localValue) ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            value={localValue as string || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.placeholder || `Enter ${setting.name.toLowerCase()}`}
            disabled={readOnly || loading}
            className={error ? 'border-red-500' : ''}
            rows={4}
          />
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={localValue as string || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              disabled={readOnly || loading}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <Input
              value={localValue as string || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="#000000"
              disabled={readOnly || loading}
              className={cn("font-mono", error ? 'border-red-500' : '')}
            />
          </div>
        );

      case 'multiselect':
        if (!setting.options) return null;
        
        const selectedValues = Array.isArray(localValue) ? localValue : [];
        
        return (
          <div className="space-y-2">
            <Select
              value=""
              onValueChange={(newValue) => {
                if (!selectedValues.includes(newValue)) {
                  handleChange([...selectedValues, newValue]);
                }
              }}
              disabled={readOnly || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add option" />
              </SelectTrigger>
              <SelectContent>
                {setting.options
                  .filter(option => !selectedValues.includes(String(option.value)))
                  .map((option, index) => (
                    <SelectItem key={index} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((selectedValue, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {setting.options.find(opt => String(opt.value) === selectedValue)?.label || selectedValue}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          const newValues = selectedValues.filter(v => v !== selectedValue);
                          handleChange(newValues);
                        }}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={localValue as string || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={readOnly || loading}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleChange(file.name);
                }
              }}
              disabled={readOnly || loading}
              className={error ? 'border-red-500' : ''}
            />
            {localValue && (
              <div className="text-sm text-gray-600">
                Selected: {localValue as string}
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            value={localValue as string || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.placeholder || `Enter ${setting.name.toLowerCase()}`}
            disabled={readOnly || loading}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label className="text-sm font-medium">
          {setting.name}
          {setting.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {setting.helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{setting.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {renderField()}

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {warning && !error && (
        <div className="flex items-center space-x-2 text-sm text-yellow-600">
          <AlertTriangle className="w-4 h-4" />
          <span>{warning}</span>
        </div>
      )}

      {setting.description && (
        <p className="text-xs text-gray-500">{setting.description}</p>
      )}
    </div>
  );
}

/**
 * Settings Group Component
 */
export function SettingsGroupComponent({
  group,
  settings,
  onUpdate,
  readOnly = false,
  loading = false,
  validation
}: SettingsGroupProps) {
  const [isExpanded, setIsExpanded] = useState(group.defaultExpanded);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSettings = group.settings.filter(setting =>
    setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    setting.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupErrors = validation?.errors[group.id] || [];
  const groupWarnings = validation?.warnings[group.id] || [];

  return (
    <Card>
      <CardHeader 
        className={cn(
          "pb-4",
          group.collapsible && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
        onClick={group.collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              {groupErrors.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {groupErrors.length} error{groupErrors.length > 1 ? 's' : ''}
                </Badge>
              )}
              {groupWarnings.length > 0 && groupErrors.length === 0 && (
                <Badge variant="outline" className="text-xs text-yellow-600">
                  {groupWarnings.length} warning{groupWarnings.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {group.description && (
              <CardDescription>{group.description}</CardDescription>
            )}
          </div>
          {group.collapsible && (
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>

      <AnimatePresence>
        {(!group.collapsible || isExpanded) && (
          <motion.div
            initial={group.collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              {group.settings.length > 5 && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search settings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {filteredSettings.map((setting) => (
                  <SettingField
                    key={setting.id}
                    setting={setting}
                    value={settings[setting.id]}
                    onChange={(value) => onUpdate(setting.id, value)}
                    error={groupErrors.find(e => e.includes(setting.name))}
                    warning={groupWarnings.find(w => w.includes(setting.name))}
                    readOnly={readOnly || setting.readOnly}
                    loading={loading}
                  />
                ))}
              </div>

              {filteredSettings.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No settings found matching "{searchTerm}"</p>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/**
 * Main Settings Registry Manager Component
 */
export function SettingsRegistryManager({
  templateId,
  settings,
  onUpdate,
  onSave,
  loading = false,
  readOnly = false,
  validation,
  className
}: SettingsRegistryManagerComponentProps) {
  const [registry, setRegistry] = useState<SettingsRegistry | null>(null);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(settings);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const settingsManager = getSettingsRegistryManager();

  useEffect(() => {
    loadRegistry();
  }, [templateId]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const loadRegistry = async () => {
    try {
      const registryData = settingsManager.getSettingsRegistry(templateId);
      setRegistry(registryData);
      
      if (registryData && registryData.groups.length > 0) {
        setActiveTab(registryData.groups[0].id);
      }
    } catch (error) {
      console.error('Failed to load settings registry:', error);
    }
  };

  const handleUpdateSetting = async (settingId: string, value: any) => {
    try {
      setLocalSettings(prev => ({ ...prev, [settingId]: value }));
      await onUpdate(settingId, value);
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert on error
      setLocalSettings(settings);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await onSave();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const handleImport = async () => {
    try {
      const importedSettings = JSON.parse(importJson);
      
      // Update all settings at once
      for (const [key, value] of Object.entries(importedSettings)) {
        await handleUpdateSetting(key, value);
      }
      
      setShowImportDialog(false);
      setImportJson('');
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
  };

  const handleResetToDefaults = async () => {
    if (!registry) return;

    try {
      const defaultSettings: Record<string, any> = {};
      
      registry.groups.forEach(group => {
        group.settings.forEach(setting => {
          if (setting.defaultValue !== undefined) {
            defaultSettings[setting.id] = setting.defaultValue;
          }
        });
      });

      for (const [key, value] of Object.entries(defaultSettings)) {
        await handleUpdateSetting(key, value);
      }
    } catch (error) {
      console.error('Failed to reset to defaults:', error);
    }
  };

  if (!registry) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Settings Registry Not Found
          </h3>
          <p className="text-gray-600">
            No settings registry found for template "{templateId}".
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasErrors = validation && !validation.isValid;
  const hasWarnings = validation && validation.warnings && Object.keys(validation.warnings).length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings Registry</h1>
          <p className="text-gray-600">Manage settings for template "{templateId}"</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasErrors && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {Object.values(validation.errors).flat().length} error{Object.values(validation.errors).flat().length > 1 ? 's' : ''}
            </Badge>
          )}
          
          {hasWarnings && !hasErrors && (
            <Badge variant="outline" className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              {Object.values(validation.warnings).flat().length} warning{Object.values(validation.warnings).flat().length > 1 ? 's' : ''}
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || readOnly}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
            disabled={loading || readOnly}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            disabled={loading || readOnly}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={loading || saveLoading || readOnly || hasErrors}
          >
            {(loading || saveLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      {registry.groups.length > 1 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {registry.groups.map((group) => (
              <TabsTrigger key={group.id} value={group.id} className="text-left">
                <div className="flex items-center space-x-2">
                  <span>{group.name}</span>
                  {validation?.errors[group.id] && (
                    <Badge variant="destructive" className="text-xs">
                      {validation.errors[group.id].length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {registry.groups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="mt-6">
              <SettingsGroupComponent
                group={group}
                settings={localSettings}
                onUpdate={handleUpdateSetting}
                readOnly={readOnly}
                loading={loading}
                validation={validation}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-6">
          {registry.groups.map((group) => (
            <SettingsGroupComponent
              key={group.id}
              group={group}
              settings={localSettings}
              onUpdate={handleUpdateSetting}
              readOnly={readOnly}
              loading={loading}
              validation={validation}
            />
          ))}
        </div>
      )}

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Settings</DialogTitle>
            <DialogDescription>
              Export the current settings configuration as JSON
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={JSON.stringify(localSettings, null, 2)}
              readOnly
              rows={12}
              className="font-mono text-sm"
            />
            
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(localSettings, null, 2));
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Settings</DialogTitle>
            <DialogDescription>
              Import settings from a JSON configuration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste JSON configuration here..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importJson.trim()}>
              Import Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
