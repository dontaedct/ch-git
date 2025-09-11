/**
 * @fileoverview HT-008.5.4: Enhanced Form Validation and Error Handling
 * @module components/ui/form-validation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.4 - Implement proper error states and user guidance
 * Focus: Vercel/Apply-level form validation with comprehensive error handling
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and data integrity)
 */

'use client'

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Eye, 
  EyeOff,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormErrorSummary, InlineError } from './error-states';

// HT-008.5.4: Enhanced Form Validation System
// Comprehensive form validation with Vercel/Apply-level UX

/**
 * Validation Rules Interface
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

/**
 * Field Validation State
 */
export interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
  success?: string;
}

/**
 * Form Field Props Interface
 */
interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRule;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Enhanced Input Component with Validation
 */
export function FormInput({
  name,
  label,
  placeholder,
  description,
  required = false,
  disabled = false,
  validation,
  value,
  onChange,
  onBlur,
  className,
  type = 'text',
  ...props
}: FormFieldProps & { type?: string }) {
  const [fieldState, setFieldState] = React.useState<FieldValidation>({ isValid: true });
  const [showPassword, setShowPassword] = React.useState(false);

  const validateField = React.useCallback((value: any): FieldValidation => {
    if (!validation) return { isValid: true };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Required validation
    if (validation.required && (!value || value.toString().trim() === '')) {
      errors.push(`${label || name} is required`);
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') {
      return { isValid: errors.length === 0, error: errors[0] };
    }

    const stringValue = value.toString();

    // Length validations
    if (validation.minLength && stringValue.length < validation.minLength) {
      errors.push(`${label || name} must be at least ${validation.minLength} characters`);
    }
    if (validation.maxLength && stringValue.length > validation.maxLength) {
      errors.push(`${label || name} must be no more than ${validation.maxLength} characters`);
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(stringValue)) {
      errors.push(`${label || name} format is invalid`);
    }

    // Email validation
    if (validation.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(stringValue)) {
        errors.push('Please enter a valid email address');
      }
    }

    // URL validation
    if (validation.url) {
      try {
        new URL(stringValue);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }

    // Number validation
    if (validation.number) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${label || name} must be a number`);
      } else {
        if (validation.min !== undefined && numValue < validation.min) {
          errors.push(`${label || name} must be at least ${validation.min}`);
        }
        if (validation.max !== undefined && numValue > validation.max) {
          errors.push(`${label || name} must be no more than ${validation.max}`);
        }
      }
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors[0],
      warning: warnings[0],
    };
  }, [validation, label, name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const validationResult = validateField(newValue);
    setFieldState(validationResult);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    const validationResult = validateField(value);
    setFieldState(validationResult);
    onBlur?.();
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            fieldState.error && "border-destructive focus-visible:ring-destructive",
            fieldState.warning && "border-warning focus-visible:ring-warning",
            fieldState.success && "border-success focus-visible:ring-success",
            type === 'password' && "pr-10"
          )}
          {...props}
        />
        
        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {fieldState.error && (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          {fieldState.warning && !fieldState.error && (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          {fieldState.success && !fieldState.error && !fieldState.warning && (
            <CheckCircle2 className="h-4 w-4 text-success" />
          )}
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {fieldState.error && (
        <InlineError message={fieldState.error} />
      )}
      {fieldState.warning && !fieldState.error && (
        <InlineError message={fieldState.warning} variant="warning" />
      )}
      {fieldState.success && !fieldState.error && !fieldState.warning && (
        <div className="flex items-center gap-2 text-xs text-success">
          <CheckCircle2 className="w-3 h-3" />
          <span>{fieldState.success}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced Textarea Component with Validation
 */
export function FormTextarea({
  name,
  label,
  placeholder,
  description,
  required = false,
  disabled = false,
  validation,
  value,
  onChange,
  onBlur,
  className,
  rows = 4,
  ...props
}: FormFieldProps & { rows?: number }) {
  const [fieldState, setFieldState] = React.useState<FieldValidation>({ isValid: true });

  const validateField = React.useCallback((value: any): FieldValidation => {
    if (!validation) return { isValid: true };

    const errors: string[] = [];

    if (validation.required && (!value || value.toString().trim() === '')) {
      errors.push(`${label || name} is required`);
    }

    if (!value || value.toString().trim() === '') {
      return { isValid: errors.length === 0, error: errors[0] };
    }

    const stringValue = value.toString();

    if (validation.minLength && stringValue.length < validation.minLength) {
      errors.push(`${label || name} must be at least ${validation.minLength} characters`);
    }
    if (validation.maxLength && stringValue.length > validation.maxLength) {
      errors.push(`${label || name} must be no more than ${validation.maxLength} characters`);
    }

    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors[0],
    };
  }, [validation, label, name]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const validationResult = validateField(newValue);
    setFieldState(validationResult);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    const validationResult = validateField(value);
    setFieldState(validationResult);
    onBlur?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        rows={rows}
        className={cn(
          fieldState.error && "border-destructive focus-visible:ring-destructive"
        )}
        {...props}
      />
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {fieldState.error && (
        <InlineError message={fieldState.error} />
      )}
    </div>
  );
}

/**
 * Enhanced Select Component with Validation
 */
export function FormSelect({
  name,
  label,
  placeholder,
  description,
  required = false,
  disabled = false,
  validation,
  value,
  onChange,
  onBlur,
  className,
  options = [],
  ...props
}: FormFieldProps & { options: Array<{ value: string; label: string; disabled?: boolean }> }) {
  const [fieldState, setFieldState] = React.useState<FieldValidation>({ isValid: true });

  const validateField = React.useCallback((value: any): FieldValidation => {
    if (!validation) return { isValid: true };

    const errors: string[] = [];

    if (validation.required && (!value || value.toString().trim() === '')) {
      errors.push(`${label || name} is required`);
    }

    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors[0],
    };
  }, [validation, label, name]);

  const handleChange = (newValue: string) => {
    const validationResult = validateField(newValue);
    setFieldState(validationResult);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    const validationResult = validateField(value);
    setFieldState(validationResult);
    onBlur?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Select
        value={value || ''}
        onValueChange={handleChange}
        disabled={disabled}
        {...props}
      >
        <SelectTrigger
          className={cn(
            fieldState.error && "border-destructive focus:ring-destructive"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {fieldState.error && (
        <InlineError message={fieldState.error} />
      )}
    </div>
  );
}

/**
 * Enhanced Checkbox Component with Validation
 */
export function FormCheckbox({
  name,
  label,
  description,
  required = false,
  disabled = false,
  validation,
  value,
  onChange,
  onBlur,
  className,
  ...props
}: FormFieldProps) {
  const [fieldState, setFieldState] = React.useState<FieldValidation>({ isValid: true });

  const validateField = React.useCallback((value: any): FieldValidation => {
    if (!validation) return { isValid: true };

    const errors: string[] = [];

    if (validation.required && !value) {
      errors.push(`${label || name} is required`);
    }

    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors[0],
    };
  }, [validation, label, name]);

  const handleChange = (checked: boolean) => {
    const validationResult = validateField(checked);
    setFieldState(validationResult);
    onChange?.(checked);
  };

  const handleBlur = () => {
    const validationResult = validateField(value);
    setFieldState(validationResult);
    onBlur?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={name}
          name={name}
          checked={value || false}
          onCheckedChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          {...props}
        />
        <div className="space-y-1">
          {label && (
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      
      {fieldState.error && (
        <InlineError message={fieldState.error} />
      )}
    </div>
  );
}

/**
 * Enhanced Radio Group Component with Validation
 */
export function FormRadioGroup({
  name,
  label,
  description,
  required = false,
  disabled = false,
  validation,
  value,
  onChange,
  onBlur,
  className,
  options = [],
  ...props
}: FormFieldProps & { options: Array<{ value: string; label: string; disabled?: boolean }> }) {
  const [fieldState, setFieldState] = React.useState<FieldValidation>({ isValid: true });

  const validateField = React.useCallback((value: any): FieldValidation => {
    if (!validation) return { isValid: true };

    const errors: string[] = [];

    if (validation.required && (!value || value.toString().trim() === '')) {
      errors.push(`${label || name} is required`);
    }

    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors[0],
    };
  }, [validation, label, name]);

  const handleChange = (newValue: string) => {
    const validationResult = validateField(newValue);
    setFieldState(validationResult);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    const validationResult = validateField(value);
    setFieldState(validationResult);
    onBlur?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <RadioGroup
        value={value || ''}
        onValueChange={handleChange}
        disabled={disabled}
        {...props}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${name}-${option.value}`}
              disabled={option.disabled}
            />
            <Label htmlFor={`${name}-${option.value}`} className="text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {fieldState.error && (
        <InlineError message={fieldState.error} />
      )}
    </div>
  );
}

/**
 * Form Validation Hook
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = React.useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validateField = React.useCallback((name: keyof T, value: any): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    const errors: string[] = [];

    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(`${String(name)} is required`);
    }

    if (!value || value.toString().trim() === '') {
      return errors[0] || null;
    }

    const stringValue = value.toString();

    if (rule.minLength && stringValue.length < rule.minLength) {
      errors.push(`${String(name)} must be at least ${rule.minLength} characters`);
    }
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors.push(`${String(name)} must be no more than ${rule.maxLength} characters`);
    }

    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors.push(`${String(name)} format is invalid`);
    }

    if (rule.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(stringValue)) {
        errors.push('Please enter a valid email address');
      }
    }

    if (rule.url) {
      try {
        new URL(stringValue);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }

    if (rule.number) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${String(name)} must be a number`);
      } else {
        if (rule.min !== undefined && numValue < rule.min) {
          errors.push(`${String(name)} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && numValue > rule.max) {
          errors.push(`${String(name)} must be no more than ${rule.max}`);
        }
      }
    }

    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors[0] || null;
  }, [validationRules]);

  const setValue = React.useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || '' }));
  }, [validateField]);

  const setFieldTouched = React.useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = React.useCallback((): boolean => {
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  const resetForm = React.useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  const isValid = Object.values(errors).every(error => !error);
  const hasErrors = Object.values(errors).some(error => !!error);

  return {
    values,
    errors,
    touched,
    isValid,
    hasErrors,
    setValue,
    setFieldTouched,
    validateForm,
    resetForm,
  };
}

export default {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  useFormValidation,
};
