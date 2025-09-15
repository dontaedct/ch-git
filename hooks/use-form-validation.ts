/**
 * @fileoverview Form Validation Hook
 * @module hooks/use-form-validation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Form Validation Hook
 * Purpose: React hook for comprehensive form validation with Zod schemas
 * Safety: Type-safe form validation with real-time feedback
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { validateAndSanitizeInput } from '@/lib/validation/comprehensive-validation'

interface ValidationResult<T> {
  success: true
  data: T
} | {
  success: false
  errors: string[]
}

interface FieldError {
  field: string
  message: string
}

interface FormState<T> {
  data: Partial<T>
  errors: FieldError[]
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
}

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  initialData?: Partial<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  onSubmit?: (data: T) => Promise<void> | void
  onError?: (errors: string[]) => void
}

/**
 * Hook for comprehensive form validation
 */
export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  initialData = {},
  validateOnChange = true,
  validateOnBlur = true,
  onSubmit,
  onError
}: UseFormValidationOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: [],
    isValid: false,
    isDirty: false,
    isSubmitting: false
  })

  // Validate individual field
  const validateField = useCallback((fieldName: keyof T, value: unknown) => {
    try {
      const fieldSchema = schema.shape[fieldName as string]
      if (!fieldSchema) return null

      const result = fieldSchema.safeParse(value)
      if (!result.success) {
        return result.error.errors[0]?.message || 'Invalid value'
      }
      return null
    } catch {
      return 'Validation error'
    }
  }, [schema])

  // Validate entire form
  const validateForm = useCallback((data: Partial<T>): ValidationResult<T> => {
    return validateAndSanitizeInput(schema, data, 'form-validation')
  }, [schema])

  // Update field value
  const setFieldValue = useCallback((fieldName: keyof T, value: unknown) => {
    setFormState(prevState => {
      const newData = { ...prevState.data, [fieldName]: value }
      const newErrors = [...prevState.errors]
      
      // Remove existing error for this field
      const errorIndex = newErrors.findIndex(error => error.field === fieldName)
      if (errorIndex >= 0) {
        newErrors.splice(errorIndex, 1)
      }

      // Validate field if enabled
      if (validateOnChange) {
        const fieldError = validateField(fieldName, value)
        if (fieldError) {
          newErrors.push({ field: fieldName as string, message: fieldError })
        }
      }

      // Validate entire form
      const validation = validateForm(newData)
      const isValid = validation.success && newErrors.length === 0

      return {
        ...prevState,
        data: newData,
        errors: newErrors,
        isValid,
        isDirty: true
      }
    })
  }, [validateOnChange, validateField, validateForm])

  // Set multiple field values
  const setFieldValues = useCallback((values: Partial<T>) => {
    setFormState(prevState => {
      const newData = { ...prevState.data, ...values }
      const validation = validateForm(newData)
      
      let newErrors: FieldError[] = []
      if (!validation.success) {
        newErrors = validation.errors.map(error => {
          // Try to extract field name from error message
          const fieldMatch = error.match(/^([^:]+):/)
          const field = fieldMatch ? fieldMatch[1] : 'unknown'
          return { field, message: error }
        })
      }

      return {
        ...prevState,
        data: newData,
        errors: newErrors,
        isValid: validation.success,
        isDirty: true
      }
    })
  }, [validateForm])

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: keyof T) => {
    if (!validateOnBlur) return

    const value = formState.data[fieldName]
    const fieldError = validateField(fieldName, value)
    
    if (fieldError) {
      setFormState(prevState => {
        const newErrors = [...prevState.errors]
        const errorIndex = newErrors.findIndex(error => error.field === fieldName)
        
        if (errorIndex >= 0) {
          newErrors[errorIndex] = { field: fieldName as string, message: fieldError }
        } else {
          newErrors.push({ field: fieldName as string, message: fieldError })
        }

        return {
          ...prevState,
          errors: newErrors,
          isValid: false
        }
      })
    }
  }, [validateOnBlur, validateField, formState.data])

  // Get field error
  const getFieldError = useCallback((fieldName: keyof T) => {
    return formState.errors.find(error => error.field === fieldName)?.message
  }, [formState.errors])

  // Clear field error
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setFormState(prevState => ({
      ...prevState,
      errors: prevState.errors.filter(error => error.field !== fieldName)
    }))
  }, [])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFormState(prevState => ({
      ...prevState,
      errors: []
    }))
  }, [])

  // Reset form
  const resetForm = useCallback(() => {
    setFormState({
      data: initialData,
      errors: [],
      isValid: false,
      isDirty: false,
      isSubmitting: false
    })
  }, [initialData])

  // Submit form
  const submitForm = useCallback(async () => {
    if (!onSubmit) return

    setFormState(prevState => ({ ...prevState, isSubmitting: true }))

    try {
      const validation = validateForm(formState.data)
      
      if (!validation.success) {
        const errors = validation.errors.map(error => {
          const fieldMatch = error.match(/^([^:]+):/)
          const field = fieldMatch ? fieldMatch[1] : 'unknown'
          return { field, message: error }
        })
        
        setFormState(prevState => ({
          ...prevState,
          errors,
          isSubmitting: false
        }))
        
        onError?.(validation.errors)
        return
      }

      await onSubmit(validation.data)
      
      setFormState(prevState => ({
        ...prevState,
        isSubmitting: false,
        isDirty: false
      }))
    } catch (error) {
      console.error('Form submission error:', error)
      setFormState(prevState => ({
        ...prevState,
        isSubmitting: false
      }))
      
      onError?.(['Form submission failed'])
    }
  }, [onSubmit, validateForm, formState.data, onError])

  // Memoized field props for easy use with form inputs
  const getFieldProps = useCallback((fieldName: keyof T) => {
    return {
      value: formState.data[fieldName] || '',
      onChange: (value: unknown) => setFieldValue(fieldName, value),
      onBlur: () => handleFieldBlur(fieldName),
      error: getFieldError(fieldName),
      hasError: !!getFieldError(fieldName)
    }
  }, [formState.data, setFieldValue, handleFieldBlur, getFieldError])

  // Memoized form state
  const formProps = useMemo(() => ({
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    hasErrors: formState.errors.length > 0,
    errors: formState.errors,
    data: formState.data
  }), [formState])

  return {
    // State
    ...formProps,
    
    // Actions
    setFieldValue,
    setFieldValues,
    handleFieldBlur,
    getFieldError,
    clearFieldError,
    clearErrors,
    resetForm,
    submitForm,
    
    // Utilities
    getFieldProps,
    validateField,
    validateForm
  }
}

/**
 * Hook for simple field validation
 */
export function useFieldValidation<T>(
  schema: z.ZodSchema<T>,
  initialValue?: T
) {
  const [value, setValue] = useState<T | undefined>(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const validate = useCallback((newValue: T) => {
    const result = schema.safeParse(newValue)
    setError(result.success ? null : result.error.errors[0]?.message || 'Invalid value')
    setIsValid(result.success)
    return result.success
  }, [schema])

  const setValueAndValidate = useCallback((newValue: T) => {
    setValue(newValue)
    return validate(newValue)
  }, [validate])

  return {
    value,
    error,
    isValid,
    setValue: setValueAndValidate,
    validate,
    clearError: () => setError(null)
  }
}

export default useFormValidation
