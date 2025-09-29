/**
 * @fileoverview Reusable Setting Input Components - HT-032.1.4
 * @module components/admin/modular/setting-input
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Reusable setting input components for common setting types in the modular admin interface.
 * Provides consistent styling, validation, and behavior across all template settings.
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  File,
  HelpCircle,
  Upload,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { TemplateSettings, TemplateSettingsValue } from '@/types/admin/template-registry';

// Base Setting Input Props
export interface BaseSettingInputProps {
  setting: TemplateSettings;
  value: TemplateSettingsValue;
  onChange: (value: TemplateSettingsValue) => void;
  error?: string;
  warning?: string;
  disabled?: boolean;
  className?: string;
}

// Setting Input Wrapper Props
export interface SettingInputWrapperProps extends BaseSettingInputProps {
  children: React.ReactNode;
}

/**
 * Setting Input Wrapper Component
 * Provides consistent wrapper styling and validation display for all setting inputs
 */
export function SettingInputWrapper({
  setting,
  value,
  onChange,
  error,
  warning,
  disabled,
  className,
  children
}: SettingInputWrapperProps) {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and Help */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label 
            className={cn(
              "text-sm font-medium",
              disabled && "text-gray-400"
            )}
          >
            {setting.name}
            {setting.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          
          {setting.helpText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => setShowHelp(!showHelp)}
                  >
                    <HelpCircle className="w-3 h-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{setting.helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {setting.readOnly && (
          <Badge variant="secondary" className="text-xs">
            Read Only
          </Badge>
        )}
      </div>

      {/* Description */}
      {setting.description && (
        <p className={cn(
          "text-sm text-gray-600 dark:text-gray-400",
          disabled && "text-gray-400"
        )}>
          {setting.description}
        </p>
      )}

      {/* Help Text (Expandable) */}
      <AnimatePresence>
        {showHelp && setting.helpText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {setting.helpText}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Component */}
      <div className="space-y-2">
        {children}
        
        {/* Validation Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        {warning && !error && (
          <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span>{warning}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * String Setting Input Component
 */
export function StringSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = setting.id.toLowerCase().includes('password') || 
                     setting.id.toLowerCase().includes('secret') ||
                     setting.id.toLowerCase().includes('key');
  
  const inputType = isPassword && !showPassword ? 'password' : 'text';

  return (
    <SettingInputWrapper {...props}>
      <div className="relative">
        <Input
          type={inputType}
          value={value as string || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={setting.placeholder}
          disabled={disabled || setting.readOnly}
          className={cn(
            isPassword && "pr-10"
          )}
        />
        
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </SettingInputWrapper>
  );
}

/**
 * Number Setting Input Component
 */
export function NumberSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  
  const min = setting.validation?.min;
  const max = setting.validation?.max;

  return (
    <SettingInputWrapper {...props}>
      <Input
        type="number"
        value={value as number || ''}
        onChange={(e) => {
          const numValue = parseFloat(e.target.value);
          onChange(isNaN(numValue) ? null : numValue);
        }}
        placeholder={setting.placeholder}
        min={min}
        max={max}
        disabled={disabled || setting.readOnly}
      />
    </SettingInputWrapper>
  );
}

/**
 * Boolean Setting Input Component
 */
export function BooleanSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;

  return (
    <SettingInputWrapper {...props}>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-3 h-3 rounded-full",
            value ? "bg-green-500" : "bg-gray-300"
          )} />
          <div>
            <span className="font-medium">
              {value ? 'Enabled' : 'Disabled'}
            </span>
            <p className="text-sm text-gray-500">
              {value ? 'This setting is currently enabled' : 'This setting is currently disabled'}
            </p>
          </div>
        </div>
        <Switch
          checked={value as boolean || false}
          onCheckedChange={onChange}
          disabled={disabled || setting.readOnly}
        />
      </div>
    </SettingInputWrapper>
  );
}

/**
 * Select Setting Input Component
 */
export function SelectSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  
  const options = setting.options || [];

  return (
    <SettingInputWrapper {...props}>
      <Select
        value={value as string || ''}
        onValueChange={onChange}
        disabled={disabled || setting.readOnly}
      >
        <SelectTrigger>
          <SelectValue placeholder={setting.placeholder || 'Select an option'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingInputWrapper>
  );
}

/**
 * Multi-Select Setting Input Component
 */
export function MultiSelectSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  
  const options = setting.options || [];
  const selectedValues = (value as string[]) || [];
  
  const toggleOption = useCallback((optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(newValues);
  }, [selectedValues, onChange]);

  return (
    <SettingInputWrapper {...props}>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((selectedValue) => {
            const option = options.find(opt => opt.value === selectedValue);
            return (
              <Badge 
                key={selectedValue} 
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>{option?.label || selectedValue}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => toggleOption(selectedValue)}
                  disabled={disabled || setting.readOnly}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
        
        <Select
          value=""
          onValueChange={toggleOption}
          disabled={disabled || setting.readOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder="Add option..." />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter(option => !selectedValues.includes(option.value))
              .map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </SettingInputWrapper>
  );
}

/**
 * Color Setting Input Component
 */
export function ColorSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  const [copied, setCopied] = useState(false);
  
  const colorValue = (value as string) || '#000000';
  
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(colorValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }, [colorValue]);

  return (
    <SettingInputWrapper {...props}>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
          disabled={disabled || setting.readOnly}
        />
        <div className="flex-1">
          <Input
            value={colorValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.placeholder || '#000000'}
            className="font-mono"
            disabled={disabled || setting.readOnly}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          disabled={disabled}
          className="flex items-center space-x-1"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </SettingInputWrapper>
  );
}

/**
 * Date Setting Input Component
 */
export function DateSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  
  const dateValue = value ? new Date(value as string).toISOString().split('T')[0] : '';

  return (
    <SettingInputWrapper {...props}>
      <div className="relative">
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || setting.readOnly}
          className="pr-10"
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </SettingInputWrapper>
  );
}

/**
 * File Setting Input Component
 */
export function FileSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onChange(file.name); // In a real implementation, you'd upload the file
    }
  }, [onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onChange(file.name); // In a real implementation, you'd upload the file
    }
  }, [onChange]);

  return (
    <SettingInputWrapper {...props}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={disabled || setting.readOnly}
          className="hidden"
          id={`file-input-${setting.id}`}
        />
        
        <div className="space-y-2">
          <File className="w-8 h-8 text-gray-400 mx-auto" />
          <div>
            <p className="text-sm font-medium">
              {value ? (value as string) : 'No file selected'}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop a file here, or click to browse
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-input-${setting.id}`)?.click()}
            disabled={disabled || setting.readOnly}
            className="flex items-center space-x-1"
          >
            <Upload className="w-4 h-4" />
            <span>Browse Files</span>
          </Button>
        </div>
      </div>
    </SettingInputWrapper>
  );
}

/**
 * Object Setting Input Component (JSON Editor)
 */
export function ObjectSettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setJsonValue(JSON.stringify(value, null, 2) || '{}');
      setJsonError(null);
    } catch (error) {
      setJsonValue('{}');
      setJsonError('Invalid JSON object');
    }
  }, [value]);

  const handleJsonChange = useCallback((newValue: string) => {
    setJsonValue(newValue);
    
    try {
      const parsed = JSON.parse(newValue);
      onChange(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON syntax');
    }
  }, [onChange]);

  return (
    <SettingInputWrapper {...props} error={props.error || jsonError || undefined}>
      <div className="space-y-2">
        <Textarea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          placeholder={setting.placeholder || '{}'}
          rows={8}
          className="font-mono text-sm"
          disabled={disabled || setting.readOnly}
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>JSON Object</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleJsonChange(JSON.stringify(value, null, 2))}
            disabled={disabled || setting.readOnly}
            className="h-6 px-2 text-xs"
          >
            Format
          </Button>
        </div>
      </div>
    </SettingInputWrapper>
  );
}

/**
 * Array Setting Input Component
 */
export function ArraySettingInput(props: BaseSettingInputProps) {
  const { setting, value, onChange, disabled } = props;
  const arrayValue = (value as string[]) || [];
  const [newItem, setNewItem] = useState('');

  const addItem = useCallback(() => {
    if (newItem.trim()) {
      onChange([...arrayValue, newItem.trim()]);
      setNewItem('');
    }
  }, [arrayValue, newItem, onChange]);

  const removeItem = useCallback((index: number) => {
    const newArray = arrayValue.filter((_, i) => i !== index);
    onChange(newArray);
  }, [arrayValue, onChange]);

  const updateItem = useCallback((index: number, newValue: string) => {
    const newArray = [...arrayValue];
    newArray[index] = newValue;
    onChange(newArray);
  }, [arrayValue, onChange]);

  return (
    <SettingInputWrapper {...props}>
      <div className="space-y-3">
        {/* Existing Items */}
        {arrayValue.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              disabled={disabled || setting.readOnly}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeItem(index)}
              disabled={disabled || setting.readOnly}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* Add New Item */}
        <div className="flex items-center space-x-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={setting.placeholder || 'Add new item...'}
            disabled={disabled || setting.readOnly}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={disabled || setting.readOnly || !newItem.trim()}
            className="flex-shrink-0"
          >
            Add
          </Button>
        </div>

        {arrayValue.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No items added yet
          </p>
        )}
      </div>
    </SettingInputWrapper>
  );
}

/**
 * Dynamic Setting Input Component
 * Automatically selects the appropriate input component based on setting type
 */
export function DynamicSettingInput(props: BaseSettingInputProps) {
  const { setting } = props;

  switch (setting.type) {
    case 'string':
      return <StringSettingInput {...props} />;
    case 'number':
      return <NumberSettingInput {...props} />;
    case 'boolean':
      return <BooleanSettingInput {...props} />;
    case 'select':
      return <SelectSettingInput {...props} />;
    case 'multiselect':
      return <MultiSelectSettingInput {...props} />;
    case 'color':
      return <ColorSettingInput {...props} />;
    case 'date':
      return <DateSettingInput {...props} />;
    case 'file':
      return <FileSettingInput {...props} />;
    case 'object':
      return <ObjectSettingInput {...props} />;
    case 'array':
      return <ArraySettingInput {...props} />;
    default:
      return <StringSettingInput {...props} />;
  }
}
