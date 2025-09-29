/**
 * Text Input Field Component
 *
 * Basic text input field with validation, accessibility features,
 * and customizable styling. Supports various input types and real-time validation.
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../lib/renderer/ThemeProvider';

export interface TextInputProps {
  field: {
    id: string;
    name: string;
    type: string;
    label: string;
    placeholder?: string;
    description?: string;
    required: boolean;
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      patternMessage?: string;
      custom?: string;
    };
    accessibility?: {
      ariaLabel?: string;
      ariaDescribedBy?: string;
    };
    styling?: {
      width?: 'full' | 'half' | 'third';
      variant?: 'default' | 'filled' | 'outline';
    };
  };
  value?: string;
  onChange: (value: string) => void;
  error?: {
    message: string;
    type: 'required' | 'format' | 'custom';
  };
  theme?: any;
  mode?: 'preview' | 'live' | 'edit';
  viewport?: 'desktop' | 'tablet' | 'mobile';
  disabled?: boolean;
  autoFocus?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  field,
  value = '',
  onChange,
  error,
  mode = 'live',
  disabled = false,
  autoFocus = false
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Real-time validation
  useEffect(() => {
    if (!isTouched || !value) {
      setValidationMessage('');
      return;
    }

    const validation = field.validation;
    if (!validation) return;

    // Length validation
    if (validation.minLength && value.length < validation.minLength) {
      setValidationMessage(`Minimum ${validation.minLength} characters required`);
      return;
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      setValidationMessage(`Maximum ${validation.maxLength} characters allowed`);
      return;
    }

    // Pattern validation
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        setValidationMessage(validation.patternMessage || 'Invalid format');
        return;
      }
    }

    setValidationMessage('');
  }, [value, isTouched, field.validation]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (!isTouched) {
      setIsTouched(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Get input type
  const getInputType = () => {
    switch (field.type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      case 'url': return 'url';
      case 'password': return 'password';
      case 'search': return 'search';
      default: return 'text';
    }
  };

  // Get width classes
  const getWidthClasses = () => {
    switch (field.styling?.width) {
      case 'half': return 'w-full md:w-1/2';
      case 'third': return 'w-full md:w-1/3';
      case 'full':
      default: return 'w-full';
    }
  };

  // Get variant classes
  const getVariantClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out focus:outline-none';
    const hasError = error || validationMessage;

    switch (field.styling?.variant) {
      case 'filled':
        return `${baseClasses} bg-gray-50 border-0 border-b-2 rounded-t-lg focus:bg-white ${
          hasError
            ? 'border-red-500 focus:border-red-500'
            : isFocused
            ? 'border-blue-500 focus:border-blue-500'
            : 'border-gray-300 focus:border-blue-500'
        }`;

      case 'outline':
        return `${baseClasses} bg-transparent border-2 rounded-lg ${
          hasError
            ? 'border-red-500 focus:border-red-500'
            : isFocused
            ? 'border-blue-500 focus:border-blue-500'
            : 'border-gray-300 focus:border-blue-500'
        }`;

      case 'default':
      default:
        return `${baseClasses} bg-white border rounded-lg shadow-sm ${
          hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : isFocused
            ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        } focus:ring-2 focus:ring-opacity-20`;
    }
  };

  const inputId = `${field.id}-input`;
  const errorId = `${field.id}-error`;
  const descriptionId = `${field.id}-description`;
  const characterCountId = `${field.id}-count`;

  const hasError = error || validationMessage;
  const showCharacterCount = field.validation?.maxLength && field.validation.maxLength > 0;

  return (
    <div className={`text-input-field ${getWidthClasses()}`} data-field-id={field.id}>
      {/* Label */}
      <label
        htmlFor={inputId}
        className={`
          block text-sm font-medium mb-2
          ${hasError ? 'text-red-700' : 'text-gray-700'}
          ${field.required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}
        `}
      >
        {field.label}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          id={inputId}
          name={field.name}
          type={getInputType()}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={field.placeholder}
          required={field.required}
          disabled={disabled || mode === 'preview'}
          autoFocus={autoFocus}
          className={`
            ${getVariantClasses()}
            px-4 py-3 text-base
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${showCharacterCount ? 'pr-16' : ''}
          `}
          aria-label={field.accessibility?.ariaLabel || field.label}
          aria-describedby={`
            ${field.description ? descriptionId : ''}
            ${hasError ? errorId : ''}
            ${showCharacterCount ? characterCountId : ''}
          `.trim()}
          aria-invalid={hasError ? 'true' : 'false'}
          maxLength={field.validation?.maxLength}
          minLength={field.validation?.minLength}
          pattern={field.validation?.pattern}
        />

        {/* Character count */}
        {showCharacterCount && (
          <div
            id={characterCountId}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2
              text-xs font-mono
              ${value.length > field.validation!.maxLength! * 0.9 ? 'text-orange-600' : 'text-gray-400'}
              ${value.length >= field.validation!.maxLength! ? 'text-red-600' : ''}
            `}
            aria-live="polite"
          >
            {value.length}/{field.validation!.maxLength}
          </div>
        )}

        {/* Success indicator */}
        {value && !hasError && isTouched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {/* Error indicator */}
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Description */}
      {field.description && !hasError && (
        <p
          id={descriptionId}
          className="mt-2 text-sm text-gray-600"
        >
          {field.description}
        </p>
      )}

      {/* Error message */}
      {hasError && (
        <p
          id={errorId}
          className="mt-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error?.message || validationMessage}
        </p>
      )}

      {/* Field type specific features */}
      {field.type === 'email' && value && !hasError && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Valid email format
        </div>
      )}

      {field.type === 'tel' && value && !hasError && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Valid phone format
        </div>
      )}

      {/* Accessibility enhancements */}
      <style jsx>{`
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .text-input-field input {
            border-width: 2px;
          }

          .text-input-field input:focus {
            outline: 3px solid currentColor;
            outline-offset: 2px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .text-input-field input {
            transition: none;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .text-input-field input {
            background-color: #374151;
            color: #f9fafb;
            border-color: #4b5563;
          }

          .text-input-field input:focus {
            background-color: #4b5563;
            border-color: #3b82f6;
          }

          .text-input-field label {
            color: #f3f4f6;
          }
        }
      `}</style>
    </div>
  );
};

export default TextInput;