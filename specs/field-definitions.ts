/**
 * Field Definitions for Component and Form Editors
 *
 * This file defines the complete field specification system for the configuration-first
 * manifest editors. Each component type and form field type has defined editor fields
 * that control how users configure them in the builder UI.
 */

// ===== COMPONENT EDITOR FIELD DEFINITIONS =====

export interface EditorField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'toggle' | 'number' | 'color' | 'image' | 'rich-text' | 'code' | 'conditional' | 'array' | 'object';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  options?: Array<{label: string; value: string}>;
  conditional?: {
    field: string;
    operator: 'equals' | 'not-equals' | 'contains';
    value: any;
  };
  advanced?: boolean; // Hidden in basic mode
  group?: string;
}

export interface ComponentEditorDefinition {
  componentType: string;
  displayName: string;
  icon: string;
  category: 'layout' | 'content' | 'interactive' | 'data';
  description: string;
  fields: EditorField[];
  previewTemplate?: string;
  dependencies?: string[];
  conflicts?: string[];
}

// Hero Section Component Editor
export const HeroEditorDefinition: ComponentEditorDefinition = {
  componentType: 'hero',
  displayName: 'Hero Section',
  icon: 'layout-hero',
  category: 'layout',
  description: 'Large header section with title, subtitle, and call-to-action',
  fields: [
    // Basic Fields
    {
      id: 'title',
      name: 'title',
      type: 'text',
      label: 'Main Title',
      description: 'Primary headline text',
      required: true,
      defaultValue: 'Welcome to Our Platform',
      validation: { min: 5, max: 100 }
    },
    {
      id: 'subtitle',
      name: 'subtitle',
      type: 'textarea',
      label: 'Subtitle',
      description: 'Supporting text under the main title',
      required: false,
      defaultValue: 'Create amazing experiences with our tools',
      validation: { max: 300 }
    },
    {
      id: 'ctaText',
      name: 'ctaText',
      type: 'text',
      label: 'Call-to-Action Text',
      required: true,
      defaultValue: 'Get Started',
      validation: { max: 30 }
    },
    {
      id: 'ctaUrl',
      name: 'ctaUrl',
      type: 'text',
      label: 'CTA URL',
      required: true,
      defaultValue: '/signup',
      validation: { pattern: '^(/|https?://).*' }
    },
    {
      id: 'backgroundImage',
      name: 'backgroundImage',
      type: 'image',
      label: 'Background Image',
      required: false,
      description: 'Optional hero background image'
    },

    // Advanced Fields
    {
      id: 'layout',
      name: 'layout',
      type: 'select',
      label: 'Layout Style',
      required: true,
      defaultValue: 'centered',
      options: [
        { label: 'Centered', value: 'centered' },
        { label: 'Left Aligned', value: 'left' },
        { label: 'Split Layout', value: 'split' }
      ],
      advanced: true
    },
    {
      id: 'height',
      name: 'height',
      type: 'select',
      label: 'Section Height',
      required: true,
      defaultValue: 'large',
      options: [
        { label: 'Small (400px)', value: 'small' },
        { label: 'Medium (600px)', value: 'medium' },
        { label: 'Large (800px)', value: 'large' },
        { label: 'Full Screen', value: 'fullscreen' }
      ],
      advanced: true
    },
    {
      id: 'showVideo',
      name: 'showVideo',
      type: 'toggle',
      label: 'Include Video Background',
      required: false,
      defaultValue: false,
      advanced: true
    },
    {
      id: 'videoUrl',
      name: 'videoUrl',
      type: 'text',
      label: 'Video URL',
      required: false,
      conditional: {
        field: 'showVideo',
        operator: 'equals',
        value: true
      },
      advanced: true
    },
    {
      id: 'customCSS',
      name: 'customCSS',
      type: 'code',
      label: 'Custom CSS',
      required: false,
      description: 'Additional CSS for custom styling',
      advanced: true
    }
  ],
  dependencies: [],
  conflicts: []
};

// Form Component Editor
export const FormEditorDefinition: ComponentEditorDefinition = {
  componentType: 'form',
  displayName: 'Form',
  icon: 'form',
  category: 'interactive',
  description: 'Interactive form with configurable fields and validation',
  fields: [
    {
      id: 'formId',
      name: 'formId',
      type: 'select',
      label: 'Form Template',
      description: 'Select from existing form manifests',
      required: true,
      options: [] // Populated dynamically from available forms
    },
    {
      id: 'title',
      name: 'title',
      type: 'text',
      label: 'Form Title',
      required: false,
      defaultValue: 'Contact Us'
    },
    {
      id: 'description',
      name: 'description',
      type: 'textarea',
      label: 'Form Description',
      required: false,
      validation: { max: 200 }
    },
    {
      id: 'showTitle',
      name: 'showTitle',
      type: 'toggle',
      label: 'Show Form Title',
      required: false,
      defaultValue: true
    },
    {
      id: 'layout',
      name: 'layout',
      type: 'select',
      label: 'Form Layout',
      required: true,
      defaultValue: 'vertical',
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Two Column', value: 'two-column' }
      ],
      advanced: true
    },
    {
      id: 'submitButtonText',
      name: 'submitButtonText',
      type: 'text',
      label: 'Submit Button Text',
      required: false,
      defaultValue: 'Submit',
      validation: { max: 20 }
    },
    {
      id: 'successMessage',
      name: 'successMessage',
      type: 'textarea',
      label: 'Success Message',
      required: false,
      defaultValue: 'Thank you for your submission!',
      validation: { max: 100 },
      advanced: true
    }
  ],
  dependencies: [],
  conflicts: []
};

// Text Content Component Editor
export const TextEditorDefinition: ComponentEditorDefinition = {
  componentType: 'text',
  displayName: 'Text Content',
  icon: 'text',
  category: 'content',
  description: 'Rich text content with formatting options',
  fields: [
    {
      id: 'content',
      name: 'content',
      type: 'rich-text',
      label: 'Text Content',
      description: 'Rich text with formatting support',
      required: true,
      defaultValue: '<p>Enter your text content here...</p>'
    },
    {
      id: 'alignment',
      name: 'alignment',
      type: 'select',
      label: 'Text Alignment',
      required: true,
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
        { label: 'Justify', value: 'justify' }
      ]
    },
    {
      id: 'fontSize',
      name: 'fontSize',
      type: 'select',
      label: 'Font Size',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Extra Large', value: 'xl' }
      ],
      advanced: true
    },
    {
      id: 'textColor',
      name: 'textColor',
      type: 'color',
      label: 'Text Color',
      required: false,
      defaultValue: '#000000',
      advanced: true
    },
    {
      id: 'backgroundColor',
      name: 'backgroundColor',
      type: 'color',
      label: 'Background Color',
      required: false,
      advanced: true
    },
    {
      id: 'maxWidth',
      name: 'maxWidth',
      type: 'number',
      label: 'Max Width (px)',
      required: false,
      validation: { min: 200, max: 1200 },
      advanced: true
    }
  ],
  dependencies: [],
  conflicts: []
};

// Button Component Editor
export const ButtonEditorDefinition: ComponentEditorDefinition = {
  componentType: 'button',
  displayName: 'Button',
  icon: 'button',
  category: 'interactive',
  description: 'Clickable button with customizable styling',
  fields: [
    {
      id: 'text',
      name: 'text',
      type: 'text',
      label: 'Button Text',
      required: true,
      defaultValue: 'Click Here',
      validation: { max: 30 }
    },
    {
      id: 'url',
      name: 'url',
      type: 'text',
      label: 'Link URL',
      required: true,
      defaultValue: '#',
      validation: { pattern: '^(#|/|https?://).*' }
    },
    {
      id: 'style',
      name: 'style',
      type: 'select',
      label: 'Button Style',
      required: true,
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' }
      ]
    },
    {
      id: 'size',
      name: 'size',
      type: 'select',
      label: 'Button Size',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]
    },
    {
      id: 'openInNewTab',
      name: 'openInNewTab',
      type: 'toggle',
      label: 'Open in New Tab',
      required: false,
      defaultValue: false,
      advanced: true
    },
    {
      id: 'icon',
      name: 'icon',
      type: 'select',
      label: 'Icon',
      required: false,
      options: [
        { label: 'None', value: '' },
        { label: 'Arrow Right', value: 'arrow-right' },
        { label: 'Download', value: 'download' },
        { label: 'External Link', value: 'external-link' },
        { label: 'Play', value: 'play' }
      ],
      advanced: true
    },
    {
      id: 'customColor',
      name: 'customColor',
      type: 'color',
      label: 'Custom Color',
      required: false,
      description: 'Override default button color',
      advanced: true
    }
  ],
  dependencies: [],
  conflicts: []
};

// Image Component Editor
export const ImageEditorDefinition: ComponentEditorDefinition = {
  componentType: 'image',
  displayName: 'Image',
  icon: 'image',
  category: 'content',
  description: 'Responsive image with caption and styling options',
  fields: [
    {
      id: 'src',
      name: 'src',
      type: 'image',
      label: 'Image Source',
      required: true,
      description: 'Upload image or enter URL'
    },
    {
      id: 'alt',
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      description: 'Accessibility description',
      required: true,
      validation: { max: 200 }
    },
    {
      id: 'caption',
      name: 'caption',
      type: 'text',
      label: 'Caption',
      required: false,
      validation: { max: 100 }
    },
    {
      id: 'width',
      name: 'width',
      type: 'select',
      label: 'Image Width',
      required: true,
      defaultValue: 'full',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: '75%', value: '75' },
        { label: '50%', value: '50' },
        { label: '25%', value: '25' },
        { label: 'Auto', value: 'auto' }
      ]
    },
    {
      id: 'alignment',
      name: 'alignment',
      type: 'select',
      label: 'Alignment',
      required: true,
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ]
    },
    {
      id: 'borderRadius',
      name: 'borderRadius',
      type: 'select',
      label: 'Border Radius',
      required: false,
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full (Circle)', value: 'full' }
      ],
      advanced: true
    },
    {
      id: 'lazy',
      name: 'lazy',
      type: 'toggle',
      label: 'Lazy Loading',
      required: false,
      defaultValue: true,
      description: 'Load image when it comes into view',
      advanced: true
    },
    {
      id: 'clickAction',
      name: 'clickAction',
      type: 'select',
      label: 'Click Action',
      required: false,
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Open Lightbox', value: 'lightbox' },
        { label: 'Navigate to URL', value: 'navigate' }
      ],
      advanced: true
    },
    {
      id: 'clickUrl',
      name: 'clickUrl',
      type: 'text',
      label: 'Click URL',
      required: false,
      conditional: {
        field: 'clickAction',
        operator: 'equals',
        value: 'navigate'
      },
      advanced: true
    }
  ],
  dependencies: [],
  conflicts: []
};

// ===== FORM FIELD EDITOR DEFINITIONS =====

export interface FormFieldEditorDefinition {
  fieldType: string;
  displayName: string;
  icon: string;
  category: 'basic' | 'advanced' | 'layout';
  description: string;
  fields: EditorField[];
}

// Text Input Field Editor
export const TextFieldEditorDefinition: FormFieldEditorDefinition = {
  fieldType: 'text',
  displayName: 'Text Input',
  icon: 'text-input',
  category: 'basic',
  description: 'Single-line text input field',
  fields: [
    {
      id: 'label',
      name: 'label',
      type: 'text',
      label: 'Field Label',
      required: true,
      defaultValue: 'Text Field',
      validation: { max: 100 }
    },
    {
      id: 'placeholder',
      name: 'placeholder',
      type: 'text',
      label: 'Placeholder Text',
      required: false,
      defaultValue: 'Enter text...',
      validation: { max: 100 }
    },
    {
      id: 'required',
      name: 'required',
      type: 'toggle',
      label: 'Required Field',
      required: false,
      defaultValue: false
    },
    {
      id: 'description',
      name: 'description',
      type: 'textarea',
      label: 'Help Text',
      required: false,
      description: 'Additional guidance for users',
      validation: { max: 200 }
    },
    {
      id: 'minLength',
      name: 'validation.minLength',
      type: 'number',
      label: 'Minimum Length',
      required: false,
      validation: { min: 0, max: 1000 },
      advanced: true,
      group: 'validation'
    },
    {
      id: 'maxLength',
      name: 'validation.maxLength',
      type: 'number',
      label: 'Maximum Length',
      required: false,
      validation: { min: 1, max: 10000 },
      advanced: true,
      group: 'validation'
    },
    {
      id: 'pattern',
      name: 'validation.pattern',
      type: 'select',
      label: 'Validation Pattern',
      required: false,
      options: [
        { label: 'None', value: '' },
        { label: 'Letters Only', value: '^[a-zA-Z\\s]+$' },
        { label: 'Numbers Only', value: '^[0-9]+$' },
        { label: 'Alphanumeric', value: '^[a-zA-Z0-9]+$' },
        { label: 'Custom RegEx', value: 'custom' }
      ],
      advanced: true,
      group: 'validation'
    },
    {
      id: 'customPattern',
      name: 'validation.customPattern',
      type: 'text',
      label: 'Custom RegEx Pattern',
      required: false,
      conditional: {
        field: 'pattern',
        operator: 'equals',
        value: 'custom'
      },
      advanced: true,
      group: 'validation'
    },
    {
      id: 'ariaLabel',
      name: 'accessibility.ariaLabel',
      type: 'text',
      label: 'ARIA Label',
      required: false,
      description: 'Screen reader description',
      advanced: true,
      group: 'accessibility'
    }
  ]
};

// Email Field Editor
export const EmailFieldEditorDefinition: FormFieldEditorDefinition = {
  fieldType: 'email',
  displayName: 'Email Input',
  icon: 'email',
  category: 'basic',
  description: 'Email address input with validation',
  fields: [
    {
      id: 'label',
      name: 'label',
      type: 'text',
      label: 'Field Label',
      required: true,
      defaultValue: 'Email Address',
      validation: { max: 100 }
    },
    {
      id: 'placeholder',
      name: 'placeholder',
      type: 'text',
      label: 'Placeholder Text',
      required: false,
      defaultValue: 'you@example.com',
      validation: { max: 100 }
    },
    {
      id: 'required',
      name: 'required',
      type: 'toggle',
      label: 'Required Field',
      required: false,
      defaultValue: true
    },
    {
      id: 'description',
      name: 'description',
      type: 'textarea',
      label: 'Help Text',
      required: false,
      validation: { max: 200 }
    },
    {
      id: 'validateDomain',
      name: 'validation.validateDomain',
      type: 'toggle',
      label: 'Validate Email Domain',
      required: false,
      defaultValue: false,
      description: 'Check if email domain exists',
      advanced: true,
      group: 'validation'
    },
    {
      id: 'blockedDomains',
      name: 'validation.blockedDomains',
      type: 'array',
      label: 'Blocked Domains',
      required: false,
      description: 'Domains to reject (e.g., tempmail.com)',
      advanced: true,
      group: 'validation'
    },
    {
      id: 'businessEmailOnly',
      name: 'validation.businessEmailOnly',
      type: 'toggle',
      label: 'Business Email Only',
      required: false,
      defaultValue: false,
      description: 'Reject common personal email providers',
      advanced: true,
      group: 'validation'
    }
  ]
};

// Select Dropdown Field Editor
export const SelectFieldEditorDefinition: FormFieldEditorDefinition = {
  fieldType: 'select',
  displayName: 'Select Dropdown',
  icon: 'select',
  category: 'basic',
  description: 'Dropdown selection with multiple options',
  fields: [
    {
      id: 'label',
      name: 'label',
      type: 'text',
      label: 'Field Label',
      required: true,
      defaultValue: 'Select Option',
      validation: { max: 100 }
    },
    {
      id: 'required',
      name: 'required',
      type: 'toggle',
      label: 'Required Field',
      required: false,
      defaultValue: false
    },
    {
      id: 'options',
      name: 'options',
      type: 'array',
      label: 'Options',
      required: true,
      description: 'Add dropdown options (label and value pairs)',
      defaultValue: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ]
    },
    {
      id: 'placeholder',
      name: 'placeholder',
      type: 'text',
      label: 'Placeholder Text',
      required: false,
      defaultValue: 'Choose an option...',
      validation: { max: 100 }
    },
    {
      id: 'allowMultiple',
      name: 'allowMultiple',
      type: 'toggle',
      label: 'Allow Multiple Selections',
      required: false,
      defaultValue: false,
      advanced: true
    },
    {
      id: 'searchable',
      name: 'searchable',
      type: 'toggle',
      label: 'Searchable Dropdown',
      required: false,
      defaultValue: false,
      description: 'Allow users to search options',
      advanced: true
    },
    {
      id: 'clearable',
      name: 'clearable',
      type: 'toggle',
      label: 'Clearable Selection',
      required: false,
      defaultValue: true,
      advanced: true
    }
  ]
};

// Textarea Field Editor
export const TextareaFieldEditorDefinition: FormFieldEditorDefinition = {
  fieldType: 'textarea',
  displayName: 'Textarea',
  icon: 'textarea',
  category: 'basic',
  description: 'Multi-line text input for longer content',
  fields: [
    {
      id: 'label',
      name: 'label',
      type: 'text',
      label: 'Field Label',
      required: true,
      defaultValue: 'Message',
      validation: { max: 100 }
    },
    {
      id: 'placeholder',
      name: 'placeholder',
      type: 'textarea',
      label: 'Placeholder Text',
      required: false,
      defaultValue: 'Enter your message...',
      validation: { max: 200 }
    },
    {
      id: 'required',
      name: 'required',
      type: 'toggle',
      label: 'Required Field',
      required: false,
      defaultValue: false
    },
    {
      id: 'rows',
      name: 'rows',
      type: 'number',
      label: 'Number of Rows',
      required: false,
      defaultValue: 4,
      validation: { min: 2, max: 20 }
    },
    {
      id: 'minLength',
      name: 'validation.minLength',
      type: 'number',
      label: 'Minimum Length',
      required: false,
      validation: { min: 0, max: 1000 },
      advanced: true,
      group: 'validation'
    },
    {
      id: 'maxLength',
      name: 'validation.maxLength',
      type: 'number',
      label: 'Maximum Length',
      required: false,
      validation: { min: 1, max: 10000 },
      advanced: true,
      group: 'validation'
    },
    {
      id: 'autoResize',
      name: 'autoResize',
      type: 'toggle',
      label: 'Auto Resize',
      required: false,
      defaultValue: false,
      description: 'Automatically expand as user types',
      advanced: true
    },
    {
      id: 'wordLimit',
      name: 'validation.wordLimit',
      type: 'number',
      label: 'Word Limit',
      required: false,
      validation: { min: 1, max: 5000 },
      advanced: true,
      group: 'validation'
    }
  ]
};

// File Upload Field Editor
export const FileFieldEditorDefinition: FormFieldEditorDefinition = {
  fieldType: 'file',
  displayName: 'File Upload',
  icon: 'file-upload',
  category: 'advanced',
  description: 'File upload field with type and size restrictions',
  fields: [
    {
      id: 'label',
      name: 'label',
      type: 'text',
      label: 'Field Label',
      required: true,
      defaultValue: 'Upload File',
      validation: { max: 100 }
    },
    {
      id: 'required',
      name: 'required',
      type: 'toggle',
      label: 'Required Field',
      required: false,
      defaultValue: false
    },
    {
      id: 'accept',
      name: 'accept',
      type: 'multiselect',
      label: 'Accepted File Types',
      required: true,
      options: [
        { label: 'Images (JPG, PNG, GIF)', value: 'image/*' },
        { label: 'PDF Documents', value: '.pdf' },
        { label: 'Microsoft Word', value: '.doc,.docx' },
        { label: 'Microsoft Excel', value: '.xls,.xlsx' },
        { label: 'Text Files', value: '.txt' },
        { label: 'CSV Files', value: '.csv' },
        { label: 'All Files', value: '*' }
      ],
      defaultValue: ['image/*']
    },
    {
      id: 'maxSize',
      name: 'validation.maxSize',
      type: 'select',
      label: 'Maximum File Size',
      required: true,
      defaultValue: '5MB',
      options: [
        { label: '1 MB', value: '1MB' },
        { label: '5 MB', value: '5MB' },
        { label: '10 MB', value: '10MB' },
        { label: '25 MB', value: '25MB' },
        { label: '50 MB', value: '50MB' },
        { label: '100 MB', value: '100MB' }
      ],
      group: 'validation'
    },
    {
      id: 'multiple',
      name: 'multiple',
      type: 'toggle',
      label: 'Allow Multiple Files',
      required: false,
      defaultValue: false,
      advanced: true
    },
    {
      id: 'maxFiles',
      name: 'validation.maxFiles',
      type: 'number',
      label: 'Maximum Number of Files',
      required: false,
      defaultValue: 3,
      validation: { min: 1, max: 20 },
      conditional: {
        field: 'multiple',
        operator: 'equals',
        value: true
      },
      advanced: true,
      group: 'validation'
    },
    {
      id: 'dragDrop',
      name: 'dragDrop',
      type: 'toggle',
      label: 'Enable Drag & Drop',
      required: false,
      defaultValue: true,
      advanced: true
    },
    {
      id: 'imagePreview',
      name: 'imagePreview',
      type: 'toggle',
      label: 'Show Image Previews',
      required: false,
      defaultValue: true,
      advanced: true
    }
  ]
};

// Conditional Logic Field Editor
export const ConditionalFieldEditorDefinition: FormFieldEditorDefinition = {
  fieldType: 'conditional',
  displayName: 'Conditional Logic',
  icon: 'conditional',
  category: 'advanced',
  description: 'Show/hide fields based on other field values',
  fields: [
    {
      id: 'triggerField',
      name: 'conditional.field',
      type: 'select',
      label: 'Trigger Field',
      required: true,
      description: 'Field that controls visibility',
      options: [] // Populated from available fields
    },
    {
      id: 'operator',
      name: 'conditional.operator',
      type: 'select',
      label: 'Condition',
      required: true,
      options: [
        { label: 'Equals', value: 'equals' },
        { label: 'Does not equal', value: 'not-equals' },
        { label: 'Contains', value: 'contains' },
        { label: 'Is empty', value: 'isEmpty' },
        { label: 'Is not empty', value: 'isNotEmpty' },
        { label: 'Greater than', value: 'greaterThan' },
        { label: 'Less than', value: 'lessThan' }
      ]
    },
    {
      id: 'value',
      name: 'conditional.value',
      type: 'text',
      label: 'Comparison Value',
      required: false,
      description: 'Value to compare against (leave empty for isEmpty/isNotEmpty)'
    },
    {
      id: 'action',
      name: 'conditional.action',
      type: 'select',
      label: 'Action',
      required: true,
      defaultValue: 'show',
      options: [
        { label: 'Show field', value: 'show' },
        { label: 'Hide field', value: 'hide' },
        { label: 'Make required', value: 'require' },
        { label: 'Make optional', value: 'optional' },
        { label: 'Set value', value: 'setValue' }
      ]
    },
    {
      id: 'setValue',
      name: 'conditional.setValue',
      type: 'text',
      label: 'Value to Set',
      required: false,
      conditional: {
        field: 'action',
        operator: 'equals',
        value: 'setValue'
      }
    }
  ]
};

// Export all definitions
export const ComponentEditorDefinitions = {
  hero: HeroEditorDefinition,
  form: FormEditorDefinition,
  text: TextEditorDefinition,
  button: ButtonEditorDefinition,
  image: ImageEditorDefinition
};

export const FormFieldEditorDefinitions = {
  text: TextFieldEditorDefinition,
  email: EmailFieldEditorDefinition,
  select: SelectFieldEditorDefinition,
  textarea: TextareaFieldEditorDefinition,
  file: FileFieldEditorDefinition,
  conditional: ConditionalFieldEditorDefinition
};

// Helper function to get editor definition by type
export function getComponentEditorDefinition(componentType: string): ComponentEditorDefinition | undefined {
  return ComponentEditorDefinitions[componentType as keyof typeof ComponentEditorDefinitions];
}

export function getFormFieldEditorDefinition(fieldType: string): FormFieldEditorDefinition | undefined {
  return FormFieldEditorDefinitions[fieldType as keyof typeof FormFieldEditorDefinitions];
}

// Helper function to group fields by category
export function groupFieldsByCategory(fields: EditorField[]): Record<string, EditorField[]> {
  const groups: Record<string, EditorField[]> = {
    basic: [],
    advanced: []
  };

  fields.forEach(field => {
    const category = field.advanced ? 'advanced' : 'basic';
    if (!groups[category]) groups[category] = [];
    groups[category].push(field);
  });

  return groups;
}