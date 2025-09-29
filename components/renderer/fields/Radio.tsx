/**
 * Radio Component
 * 
 * Single selection from multiple options
 */

import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioProps {
  name: string;
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  options: RadioOption[];
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

const Radio: React.FC<RadioProps> = ({
  name,
  label,
  required = false,
  value = '',
  onChange,
  error,
  options,
  direction = 'vertical',
  className = ''
}) => {
  const handleChange = (optionValue: string) => {
    onChange?.(optionValue);
  };

  const containerClasses = direction === 'horizontal' 
    ? 'flex flex-wrap gap-4' 
    : 'space-y-2';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={containerClasses}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center space-x-2 cursor-pointer
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => handleChange(option.value)}
              disabled={option.disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Radio;
