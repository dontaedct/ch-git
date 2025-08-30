# @dct/form-table-csv

A universal form-table-CSV block for DCT Micro-Apps that provides a complete solution for form submission, data display, and CSV export functionality.

## Features

- 📝 **Dynamic Form Generation** - Create forms from schema definitions with built-in validation
- 📊 **Rich Table Display** - Sortable, filterable, and paginated data tables
- 📁 **CSV Export** - Export data with formatting and customization options
- 🎨 **Customizable** - Flexible styling and configuration options
- 🔒 **Type-Safe** - Full TypeScript support with Zod validation
- ♿ **Accessible** - Built with accessibility in mind
- 📱 **Responsive** - Works on all device sizes

## Installation

```bash
npm install @dct/form-table-csv
```

## Peer Dependencies

Make sure you have these installed in your project:

```bash
npm install react react-dom zod
```

## Quick Start

```tsx
import { FormTableCsvBlock, createContactFormSchema } from '@dct/form-table-csv'

const config = {
  schema: createContactFormSchema(),
  form: {
    submitText: 'Send Message',
    showReset: true
  },
  table: {
    showSearch: true,
    showPagination: true
  },
  csv: {
    filename: 'contacts.csv'
  }
}

function App() {
  return (
    <FormTableCsvBlock 
      config={config}
      onDataChange={(data) => console.log('Data updated:', data)}
    />
  )
}
```

## Schema Creation

### Basic Schema

```tsx
import { createFormTableCsvSchema } from '@dct/form-table-csv'

const schema = createFormTableCsvSchema({
  name: 'contact-form',
  title: 'Contact Us',
  description: 'Get in touch with our team',
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
      placeholder: 'your@email.com'
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Your message...'
    }
  ]
})
```

### Field Types

- `text` - Single line text input
- `email` - Email input with validation
- `tel` - Phone number input
- `number` - Numeric input
- `date` - Date picker
- `datetime-local` - Date and time picker
- `select` - Dropdown selection
- `multiselect` - Multiple selection dropdown
- `checkbox` - Single checkbox
- `radio` - Radio button group
- `textarea` - Multi-line text input

### Pre-built Schemas

```tsx
import { 
  createContactFormSchema, 
  createEventRegistrationSchema 
} from '@dct/form-table-csv'

// Contact form with name, email, phone, message, consent
const contactSchema = createContactFormSchema()

// Event registration with name, email, event type, date, dietary requirements
const eventSchema = createEventRegistrationSchema()
```

## Components

### FormTableCsvBlock (Complete Solution)

The main component that combines form, table, and CSV export:

```tsx
<FormTableCsvBlock
  config={{
    schema: mySchema,
    form: {
      submitText: 'Submit',
      resetText: 'Reset',
      showReset: true,
      layout: 'grid', // 'stack' | 'grid'
      gridCols: 2
    },
    table: {
      showSearch: true,
      showFilters: true,
      showPagination: true,
      pageSize: 10,
      emptyMessage: 'No data available',
      actions: [
        {
          label: 'Edit',
          onClick: (row) => handleEdit(row),
          variant: 'outline'
        }
      ]
    },
    csv: {
      filename: 'export.csv',
      includeHeaders: true,
      dateFormat: 'MM/dd/yyyy'
    }
  }}
  initialData={[]}
  onDataChange={(data) => console.log(data)}
  className="max-w-6xl mx-auto"
/>
```

### Individual Components

#### FormComponent

```tsx
import { FormComponent } from '@dct/form-table-csv'

<FormComponent
  schema={schema}
  onSubmit={(data) => handleSubmit(data)}
  onReset={() => handleReset()}
  layout="grid"
  gridCols={2}
  disabled={false}
/>
```

#### TableComponent

```tsx
import { TableComponent } from '@dct/form-table-csv'

<TableComponent
  data={tableData}
  schema={schema}
  showSearch={true}
  showFilters={true}
  showPagination={true}
  pageSize={10}
  actions={[
    {
      label: 'View',
      onClick: (row) => handleView(row),
      variant: 'outline'
    }
  ]}
/>
```

#### CsvExportButton

```tsx
import { CsvExportButton } from '@dct/form-table-csv'

<CsvExportButton
  data={data}
  schema={schema}
  options={{
    filename: 'my-export.csv',
    includeHeaders: true,
    dateFormat: 'yyyy-MM-dd'
  }}
  variant="outline"
>
  Export Data
</CsvExportButton>
```

## Server Actions

For Next.js applications, use the provided server actions:

```tsx
'use server'

import { submitFormData } from '@dct/form-table-csv/server'

export async function handleFormSubmission(data: any) {
  return await submitFormData(schema, data, {
    onSuccess: async (validatedData) => {
      // Save to database
      await db.contacts.create({ data: validatedData })
    },
    onError: async (error) => {
      // Log error
      console.error('Form submission failed:', error)
    }
  })
}
```

## Custom Validation

Add custom validation to fields:

```tsx
import { z } from 'zod'

const customSchema = createFormTableCsvSchema({
  name: 'custom-form',
  title: 'Custom Validation',
  fields: [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      validation: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    }
  ]
})
```

## Custom Column Rendering

Customize how data appears in tables:

```tsx
const customColumns = [
  {
    key: 'status',
    header: 'Status',
    render: (value, row) => (
      <span className={`badge ${value === 'active' ? 'badge-success' : 'badge-inactive'}`}>
        {value}
      </span>
    )
  },
  {
    key: 'amount',
    header: 'Amount',
    format: 'currency',
    align: 'right'
  }
]
```

## Context Provider

For advanced use cases, use the context provider directly:

```tsx
import { FormTableCsvProvider, useFormTableCsv } from '@dct/form-table-csv'

function MyCustomComponent() {
  const { data, loading, addEntry, exportToCsv } = useFormTableCsv()
  
  // Your custom logic here
}

function App() {
  return (
    <FormTableCsvProvider
      schema={schema}
      initialData={[]}
      onDataChange={(data) => console.log(data)}
    >
      <MyCustomComponent />
    </FormTableCsvProvider>
  )
}
```

## Styling

The components use Tailwind CSS classes. To customize styling:

1. Override CSS classes via the `className` prop
2. Use CSS-in-JS solutions
3. Create custom themes

## TypeScript

Full TypeScript support with proper type inference:

```tsx
import type { FormTableCsvSchema, FormTableCsvConfig } from '@dct/form-table-csv'

const mySchema: FormTableCsvSchema = {
  // Schema definition
}

const myConfig: FormTableCsvConfig = {
  // Configuration
}
```

## Examples

Check out the Storybook stories for comprehensive examples:

- Basic contact forms
- Event registration
- Custom field types
- Table with actions
- CSV export configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.