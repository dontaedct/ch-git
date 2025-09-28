'use client'

import { useState, useEffect } from 'react'
import {
  Table, Filter, Search, Download, Upload, Edit, Trash2, Eye,
  Plus, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square,
  MoreHorizontal, Settings, RefreshCw, BarChart3
} from 'lucide-react'

interface DataRow {
  id: string
  [key: string]: any
}

interface Column {
  id: string
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'email'
  sortable: boolean
  filterable: boolean
  width?: number
}

interface FilterCondition {
  column: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between'
  value: any
  value2?: any
}

interface SortCondition {
  column: string
  direction: 'asc' | 'desc'
}

export default function DataManagement() {
  const [data, setData] = useState<DataRow[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [sorts, setSorts] = useState<SortCondition[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showFilters, setShowFilters] = useState(false)
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // Sample data
  useEffect(() => {
    const sampleColumns: Column[] = [
      { id: 'id', key: 'id', label: 'ID', type: 'text', sortable: true, filterable: false, width: 80 },
      { id: 'name', key: 'name', label: 'Name', type: 'text', sortable: true, filterable: true, width: 200 },
      { id: 'email', key: 'email', label: 'Email', type: 'email', sortable: true, filterable: true, width: 250 },
      { id: 'status', key: 'status', label: 'Status', type: 'select', sortable: true, filterable: true, width: 120 },
      { id: 'created', key: 'created', label: 'Created', type: 'date', sortable: true, filterable: true, width: 150 },
      { id: 'score', key: 'score', label: 'Score', type: 'number', sortable: true, filterable: true, width: 100 }
    ]

    const sampleData: DataRow[] = [
      {
        id: 'row1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        created: '2025-09-15',
        score: 85
      },
      {
        id: 'row2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'pending',
        created: '2025-09-16',
        score: 92
      },
      {
        id: 'row3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        status: 'inactive',
        created: '2025-09-17',
        score: 78
      },
      {
        id: 'row4',
        name: 'Alice Brown',
        email: 'alice@example.com',
        status: 'active',
        created: '2025-09-18',
        score: 95
      },
      {
        id: 'row5',
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        status: 'pending',
        created: '2025-09-19',
        score: 88
      }
    ]

    setColumns(sampleColumns)
    setData(sampleData)
  }, [])

  // Filter and search data
  const getFilteredData = () => {
    let filteredData = [...data]

    // Apply search
    if (searchTerm) {
      filteredData = filteredData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply filters
    filters.forEach(filter => {
      filteredData = filteredData.filter(row => {
        const value = row[filter.column]
        switch (filter.operator) {
          case 'equals':
            return value === filter.value
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'greater_than':
            return Number(value) > Number(filter.value)
          case 'less_than':
            return Number(value) < Number(filter.value)
          case 'between':
            return Number(value) >= Number(filter.value) && Number(value) <= Number(filter.value2)
          default:
            return true
        }
      })
    })

    // Apply sorting
    if (sorts.length > 0) {
      filteredData.sort((a, b) => {
        for (const sort of sorts) {
          let aValue = a[sort.column]
          let bValue = b[sort.column]

          const column = columns.find(col => col.key === sort.column)
          if (column?.type === 'number') {
            aValue = Number(aValue) || 0
            bValue = Number(bValue) || 0
          } else if (column?.type === 'date') {
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

    return filteredData
  }

  // Pagination
  const getPaginatedData = () => {
    const filteredData = getFilteredData()
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(getFilteredData().length / pageSize)

  // Sorting
  const handleSort = (columnKey: string) => {
    const existingSort = sorts.find(s => s.column === columnKey)
    if (existingSort) {
      if (existingSort.direction === 'asc') {
        existingSort.direction = 'desc'
      } else {
        setSorts(sorts.filter(s => s.column !== columnKey))
      }
    } else {
      setSorts([...sorts, { column: columnKey, direction: 'asc' }])
    }
  }

  // Selection
  const handleSelectAll = () => {
    const visibleRowIds = getPaginatedData().map(row => row.id)
    if (selectedRows.length === visibleRowIds.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(visibleRowIds)
    }
  }

  const handleSelectRow = (rowId: string) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter(id => id !== rowId))
    } else {
      setSelectedRows([...selectedRows, rowId])
    }
  }

  // CSV Export
  const exportToCSV = () => {
    const exportData = selectedRows.length > 0
      ? data.filter(row => selectedRows.includes(row.id))
      : getFilteredData()

    const headers = columns.map(col => col.label)
    const csvContent = [
      headers.join(','),
      ...exportData.map(row =>
        columns.map(col => {
          const value = row[col.key]
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data-export-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // CSV Import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      if (lines.length < 2) return

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const newData: DataRow[] = []

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue

        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: DataRow = { id: `imported-${Date.now()}-${i}` }

        headers.forEach((header, index) => {
          const column = columns.find(col => col.label === header)
          if (column && values[index] !== undefined) {
            row[column.key] = values[index]
          }
        })

        newData.push(row)
      }

      setData([...data, ...newData])
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  const getSortIcon = (columnKey: string) => {
    const sort = sorts.find(s => s.column === columnKey)
    if (!sort) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    return sort.direction === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Data Management</h2>
          <p className="text-gray-600">Manage form submissions with rich table features</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedRows.length} selected
              </span>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Bulk Edit
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Showing {getPaginatedData().length} of {getFilteredData().length} entries
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Active Filters</h3>
            <button
              onClick={() => setFilters([])}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.filter(col => col.filterable).map((column) => (
              <div key={column.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {column.label}
                </label>
                <div className="flex gap-2">
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    {column.type === 'number' && (
                      <>
                        <option value="greater_than">Greater than</option>
                        <option value="less_than">Less than</option>
                      </>
                    )}
                  </select>
                  <input
                    type={column.type === 'number' ? 'number' : 'text'}
                    placeholder="Filter value..."
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-12 px-4 py-3">
                  <button onClick={handleSelectAll}>
                    {selectedRows.length === getPaginatedData().length && getPaginatedData().length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className="text-left px-4 py-3 font-medium text-gray-900"
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <button onClick={() => handleSort(column.key)}>
                          {getSortIcon(column.key)}
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-20 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getPaginatedData().map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${
                    selectedRows.includes(row.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <button onClick={() => handleSelectRow(row.id)}>
                      {selectedRows.includes(row.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-3">
                      {column.key === 'status' ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[column.key])}`}>
                          {row[column.key]}
                        </span>
                      ) : column.type === 'date' ? (
                        new Date(row[column.key]).toLocaleDateString()
                      ) : column.type === 'email' ? (
                        <a href={`mailto:${row[column.key]}`} className="text-blue-600 hover:text-blue-800">
                          {row[column.key]}
                        </a>
                      ) : (
                        row[column.key]
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Total: {getFilteredData().length} records
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Table className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-xl font-semibold text-gray-900">{data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Selected</p>
              <p className="text-xl font-semibold text-gray-900">{selectedRows.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Filter className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Filters</p>
              <p className="text-xl font-semibold text-gray-900">{filters.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Integrity</p>
              <p className="text-xl font-semibold text-gray-900">99.2%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}