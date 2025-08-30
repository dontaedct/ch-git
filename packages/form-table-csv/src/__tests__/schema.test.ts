import { z } from 'zod'
import { createFormTableCsvSchema, createContactFormSchema, createEventRegistrationSchema } from '../schema/createSchema'

describe('Schema Creation', () => {
  describe('createFormTableCsvSchema', () => {
    it('should create a basic schema with text fields', () => {
      const schema = createFormTableCsvSchema({
        name: 'test-form',
        title: 'Test Form',
        description: 'Test form description',
        fields: [
          {
            name: 'test_field',
            label: 'Test Field',
            type: 'text',
            required: true
          }
        ]
      })

      expect(schema.name).toBe('test-form')
      expect(schema.title).toBe('Test Form')
      expect(schema.description).toBe('Test form description')
      expect(schema.fields).toHaveLength(1)
      expect(schema.columns).toHaveLength(1)
      
      // Test validation
      expect(() => schema.validation.parse({ test_field: 'valid' })).not.toThrow()
      expect(() => schema.validation.parse({ test_field: '' })).toThrow()
    })

    it('should create schema with different field types', () => {
      const schema = createFormTableCsvSchema({
        name: 'multi-type-form',
        title: 'Multi Type Form',
        fields: [
          { name: 'text_field', label: 'Text', type: 'text', required: true },
          { name: 'email_field', label: 'Email', type: 'email', required: true },
          { name: 'number_field', label: 'Number', type: 'number', required: false },
          { name: 'checkbox_field', label: 'Checkbox', type: 'checkbox', required: false },
          { name: 'date_field', label: 'Date', type: 'date', required: false }
        ]
      })

      expect(schema.fields).toHaveLength(5)
      expect(schema.columns).toHaveLength(5)
      
      // Test valid data
      const validData = {
        text_field: 'test',
        email_field: 'test@example.com',
        number_field: 123,
        checkbox_field: true,
        date_field: new Date().toISOString()
      }
      
      expect(() => schema.validation.parse(validData)).not.toThrow()
      
      // Test invalid email
      expect(() => schema.validation.parse({
        ...validData,
        email_field: 'invalid-email'
      })).toThrow()
    })

    it('should handle optional fields correctly', () => {
      const schema = createFormTableCsvSchema({
        name: 'optional-fields',
        title: 'Optional Fields',
        fields: [
          { name: 'required_field', label: 'Required', type: 'text', required: true },
          { name: 'optional_field', label: 'Optional', type: 'text', required: false }
        ]
      })

      // Should pass with only required field
      expect(() => schema.validation.parse({
        required_field: 'test'
      })).not.toThrow()

      // Should pass with both fields
      expect(() => schema.validation.parse({
        required_field: 'test',
        optional_field: 'optional'
      })).not.toThrow()

      // Should fail without required field
      expect(() => schema.validation.parse({
        optional_field: 'optional'
      })).toThrow()
    })

    it('should auto-generate column configurations', () => {
      const schema = createFormTableCsvSchema({
        name: 'test-columns',
        title: 'Test Columns',
        fields: [
          { name: 'sortable_text', label: 'Sortable Text', type: 'text' },
          { name: 'sortable_number', label: 'Sortable Number', type: 'number' },
          { name: 'sortable_date', label: 'Sortable Date', type: 'date' },
          { name: 'non_sortable', label: 'Non Sortable', type: 'checkbox' }
        ]
      })

      const textColumn = schema.columns.find(col => col.key === 'sortable_text')
      const numberColumn = schema.columns.find(col => col.key === 'sortable_number')
      const dateColumn = schema.columns.find(col => col.key === 'sortable_date')
      const checkboxColumn = schema.columns.find(col => col.key === 'non_sortable')

      expect(textColumn?.sortable).toBe(true)
      expect(textColumn?.filterable).toBe(true)

      expect(numberColumn?.sortable).toBe(true)
      expect(numberColumn?.format).toBe('number')

      expect(dateColumn?.sortable).toBe(true)
      expect(dateColumn?.format).toBe('date')

      expect(checkboxColumn?.sortable).toBe(false)
    })
  })

  describe('Pre-built schemas', () => {
    it('should create contact form schema', () => {
      const schema = createContactFormSchema()
      
      expect(schema.name).toBe('contact-form')
      expect(schema.title).toBe('Contact Form')
      expect(schema.fields.length).toBeGreaterThan(0)
      
      // Test that it has expected fields
      const fieldNames = schema.fields.map(f => f.name)
      expect(fieldNames).toContain('full_name')
      expect(fieldNames).toContain('email')
      expect(fieldNames).toContain('phone')
      expect(fieldNames).toContain('consent')
    })

    it('should create event registration schema', () => {
      const schema = createEventRegistrationSchema()
      
      expect(schema.name).toBe('event-registration')
      expect(schema.title).toBe('Event Registration')
      
      const fieldNames = schema.fields.map(f => f.name)
      expect(fieldNames).toContain('full_name')
      expect(fieldNames).toContain('email')
      expect(fieldNames).toContain('event_type')
      expect(fieldNames).toContain('registration_date')
    })
  })

  describe('Custom validation', () => {
    it('should support custom validation for fields', () => {
      const schema = createFormTableCsvSchema({
        name: 'custom-validation',
        title: 'Custom Validation',
        fields: [
          {
            name: 'custom_field',
            label: 'Custom Field',
            type: 'text',
            validation: z.string().min(5, 'Must be at least 5 characters')
          }
        ]
      })

      // Should pass with valid length
      expect(() => schema.validation.parse({
        custom_field: 'valid_value'
      })).not.toThrow()

      // Should fail with short value
      expect(() => schema.validation.parse({
        custom_field: 'no'
      })).toThrow()
    })
  })
})