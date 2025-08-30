'use client'

import React from 'react'
import { exportToCSV } from '../utils/csv'
import type { FormTableCsvSchema, CsvExportOptions } from '../types'

interface CsvExportButtonProps {
  data: any[]
  schema: FormTableCsvSchema
  options?: CsvExportOptions
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
}

export function CsvExportButton({
  data,
  schema,
  options = {},
  children = 'Export CSV',
  className = '',
  disabled = false,
  variant = 'default'
}: CsvExportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) {
      alert('No data available to export')
      return
    }
    
    exportToCSV(data, schema, options)
  }

  const getVariantClass = () => {
    const baseClasses = 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
    
    switch (variant) {
      case 'outline':
        return `${baseClasses} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500`
      case 'ghost':
        return `${baseClasses} text-gray-700 hover:bg-gray-100 focus:ring-blue-500`
      default:
        return `${baseClasses} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || data.length === 0}
      className={`${getVariantClass()} ${className}`}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {children}
    </button>
  )
}