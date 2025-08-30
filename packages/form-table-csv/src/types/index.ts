import type { z } from 'zod'

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'tel' 
  | 'number' 
  | 'date' 
  | 'datetime-local'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'textarea'

export interface FormFieldConfig {
  name: string
  label: string
  type: FormFieldType
  placeholder?: string
  description?: string
  required?: boolean
  defaultValue?: any
  options?: Array<{ label: string; value: string | number }>
  validation?: z.ZodType<any>
  grid?: {
    col?: number
    row?: number
    colSpan?: number
    rowSpan?: number
  }
}

export interface ColumnConfig {
  key: string
  header: string
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
  format?: 'date' | 'currency' | 'number' | 'percent'
}

export interface FormTableCsvSchema {
  name: string
  title: string
  description?: string
  fields: FormFieldConfig[]
  columns: ColumnConfig[]
  validation: z.ZodObject<any>
}

export interface FormTableCsvConfig {
  schema: FormTableCsvSchema
  form?: {
    submitText?: string
    resetText?: string
    showReset?: boolean
    layout?: 'grid' | 'stack'
    gridCols?: number
  }
  table?: {
    showSearch?: boolean
    showFilters?: boolean
    showPagination?: boolean
    pageSize?: number
    emptyMessage?: string
    actions?: Array<{
      label: string
      onClick: (row: any) => void
      variant?: 'default' | 'destructive' | 'outline' | 'secondary'
    }>
  }
  csv?: {
    filename?: string
    includeHeaders?: boolean
    dateFormat?: string
  }
}

export interface CsvExportOptions {
  filename?: string
  includeHeaders?: boolean
  transform?: (data: any[]) => any[]
  dateFormat?: string
}

export interface FormTableCsvData {
  data: any[]
  loading: boolean
  error: string | null
}

export interface FormTableCsvActions {
  addEntry: (entry: any) => Promise<void>
  updateEntry: (id: string, entry: any) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  exportToCsv: (options?: CsvExportOptions) => void
  clearData: () => void
}