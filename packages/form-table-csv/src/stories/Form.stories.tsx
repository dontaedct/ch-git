import type { Meta, StoryObj } from '@storybook/react'
import { FormComponent } from '../components/Form'
import { createContactFormSchema, createEventRegistrationSchema, createFormTableCsvSchema } from '../schema/createSchema'
import { action } from '@storybook/addon-actions'

const meta: Meta<typeof FormComponent> = {
  title: 'Form Table CSV/Form',
  component: FormComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible form component that renders based on a schema configuration with built-in validation.'
      }
    }
  },
  argTypes: {
    layout: {
      control: { type: 'radio' },
      options: ['stack', 'grid']
    },
    gridCols: {
      control: { type: 'number', min: 1, max: 4 }
    }
  }
}

export default meta
type Story = StoryObj<typeof FormComponent>

export const ContactForm: Story = {
  args: {
    schema: createContactFormSchema(),
    onSubmit: action('form-submitted'),
    onReset: action('form-reset'),
    submitText: 'Send Message',
    resetText: 'Clear Form',
    showReset: true,
    layout: 'stack',
    className: 'w-full max-w-2xl'
  },
  parameters: {
    docs: {
      description: {
        story: 'Standard contact form with text inputs, email validation, and consent checkbox.'
      }
    }
  }
}

export const EventRegistration: Story = {
  args: {
    schema: createEventRegistrationSchema(),
    onSubmit: action('registration-submitted'),
    onReset: action('registration-reset'),
    submitText: 'Register Now',
    resetText: 'Reset',
    showReset: true,
    layout: 'grid',
    gridCols: 2,
    className: 'w-full max-w-4xl'
  },
  parameters: {
    docs: {
      description: {
        story: 'Event registration form with grid layout, select inputs, and multi-select options.'
      }
    }
  }
}

export const GridLayout: Story = {
  args: {
    schema: createContactFormSchema(),
    onSubmit: action('form-submitted'),
    layout: 'grid',
    gridCols: 2,
    submitText: 'Submit',
    showReset: false,
    className: 'w-full max-w-4xl'
  },
  parameters: {
    docs: {
      description: {
        story: 'Form displayed in a 2-column grid layout for more compact presentation.'
      }
    }
  }
}

export const DisabledForm: Story = {
  args: {
    schema: createContactFormSchema(),
    onSubmit: action('form-submitted'),
    disabled: true,
    submitText: 'Processing...',
    className: 'w-full max-w-2xl'
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in disabled state, useful during submission or loading states.'
      }
    }
  }
}

export const CustomFieldTypes: Story = {
  args: {
    schema: createFormTableCsvSchema({
      name: 'custom-form',
      title: 'Custom Field Types Demo',
      description: 'Demonstration of various field types and validation',
      fields: [
        {
          name: 'text_field',
          label: 'Text Input',
          type: 'text',
          placeholder: 'Enter some text',
          required: true
        },
        {
          name: 'email_field',
          label: 'Email Address',
          type: 'email',
          placeholder: 'user@example.com',
          required: true
        },
        {
          name: 'tel_field',
          label: 'Phone Number',
          type: 'tel',
          placeholder: '(555) 123-4567',
          description: 'Include area code'
        },
        {
          name: 'number_field',
          label: 'Age',
          type: 'number',
          placeholder: '25'
        },
        {
          name: 'date_field',
          label: 'Birth Date',
          type: 'date'
        },
        {
          name: 'select_field',
          label: 'Favorite Color',
          type: 'select',
          options: [
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
            { label: 'Blue', value: 'blue' }
          ]
        },
        {
          name: 'multiselect_field',
          label: 'Hobbies',
          type: 'multiselect',
          description: 'Hold Ctrl/Cmd to select multiple',
          options: [
            { label: 'Reading', value: 'reading' },
            { label: 'Sports', value: 'sports' },
            { label: 'Music', value: 'music' },
            { label: 'Cooking', value: 'cooking' }
          ]
        },
        {
          name: 'radio_field',
          label: 'Preferred Contact Method',
          type: 'radio',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Text', value: 'text' }
          ]
        },
        {
          name: 'textarea_field',
          label: 'Additional Comments',
          type: 'textarea',
          placeholder: 'Enter your comments here...'
        },
        {
          name: 'checkbox_field',
          label: 'I agree to the terms and conditions',
          type: 'checkbox',
          required: true
        }
      ]
    }),
    onSubmit: action('custom-form-submitted'),
    layout: 'grid',
    gridCols: 2,
    className: 'w-full max-w-6xl'
  },
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive demo showing all available field types and their configurations.'
      }
    }
  }
}

export const WithDefaultValues: Story = {
  args: {
    schema: createFormTableCsvSchema({
      name: 'prefilled-form',
      title: 'Pre-filled Form',
      description: 'Form with default values already set',
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          defaultValue: 'John Doe',
          required: true
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          defaultValue: 'john.doe@example.com',
          required: true
        },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          defaultValue: 'developer',
          options: [
            { label: 'Developer', value: 'developer' },
            { label: 'Designer', value: 'designer' },
            { label: 'Manager', value: 'manager' }
          ]
        },
        {
          name: 'newsletter',
          label: 'Subscribe to newsletter',
          type: 'checkbox',
          defaultValue: true
        }
      ]
    }),
    onSubmit: action('prefilled-form-submitted'),
    className: 'w-full max-w-2xl'
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with default values pre-populated for better user experience.'
      }
    }
  }
}

export const ValidationErrors: Story = {
  args: {
    schema: createContactFormSchema(),
    onSubmit: async (data) => {
      action('form-submitted')(data)
      // Simulate validation errors
      throw new Error('Server validation failed')
    },
    className: 'w-full max-w-2xl'
  },
  parameters: {
    docs: {
      description: {
        story: 'Form demonstrating validation error states. Try submitting without required fields.'
      }
    }
  }
}

export const CompactLayout: Story = {
  args: {
    schema: createFormTableCsvSchema({
      name: 'compact-form',
      title: 'Quick Contact',
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          required: true,
          placeholder: 'Your name'
        },
        {
          name: 'email',
          label: 'Email',
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
    }),
    onSubmit: action('compact-form-submitted'),
    submitText: 'Send',
    showReset: false,
    className: 'w-full max-w-md'
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact form layout suitable for sidebars or modal dialogs.'
      }
    }
  }
}