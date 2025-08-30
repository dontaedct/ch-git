import Papa from 'papaparse'
import type { CsvExportOptions, FormTableCsvSchema } from '../types'

export function exportToCSV(
  data: any[],
  schema: FormTableCsvSchema,
  options: CsvExportOptions = {}
) {
  const {
    filename = `${schema.name}-export-${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders = true,
    transform,
    dateFormat = 'MM/dd/yyyy'
  } = options

  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Transform data if transform function is provided
  let processedData = transform ? transform(data) : data

  // Format data based on schema columns
  processedData = processedData.map(row => {
    const formattedRow: Record<string, any> = {}
    
    schema.columns.forEach(column => {
      let value = row[column.key]
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        formattedRow[column.header] = ''
        return
      }

      // Format based on column type
      switch (column.format) {
        case 'date':
          try {
            const date = new Date(value)
            formattedRow[column.header] = formatDate(date, dateFormat)
          } catch {
            formattedRow[column.header] = value
          }
          break
        case 'currency':
          formattedRow[column.header] = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(Number(value))
          break
        case 'number':
          formattedRow[column.header] = new Intl.NumberFormat('en-US').format(Number(value))
          break
        case 'percent':
          formattedRow[column.header] = new Intl.NumberFormat('en-US', {
            style: 'percent'
          }).format(Number(value))
          break
        default:
          if (Array.isArray(value)) {
            formattedRow[column.header] = value.join('; ')
          } else if (typeof value === 'boolean') {
            formattedRow[column.header] = value ? 'Yes' : 'No'
          } else {
            formattedRow[column.header] = String(value)
          }
      }
    })
    
    return formattedRow
  })

  // Generate CSV
  const csv = Papa.unparse(processedData, {
    header: includeHeaders,
    skipEmptyLines: true
  })

  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`
    case 'MM/dd/yyyy':
    default:
      return `${month}/${day}/${year}`
  }
}

// Utility to parse CSV data back to objects
export function parseCSV(csvText: string, schema: FormTableCsvSchema): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Find column by header name
        const column = schema.columns.find(col => col.header === header)
        return column ? column.key : header.toLowerCase().replace(/\s+/g, '_')
      },
      transform: (value, field) => {
        // Find column configuration
        const column = schema.columns.find(col => col.key === field)
        if (!column) return value

        // Transform based on column type
        switch (column.format) {
          case 'number':
            return value === '' ? null : Number(value.replace(/[^\d.-]/g, ''))
          case 'date':
            return value === '' ? null : new Date(value).toISOString()
          default:
            return value === '' ? null : value
        }
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`))
        } else {
          resolve(results.data as any[])
        }
      },
      error: (error: any) => {
        reject(error)
      }
    })
  })
}