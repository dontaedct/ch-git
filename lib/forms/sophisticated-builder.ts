/**
 * @fileoverview Sophisticated Form Builder Library - HT-031.3.2
 * Advanced form builder with 11 field types, rich table displays,
 * CSV export/import, and advanced data management capabilities
 */

import { z } from 'zod'

export interface SophisticatedFieldConfig {
  id: string
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date' | 'file' | 'rating' | 'table' | 'signature'
  label: string
  name: string
  required: boolean
  placeholder?: string
  description?: string
  validation?: FieldValidation
  options?: SelectOption[]
  tableConfig?: TableConfig
  fileConfig?: FileConfig
  ratingConfig?: RatingConfig
  conditionalLogic?: ConditionalLogic[]
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TableConfig {
  columns: TableColumn[]
  minRows?: number
  maxRows?: number
  allowAddRows: boolean
  allowDeleteRows: boolean
  allowReorder: boolean
  csvExport: boolean
}

export interface TableColumn {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  required: boolean
  sortable: boolean
  filterable: boolean
  width?: number
  options?: SelectOption[]
}

export interface FileConfig {
  accept: string[]
  maxSize: number // in bytes
  multiple: boolean
  allowedTypes: string[]
  thumbnail: boolean
}

export interface RatingConfig {
  max: number
  icon: 'star' | 'heart' | 'thumb' | 'number'
  allowHalf: boolean
  labels?: string[]
}

export interface ConditionalLogic {
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  fieldId: string
  value: any
  action: 'show' | 'hide' | 'require' | 'disable'
}

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
  custom?: (value: any) => boolean | string
}

export interface FormSchema {
  id: string
  name: string
  title: string
  description?: string
  fields: SophisticatedFieldConfig[]
  settings: FormSettings
  analytics: FormAnalytics
}

export interface FormSettings {
  theme: 'light' | 'dark' | 'auto'
  submitButton: {
    text: string
    style: 'primary' | 'secondary' | 'outline'
    position: 'left' | 'center' | 'right'
  }
  validation: {
    validateOnBlur: boolean
    validateOnChange: boolean
    showRequiredIndicator: boolean
  }
  layout: {
    columns: number
    spacing: 'tight' | 'normal' | 'loose'
    fieldWidth: 'auto' | 'full' | 'half'
  }
  security: {
    enableCaptcha: boolean
    enableRateLimit: boolean
    rateLimitAttempts: number
  }
}

export interface FormAnalytics {
  enabled: boolean
  trackFieldFocus: boolean
  trackFieldTime: boolean
  trackSubmissionTime: boolean
  trackDropoffPoints: boolean
}

export interface FormSubmissionData {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: string
  metadata: {
    userAgent: string
    ip: string
    location?: string
    sessionId: string
    timeToComplete: number
    fieldInteractions: FieldInteraction[]
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  validation: {
    isValid: boolean
    errors: ValidationError[]
  }
}

export interface FieldInteraction {
  fieldId: string
  events: Array<{
    type: 'focus' | 'blur' | 'change' | 'error'
    timestamp: number
    value?: any
  }>
  timeSpent: number
  changeCount: number
}

export interface ValidationError {
  fieldId: string
  message: string
  type: 'required' | 'format' | 'range' | 'custom'
}

export class SophisticatedFormBuilder {
  private schema: FormSchema
  private validationRules: Map<string, z.ZodSchema> = new Map()

  constructor(schema: Partial<FormSchema> = {}) {
    this.schema = {
      id: schema.id || this.generateId(),
      name: schema.name || 'Untitled Form',
      title: schema.title || 'New Form',
      description: schema.description || '',
      fields: schema.fields || [],
      settings: {
        theme: 'auto',
        submitButton: {
          text: 'Submit',
          style: 'primary',
          position: 'center'
        },
        validation: {
          validateOnBlur: true,
          validateOnChange: false,
          showRequiredIndicator: true
        },
        layout: {
          columns: 1,
          spacing: 'normal',
          fieldWidth: 'full'
        },
        security: {
          enableCaptcha: false,
          enableRateLimit: true,
          rateLimitAttempts: 10
        },
        ...schema.settings
      },
      analytics: {
        enabled: true,
        trackFieldFocus: true,
        trackFieldTime: true,
        trackSubmissionTime: true,
        trackDropoffPoints: true,
        ...schema.analytics
      }
    }

    this.buildValidationRules()
  }

  /**
   * Add a field to the form
   */
  addField(field: Omit<SophisticatedFieldConfig, 'id'>): SophisticatedFieldConfig {
    const newField: SophisticatedFieldConfig = {
      ...field,
      id: this.generateId()
    }

    this.schema.fields.push(newField)
    this.buildValidationRules()

    return newField
  }

  /**
   * Update an existing field
   */
  updateField(fieldId: string, updates: Partial<SophisticatedFieldConfig>): boolean {
    const fieldIndex = this.schema.fields.findIndex(f => f.id === fieldId)
    if (fieldIndex === -1) return false

    this.schema.fields[fieldIndex] = {
      ...this.schema.fields[fieldIndex],
      ...updates
    }

    this.buildValidationRules()
    return true
  }

  /**
   * Remove a field from the form
   */
  removeField(fieldId: string): boolean {
    const initialLength = this.schema.fields.length
    this.schema.fields = this.schema.fields.filter(f => f.id !== fieldId)

    if (this.schema.fields.length < initialLength) {
      this.buildValidationRules()
      return true
    }

    return false
  }

  /**
   * Reorder fields
   */
  reorderFields(fieldIds: string[]): boolean {
    const newFields: SophisticatedFieldConfig[] = []

    for (const fieldId of fieldIds) {
      const field = this.schema.fields.find(f => f.id === fieldId)
      if (field) {
        newFields.push(field)
      }
    }

    if (newFields.length === this.schema.fields.length) {
      this.schema.fields = newFields
      return true
    }

    return false
  }

  /**
   * Create a table field with rich configuration
   */
  createTableField(config: {
    label: string
    name: string
    required?: boolean
    columns: Omit<TableColumn, 'id'>[]
    minRows?: number
    maxRows?: number
    allowAddRows?: boolean
    allowDeleteRows?: boolean
  }): SophisticatedFieldConfig {
    const tableColumns: TableColumn[] = config.columns.map(col => ({
      ...col,
      id: this.generateId()
    }))

    return this.addField({
      type: 'table',
      label: config.label,
      name: config.name,
      required: config.required || false,
      tableConfig: {
        columns: tableColumns,
        minRows: config.minRows || 1,
        maxRows: config.maxRows || 10,
        allowAddRows: config.allowAddRows || true,
        allowDeleteRows: config.allowDeleteRows || true,
        allowReorder: true,
        csvExport: true
      }
    })
  }

  /**
   * Validate form submission data
   */
  validateSubmission(data: Record<string, any>): {
    isValid: boolean
    errors: ValidationError[]
    sanitizedData: Record<string, any>
  } {
    const errors: ValidationError[] = []
    const sanitizedData: Record<string, any> = {}

    for (const field of this.schema.fields) {
      const value = data[field.name]
      const validation = this.validationRules.get(field.id)

      try {
        if (validation) {
          const result = validation.parse(value)
          sanitizedData[field.name] = result
        } else {
          sanitizedData[field.name] = value
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            fieldId: field.id,
            message: error.errors[0]?.message || 'Validation failed',
            type: 'format'
          })
        }
      }

      // Custom validation
      if (field.validation?.custom && value !== undefined) {
        const customResult = field.validation.custom(value)
        if (typeof customResult === 'string') {
          errors.push({
            fieldId: field.id,
            message: customResult,
            type: 'custom'
          })
        }
      }

      // Conditional logic validation
      if (field.conditionalLogic) {
        for (const logic of field.conditionalLogic) {
          const conditionField = this.schema.fields.find(f => f.id === logic.fieldId)
          if (conditionField) {
            const conditionValue = data[conditionField.name]
            const shouldApply = this.evaluateCondition(logic.condition, conditionValue, logic.value)

            if (shouldApply && logic.action === 'require' && (!value || value === '')) {
              errors.push({
                fieldId: field.id,
                message: `${field.label} is required when ${conditionField.label} ${logic.condition} ${logic.value}`,
                type: 'required'
              })
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    }
  }

  /**
   * Export form data to CSV
   */
  exportToCSV(submissions: FormSubmissionData[]): string {
    if (submissions.length === 0) return ''

    const headers = ['Submission ID', 'Submitted At', 'Status', ...this.schema.fields.map(f => f.label)]
    const rows = submissions.map(submission => [
      submission.id,
      new Date(submission.submittedAt).toISOString(),
      submission.status,
      ...this.schema.fields.map(field => {
        const value = submission.data[field.name]
        if (field.type === 'table' && Array.isArray(value)) {
          return JSON.stringify(value)
        }
        return value || ''
      })
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
  }

  /**
   * Import form data from CSV
   */
  importFromCSV(csvContent: string): {
    success: boolean
    imported: number
    errors: string[]
    data: Record<string, any>[]
  } {
    const errors: string[] = []
    const importedData: Record<string, any>[] = []

    try {
      const lines = csvContent.trim().split('\n')
      if (lines.length < 2) {
        return { success: false, imported: 0, errors: ['CSV file is empty or has no data rows'], data: [] }
      }

      const headers = this.parseCSVLine(lines[0])
      const fieldMap = new Map<string, string>()

      // Map CSV headers to form fields
      for (const field of this.schema.fields) {
        const headerIndex = headers.findIndex(h =>
          h.toLowerCase() === field.label.toLowerCase() ||
          h.toLowerCase() === field.name.toLowerCase()
        )
        if (headerIndex !== -1) {
          fieldMap.set(headers[headerIndex], field.name)
        }
      }

      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i])
          const rowData: Record<string, any> = {}

          for (let j = 0; j < headers.length && j < values.length; j++) {
            const fieldName = fieldMap.get(headers[j])
            if (fieldName) {
              rowData[fieldName] = this.parseCSVValue(values[j], fieldName)
            }
          }

          // Validate the row data
          const validation = this.validateSubmission(rowData)
          if (validation.isValid) {
            importedData.push(validation.sanitizedData)
          } else {
            errors.push(`Row ${i + 1}: ${validation.errors.map(e => e.message).join(', ')}`)
          }
        } catch (error) {
          errors.push(`Row ${i + 1}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return {
        success: importedData.length > 0,
        imported: importedData.length,
        errors,
        data: importedData
      }
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
        data: []
      }
    }
  }

  /**
   * Generate form analytics
   */
  generateAnalytics(submissions: FormSubmissionData[]): {
    totalSubmissions: number
    conversionRate: number
    averageCompletionTime: number
    fieldAnalytics: Array<{
      fieldId: string
      fieldName: string
      interactions: number
      averageTime: number
      errorRate: number
      dropoffRate: number
    }>
    dropoffPoints: Array<{
      fieldId: string
      fieldName: string
      dropoffCount: number
      dropoffRate: number
    }>
  } {
    const totalSubmissions = submissions.length
    const completedSubmissions = submissions.filter(s => s.status === 'completed').length
    const conversionRate = totalSubmissions > 0 ? (completedSubmissions / totalSubmissions) * 100 : 0

    const averageCompletionTime = completedSubmissions > 0
      ? submissions
          .filter(s => s.status === 'completed')
          .reduce((sum, s) => sum + s.metadata.timeToComplete, 0) / completedSubmissions
      : 0

    const fieldAnalytics = this.schema.fields.map(field => {
      const fieldInteractions = submissions.flatMap(s =>
        s.metadata.fieldInteractions.filter(fi => fi.fieldId === field.id)
      )

      const interactions = fieldInteractions.length
      const averageTime = interactions > 0
        ? fieldInteractions.reduce((sum, fi) => sum + fi.timeSpent, 0) / interactions
        : 0

      const errorsCount = submissions.reduce((sum, s) =>
        sum + s.validation.errors.filter(e => e.fieldId === field.id).length, 0
      )
      const errorRate = interactions > 0 ? (errorsCount / interactions) * 100 : 0

      return {
        fieldId: field.id,
        fieldName: field.name,
        interactions,
        averageTime,
        errorRate,
        dropoffRate: 0 // This would be calculated based on actual dropoff tracking
      }
    })

    const dropoffPoints = this.schema.fields.map(field => ({
      fieldId: field.id,
      fieldName: field.name,
      dropoffCount: 0, // This would be calculated based on actual dropoff tracking
      dropoffRate: 0
    }))

    return {
      totalSubmissions,
      conversionRate,
      averageCompletionTime,
      fieldAnalytics,
      dropoffPoints
    }
  }

  /**
   * Get form schema
   */
  getSchema(): FormSchema {
    return { ...this.schema }
  }

  /**
   * Update form settings
   */
  updateSettings(settings: Partial<FormSettings>): void {
    this.schema.settings = { ...this.schema.settings, ...settings }
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private buildValidationRules(): void {
    this.validationRules.clear()

    for (const field of this.schema.fields) {
      let schema: z.ZodSchema

      switch (field.type) {
        case 'email':
          schema = z.string().email('Please enter a valid email address')
          break
        case 'number':
          schema = z.number().min(field.validation?.min || 0).max(field.validation?.max || Number.MAX_SAFE_INTEGER)
          break
        case 'date':
          schema = z.string().refine(date => !isNaN(Date.parse(date)), 'Please enter a valid date')
          break
        case 'file':
          schema = z.any() // File validation would be handled separately
          break
        case 'table':
          schema = z.array(z.record(z.any())).min(field.tableConfig?.minRows || 0).max(field.tableConfig?.maxRows || 100)
          break
        case 'rating':
          schema = z.number().min(1).max(field.ratingConfig?.max || 5)
          break
        default:
          schema = z.string()
      }

      if (field.required) {
        if (field.type === 'table' && schema instanceof z.ZodArray) {
          schema = schema.min(1, `${field.label} is required`)
        } else if (schema instanceof z.ZodString) {
          schema = schema.min(1, `${field.label} is required`)
        }
      } else {
        schema = schema.optional()
      }

      if (field.validation?.minLength) {
        schema = schema instanceof z.ZodString ? schema.min(field.validation.minLength) : schema
      }

      if (field.validation?.maxLength) {
        schema = schema instanceof z.ZodString ? schema.max(field.validation.maxLength) : schema
      }

      if (field.validation?.pattern) {
        schema = schema instanceof z.ZodString ? schema.regex(new RegExp(field.validation.pattern)) : schema
      }

      this.validationRules.set(field.id, schema)
    }
  }

  private evaluateCondition(condition: ConditionalLogic['condition'], fieldValue: any, targetValue: any): boolean {
    switch (condition) {
      case 'equals':
        return fieldValue === targetValue
      case 'not_equals':
        return fieldValue !== targetValue
      case 'contains':
        return String(fieldValue).includes(String(targetValue))
      case 'greater_than':
        return Number(fieldValue) > Number(targetValue)
      case 'less_than':
        return Number(fieldValue) < Number(targetValue)
      default:
        return false
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

  private parseCSVValue(value: string, fieldName: string): any {
    const field = this.schema.fields.find(f => f.name === fieldName)
    if (!field) return value

    switch (field.type) {
      case 'number':
      case 'rating':
        return isNaN(Number(value)) ? value : Number(value)
      case 'checkbox':
        return value.toLowerCase() === 'true' || value === '1'
      case 'table':
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      default:
        return value
    }
  }
}

/**
 * Utility functions for sophisticated form building
 */
export const SophisticatedFormUtils = {
  /**
   * Create a contact form template
   */
  createContactForm(): SophisticatedFormBuilder {
    const builder = new SophisticatedFormBuilder({
      name: 'contact-form',
      title: 'Contact Us',
      description: 'Get in touch with our team'
    })

    builder.addField({
      type: 'text',
      label: 'Full Name',
      name: 'fullName',
      required: true,
      placeholder: 'Enter your full name'
    })

    builder.addField({
      type: 'email',
      label: 'Email Address',
      name: 'email',
      required: true,
      placeholder: 'Enter your email address'
    })

    builder.addField({
      type: 'select',
      label: 'Subject',
      name: 'subject',
      required: true,
      options: [
        { value: 'general', label: 'General Inquiry' },
        { value: 'support', label: 'Technical Support' },
        { value: 'sales', label: 'Sales Question' },
        { value: 'feedback', label: 'Feedback' }
      ]
    })

    builder.addField({
      type: 'textarea',
      label: 'Message',
      name: 'message',
      required: true,
      placeholder: 'Please describe your inquiry...'
    })

    return builder
  },

  /**
   * Create a feedback form with rating and table
   */
  createFeedbackForm(): SophisticatedFormBuilder {
    const builder = new SophisticatedFormBuilder({
      name: 'feedback-form',
      title: 'Customer Feedback',
      description: 'Help us improve our services'
    })

    builder.addField({
      type: 'rating',
      label: 'Overall Satisfaction',
      name: 'overallRating',
      required: true,
      ratingConfig: {
        max: 5,
        icon: 'star',
        allowHalf: false
      }
    })

    builder.createTableField({
      label: 'Service Ratings',
      name: 'serviceRatings',
      required: false,
      columns: [
        { label: 'Service', type: 'text', required: true, sortable: false, filterable: false },
        { label: 'Rating', type: 'number', required: true, sortable: true, filterable: false },
        { label: 'Comments', type: 'text', required: false, sortable: false, filterable: false }
      ],
      minRows: 1,
      maxRows: 10,
      allowAddRows: true,
      allowDeleteRows: true
    })

    builder.addField({
      type: 'textarea',
      label: 'Additional Comments',
      name: 'comments',
      required: false,
      placeholder: 'Share any additional feedback...'
    })

    return builder
  },

  /**
   * Validate form schema
   */
  validateSchema(schema: FormSchema): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!schema.name.trim()) {
      errors.push('Form name is required')
    }

    if (!schema.title.trim()) {
      errors.push('Form title is required')
    }

    if (schema.fields.length === 0) {
      errors.push('At least one field is required')
    }

    // Check for duplicate field names
    const fieldNames = schema.fields.map(f => f.name)
    const uniqueNames = new Set(fieldNames)
    if (fieldNames.length !== uniqueNames.size) {
      errors.push('Field names must be unique')
    }

    // Validate table fields
    for (const field of schema.fields) {
      if (field.type === 'table' && field.tableConfig) {
        if (field.tableConfig.columns.length === 0) {
          errors.push(`Table field "${field.label}" must have at least one column`)
        }

        const columnIds = field.tableConfig.columns.map(c => c.id)
        const uniqueColumnIds = new Set(columnIds)
        if (columnIds.length !== uniqueColumnIds.size) {
          errors.push(`Table field "${field.label}" has duplicate column IDs`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export default SophisticatedFormBuilder