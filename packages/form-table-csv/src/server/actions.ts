'use server'

import { z } from 'zod'
import type { FormTableCsvSchema } from '../types'

// Generic server action for handling form submissions
export async function submitFormData<T>(
  schema: FormTableCsvSchema,
  formData: T,
  options: {
    onSuccess?: (data: T) => Promise<void>
    onError?: (error: Error) => Promise<void>
    transform?: (data: T) => T
  } = {}
) {
  try {
    // Validate data against schema
    const validatedData = schema.validation.parse(formData)
    
    // Transform data if transform function is provided
    const processedData = options.transform 
      ? options.transform(validatedData as T)
      : validatedData as T

    // Add metadata
    const dataWithMeta = {
      ...processedData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Call success handler if provided
    if (options.onSuccess) {
      await options.onSuccess(dataWithMeta)
    }

    return {
      success: true,
      data: dataWithMeta,
      error: null
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    // Call error handler if provided
    if (options.onError && error instanceof Error) {
      await options.onError(error)
    }

    return {
      success: false,
      data: null,
      error: errorMessage
    }
  }
}

// Server action for bulk data operations
export async function bulkProcessFormData<T>(
  schema: FormTableCsvSchema,
  dataArray: T[],
  options: {
    onBatchSuccess?: (data: T[]) => Promise<void>
    onBatchError?: (error: Error) => Promise<void>
    onItemError?: (item: T, error: Error, index: number) => Promise<void>
    transform?: (data: T) => T
    validateAll?: boolean // If true, validates all items before processing any
  } = {}
) {
  const results: Array<{
    index: number
    success: boolean
    data: T | null
    error: string | null
  }> = []

  try {
    // Validate all items first if requested
    if (options.validateAll) {
      for (const item of dataArray) {
        schema.validation.parse(item)
      }
    }

    // Process each item
    for (let i = 0; i < dataArray.length; i++) {
      const item = dataArray[i]
      
      try {
        const result = await submitFormData(schema, item, {
          transform: options.transform
        })
        
        results.push({
          index: i,
          success: result.success,
          data: result.data,
          error: result.error
        })
      } catch (itemError) {
        const errorMessage = itemError instanceof Error ? itemError.message : 'Unknown error'
        
        results.push({
          index: i,
          success: false,
          data: null,
          error: errorMessage
        })

        if (options.onItemError && itemError instanceof Error) {
          await options.onItemError(item, itemError, i)
        }
      }
    }

    const successfulResults = results.filter(r => r.success)
    const failedResults = results.filter(r => !r.success)

    // Call batch success handler if provided
    if (options.onBatchSuccess && successfulResults.length > 0) {
      const successfulData = successfulResults.map(r => r.data!).filter(Boolean)
      await options.onBatchSuccess(successfulData)
    }

    return {
      success: failedResults.length === 0,
      processed: dataArray.length,
      successful: successfulResults.length,
      failed: failedResults.length,
      results,
      errors: failedResults.map(r => r.error)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bulk processing failed'
    
    if (options.onBatchError && error instanceof Error) {
      await options.onBatchError(error)
    }

    return {
      success: false,
      processed: 0,
      successful: 0,
      failed: dataArray.length,
      results: [],
      errors: [errorMessage]
    }
  }
}

// Helper to create type-safe server actions for specific schemas
export function createFormServerActions<T>(schema: FormTableCsvSchema) {
  return {
    submit: (formData: T, options?: Parameters<typeof submitFormData>[2]) => 
      submitFormData(schema, formData, options),
    
    bulkSubmit: (dataArray: T[], options?: Parameters<typeof bulkProcessFormData>[2]) => 
      bulkProcessFormData(schema, dataArray, options)
  }
}

// Example usage - Contact form server actions
export const contactFormActions = createFormServerActions(
  // You would import your schema here
  {
    name: 'contact-form',
    title: 'Contact Form',
    fields: [],
    columns: [],
    validation: z.object({
      full_name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      message: z.string().optional(),
      consent: z.boolean()
    })
  }
)