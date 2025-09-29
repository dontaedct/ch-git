/**
 * @fileoverview Rich Table Display System - HT-031.3.2
 * Advanced table components with sorting, filtering, CSV export,
 * and sophisticated data management capabilities
 */

export interface TableData {
  id: string
  [key: string]: any
}

export interface TableColumn {
  id: string
  label: string
  key: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'currency' | 'email' | 'url'
  width?: number
  minWidth?: number
  maxWidth?: number
  sortable: boolean
  filterable: boolean
  resizable: boolean
  required: boolean
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string
  validate?: (value: any) => boolean | string
  options?: Array<{ value: any; label: string }>
}

export interface TableConfig {
  allowAdd: boolean
  allowEdit: boolean
  allowDelete: boolean
  allowReorder: boolean
  allowResize: boolean
  allowSort: boolean
  allowFilter: boolean
  allowExport: boolean
  pagination: {
    enabled: boolean
    pageSize: number
    showSizeSelector: boolean
  }
  selection: {
    enabled: boolean
    multiple: boolean
    showSelectAll: boolean
  }
  virtualization: {
    enabled: boolean
    rowHeight: number
    overscan: number
  }
}

export interface SortState {
  column: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  column: string
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between'
  value: any
  value2?: any // for 'between' operator
}

export interface TableState {
  data: TableData[]
  selectedRows: string[]
  sortState: SortState[]
  filterState: FilterState[]
  currentPage: number
  pageSize: number
  editingCell: { rowId: string; columnId: string } | null
  expandedRows: string[]
}

export class RichTableManager {
  private state: TableState
  private config: TableConfig
  private columns: TableColumn[]
  private originalData: TableData[]

  constructor(
    columns: TableColumn[],
    data: TableData[] = [],
    config: Partial<TableConfig> = {}
  ) {
    this.columns = columns
    this.originalData = [...data]
    this.config = {
      allowAdd: true,
      allowEdit: true,
      allowDelete: true,
      allowReorder: true,
      allowResize: true,
      allowSort: true,
      allowFilter: true,
      allowExport: true,
      pagination: {
        enabled: true,
        pageSize: 25,
        showSizeSelector: true
      },
      selection: {
        enabled: true,
        multiple: true,
        showSelectAll: true
      },
      virtualization: {
        enabled: false,
        rowHeight: 48,
        overscan: 5
      },
      ...config
    }

    this.state = {
      data: [...data],
      selectedRows: [],
      sortState: [],
      filterState: [],
      currentPage: 1,
      pageSize: this.config.pagination.pageSize,
      editingCell: null,
      expandedRows: []
    }
  }

  /**
   * Add a new row to the table
   */
  addRow(data: Partial<TableData> = {}): string {
    if (!this.config.allowAdd) return ''

    const newRow: TableData = {
      id: this.generateId(),
      ...this.getDefaultRowData(),
      ...data
    }

    this.state.data.push(newRow)
    this.originalData.push(newRow)

    return newRow.id
  }

  /**
   * Update an existing row
   */
  updateRow(rowId: string, updates: Partial<TableData>): boolean {
    if (!this.config.allowEdit) return false

    const rowIndex = this.state.data.findIndex(row => row.id === rowId)
    if (rowIndex === -1) return false

    // Validate updates
    for (const [columnKey, value] of Object.entries(updates)) {
      const column = this.columns.find(col => col.key === columnKey)
      if (column?.validate) {
        const validation = column.validate(value)
        if (validation !== true) {
          throw new Error(`Validation failed for ${column.label}: ${validation}`)
        }
      }
    }

    this.state.data[rowIndex] = { ...this.state.data[rowIndex], ...updates }

    // Update original data
    const originalIndex = this.originalData.findIndex(row => row.id === rowId)
    if (originalIndex !== -1) {
      this.originalData[originalIndex] = { ...this.originalData[originalIndex], ...updates }
    }

    return true
  }

  /**
   * Delete rows
   */
  deleteRows(rowIds: string[]): boolean {
    if (!this.config.allowDelete) return false

    this.state.data = this.state.data.filter(row => !rowIds.includes(row.id))
    this.originalData = this.originalData.filter(row => !rowIds.includes(row.id))
    this.state.selectedRows = this.state.selectedRows.filter(id => !rowIds.includes(id))

    return true
  }

  /**
   * Sort table by column
   */
  sort(columnKey: string, direction: 'asc' | 'desc' | 'none' = 'asc'): void {
    if (!this.config.allowSort) return

    if (direction === 'none') {
      this.state.sortState = this.state.sortState.filter(sort => sort.column !== columnKey)
      this.state.data = [...this.originalData]
      this.applyFilters()
      return
    }

    const existingSort = this.state.sortState.find(sort => sort.column === columnKey)
    if (existingSort) {
      existingSort.direction = direction
    } else {
      this.state.sortState = [{ column: columnKey, direction }]
    }

    this.applySorting()
  }

  /**
   * Add or update filter
   */
  addFilter(filter: FilterState): void {
    if (!this.config.allowFilter) return

    const existingFilterIndex = this.state.filterState.findIndex(f => f.column === filter.column)
    if (existingFilterIndex !== -1) {
      this.state.filterState[existingFilterIndex] = filter
    } else {
      this.state.filterState.push(filter)
    }

    this.applyFilters()
  }

  /**
   * Remove filter
   */
  removeFilter(columnKey: string): void {
    this.state.filterState = this.state.filterState.filter(f => f.column !== columnKey)
    this.applyFilters()
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.state.filterState = []
    this.applyFilters()
  }

  /**
   * Select rows
   */
  selectRows(rowIds: string[], replace: boolean = false): void {
    if (!this.config.selection.enabled) return

    if (replace) {
      this.state.selectedRows = [...rowIds]
    } else {
      const newSelections = rowIds.filter(id => !this.state.selectedRows.includes(id))
      this.state.selectedRows.push(...newSelections)
    }

    if (!this.config.selection.multiple && this.state.selectedRows.length > 1) {
      this.state.selectedRows = [this.state.selectedRows[this.state.selectedRows.length - 1]]
    }
  }

  /**
   * Deselect rows
   */
  deselectRows(rowIds: string[]): void {
    this.state.selectedRows = this.state.selectedRows.filter(id => !rowIds.includes(id))
  }

  /**
   * Select all visible rows
   */
  selectAll(): void {
    if (!this.config.selection.enabled || !this.config.selection.multiple) return

    const visibleRowIds = this.getVisibleData().map(row => row.id)
    this.selectRows(visibleRowIds, true)
  }

  /**
   * Deselect all rows
   */
  deselectAll(): void {
    this.state.selectedRows = []
  }

  /**
   * Export table data to CSV
   */
  exportToCSV(options: {
    filename?: string
    includeHeaders?: boolean
    selectedOnly?: boolean
    visibleColumnsOnly?: boolean
  } = {}): string {
    if (!this.config.allowExport) return ''

    const {
      filename = 'table-export.csv',
      includeHeaders = true,
      selectedOnly = false,
      visibleColumnsOnly = true
    } = options

    const dataToExport = selectedOnly
      ? this.state.data.filter(row => this.state.selectedRows.includes(row.id))
      : this.getVisibleData()

    const columnsToExport = visibleColumnsOnly
      ? this.columns
      : this.columns

    const headers = columnsToExport.map(col => col.label)
    const rows = dataToExport.map(row =>
      columnsToExport.map(col => {
        const value = row[col.key]
        if (col.format) {
          return col.format(value)
        }
        return value || ''
      })
    )

    const csvContent = [
      ...(includeHeaders ? [headers] : []),
      ...rows
    ].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return csvContent
  }

  /**
   * Import data from CSV
   */
  importFromCSV(csvContent: string, options: {
    hasHeaders?: boolean
    append?: boolean
    validateData?: boolean
  } = {}): {
    success: boolean
    importedCount: number
    errors: string[]
  } {
    const { hasHeaders = true, append = true, validateData = true } = options
    const errors: string[] = []
    let importedCount = 0

    try {
      const lines = csvContent.trim().split('\n')
      if (lines.length === 0) {
        return { success: false, importedCount: 0, errors: ['CSV file is empty'] }
      }

      let dataLines = lines
      let headerMapping: Map<number, string> = new Map()

      if (hasHeaders) {
        const headers = this.parseCSVLine(lines[0])
        dataLines = lines.slice(1)

        // Map CSV headers to column keys
        headers.forEach((header, index) => {
          const column = this.columns.find(col =>
            col.label.toLowerCase() === header.toLowerCase() ||
            col.key.toLowerCase() === header.toLowerCase()
          )
          if (column) {
            headerMapping.set(index, column.key)
          }
        })
      } else {
        // Map by position
        this.columns.forEach((column, index) => {
          headerMapping.set(index, column.key)
        })
      }

      const newData: TableData[] = []

      for (let lineIndex = 0; lineIndex < dataLines.length; lineIndex++) {
        try {
          const values = this.parseCSVLine(dataLines[lineIndex])
          const rowData: TableData = { id: this.generateId() }

          values.forEach((value, index) => {
            const columnKey = headerMapping.get(index)
            if (columnKey) {
              const column = this.columns.find(col => col.key === columnKey)
              if (column) {
                const parsedValue = this.parseValueByType(value, column.type)

                if (validateData && column.validate) {
                  const validation = column.validate(parsedValue)
                  if (validation !== true) {
                    errors.push(`Row ${lineIndex + 1}, ${column.label}: ${validation}`)
                    return
                  }
                }

                rowData[columnKey] = parsedValue
              }
            }
          })

          newData.push(rowData)
          importedCount++
        } catch (error) {
          errors.push(`Row ${lineIndex + 1}: ${error instanceof Error ? error.message : 'Parse error'}`)
        }
      }

      if (!append) {
        this.state.data = newData
        this.originalData = [...newData]
      } else {
        this.state.data.push(...newData)
        this.originalData.push(...newData)
      }

      this.applyFilters()

      return {
        success: importedCount > 0,
        importedCount,
        errors
      }
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  /**
   * Get current visible data (after filters and sorting)
   */
  getVisibleData(): TableData[] {
    return this.state.data
  }

  /**
   * Get paginated data
   */
  getPaginatedData(): {
    data: TableData[]
    totalPages: number
    currentPage: number
    totalItems: number
  } {
    const totalItems = this.state.data.length
    const totalPages = Math.ceil(totalItems / this.state.pageSize)

    if (!this.config.pagination.enabled) {
      return {
        data: this.state.data,
        totalPages: 1,
        currentPage: 1,
        totalItems
      }
    }

    const startIndex = (this.state.currentPage - 1) * this.state.pageSize
    const endIndex = startIndex + this.state.pageSize
    const data = this.state.data.slice(startIndex, endIndex)

    return {
      data,
      totalPages,
      currentPage: this.state.currentPage,
      totalItems
    }
  }

  /**
   * Navigate to page
   */
  goToPage(page: number): void {
    const totalPages = Math.ceil(this.state.data.length / this.state.pageSize)
    this.state.currentPage = Math.max(1, Math.min(page, totalPages))
  }

  /**
   * Change page size
   */
  setPageSize(size: number): void {
    this.state.pageSize = Math.max(1, size)
    this.state.currentPage = 1 // Reset to first page
  }

  /**
   * Get table state
   */
  getState(): TableState {
    return { ...this.state }
  }

  /**
   * Get table configuration
   */
  getConfig(): TableConfig {
    return { ...this.config }
  }

  /**
   * Get columns
   */
  getColumns(): TableColumn[] {
    return [...this.columns]
  }

  /**
   * Private helper methods
   */
  private applySorting(): void {
    if (this.state.sortState.length === 0) {
      this.state.data = [...this.originalData]
      this.applyFilters()
      return
    }

    this.state.data.sort((a, b) => {
      for (const sort of this.state.sortState) {
        const column = this.columns.find(col => col.key === sort.column)
        if (!column) continue

        let aValue = a[sort.column]
        let bValue = b[sort.column]

        // Handle different data types
        if (column.type === 'number' || column.type === 'currency') {
          aValue = Number(aValue) || 0
          bValue = Number(bValue) || 0
        } else if (column.type === 'date') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        } else {
          aValue = String(aValue || '').toLowerCase()
          bValue = String(bValue || '').toLowerCase()
        }

        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  private applyFilters(): void {
    if (this.state.filterState.length === 0) {
      this.state.data = [...this.originalData]
      this.applySorting()
      return
    }

    this.state.data = this.originalData.filter(row => {
      return this.state.filterState.every(filter => {
        const value = row[filter.column]
        return this.evaluateFilter(value, filter)
      })
    })

    this.applySorting()
  }

  private evaluateFilter(value: any, filter: FilterState): boolean {
    const { operator, value: filterValue, value2 } = filter

    switch (operator) {
      case 'equals':
        return value === filterValue
      case 'contains':
        return String(value || '').toLowerCase().includes(String(filterValue || '').toLowerCase())
      case 'starts_with':
        return String(value || '').toLowerCase().startsWith(String(filterValue || '').toLowerCase())
      case 'ends_with':
        return String(value || '').toLowerCase().endsWith(String(filterValue || '').toLowerCase())
      case 'greater_than':
        return Number(value) > Number(filterValue)
      case 'less_than':
        return Number(value) < Number(filterValue)
      case 'between':
        return Number(value) >= Number(filterValue) && Number(value) <= Number(value2)
      default:
        return true
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  private parseValueByType(value: string, type: TableColumn['type']): any {
    if (!value || value === '') return null

    switch (type) {
      case 'number':
      case 'currency':
        const num = Number(value)
        return isNaN(num) ? null : num
      case 'boolean':
        return value.toLowerCase() === 'true' || value === '1'
      case 'date':
        const date = new Date(value)
        return isNaN(date.getTime()) ? null : date.toISOString()
      default:
        return value
    }
  }

  private getDefaultRowData(): Partial<TableData> {
    const defaultData: Partial<TableData> = {}

    this.columns.forEach(column => {
      switch (column.type) {
        case 'number':
        case 'currency':
          defaultData[column.key] = 0
          break
        case 'boolean':
          defaultData[column.key] = false
          break
        case 'date':
          defaultData[column.key] = new Date().toISOString().split('T')[0]
          break
        case 'select':
          defaultData[column.key] = column.options?.[0]?.value || ''
          break
        default:
          defaultData[column.key] = ''
      }
    })

    return defaultData
  }

  private generateId(): string {
    return `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Rich table utilities
 */
export const RichTableUtils = {
  /**
   * Create a basic table configuration
   */
  createBasicTable(columns: Omit<TableColumn, 'id'>[]): RichTableManager {
    const tableColumns: TableColumn[] = columns.map((col, index) => ({
      ...col,
      id: `col-${index}-${Date.now()}`
    }))

    return new RichTableManager(tableColumns)
  },

  /**
   * Format currency values
   */
  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value)
  },

  /**
   * Format date values
   */
  formatDate(value: string | Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
    const date = typeof value === 'string' ? new Date(value) : value

    if (isNaN(date.getTime())) return 'Invalid Date'

    return new Intl.DateTimeFormat('en-US', {
      dateStyle: format
    }).format(date)
  },

  /**
   * Validate email addresses
   */
  validateEmail(email: string): boolean | string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) || 'Please enter a valid email address'
  },

  /**
   * Validate URLs
   */
  validateUrl(url: string): boolean | string {
    try {
      new URL(url)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  }
}

export default RichTableManager