/**
 * @fileoverview HT-008.10.2: Enterprise-Grade FormBuilder Component
 * @module components/ui/form-builder
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.2 - Enterprise-Grade Component Library
 * Focus: Dynamic form builder with validation, conditional logic, and field types
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (enterprise form management)
 */

'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTokens } from '@/lib/design-tokens';

export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'range'
  | 'color';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
  conditional?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains';
    value: any;
  };
  visibility?: boolean;
}

export interface FormBuilderProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  onFieldChange?: (field: FormField) => void;
  onFieldAdd?: (field: FormField) => void;
  onFieldRemove?: (fieldId: string) => void;
  onFieldReorder?: (fields: FormField[]) => void;
  className?: string;
  title?: string;
  description?: string;
  submitText?: string;
  resetText?: string;
  showPreview?: boolean;
  editable?: boolean;
}

const createValidationSchema = (fields: FormField[]) => {
  const schemaFields: Record<string, any> = {};
  
  fields.forEach((field) => {
    let fieldSchema: any;
    
    switch (field.type) {
      case 'email':
        fieldSchema = z.string().email('Invalid email address');
        break;
      case 'number':
        fieldSchema = z.number();
        break;
      case 'url':
        fieldSchema = z.string().url('Invalid URL');
        break;
      case 'tel':
        fieldSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number');
        break;
      default:
        fieldSchema = z.string();
    }
    
    if (field.validation) {
      if (field.validation.minLength) {
        fieldSchema = fieldSchema.min(field.validation.minLength);
      }
      if (field.validation.maxLength) {
        fieldSchema = fieldSchema.max(field.validation.maxLength);
      }
      if (field.validation.pattern) {
        fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern));
      }
    }
    
    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }
    
    schemaFields[field.id] = fieldSchema;
  });
  
  return z.object(schemaFields);
};

export function FormBuilder({
  fields,
  onSubmit,
  onFieldChange,
  onFieldAdd,
  onFieldRemove,
  onFieldReorder,
  className,
  title,
  description,
  submitText = 'Submit',
  resetText = 'Reset',
  showPreview = false,
  editable = false,
}: FormBuilderProps) {
  const { tokens } = useTokens();
  const [isPreview, setIsPreview] = React.useState(showPreview);
  
  const validationSchema = React.useMemo(() => createValidationSchema(fields), [fields]);
  
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.id] = field.defaultValue || '';
      return acc;
    }, {} as Record<string, any>),
  });
  
  const { fields: formFields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'fields',
  });
  
  const handleSubmit = (data: any) => {
    onSubmit(data);
  };
  
  const handleReset = () => {
    form.reset();
  };
  
  const renderField = (field: FormField) => {
    const fieldValue = form.watch(field.id);
    
    // Handle conditional visibility
    if (field.conditional && field.visibility !== undefined) {
      const conditionalField = fields.find(f => f.id === field.conditional.field);
      if (conditionalField) {
        const conditionalValue = form.watch(conditionalField.id);
        let shouldShow = false;
        
        switch (field.conditional.operator) {
          case 'equals':
            shouldShow = conditionalValue === field.conditional.value;
            break;
          case 'notEquals':
            shouldShow = conditionalValue !== field.conditional.value;
            break;
          case 'contains':
            shouldShow = String(conditionalValue).includes(String(field.conditional.value));
            break;
          case 'notContains':
            shouldShow = !String(conditionalValue).includes(String(field.conditional.value));
            break;
        }
        
        if (!shouldShow) return null;
      }
    }
    
    const baseProps = {
      id: field.id,
      placeholder: field.placeholder,
      disabled: !editable && isPreview,
    };
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            {...form.register(field.id)}
            className="min-h-[100px]"
          />
        );
        
      case 'select':
        return (
          <Select onValueChange={(value) => form.setValue(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  onCheckedChange={(checked) => {
                    const currentValue = form.getValues(field.id) || [];
                    if (checked) {
                      form.setValue(field.id, [...currentValue, option.value]);
                    } else {
                      form.setValue(field.id, currentValue.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              {...baseProps}
              onCheckedChange={(checked) => form.setValue(field.id, checked)}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );
        
      case 'radio':
        return (
          <RadioGroup
            onValueChange={(value) => form.setValue(field.id, value)}
            className="space-y-2"
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              {...baseProps}
              onCheckedChange={(checked) => form.setValue(field.id, checked)}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );
        
      case 'range':
        return (
          <div className="space-y-2">
            <Input
              {...baseProps}
              type="range"
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              {...form.register(field.id)}
            />
            <div className="text-sm text-muted-foreground">
              Current value: {fieldValue || 0}
            </div>
          </div>
        );
        
      case 'color':
        return (
          <Input
            {...baseProps}
            type="color"
            {...form.register(field.id)}
            className="h-10 w-20"
          />
        );
        
      case 'file':
        return (
          <Input
            {...baseProps}
            type="file"
            {...form.register(field.id)}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
          />
        );
        
      default:
        return (
          <Input
            {...baseProps}
            type={field.type}
            {...form.register(field.id)}
          />
        );
    }
  };
  
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {editable && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                >
                  {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isPreview ? 'Edit' : 'Preview'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={field.id}
                render={({ field: formField }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="flex items-center space-x-2">
                        {field.label}
                        {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </FormLabel>
                      {editable && !isPreview && (
                        <div className="flex items-center space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onFieldChange?.(field)}
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onFieldRemove?.(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormControl>
                      {renderField(field)}
                    </FormControl>
                    {field.description && (
                      <FormDescription>{field.description}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" onClick={handleReset}>
                {resetText}
              </Button>
              <Button type="submit">
                {submitText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
