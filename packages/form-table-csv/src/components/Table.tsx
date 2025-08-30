'use client'

import React, { useState, useMemo } from 'react'
import type { ColumnConfig, FormTableCsvSchema } from '../types'

interface TableProps {
  data: any[]
  schema: FormTableCsvSchema
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
  className?: string
}

interface TableCellProps {
  value: any
  column: ColumnConfig
  row: any
}

function TableCell({ value, column, row }: TableCellProps) {
  if (column.render) {
    return column.render(value, row)
  }

  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>
  }

  // Format based on column type
  switch (column.format) {
    case 'date':
      try {
        return new Date(value).toLocaleDateString()
      } catch {
        return value
      }
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(value))
    case 'number':
      return new Intl.NumberFormat('en-US').format(Number(value))
    case 'percent':
      return new Intl.NumberFormat('en-US', {
        style: 'percent'
      }).format(Number(value))
    default:
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      if (typeof value === 'boolean') {
        return value ? '✓' : '✗'
      }
      return String(value)
  }
}

export function TableComponent({
  data,
  schema,
  showSearch = true,
  showFilters = false,
  showPagination = true,
  pageSize = 10,
  emptyMessage = 'No data available',
  actions = [],
  className = ''
}: TableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(filterValue.toLowerCase())
        )
      }
    })

    return filtered
  }, [data, searchTerm, filters])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      let aValue = a[sortColumn]
      let bValue = b[sortColumn]

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      // String comparison
      const comparison = String(aValue).localeCompare(String(bValue))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortColumn, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData
    
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, currentPage, pageSize, showPagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (columnKey: string) => {
    const column = schema.columns.find(col => col.key === columnKey)
    if (!column?.sortable) return

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const getActionButtonClass = (variant: string = 'default') => {
    const baseClasses = 'px-3 py-1 text-sm rounded transition-colors'
    switch (variant) {
      case 'destructive':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700`
      case 'outline':
        return `${baseClasses} border border-gray-300 text-gray-700 hover:bg-gray-50`
      case 'secondary':
        return `${baseClasses} bg-gray-200 text-gray-900 hover:bg-gray-300`
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header with search and title */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{schema.title} Data</h3>
            <p className="text-sm text-gray-600">
              Showing {paginatedData.length} of {sortedData.length} entries
            </p>
          </div>
          
          {showSearch && (
            <div className="max-w-sm">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {schema.columns.filter(col => col.filterable).map(column => (
              <div key={column.key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Filter {column.header}
                </label>
                <input
                  type="text"
                  placeholder={`Filter by ${column.header.toLowerCase()}...`}
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilterChange(column.key, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {paginatedData.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {schema.columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => handleSort(column.key)}
                    style={{ width: column.width, textAlign: column.align }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {schema.columns.map(column => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-900"
                      style={{ textAlign: column.align }}
                    >
                      <TableCell
                        value={row[column.key]}
                        column={column}
                        row={row}
                      />
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={getActionButtonClass(action.variant)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}