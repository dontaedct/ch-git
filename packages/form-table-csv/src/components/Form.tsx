'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FormTableCsvSchema, FormFieldConfig } from '../types'

interface FormProps {
  schema: FormTableCsvSchema
  onSubmit: (data: any) => Promise<void>
  onReset?: () => void
  submitText?: string
  resetText?: string
  showReset?: boolean
  layout?: 'grid' | 'stack'
  gridCols?: number
  className?: string
  disabled?: boolean
}

interface FormFieldProps {
  field: FormFieldConfig
  register: any
  error?: string
  disabled?: boolean
}

function FormField({ field, register, error, disabled }: FormFieldProps) {
  const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : ""

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...register(field.name)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses} min-h-[100px] resize-vertical`}
            rows={4}
          />
        )

      case 'select':
        return (
          <select
            {...register(field.name)}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses}`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <select
            {...register(field.name)}
            disabled={disabled}
            multiple
            className={`${baseClasses} ${errorClasses} min-h-[120px]`}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              {...register(field.name)}
              type="checkbox"
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
            />
            <label className="ml-2 block text-sm text-gray-900">
              {field.label}
            </label>
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  {...register(field.name)}
                  type="radio"
                  value={option.value}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:cursor-not-allowed"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <input
            {...register(field.name, field.type === 'number' ? { valueAsNumber: true } : {})}
            type={field.type}
            placeholder={field.placeholder}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses}`}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {field.description && (
        <p className="text-sm text-gray-500">{field.description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export function FormComponent({
  schema,
  onSubmit,
  onReset,
  submitText = 'Submit',
  resetText = 'Reset',
  showReset = true,
  layout = 'stack',
  gridCols = 2,
  className = '',
  disabled = false
}: FormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema.validation),
    defaultValues: schema.fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue ?? (
        field.type === 'checkbox' ? false :
        field.type === 'multiselect' ? [] :
        field.type === 'number' ? 0 :
        ''
      )
      return acc
    }, {} as Record<string, any>)
  })

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data)
      reset()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleReset = () => {
    reset()
    onReset?.()
  }

  const gridClass = layout === 'grid' ? `grid grid-cols-1 md:grid-cols-${gridCols} gap-6` : 'space-y-6'

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{schema.title}</h2>
        {schema.description && (
          <p className="mt-2 text-sm text-gray-600">{schema.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className={gridClass}>
          {schema.fields.map((field) => (
            <div 
              key={field.name}
              className={field.grid ? `col-span-${field.grid.colSpan || 1} row-span-${field.grid.rowSpan || 1}` : ''}
            >
              <FormField
                field={field}
                register={register}
                error={errors[field.name]?.message as string}
                disabled={disabled || isSubmitting}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : submitText}
          </button>
          
          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              disabled={disabled || isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              {resetText}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}