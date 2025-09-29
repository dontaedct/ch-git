/**
 * DateInput Component
 * 
 * Date picker input
 */

import React from 'react';

interface DateInputProps {
  name: string;
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  min?: string;
  max?: string;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  required = false,
  value = '',
  onChange,
  error,
  min,
  max,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
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
        type="date"
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        min={min}
        max={max}
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

export default DateInput;
