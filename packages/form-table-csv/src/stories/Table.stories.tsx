import type { Meta, StoryObj } from '@storybook/react'
import { TableComponent } from '../components/Table'
import { createContactFormSchema, createFormTableCsvSchema } from '../schema/createSchema'
import { action } from '@storybook/addon-actions'

const meta: Meta<typeof TableComponent> = {
  title: 'Form Table CSV/Table',
  component: TableComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A feature-rich table component with sorting, filtering, pagination, and custom actions.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof TableComponent>

// Sample data
const contactData = [
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
  },
  {
    id: '3',
    full_name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '(555) 555-0123',
    message: 'I have a question about your product features.',
    consent: true,
    createdAt: '2024-01-17T09:15:00Z'
  },
  {
    id: '4',
    full_name: 'Alice Wilson',
    email: 'alice.wilson@example.com',
    phone: '(555) 444-0987',
    message: 'Looking for technical support information.',
    consent: true,
    createdAt: '2024-01-18T11:45:00Z'
  },
  {
    id: '5',
    full_name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    phone: '(555) 321-0654',
    message: 'Interested in your premium plans.',
    consent: false,
    createdAt: '2024-01-19T16:30:00Z'
  },
  {
    id: '6',
    full_name: 'Diana Prince',
    email: 'diana.prince@example.com',
    phone: '(555) 876-5432',
    message: 'Need help with integration setup.',
    consent: true,
    createdAt: '2024-01-20T08:00:00Z'
  },
  {
    id: '7',
    full_name: 'Edward Green',
    email: 'edward.green@example.com',
    phone: '(555) 765-4321',
    message: 'Question about data security measures.',
    consent: true,
    createdAt: '2024-01-21T13:15:00Z'
  }
]

const salesData = [
  {
    id: '1',
    product: 'Widget A',
    customer: 'ACME Corp',
    amount: 1299.99,
    date: '2024-01-15T10:00:00Z',
    status: 'completed',
    region: 'North America'
  },
  {
    id: '2',
    product: 'Widget B',
    customer: 'Global Inc',
    amount: 2499.50,
    date: '2024-01-16T14:30:00Z',
    status: 'pending',
    region: 'Europe'
  },
  {
    id: '3',
    product: 'Widget C',
    customer: 'Tech Solutions',
    amount: 899.99,
    date: '2024-01-17T09:45:00Z',
    status: 'completed',
    region: 'Asia'
  },
  {
    id: '4',
    product: 'Widget A',
    customer: 'StartupXYZ',
    amount: 650.00,
    date: '2024-01-18T11:20:00Z',
    status: 'cancelled',
    region: 'North America'
  }
]

export const BasicTable: Story = {
  args: {
    data: contactData,
    schema: createContactFormSchema(),
    showSearch: true,
    showPagination: true,
    pageSize: 5,
    className: 'mx-4'
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic table with search and pagination functionality.'
      }
    }
  }
}

export const TableWithFilters: Story = {
  args: {
    data: contactData,
    schema: createContactFormSchema(),
    showSearch: true,
    showFilters: true,
    showPagination: true,
    pageSize: 5,
    className: 'mx-4'
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with both search and column-specific filters enabled.'
      }
    }
  }
}

export const TableWithActions: Story = {
  args: {
    data: contactData,
    schema: createContactFormSchema(),
    showSearch: true,
    showPagination: true,
    pageSize: 5,
    actions: [
      {
        label: 'View',
        onClick: action('view-clicked'),
        variant: 'outline'
      },
      {
        label: 'Edit',
        onClick: action('edit-clicked'),
        variant: 'default'
      },
      {
        label: 'Delete',
        onClick: action('delete-clicked'),
        variant: 'destructive'
      }
    ],
    className: 'mx-4'
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with custom action buttons for each row.'
      }
    }
  }
}

export const EmptyTable: Story = {
  args: {
    data: [],
    schema: createContactFormSchema(),
    showSearch: true,
    showPagination: true,
    emptyMessage: 'No contacts found. Add some data to see the table in action!',
    className: 'mx-4'
  },
  parameters: {
    docs: {
      description: {
        story: 'Table in empty state with custom empty message.'
      }
    }
  }
}

export const SalesTable: Story = {
  args: {
    data: salesData,
    schema: createFormTableCsvSchema({
      name: 'sales-data',
      title: 'Sales Dashboard',
      description: 'Track sales performance and revenue',
      fields: [
        { name: 'product', label: 'Product', type: 'text' },
        { name: 'customer', label: 'Customer', type: 'text' },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select' },
        { name: 'region', label: 'Region', type: 'select' }
      ]
    }),
    showSearch: true,
    showFilters: true,
    showPagination: false,
    actions: [
      {
        label: '📊 Details',
        onClick: action('view-details'),
        variant: 'outline'
      },
      {
        label: '✏️ Edit',
        onClick: action('edit-sale'),
        variant: 'default'
      }
    ],
    className: 'mx-4'
  },
  parameters: {
    docs: {
      description: {
        story: 'Sales data table demonstrating number and date formatting with custom actions.'
      }
    }
  }
}

export const CompactTable: Story = {
  args: {
    data: contactData.slice(0, 3),
    schema: createFormTableCsvSchema({
      name: 'compact-contacts',
      title: 'Recent Contacts',
      fields: [
        { name: 'full_name', label: 'Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'createdAt', label: 'Date', type: 'date' }
      ]
    }),
    showSearch: false,
    showFilters: false,
    showPagination: false,
    emptyMessage: 'No recent contacts',
    className: 'mx-4'
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact table layout without search, filters, or pagination - ideal for dashboards.'
      }
    }
  }
}

export const CustomRendering: Story = {
  args: {
    data: salesData,
    schema: {
      name: 'custom-sales',
      title: 'Sales with Custom Rendering',
      description: 'Demonstrates custom cell rendering',
      fields: [],
      columns: [
        {
          key: 'product',
          header: 'Product',
          sortable: true,
          render: (value, row) => (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">{value}</span>
            </div>
          )
        },
        {
          key: 'customer',
          header: 'Customer',
          sortable: true
        },
        {
          key: 'amount',
          header: 'Amount',
          sortable: true,
          align: 'right',
          format: 'currency'
        },
        {
          key: 'status',
          header: 'Status',
          render: (value) => {
            const colors = {
              completed: 'bg-green-100 text-green-800',
              pending: 'bg-yellow-100 text-yellow-800',
              cancelled: 'bg-red-100 text-red-800'
            }
            return (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
                {value}
              </span>
            )
          }
        },
        {
          key: 'date',
          header: 'Date',
          format: 'date',
          sortable: true
        }
      ],
      validation: require('zod').z.object({})
    },
    showSearch: true,
    showPagination: false,
    className: 'mx-4'
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with custom cell rendering including status badges and custom product display.'
      }
    }
  }
}

export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      full_name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `(555) ${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      message: `This is a sample message from user ${i + 1}.`,
      consent: Math.random() > 0.2,
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString()
    })),
    schema: createContactFormSchema(),
    showSearch: true,
    showFilters: true,
    showPagination: true,
    pageSize: 10,
    actions: [
      {
        label: 'Quick Action',
        onClick: action('quick-action'),
        variant: 'outline'
      }
    ],
    className: 'mx-4'
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with a larger dataset (50 items) to demonstrate pagination and performance.'
      }
    }
  }
}