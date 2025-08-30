import { z } from 'zod'
import type { FormFieldConfig, FormTableCsvSchema, ColumnConfig } from '../types'

export function createFormTableCsvSchema(config: {
  name: string
  title: string
  description?: string
  fields: FormFieldConfig[]
}): FormTableCsvSchema {
  // Build Zod validation schema from field configs
  const validationFields: Record<string, z.ZodType<any>> = {}
  
  config.fields.forEach(field => {
    let fieldSchema: z.ZodType<any>
    
    if (field.validation) {
      fieldSchema = field.validation
    } else {
      // Auto-generate validation based on field type
      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email()
          break
        case 'number':
          fieldSchema = z.number()
          break
        case 'date':
        case 'datetime-local':
          fieldSchema = z.string().datetime()
          break
        case 'checkbox':
          fieldSchema = z.boolean()
          break
        case 'multiselect':
          fieldSchema = z.array(z.string())
          break
        case 'tel':
          fieldSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
          break
        default:
          fieldSchema = z.string()
      }
    }
    
    // Apply required/optional
    if (!field.required) {
      fieldSchema = fieldSchema.optional()
    } else if ((field.type === 'text' || field.type === 'textarea' || field.type === 'email') && 'min' in fieldSchema) {
      fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`)
    }
    
    validationFields[field.name] = fieldSchema
  })
  
  // Auto-generate column configs from field configs
  const columns: ColumnConfig[] = config.fields.map(field => ({
    key: field.name,
    header: field.label,
    sortable: ['text', 'number', 'date', 'datetime-local', 'email'].includes(field.type),
    filterable: ['text', 'select', 'email'].includes(field.type),
    format: field.type === 'date' || field.type === 'datetime-local' ? 'date' as const :
            field.type === 'number' ? 'number' as const : undefined,
  }))
  
  return {
    name: config.name,
    title: config.title,
    description: config.description,
    fields: config.fields,
    columns,
    validation: z.object(validationFields)
  }
}

// Helper to create a basic contact form schema
export function createContactFormSchema(): FormTableCsvSchema {
  return createFormTableCsvSchema({
    name: 'contact-form',
    title: 'Contact Form',
    description: 'Collect contact information from users',
    fields: [
      {
        name: 'full_name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name'
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter your email address'
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter your phone number'
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'Enter your message'
      },
      {
        name: 'consent',
        label: 'I agree to the terms and conditions',
        type: 'checkbox',
        required: true
      }
    ]
  })
}

// Helper to create an event registration form
export function createEventRegistrationSchema(): FormTableCsvSchema {
  return createFormTableCsvSchema({
    name: 'event-registration',
    title: 'Event Registration',
    description: 'Register for upcoming events',
    fields: [
      {
        name: 'full_name',
        label: 'Full Name',
        type: 'text',
        required: true
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true
      },
      {
        name: 'event_type',
        label: 'Event Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Workshop', value: 'workshop' },
          { label: 'Seminar', value: 'seminar' },
          { label: 'Conference', value: 'conference' }
        ]
      },
      {
        name: 'registration_date',
        label: 'Registration Date',
        type: 'datetime-local',
        required: true
      },
      {
        name: 'dietary_requirements',
        label: 'Dietary Requirements',
        type: 'multiselect',
        options: [
          { label: 'Vegetarian', value: 'vegetarian' },
          { label: 'Vegan', value: 'vegan' },
          { label: 'Gluten Free', value: 'gluten-free' },
          { label: 'No Dairy', value: 'no-dairy' }
        ]
      }
    ]
  })
}