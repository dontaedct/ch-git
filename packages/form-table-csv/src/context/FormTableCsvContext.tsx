'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { FormTableCsvData, FormTableCsvActions, CsvExportOptions, FormTableCsvSchema } from '../types'
import { exportToCSV } from '../utils/csv'

interface FormTableCsvContextType extends FormTableCsvData, FormTableCsvActions {
  schema: FormTableCsvSchema | null
}

const FormTableCsvContext = createContext<FormTableCsvContextType | null>(null)

interface FormTableCsvProviderProps {
  children: ReactNode
  schema: FormTableCsvSchema
  initialData?: any[]
  onDataChange?: (data: any[]) => void
}

export function FormTableCsvProvider({
  children,
  schema,
  initialData = [],
  onDataChange
}: FormTableCsvProviderProps) {
  const [data, setData] = useState<any[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateData = useCallback((newData: any[]) => {
    setData(newData)
    onDataChange?.(newData)
  }, [onDataChange])

  const addEntry = useCallback(async (entry: any) => {
    setLoading(true)
    setError(null)
    
    try {
      // Validate entry against schema
      const validatedEntry = schema.validation.parse(entry)
      
      // Add timestamp and id if not provided
      const entryWithMeta = {
        ...validatedEntry,
        id: entry.id || crypto.randomUUID(),
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const newData = [...data, entryWithMeta]
      updateData(newData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add entry'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [data, schema.validation, updateData])

  const updateEntry = useCallback(async (id: string, entry: any) => {
    setLoading(true)
    setError(null)
    
    try {
      // Validate entry against schema
      const validatedEntry = schema.validation.parse(entry)
      
      const newData = data.map(item => 
        item.id === id 
          ? { ...item, ...validatedEntry, updatedAt: new Date().toISOString() }
          : item
      )
      
      updateData(newData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update entry'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [data, schema.validation, updateData])

  const deleteEntry = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const newData = data.filter(item => item.id !== id)
      updateData(newData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entry'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [data, updateData])

  const exportToCsv = useCallback((options?: CsvExportOptions) => {
    exportToCSV(data, schema, options)
  }, [data, schema])

  const clearData = useCallback(() => {
    updateData([])
    setError(null)
  }, [updateData])

  const value: FormTableCsvContextType = {
    schema,
    data,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    exportToCsv,
    clearData
  }

  return (
    <FormTableCsvContext.Provider value={value}>
      {children}
    </FormTableCsvContext.Provider>
  )
}

export function useFormTableCsv() {
  const context = useContext(FormTableCsvContext)
  if (!context) {
    throw new Error('useFormTableCsv must be used within a FormTableCsvProvider')
  }
  return context
}