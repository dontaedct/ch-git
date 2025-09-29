/**
 * MultiSelect Component
 * 
 * Multiple selection from options
 */

import React, { useState } from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string[];
  onChange?: (values: string[]) => void;
  error?: string;
  options: MultiSelectOption[];
  maxSelections?: number;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  name,
  label,
  placeholder = 'Select options',
  required = false,
  value = [],
  onChange,
  error,
  options,
  maxSelections,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    if (!maxSelections || newValue.length <= maxSelections) {
      onChange?.(newValue);
    }
  };

  const handleRemoveOption = (optionValue: string) => {
    onChange?.(value.filter(v => v !== optionValue));
  };

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOption(option.value);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => handleToggleOption(option.value)}
                  disabled={option.disabled || (maxSelections && value.length >= maxSelections && !value.includes(option.value))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      
      {maxSelections && (
        <p className="text-xs text-gray-500">
          {value.length}/{maxSelections} selected
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;
