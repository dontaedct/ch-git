/**
 * @fileoverview Dynamic Form Generation Library - HT-031.1.3
 * @module lib/forms/dynamic-generator
 * @author Hero Tasks System
 * @version 1.0.0
 */

import { z } from 'zod'
import { createFormTableCsvSchema, type FormTableCsvSchema } from '@dct/form-table-csv'

export interface DynamicFieldConfig {
  id: string
  name: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  description?: string
  options?: string[]
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: string
  }
  conditional?: {
    dependsOn: string
    showWhen: any
  }
  styling?: {
    width?: 'full' | 'half' | 'third'
    className?: string
  }
}

export interface DynamicFormConfig {
  id: string
  name: string
  title: string
  description?: string
  fields: DynamicFieldConfig[]
  layout: 'stack' | 'grid' | 'wizard'
  gridCols?: number
  theme?: 'default' | 'minimal' | 'modern' | 'corporate'
  validation: 'client' | 'server' | 'both'
  submission: {
    endpoint?: string
    method?: 'POST' | 'PUT' | 'PATCH'
    headers?: Record<string, string>
  }
  features: {
    autoSave?: boolean
    progressBar?: boolean
    fieldDependencies?: boolean
    conditionalLogic?: boolean
    realTimeValidation?: boolean
  }
}

export interface GeneratedFormOutput {
  schema: FormTableCsvSchema
  component: string
  types: string
  validation: Record<string, any>
  hooks: string[]
  styles: string
  config: DynamicFormConfig
}

export class DynamicFormGenerator {
  private config: DynamicFormConfig
  private templates: Map<string, DynamicFieldConfig[]> = new Map()

  constructor(config: DynamicFormConfig) {
    this.config = config
    this.initializeTemplates()
  }

  /**
   * Generate a complete form with all necessary components
   */
  async generateForm(): Promise<GeneratedFormOutput> {
    const schema = this.generateSchema()
    const component = this.generateComponent()
    const types = this.generateTypes()
    const validation = this.generateValidation()
    const hooks = this.generateHooks()
    const styles = this.generateStyles()

    return {
      schema,
      component,
      types,
      validation,
      hooks,
      styles,
      config: this.config
    }
  }

  /**
   * Generate form from a template
   */
  static async generateFromTemplate(templateName: string, customizations?: Partial<DynamicFormConfig>): Promise<GeneratedFormOutput> {
    const generator = new DynamicFormGenerator({
      id: `form_${Date.now()}`,
      name: templateName,
      title: templateName.charAt(0).toUpperCase() + templateName.slice(1),
      description: `Generated ${templateName} form`,
      fields: DynamicFormTemplates.getTemplate(templateName),
      layout: 'stack',
      validation: 'both',
      submission: { method: 'POST' },
      features: {
        autoSave: true,
        progressBar: true,
        realTimeValidation: true
      },
      ...customizations
    })

    return generator.generateForm()
  }

  /**
   * Generate form from natural language description
   */
  static async generateFromDescription(description: string): Promise<GeneratedFormOutput> {
    const config = await DynamicFormParser.parseDescription(description)
    const generator = new DynamicFormGenerator(config)
    return generator.generateForm()
  }

  /**
   * Add conditional logic to fields
   */
  addConditionalLogic(fieldId: string, dependsOn: string, showWhen: any): DynamicFormGenerator {
    const field = this.config.fields.find(f => f.id === fieldId)
    if (field) {
      field.conditional = { dependsOn, showWhen }
      this.config.features.conditionalLogic = true
    }
    return this
  }

  /**
   * Optimize form for performance
   */
  optimizeForPerformance(): DynamicFormGenerator {
    // Remove heavy features for better performance
    this.config.features.autoSave = false
    this.config.features.fieldDependencies = false
    
    // Use simpler validation
    this.config.validation = 'client'
    
    // Optimize field types
    this.config.fields.forEach(field => {
      if (field.type === 'multiselect' && field.options && field.options.length > 10) {
        field.type = 'textarea'
        field.placeholder = 'Enter options separated by commas'
      }
    })

    return this
  }

  /**
   * Generate accessibility-enhanced form
   */
  enhanceForAccessibility(): DynamicFormGenerator {
    this.config.fields.forEach(field => {
      // Ensure all fields have proper labels
      if (!field.label) {
        field.label = field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/_/g, ' ')
      }

      // Add descriptions for complex fields
      if (['select', 'multiselect', 'radio'].includes(field.type) && !field.description) {
        field.description = `Select an option from the ${field.type} menu`
      }

      // Add ARIA labels
      if (field.required && !field.description) {
        field.description = 'This field is required'
      }
    })

    return this
  }

  private generateSchema(): FormTableCsvSchema {
    return createFormTableCsvSchema({
      name: this.config.name,
      title: this.config.title,
      description: this.config.description,
      fields: this.config.fields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type as any,
        required: field.required,
        placeholder: field.placeholder,
        description: field.description,
        options: field.options,
        defaultValue: field.defaultValue
      }))
    })
  }

  private generateComponent(): string {
    const imports = this.generateImports()
    const interfaces = this.generateInterfaces()
    const hooks = this.generateHookCalls()
    const render = this.generateRender()

    return `${imports}

${interfaces}

export function DynamicForm({ 
  onSubmit, 
  onFieldChange, 
  initialData = {} 
}: DynamicFormProps) {
  ${hooks}

  ${render}
}

${this.generateTypes()}
`
  }

  private generateImports(): string {
    const imports = [
      "import React, { useState, useEffect } from 'react'",
      "import { useForm } from 'react-hook-form'",
      "import { zodResolver } from '@hookform/resolvers/zod'",
      "import { z } from 'zod'"
    ]

    if (this.config.features.progressBar) {
      imports.push("import { Progress } from '@/components/ui/progress'")
    }

    if (this.config.features.autoSave) {
      imports.push("import { useAutoSave } from '@/hooks/useAutoSave'")
    }

    return imports.join('\n')
  }

  private generateInterfaces(): string {
    return `
interface DynamicFormProps {
  onSubmit: (data: any) => Promise<void>
  onFieldChange?: (fieldName: string, value: any) => void
  initialData?: Record<string, any>
}

interface FormData {
${this.config.fields.map(field => `  ${field.name}: ${this.getTypeScriptType(field.type)}`).join('\n')}
}
`
  }

  private generateHookCalls(): string {
    const hooks = []

    hooks.push(`
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialData
  })
`)

    if (this.config.features.conditionalLogic) {
      hooks.push(`
  const watchedValues = watch()
  const visibleFields = getVisibleFields(watchedValues)
`)
    }

    if (this.config.features.autoSave) {
      hooks.push(`
  useAutoSave(watch(), {
    key: '${this.config.name}_autosave',
    interval: 30000
  })
`)
    }

    if (this.config.features.progressBar) {
      hooks.push(`
  const progress = calculateProgress(watchedValues)
`)
    }

    return hooks.join('\n')
  }

  private generateRender(): string {
    return `
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      ${this.config.features.progressBar ? `
      <div className="mb-6">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2">
          {progress}% complete
        </p>
      </div>
      ` : ''}

      <div className="grid gap-6 ${this.getGridClasses()}">
        ${this.config.fields.map(field => this.generateFieldJSX(field)).join('\n        ')}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  )
`
  }

  private generateFieldJSX(field: DynamicFieldConfig): string {
    const conditionalWrapper = field.conditional ? `
{visibleFields.includes('${field.name}') && (
` : ''

    const conditionalClose = field.conditional ? `
)}
` : ''

    const fieldJSX = this.generateFieldInput(field)

    return `${conditionalWrapper}
        <div className="space-y-2 ${field.styling?.className || ''}">
          <Label htmlFor="${field.name}">
            ${field.label}
            ${field.required ? ' <span className="text-red-500">*</span>' : ''}
          </Label>
          ${fieldJSX}
          ${field.description ? `<p className="text-sm text-muted-foreground">${field.description}</p>` : ''}
          {errors.${field.name} && (
            <p className="text-sm text-red-600">{errors.${field.name}.message}</p>
          )}
        </div>
${conditionalClose}`
  }

  private generateFieldInput(field: DynamicFieldConfig): string {
    switch (field.type) {
      case 'textarea':
        return `<Textarea
          id="${field.name}"
          {...register("${field.name}")}
          placeholder="${field.placeholder || ''}"
          className="min-h-[100px]"
        />`

      case 'select':
        return `<Select>
          <SelectTrigger>
            <SelectValue placeholder="${field.placeholder || 'Select an option'}" />
          </SelectTrigger>
          <SelectContent>
            ${field.options?.map(option => `
            <SelectItem value="${option}">${option}</SelectItem>
            `).join('') || ''}
          </SelectContent>
        </Select>`

      case 'checkbox':
        return `<div className="flex items-center space-x-2">
          <Checkbox
            id="${field.name}"
            {...register("${field.name}")}
          />
          <Label htmlFor="${field.name}" className="text-sm font-normal">
            ${field.description || field.label}
          </Label>
        </div>`

      case 'radio':
        return `<div className="space-y-2">
          ${field.options?.map(option => `
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="${option}" id="${field.name}_${option}" />
            <Label htmlFor="${field.name}_${option}">${option}</Label>
          </div>
          `).join('') || ''}
        </div>`

      default:
        return `<Input
          id="${field.name}"
          type="${field.type}"
          {...register("${field.name}")}
          placeholder="${field.placeholder || ''}"
        />`
    }
  }

  private generateTypes(): string {
    return `
// Generated types for ${this.config.name}
export type ${this.toPascalCase(this.config.name)}Data = {
${this.config.fields.map(field => `  ${field.name}: ${this.getTypeScriptType(field.type)}`).join('\n')}
}

export type ${this.toPascalCase(this.config.name)}Field = {
  name: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  description?: string
}
`
  }

  private generateValidation(): Record<string, any> {
    const validation: Record<string, any> = {}

    this.config.fields.forEach(field => {
      let fieldValidation: any

      switch (field.type) {
        case 'email':
          fieldValidation = z.string().email('Invalid email address')
          break
        case 'number':
          fieldValidation = z.number()
          if (field.validation?.min !== undefined) {
            fieldValidation = fieldValidation.min(field.validation.min)
          }
          if (field.validation?.max !== undefined) {
            fieldValidation = fieldValidation.max(field.validation.max)
          }
          break
        case 'tel':
          fieldValidation = z.string().regex(
            /^[\+]?[1-9][\d]{0,15}$/,
            'Invalid phone number'
          )
          break
        default:
          fieldValidation = z.string()
          if (field.validation?.min !== undefined) {
            fieldValidation = fieldValidation.min(field.validation.min)
          }
          if (field.validation?.max !== undefined) {
            fieldValidation = fieldValidation.max(field.validation.max)
          }
      }

      if (!field.required) {
        fieldValidation = fieldValidation.optional()
      }

      validation[field.name] = fieldValidation
    })

    return validation
  }

  private generateHooks(): string[] {
    const hooks = []

    if (this.config.features.conditionalLogic) {
      hooks.push(`
// Hook for conditional field visibility
function useConditionalFields(watchedValues: any) {
  return useMemo(() => {
    return getVisibleFields(watchedValues)
  }, [watchedValues])
}
`)
    }

    if (this.config.features.progressBar) {
      hooks.push(`
// Hook for form progress calculation
function useFormProgress(fields: any[], values: any) {
  return useMemo(() => {
    return calculateProgress(fields, values)
  }, [fields, values])
}
`)
    }

    return hooks
  }

  private generateStyles(): string {
    const themeStyles = {
      default: '',
      minimal: `
.dynamic-form {
  @apply space-y-4;
}

.dynamic-form .field-group {
  @apply space-y-2;
}

.dynamic-form .field-label {
  @apply text-sm font-medium text-gray-700;
}

.dynamic-form .field-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}
`,
      modern: `
.dynamic-form {
  @apply space-y-6;
}

.dynamic-form .field-group {
  @apply space-y-3;
}

.dynamic-form .field-label {
  @apply text-sm font-semibold text-gray-900;
}

.dynamic-form .field-input {
  @apply w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors;
}
`,
      corporate: `
.dynamic-form {
  @apply space-y-5;
}

.dynamic-form .field-group {
  @apply space-y-2;
}

.dynamic-form .field-label {
  @apply text-sm font-medium text-gray-800;
}

.dynamic-form .field-input {
  @apply w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-gray-600;
}
`
    }

    return themeStyles[this.config.theme || 'default']
  }

  private getTypeScriptType(fieldType: string): string {
    switch (fieldType) {
      case 'number':
        return 'number'
      case 'checkbox':
        return 'boolean'
      case 'multiselect':
        return 'string[]'
      default:
        return 'string'
    }
  }

  private getGridClasses(): string {
    switch (this.config.layout) {
      case 'grid':
        return `grid-cols-${this.config.gridCols || 2}`
      case 'wizard':
        return 'grid-cols-1'
      default:
        return 'grid-cols-1'
    }
  }

  private toPascalCase(str: string): string {
    return str.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())
  }

  private initializeTemplates(): void {
    this.templates.set('contact', [
      {
        id: '1',
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name'
      },
      {
        id: '2',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your@email.com'
      },
      {
        id: '3',
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        required: false,
        placeholder: '+1 (555) 123-4567'
      },
      {
        id: '4',
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Tell us how we can help...'
      }
    ])

    this.templates.set('registration', [
      {
        id: '1',
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true
      },
      {
        id: '2',
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true
      },
      {
        id: '3',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true
      },
      {
        id: '4',
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true
      },
      {
        id: '5',
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        required: true
      }
    ])
  }
}

/**
 * Template definitions for common form types
 */
export class DynamicFormTemplates {
  private static templates: Map<string, DynamicFieldConfig[]> = new Map()

  static getTemplate(name: string): DynamicFieldConfig[] {
    const template = this.templates.get(name)
    if (!template) {
      throw new Error(`Template "${name}" not found`)
    }
    return JSON.parse(JSON.stringify(template)) // Deep clone
  }

  static registerTemplate(name: string, fields: DynamicFieldConfig[]): void {
    this.templates.set(name, fields)
  }

  static getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys())
  }
}

/**
 * Parser for natural language form descriptions
 */
export class DynamicFormParser {
  static async parseDescription(description: string): Promise<DynamicFormConfig> {
    // Simple keyword-based parsing
    const fields: DynamicFieldConfig[] = []
    let fieldId = 1

    // Extract field information from description
    const fieldKeywords = {
      'name': { type: 'text', label: 'Full Name' },
      'email': { type: 'email', label: 'Email Address' },
      'phone': { type: 'tel', label: 'Phone Number' },
      'message': { type: 'textarea', label: 'Message' },
      'age': { type: 'number', label: 'Age' },
      'date': { type: 'date', label: 'Date' },
      'password': { type: 'password', label: 'Password' }
    }

    Object.entries(fieldKeywords).forEach(([keyword, config]) => {
      if (description.toLowerCase().includes(keyword)) {
        fields.push({
          id: fieldId.toString(),
          name: keyword,
          label: config.label,
          type: config.type,
          required: true
        })
        fieldId++
      }
    })

    return {
      id: `form_${Date.now()}`,
      name: 'generated-form',
      title: 'Generated Form',
      description,
      fields,
      layout: 'stack',
      validation: 'both',
      submission: { method: 'POST' },
      features: {
        autoSave: true,
        realTimeValidation: true
      }
    }
  }
}
