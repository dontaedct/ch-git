import type { Meta, StoryObj } from '@storybook/react'
import { FormTableCsvBlock } from '../components/FormTableCsvBlock'
import { createContactFormSchema, createEventRegistrationSchema } from '../schema/createSchema'
import type { FormTableCsvConfig } from '../types'

const meta: Meta<typeof FormTableCsvBlock> = {
  title: 'Form Table CSV/FormTableCsvBlock',
  component: FormTableCsvBlock,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A complete form-table-CSV block that handles form submission, data display, and CSV export.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof FormTableCsvBlock>

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
    showFilters: false,
    showPagination: true,
    pageSize: 5,
    emptyMessage: 'No contacts submitted yet',
    actions: [
      {
        label: 'View',
        onClick: (row) => alert(`Viewing: ${row.full_name}`),
        variant: 'outline'
      },
      {
        label: 'Delete',
        onClick: (row) => alert(`Deleting: ${row.full_name}`),
        variant: 'destructive'
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
    submitText: 'Register',
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
    emptyMessage: 'No registrations yet',
    actions: [
      {
        label: 'Edit',
        onClick: (row) => alert(`Editing registration for: ${row.full_name}`),
        variant: 'outline'
      }
    ]
  },
  csv: {
    filename: 'event-registrations.csv',
    includeHeaders: true
  }
}

// Sample data
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
    message: 'Please contact me about pricing.',
    consent: true,
    createdAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '3',
    full_name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '(555) 555-0123',
    message: 'I have a question about your product features.',
    consent: true,
    createdAt: '2024-01-17T09:15:00Z'
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
  },
  {
    id: '2',
    full_name: 'Charlie Brown',
    email: 'charlie@example.com',
    event_type: 'conference',
    registration_date: '2024-03-10T10:00:00Z',
    dietary_requirements: ['gluten-free'],
    createdAt: '2024-01-21T15:30:00Z'
  }
]

export const ContactForm: Story = {
  args: {
    config: contactFormConfig,
    initialData: [],
    className: 'max-w-6xl mx-auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'A contact form that collects user inquiries with validation and displays them in a searchable table.'
      }
    }
  }
}

export const ContactFormWithData: Story = {
  args: {
    config: contactFormConfig,
    initialData: contactSampleData,
    className: 'max-w-6xl mx-auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'The same contact form pre-populated with sample data to demonstrate table functionality.'
      }
    }
  }
}

export const EventRegistration: Story = {
  args: {
    config: eventRegistrationConfig,
    initialData: [],
    className: 'max-w-6xl mx-auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'An event registration form with grid layout, select fields, and multi-select options.'
      }
    }
  }
}

export const EventRegistrationWithData: Story = {
  args: {
    config: eventRegistrationConfig,
    initialData: eventSampleData,
    className: 'max-w-6xl mx-auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Event registration form with sample data showing filtering and CSV export capabilities.'
      }
    }
  }
}

export const MinimalConfiguration: Story = {
  args: {
    config: {
      schema: createContactFormSchema(),
      form: {
        showReset: false
      },
      table: {
        showSearch: false,
        showFilters: false,
        showPagination: false,
        emptyMessage: 'Add your first entry using the form above'
      }
    },
    initialData: [],
    className: 'max-w-4xl mx-auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal configuration with basic form and simple table display.'
      }
    }
  }
}

export const CustomActions: Story = {
  args: {
    config: {
      ...contactFormConfig,
      table: {
        ...contactFormConfig.table,
        actions: [
          {
            label: '📧 Email',
            onClick: (row) => window.open(`mailto:${row.email}`),
            variant: 'outline'
          },
          {
            label: '📞 Call',
            onClick: (row) => window.open(`tel:${row.phone}`),
            variant: 'secondary'
          },
          {
            label: '✏️ Edit',
            onClick: (row) => alert(`Editing ${row.full_name}`),
            variant: 'default'
          },
          {
            label: '🗑️ Delete',
            onClick: (row) => {
              if (confirm(`Delete ${row.full_name}?`)) {
                alert('Deleted!')
              }
            },
            variant: 'destructive'
          }
        ]
      }
    },
    initialData: contactSampleData,
    className: 'max-w-7xl mx-auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with custom table actions including email, call, edit, and delete functionality.'
      }
    }
  }
}