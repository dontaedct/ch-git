'use client'

import React from 'react'
import { FormTableCsvProvider, useFormTableCsv } from '../context/FormTableCsvContext'
import { FormComponent } from './Form'
import { TableComponent } from './Table'
import { CsvExportButton } from './CsvExportButton'
import type { FormTableCsvConfig } from '../types'

interface FormTableCsvBlockProps {
  config: FormTableCsvConfig
  initialData?: any[]
  onDataChange?: (data: any[]) => void
  className?: string
}

function FormTableCsvBlockContent({ config, className = '' }: Omit<FormTableCsvBlockProps, 'initialData' | 'onDataChange'>) {
  const { schema, data, loading, error, addEntry, exportToCsv, clearData } = useFormTableCsv()

  if (!schema) {
    return <div>Error: No schema provided</div>
  }

  const handleFormSubmit = async (formData: any) => {
    await addEntry(formData)
  }

  const tableActions = [
    ...(config.table?.actions || []),
    {
      label: 'Clear All Data',
      onClick: () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
          clearData()
        }
      },
      variant: 'destructive' as const
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <FormComponent
          schema={schema}
          onSubmit={handleFormSubmit}
          submitText={config.form?.submitText}
          resetText={config.form?.resetText}
          showReset={config.form?.showReset}
          layout={config.form?.layout}
          gridCols={config.form?.gridCols}
          disabled={loading}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Table Header with Export Button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {schema.title} Data ({data.length} entries)
            </h3>
            {schema.description && (
              <p className="text-sm text-gray-600 mt-1">{schema.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <CsvExportButton
              data={data}
              schema={schema}
              options={config.csv}
              disabled={loading || data.length === 0}
              variant="outline"
            />
          </div>
        </div>

        {/* Table */}
        <TableComponent
          data={data}
          schema={schema}
          showSearch={config.table?.showSearch}
          showFilters={config.table?.showFilters}
          showPagination={config.table?.showPagination}
          pageSize={config.table?.pageSize}
          emptyMessage={config.table?.emptyMessage}
          actions={tableActions}
        />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function FormTableCsvBlock({
  config,
  initialData = [],
  onDataChange,
  className = ''
}: FormTableCsvBlockProps) {
  return (
    <FormTableCsvProvider
      schema={config.schema}
      initialData={initialData}
      onDataChange={onDataChange}
    >
      <FormTableCsvBlockContent config={config} className={className} />
    </FormTableCsvProvider>
  )
}