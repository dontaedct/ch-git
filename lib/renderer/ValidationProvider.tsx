/**
 * Validation Provider
 *
 * Provides validation context and utilities for form validation
 * across the manifest renderer system.
 */

import React, { createContext, useContext } from 'react';

export interface ValidationConfig {
  enabled?: boolean;
  realtime?: boolean;
  showErrorSummary?: boolean;
  customRules?: Array<{
    id: string;
    function: string;
    message: string;
    fields: string[];
  }>;
}

interface ValidationContextValue {
  config: ValidationConfig;
  validateField: (fieldId: string, value: any, allValues: Record<string, any>) => string[];
  validateForm: (values: Record<string, any>) => Record<string, string[]>;
}

const ValidationContext = createContext<ValidationContextValue | undefined>(undefined);

export const useValidation = (): ValidationContextValue => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
};

interface ValidationProviderProps {
  validation?: ValidationConfig;
  children: React.ReactNode;
}

export const ValidationProvider: React.FC<ValidationProviderProps> = ({
  validation = { enabled: true },
  children
}) => {
  const validateField = (fieldId: string, value: any, allValues: Record<string, any>): string[] => {
    const errors: string[] = [];

    // Basic validation logic would go here
    // This is a simplified implementation

    return errors;
  };

  const validateForm = (values: Record<string, any>): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};

    // Form-level validation logic would go here

    return errors;
  };

  const contextValue: ValidationContextValue = {
    config: validation,
    validateField,
    validateForm
  };

  return (
    <ValidationContext.Provider value={contextValue}>
      {children}
    </ValidationContext.Provider>
  );
};

export default ValidationProvider;