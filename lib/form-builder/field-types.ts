import { ValidationRule } from "@/components/form-builder/form-builder-engine"

export interface FieldTypeDefinition {
  id: string
  name: string
  category: "input" | "selection" | "content" | "advanced"
  icon?: string
  description: string
  defaultProps: Record<string, any>
  supportedValidations: ValidationRule["type"][]
  hasOptions?: boolean
  isMultiValue?: boolean
}

export const FIELD_TYPES: FieldTypeDefinition[] = [
  {
    id: "text",
    name: "Text Input",
    category: "input",
    description: "Single line text input for short responses",
    defaultProps: {
      placeholder: "Enter text here...",
      maxLength: 255
    },
    supportedValidations: ["required", "minLength", "maxLength", "pattern"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "email",
    name: "Email",
    category: "input",
    description: "Email address input with validation",
    defaultProps: {
      placeholder: "Enter email address..."
    },
    supportedValidations: ["required", "email"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "number",
    name: "Number",
    category: "input",
    description: "Numeric input for quantities, ages, etc.",
    defaultProps: {
      placeholder: "Enter number...",
      min: 0,
      max: 999999
    },
    supportedValidations: ["required", "number"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "textarea",
    name: "Text Area",
    category: "input",
    description: "Multi-line text input for longer responses",
    defaultProps: {
      placeholder: "Enter detailed response...",
      rows: 4,
      maxLength: 2000
    },
    supportedValidations: ["required", "minLength", "maxLength"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "select",
    name: "Dropdown",
    category: "selection",
    description: "Single selection from predefined options",
    defaultProps: {
      placeholder: "Choose an option..."
    },
    supportedValidations: ["required"],
    hasOptions: true,
    isMultiValue: false
  },
  {
    id: "radio",
    name: "Radio Buttons",
    category: "selection",
    description: "Single selection with visible options",
    defaultProps: {},
    supportedValidations: ["required"],
    hasOptions: true,
    isMultiValue: false
  },
  {
    id: "checkbox",
    name: "Checkboxes",
    category: "selection",
    description: "Multiple selection from options",
    defaultProps: {},
    supportedValidations: ["required"],
    hasOptions: true,
    isMultiValue: true
  },
  {
    id: "switch",
    name: "Toggle Switch",
    category: "selection",
    description: "Boolean yes/no toggle",
    defaultProps: {
      defaultValue: false
    },
    supportedValidations: [],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "date",
    name: "Date Picker",
    category: "input",
    description: "Date selection input",
    defaultProps: {
      placeholder: "Select date..."
    },
    supportedValidations: ["required"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "time",
    name: "Time Picker",
    category: "input",
    description: "Time selection input",
    defaultProps: {
      placeholder: "Select time..."
    },
    supportedValidations: ["required"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "phone",
    name: "Phone Number",
    category: "input",
    description: "Phone number input with formatting",
    defaultProps: {
      placeholder: "(555) 123-4567"
    },
    supportedValidations: ["required", "pattern"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "url",
    name: "URL",
    category: "input",
    description: "Website URL input",
    defaultProps: {
      placeholder: "https://example.com"
    },
    supportedValidations: ["required", "pattern"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "rating",
    name: "Rating",
    category: "selection",
    description: "Star or numeric rating input",
    defaultProps: {
      min: 1,
      max: 5,
      step: 1
    },
    supportedValidations: ["required"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "slider",
    name: "Slider",
    category: "input",
    description: "Range slider for numeric values",
    defaultProps: {
      min: 0,
      max: 100,
      step: 1
    },
    supportedValidations: ["required"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "file",
    name: "File Upload",
    category: "input",
    description: "File upload input",
    defaultProps: {
      accept: "*/*",
      multiple: false,
      maxSize: "10MB"
    },
    supportedValidations: ["required"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "address",
    name: "Address",
    category: "input",
    description: "Address input with autocomplete",
    defaultProps: {
      placeholder: "Enter address..."
    },
    supportedValidations: ["required"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "signature",
    name: "Signature",
    category: "advanced",
    description: "Digital signature capture",
    defaultProps: {
      width: 400,
      height: 200
    },
    supportedValidations: ["required"],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "heading",
    name: "Heading",
    category: "content",
    description: "Section heading or title",
    defaultProps: {
      level: 2,
      text: "Section Heading"
    },
    supportedValidations: [],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "paragraph",
    name: "Paragraph",
    category: "content",
    description: "Descriptive text or instructions",
    defaultProps: {
      text: "Add your description here..."
    },
    supportedValidations: [],
    hasOptions: false,
    isMultiValue: false
  },
  {
    id: "divider",
    name: "Divider",
    category: "content",
    description: "Visual separator between sections",
    defaultProps: {
      style: "line"
    },
    supportedValidations: [],
    hasOptions: false,
    isMultiValue: false
  }
]

export function getFieldTypeById(id: string): FieldTypeDefinition | undefined {
  return FIELD_TYPES.find(type => type.id === id)
}

export function getFieldTypesByCategory(category: FieldTypeDefinition["category"]): FieldTypeDefinition[] {
  return FIELD_TYPES.filter(type => type.category === category)
}

export function getAllFieldTypes(): FieldTypeDefinition[] {
  return FIELD_TYPES
}

export function getFieldTypesWithOptions(): FieldTypeDefinition[] {
  return FIELD_TYPES.filter(type => type.hasOptions)
}

export function getMultiValueFieldTypes(): FieldTypeDefinition[] {
  return FIELD_TYPES.filter(type => type.isMultiValue)
}

export function getSupportedValidationsForFieldType(fieldTypeId: string): ValidationRule["type"][] {
  const fieldType = getFieldTypeById(fieldTypeId)
  return fieldType?.supportedValidations || []
}