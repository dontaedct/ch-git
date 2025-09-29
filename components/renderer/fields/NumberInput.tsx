/**
 * NumberInput Component
 * 
 * Numeric input with validation
 */

import React from 'react';

interface NumberInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  name,
  label,
  placeholder = 'Enter a number',
  required = false,
  value,
  onChange,
  error,
  min,
  max,
  step = 1,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      onChange?.(numValue);
    } else if (e.target.value === '') {
      onChange?.(0);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type="number"
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default NumberInput;
