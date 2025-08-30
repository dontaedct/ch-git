/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormComponent } from '../components/Form'
import { createContactFormSchema } from '../schema/createSchema'

describe('FormComponent', () => {
  const mockSchema = createContactFormSchema()
  const mockOnSubmit = jest.fn()
  const mockOnReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form with all fields', () => {
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByText(mockSchema.title)).toBeInTheDocument()
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/I agree to the terms/i)).toBeInTheDocument()
  })

  it('should show required field indicators', () => {
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
      />
    )

    // Full Name should have required indicator
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
      />
    )

    // Fill in form
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/Phone Number/i), '1234567890')
    await user.type(screen.getByLabelText(/Message/i), 'Test message')
    await user.click(screen.getByLabelText(/I agree to the terms/i))

    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test message',
        consent: true
      })
    })
  })

  it('should show validation errors for invalid data', async () => {
    const user = userEvent.setup()
    
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
      />
    )

    // Submit form without filling required fields
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Full Name is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should show email validation error', async () => {
    const user = userEvent.setup()
    
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
      />
    )

    // Fill with invalid email
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Email Address/i), 'invalid-email')
    await user.click(screen.getByLabelText(/I agree to the terms/i))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument()
    })
  })

  it('should reset form when reset button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
        onReset={mockOnReset}
        showReset={true}
      />
    )

    // Fill in some data
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com')

    // Reset form
    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(mockOnReset).toHaveBeenCalled()
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('')
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('')
  })

  it('should disable form when disabled prop is true', () => {
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
        disabled={true}
      />
    )

    expect(screen.getByLabelText(/Full Name/i)).toBeDisabled()
    expect(screen.getByLabelText(/Email Address/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    const slowSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={slowSubmit}
      />
    )

    // Fill in valid data
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com')
    await user.click(screen.getByLabelText(/I agree to the terms/i))

    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Check for loading state
    expect(screen.getByText(/Submitting.../i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submitting.../i })).toBeDisabled()

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText(/Submit/i)).toBeInTheDocument()
    })
  })

  it('should render in grid layout', () => {
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
        layout="grid"
        gridCols={3}
      />
    )

    const form = screen.getByRole('form')
    expect(form.querySelector('.grid')).toBeInTheDocument()
  })

  it('should handle custom submit and reset text', () => {
    render(
      <FormComponent
        schema={mockSchema}
        onSubmit={mockOnSubmit}
        submitText="Send Message"
        resetText="Clear All"
        showReset={true}
      />
    )

    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear All' })).toBeInTheDocument()
  })

  it('should handle different field types correctly', async () => {
    const user = userEvent.setup()
    const customSchema = {
      name: 'test-form',
      title: 'Test Form',
      fields: [
        { name: 'select_field', label: 'Select Field', type: 'select' as const, options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' }
        ]},
        { name: 'number_field', label: 'Number Field', type: 'number' as const },
        { name: 'textarea_field', label: 'Textarea Field', type: 'textarea' as const }
      ],
      columns: [],
      validation: require('zod').z.object({
        select_field: require('zod').z.string().optional(),
        number_field: require('zod').z.number().optional(),
        textarea_field: require('zod').z.string().optional()
      })
    }

    render(
      <FormComponent
        schema={customSchema}
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByLabelText(/Select Field/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Number Field/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Textarea Field/i)).toBeInTheDocument()

    // Test number field
    await user.type(screen.getByLabelText(/Number Field/i), '123')
    expect(screen.getByLabelText(/Number Field/i)).toHaveValue(123)
  })
})