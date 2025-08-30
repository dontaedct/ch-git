'use client'

import React, { useState } from 'react'
import { FormTableCsvBlock } from '@/packages/form-table-csv/src'
import { createContactFormSchema, createEventRegistrationSchema } from '@/packages/form-table-csv/src/schema/createSchema'
import type { FormTableCsvConfig } from '@/packages/form-table-csv/src/types'

export default function FormTableCsvDemo() {
  const [selectedDemo, setSelectedDemo] = useState<'contact' | 'event'>('contact')

  // Contact Form Configuration
  const contactFormConfig: FormTableCsvConfig = {
    schema: createContactFormSchema(),
    form: {
      submitText: 'Send Message',
      resetText: 'Clear Form',
      showReset: true,
      layout: 'stack'
    },
    table: {
      showSearch: true,
      showFilters: true,
      showPagination: true,
      pageSize: 5,
      emptyMessage: 'No contacts submitted yet',
      actions: [
        {
          label: 'View',
          onClick: (row: any) => alert(`Viewing contact: ${row.full_name}`),
          variant: 'outline'
        },
        {
          label: 'Email',
          onClick: (row: any) => window.open(`mailto:${row.email}`),
          variant: 'default'
        }
      ]
    },
    csv: {
      filename: 'contact-submissions.csv',
      includeHeaders: true,
      dateFormat: 'MM/dd/yyyy'
    }
  }

  // Event Registration Configuration
  const eventRegistrationConfig: FormTableCsvConfig = {
    schema: createEventRegistrationSchema(),
    form: {
      submitText: 'Register for Event',
      resetText: 'Reset',
      showReset: true,
      layout: 'grid',
      gridCols: 2
    },
    table: {
      showSearch: true,
      showFilters: true,
      showPagination: true,
      pageSize: 10,
      emptyMessage: 'No registrations yet'
    },
    csv: {
      filename: 'event-registrations.csv',
      includeHeaders: true
    }
  }

  // Sample data for demonstration
  const contactSampleData = [
    {
      id: '1',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      message: 'I would like to learn more about your services.',
      consent: true,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '(555) 987-6543',
      message: 'Please contact me about pricing options.',
      consent: true,
      createdAt: '2024-01-16T14:20:00Z'
    }
  ]

  const eventSampleData = [
    {
      id: '1',
      full_name: 'Alice Wilson',
      email: 'alice@example.com',
      event_type: 'workshop',
      registration_date: '2024-02-15T09:00:00Z',
      dietary_requirements: ['vegetarian', 'no-dairy'],
      createdAt: '2024-01-20T12:00:00Z'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Form → Table → CSV Block Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Universal form-table-CSV package for DCT Micro-Apps. This demo showcases
            dynamic form generation, table display, and CSV export functionality.
          </p>

          {/* Demo Selector */}
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedDemo('contact')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedDemo === 'contact'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Contact Form Demo
            </button>
            <button
              onClick={() => setSelectedDemo('event')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedDemo === 'event'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Event Registration Demo
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Package Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold">Dynamic Forms</h3>
              <p className="text-sm text-gray-600">Schema-driven form generation with validation</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold">Rich Tables</h3>
              <p className="text-sm text-gray-600">Sortable, filterable, paginated data display</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">📁</div>
              <h3 className="font-semibold">CSV Export</h3>
              <p className="text-sm text-gray-600">One-click data export with formatting</p>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        {selectedDemo === 'contact' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Contact Form Demo</h2>
            <p className="text-gray-600 mb-6">
              A complete contact form with validation, data display, and CSV export.
              Features include email validation, phone formatting, and consent tracking.
            </p>
            <FormTableCsvBlock
              config={contactFormConfig}
              initialData={contactSampleData}
              onDataChange={(data) => console.log('Contact data updated:', data)}
              className="max-w-6xl"
            />
          </div>
        )}

        {selectedDemo === 'event' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Event Registration Demo</h2>
            <p className="text-gray-600 mb-6">
              An event registration form with grid layout, select fields, and multi-select options.
              Demonstrates complex form types and custom validation.
            </p>
            <FormTableCsvBlock
              config={eventRegistrationConfig}
              initialData={eventSampleData}
              onDataChange={(data) => console.log('Event data updated:', data)}
              className="max-w-6xl"
            />
          </div>
        )}

        {/* Usage Examples */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Basic Implementation</h3>
              <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { FormTableCsvBlock, createContactFormSchema } from '@dct/form-table-csv'

const config = {
  schema: createContactFormSchema(),
  form: { submitText: 'Send Message' },
  table: { showSearch: true },
  csv: { filename: 'contacts.csv' }
}

<FormTableCsvBlock config={config} />`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Custom Schema</h3>
              <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { createFormTableCsvSchema } from '@dct/form-table-csv'

const customSchema = createFormTableCsvSchema({
  name: 'feedback-form',
  title: 'Customer Feedback',
  fields: [
    { name: 'rating', label: 'Rating', type: 'number', required: true },
    { name: 'comments', label: 'Comments', type: 'textarea' }
  ]
})`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}