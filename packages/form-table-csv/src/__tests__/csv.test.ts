import { exportToCSV, parseCSV } from '../utils/csv'
import { createContactFormSchema } from '../schema/createSchema'

// Mock Papa Parse
jest.mock('papaparse', () => ({
  unparse: jest.fn((data) => 'mocked,csv,data\nrow1,row2,row3'),
  parse: jest.fn((csv, options) => {
    const mockData = [
      { full_name: 'John Doe', email: 'john@example.com', phone: '1234567890' }
    ]
    setTimeout(() => options.complete({ data: mockData, errors: [] }), 0)
  })
}))

// Mock DOM methods
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  }
})

// Mock document methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    setAttribute: jest.fn(),
    click: jest.fn(),
    style: {},
    download: true
  }))
})

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn()
})

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn()
})

describe('CSV Utils', () => {
  const mockSchema = createContactFormSchema()
  const mockData = [
    {
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      message: 'Test message',
      consent: true
    },
    {
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      message: 'Another message',
      consent: true
    }
  ]

  describe('exportToCSV', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should export data to CSV with default options', () => {
      exportToCSV(mockData, mockSchema)
      
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(window.URL.createObjectURL).toHaveBeenCalled()
    })

    it('should handle empty data gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      exportToCSV([], mockSchema)
      
      expect(consoleSpy).toHaveBeenCalledWith('No data to export')
      expect(document.createElement).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should use custom filename when provided', () => {
      const Papa = require('papaparse')
      Papa.unparse.mockReturnValue('mocked,csv,data')
      
      exportToCSV(mockData, mockSchema, {
        filename: 'custom-export.csv'
      })
      
      expect(document.createElement).toHaveBeenCalled()
    })

    it('should transform data when transform function provided', () => {
      const transformFunction = jest.fn((data: any[]) => 
        data.map((row: any) => ({ ...row, transformed: true }))
      )
      
      exportToCSV(mockData, mockSchema, {
        transform: transformFunction
      })
      
      expect(transformFunction).toHaveBeenCalledWith(mockData)
    })

    it('should format different data types correctly', () => {
      const dataWithTypes = [
        {
          text: 'Sample text',
          number: 123.45,
          date: new Date('2024-01-15').toISOString(),
          boolean: true,
          array: ['item1', 'item2'],
          null_value: null,
          undefined_value: undefined
        }
      ]

      const schemaWithTypes = {
        ...mockSchema,
        columns: [
          { key: 'text', header: 'Text', format: undefined },
          { key: 'number', header: 'Number', format: 'number' as const },
          { key: 'date', header: 'Date', format: 'date' as const },
          { key: 'boolean', header: 'Boolean', format: undefined },
          { key: 'array', header: 'Array', format: undefined },
          { key: 'null_value', header: 'Null', format: undefined },
          { key: 'undefined_value', header: 'Undefined', format: undefined }
        ]
      }

      expect(() => exportToCSV(dataWithTypes, schemaWithTypes)).not.toThrow()
    })
  })

  describe('parseCSV', () => {
    it('should parse CSV data correctly', async () => {
      const csvText = 'Full Name,Email,Phone\nJohn Doe,john@example.com,1234567890'
      
      const result = await parseCSV(csvText, mockSchema)
      
      expect(result).toEqual([
        { full_name: 'John Doe', email: 'john@example.com', phone: '1234567890' }
      ])
    })

    it('should handle parsing errors', async () => {
      const Papa = require('papaparse')
      Papa.parse.mockImplementationOnce((csv: any, options: any) => {
        setTimeout(() => options.complete({
          data: [],
          errors: [{ message: 'Parse error' }]
        }), 0)
      })

      const csvText = 'invalid,csv,data'
      
      await expect(parseCSV(csvText, mockSchema)).rejects.toThrow('CSV parsing errors: Parse error')
    })

    it('should transform headers to field names', async () => {
      const Papa = require('papaparse')
      let transformHeaderFn: ((header: string) => string) | undefined

      Papa.parse.mockImplementationOnce((csv: any, options: any) => {
        transformHeaderFn = options.transformHeader
        setTimeout(() => options.complete({ data: [], errors: [] }), 0)
      })

      await parseCSV('test', mockSchema)

      expect(transformHeaderFn).toBeDefined()
      if (transformHeaderFn) {
        expect(transformHeaderFn('Full Name')).toBe('full_name')
        expect(transformHeaderFn('Email Address')).toBe('email')
        expect(transformHeaderFn('Unknown Header')).toBe('unknown_header')
      }
    })

    it('should transform values based on column format', async () => {
      const Papa = require('papaparse')
      let transformFn: ((value: string, field: string) => any) | undefined

      Papa.parse.mockImplementationOnce((csv: any, options: any) => {
        transformFn = options.transform
        setTimeout(() => options.complete({ data: [], errors: [] }), 0)
      })

      const schemaWithFormats = {
        ...mockSchema,
        columns: [
          { key: 'number_field', header: 'Number', format: 'number' as const },
          { key: 'date_field', header: 'Date', format: 'date' as const },
          { key: 'text_field', header: 'Text', format: undefined }
        ]
      }

      await parseCSV('test', schemaWithFormats)

      expect(transformFn).toBeDefined()
      if (transformFn) {
        expect(transformFn('123.45', 'number_field')).toBe(123.45)
        expect(transformFn('', 'number_field')).toBe(null)
        expect(transformFn('2024-01-15', 'date_field')).toMatch(/2024-01-15/)
        expect(transformFn('plain text', 'text_field')).toBe('plain text')
        expect(transformFn('', 'text_field')).toBe(null)
      }
    })
  })
})