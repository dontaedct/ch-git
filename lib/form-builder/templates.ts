import { FormTemplate, FormField } from "@/components/form-builder/form-builder-engine"

export interface FormTemplateCategory {
  id: string
  name: string
  description: string
  icon?: string
  color?: string
}

export interface TemplatePattern {
  id: string
  name: string
  description: string
  categoryId: string
  fields: FormField[]
  tags: string[]
  complexity: "simple" | "medium" | "complex"
  estimatedTimeToComplete: string
  useCases: string[]
  preview?: string
}

export const TEMPLATE_CATEGORIES: FormTemplateCategory[] = [
  {
    id: "contact",
    name: "Contact & Lead Generation",
    description: "Forms for capturing leads and contact information",
    icon: "user-plus",
    color: "blue"
  },
  {
    id: "feedback",
    name: "Feedback & Surveys",
    description: "Customer feedback and satisfaction surveys",
    icon: "message-square",
    color: "green"
  },
  {
    id: "registration",
    name: "Registration & Onboarding",
    description: "User registration and onboarding forms",
    icon: "user-check",
    color: "purple"
  },
  {
    id: "booking",
    name: "Booking & Appointments",
    description: "Service booking and appointment scheduling",
    icon: "calendar",
    color: "orange"
  },
  {
    id: "ecommerce",
    name: "E-commerce & Orders",
    description: "Product orders and e-commerce forms",
    icon: "shopping-cart",
    color: "red"
  },
  {
    id: "support",
    name: "Support & Helpdesk",
    description: "Customer support and ticket forms",
    icon: "help-circle",
    color: "yellow"
  },
  {
    id: "assessment",
    name: "Assessment & Evaluation",
    description: "Evaluation forms and assessments",
    icon: "clipboard-check",
    color: "indigo"
  },
  {
    id: "application",
    name: "Applications & Submissions",
    description: "Job applications and formal submissions",
    icon: "file-text",
    color: "gray"
  }
]

export const FORM_TEMPLATES: TemplatePattern[] = [
  {
    id: "contact-basic",
    name: "Basic Contact Form",
    description: "Simple contact form with essential fields",
    categoryId: "contact",
    complexity: "simple",
    estimatedTimeToComplete: "2 minutes",
    tags: ["contact", "lead-generation", "basic"],
    useCases: ["Website contact", "General inquiries", "Lead capture"],
    fields: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        validation: [
          { type: "required", message: "Name is required" },
          { type: "minLength", value: 2, message: "Name must be at least 2 characters" }
        ]
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        validation: [
          { type: "required", message: "Email is required" },
          { type: "email", message: "Please enter a valid email address" }
        ]
      },
      {
        id: "phone",
        type: "phone",
        label: "Phone Number",
        placeholder: "(555) 123-4567",
        required: false,
        validation: [
          { type: "pattern", value: "^[\\+]?[1-9][\\d\\s\\-\\(\\)]{8,15}$", message: "Please enter a valid phone number" }
        ]
      },
      {
        id: "subject",
        type: "text",
        label: "Subject",
        placeholder: "What is this regarding?",
        required: true,
        validation: [
          { type: "required", message: "Subject is required" }
        ]
      },
      {
        id: "message",
        type: "textarea",
        label: "Message",
        placeholder: "Tell us how we can help you...",
        required: true,
        validation: [
          { type: "required", message: "Message is required" },
          { type: "minLength", value: 10, message: "Message must be at least 10 characters" }
        ]
      }
    ]
  },
  {
    id: "feedback-satisfaction",
    name: "Customer Satisfaction Survey",
    description: "Comprehensive customer satisfaction feedback form",
    categoryId: "feedback",
    complexity: "medium",
    estimatedTimeToComplete: "5 minutes",
    tags: ["feedback", "satisfaction", "rating"],
    useCases: ["Post-purchase feedback", "Service evaluation", "Customer experience"],
    fields: [
      {
        id: "overall_satisfaction",
        type: "rating",
        label: "Overall Satisfaction",
        placeholder: "Rate your overall experience",
        required: true,
        options: ["5"],
        validation: [
          { type: "required", message: "Please rate your overall satisfaction" }
        ]
      },
      {
        id: "service_quality",
        type: "select",
        label: "Service Quality",
        placeholder: "How would you rate our service quality?",
        required: true,
        options: ["Excellent", "Good", "Average", "Poor", "Very Poor"],
        validation: [
          { type: "required", message: "Please rate the service quality" }
        ]
      },
      {
        id: "recommend",
        type: "radio",
        label: "Would you recommend us to others?",
        required: true,
        options: ["Definitely", "Probably", "Not sure", "Probably not", "Definitely not"],
        validation: [
          { type: "required", message: "Please let us know if you would recommend us" }
        ]
      },
      {
        id: "improvements",
        type: "checkbox",
        label: "What areas could we improve?",
        required: false,
        options: ["Response time", "Communication", "Product quality", "Pricing", "Website experience", "Customer service"]
      },
      {
        id: "comments",
        type: "textarea",
        label: "Additional Comments",
        placeholder: "Please share any additional feedback...",
        required: false,
        validation: [
          { type: "maxLength", value: 500, message: "Comments must be less than 500 characters" }
        ]
      }
    ]
  },
  {
    id: "user-registration",
    name: "User Registration Form",
    description: "Complete user registration with profile setup",
    categoryId: "registration",
    complexity: "medium",
    estimatedTimeToComplete: "7 minutes",
    tags: ["registration", "user-profile", "onboarding"],
    useCases: ["Website signup", "App registration", "Membership signup"],
    fields: [
      {
        id: "first_name",
        type: "text",
        label: "First Name",
        placeholder: "Enter your first name",
        required: true,
        validation: [
          { type: "required", message: "First name is required" },
          { type: "minLength", value: 2, message: "First name must be at least 2 characters" }
        ]
      },
      {
        id: "last_name",
        type: "text",
        label: "Last Name",
        placeholder: "Enter your last name",
        required: true,
        validation: [
          { type: "required", message: "Last name is required" },
          { type: "minLength", value: 2, message: "Last name must be at least 2 characters" }
        ]
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        validation: [
          { type: "required", message: "Email is required" },
          { type: "email", message: "Please enter a valid email address" }
        ]
      },
      {
        id: "date_of_birth",
        type: "date",
        label: "Date of Birth",
        placeholder: "Select your date of birth",
        required: true,
        validation: [
          { type: "required", message: "Date of birth is required" }
        ]
      },
      {
        id: "gender",
        type: "select",
        label: "Gender",
        placeholder: "Select your gender",
        required: false,
        options: ["Male", "Female", "Non-binary", "Prefer not to say"]
      },
      {
        id: "interests",
        type: "checkbox",
        label: "Areas of Interest",
        required: false,
        options: ["Technology", "Business", "Health", "Education", "Entertainment", "Sports", "Travel", "Food"]
      },
      {
        id: "newsletter",
        type: "switch",
        label: "Subscribe to Newsletter",
        required: false
      },
      {
        id: "terms",
        type: "checkbox",
        label: "I agree to the Terms of Service and Privacy Policy",
        required: true,
        validation: [
          { type: "required", message: "You must agree to the terms and conditions" }
        ]
      }
    ]
  },
  {
    id: "appointment-booking",
    name: "Appointment Booking Form",
    description: "Service appointment scheduling form",
    categoryId: "booking",
    complexity: "medium",
    estimatedTimeToComplete: "4 minutes",
    tags: ["booking", "appointment", "scheduling"],
    useCases: ["Medical appointments", "Consultations", "Service bookings"],
    fields: [
      {
        id: "service_type",
        type: "select",
        label: "Service Type",
        placeholder: "Select the service you need",
        required: true,
        options: ["General Consultation", "Specialist Consultation", "Follow-up", "Emergency", "Routine Check-up"],
        validation: [
          { type: "required", message: "Please select a service type" }
        ]
      },
      {
        id: "preferred_date",
        type: "date",
        label: "Preferred Date",
        placeholder: "Select your preferred date",
        required: true,
        validation: [
          { type: "required", message: "Please select a preferred date" }
        ]
      },
      {
        id: "preferred_time",
        type: "time",
        label: "Preferred Time",
        placeholder: "Select your preferred time",
        required: true,
        validation: [
          { type: "required", message: "Please select a preferred time" }
        ]
      },
      {
        id: "client_name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        validation: [
          { type: "required", message: "Name is required" }
        ]
      },
      {
        id: "client_email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        validation: [
          { type: "required", message: "Email is required" },
          { type: "email", message: "Please enter a valid email address" }
        ]
      },
      {
        id: "client_phone",
        type: "phone",
        label: "Phone Number",
        placeholder: "(555) 123-4567",
        required: true,
        validation: [
          { type: "required", message: "Phone number is required" }
        ]
      },
      {
        id: "special_requests",
        type: "textarea",
        label: "Special Requests or Notes",
        placeholder: "Any special requirements or additional information...",
        required: false,
        validation: [
          { type: "maxLength", value: 300, message: "Notes must be less than 300 characters" }
        ]
      }
    ]
  },
  {
    id: "product-order",
    name: "Product Order Form",
    description: "E-commerce product ordering form",
    categoryId: "ecommerce",
    complexity: "complex",
    estimatedTimeToComplete: "8 minutes",
    tags: ["ecommerce", "order", "payment"],
    useCases: ["Online orders", "Product purchases", "Custom orders"],
    fields: [
      {
        id: "product_selection",
        type: "select",
        label: "Product",
        placeholder: "Select a product",
        required: true,
        options: ["Basic Package - $99", "Professional Package - $199", "Enterprise Package - $399", "Custom Solution - Contact Us"],
        validation: [
          { type: "required", message: "Please select a product" }
        ]
      },
      {
        id: "quantity",
        type: "number",
        label: "Quantity",
        placeholder: "Enter quantity",
        required: true,
        validation: [
          { type: "required", message: "Quantity is required" },
          { type: "number", message: "Please enter a valid number" }
        ]
      },
      {
        id: "customer_name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        validation: [
          { type: "required", message: "Name is required" }
        ]
      },
      {
        id: "customer_email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        validation: [
          { type: "required", message: "Email is required" },
          { type: "email", message: "Please enter a valid email address" }
        ]
      },
      {
        id: "billing_address",
        type: "address",
        label: "Billing Address",
        placeholder: "Enter your billing address",
        required: true,
        validation: [
          { type: "required", message: "Billing address is required" }
        ]
      },
      {
        id: "shipping_same",
        type: "switch",
        label: "Shipping address same as billing",
        required: false
      },
      {
        id: "special_instructions",
        type: "textarea",
        label: "Special Instructions",
        placeholder: "Any special delivery instructions...",
        required: false,
        validation: [
          { type: "maxLength", value: 200, message: "Instructions must be less than 200 characters" }
        ]
      }
    ]
  },
  {
    id: "support-ticket",
    name: "Support Ticket Form",
    description: "Customer support request form",
    categoryId: "support",
    complexity: "medium",
    estimatedTimeToComplete: "5 minutes",
    tags: ["support", "helpdesk", "ticket"],
    useCases: ["Technical support", "Bug reports", "Feature requests"],
    fields: [
      {
        id: "issue_type",
        type: "select",
        label: "Issue Type",
        placeholder: "Select the type of issue",
        required: true,
        options: ["Technical Issue", "Billing Question", "Feature Request", "Bug Report", "Account Access", "General Question"],
        validation: [
          { type: "required", message: "Please select an issue type" }
        ]
      },
      {
        id: "priority",
        type: "radio",
        label: "Priority Level",
        required: true,
        options: ["Low", "Medium", "High", "Critical"],
        validation: [
          { type: "required", message: "Please select a priority level" }
        ]
      },
      {
        id: "subject",
        type: "text",
        label: "Subject",
        placeholder: "Brief description of the issue",
        required: true,
        validation: [
          { type: "required", message: "Subject is required" },
          { type: "minLength", value: 5, message: "Subject must be at least 5 characters" }
        ]
      },
      {
        id: "description",
        type: "textarea",
        label: "Detailed Description",
        placeholder: "Please provide a detailed description of the issue...",
        required: true,
        validation: [
          { type: "required", message: "Description is required" },
          { type: "minLength", value: 20, message: "Description must be at least 20 characters" }
        ]
      },
      {
        id: "steps_to_reproduce",
        type: "textarea",
        label: "Steps to Reproduce (if applicable)",
        placeholder: "1. First step\n2. Second step\n3. Result",
        required: false,
        validation: [
          { type: "maxLength", value: 500, message: "Steps must be less than 500 characters" }
        ]
      },
      {
        id: "attachments",
        type: "file",
        label: "Attachments",
        placeholder: "Upload screenshots or relevant files",
        required: false,
        options: ["image/*,.pdf,.doc,.docx"]
      }
    ]
  }
]

export function getTemplatesByCategory(categoryId: string): TemplatePattern[] {
  return FORM_TEMPLATES.filter(template => template.categoryId === categoryId)
}

export function getTemplateById(id: string): TemplatePattern | undefined {
  return FORM_TEMPLATES.find(template => template.id === id)
}

export function getAllTemplates(): TemplatePattern[] {
  return FORM_TEMPLATES
}

export function getTemplatesByComplexity(complexity: TemplatePattern["complexity"]): TemplatePattern[] {
  return FORM_TEMPLATES.filter(template => template.complexity === complexity)
}

export function getTemplatesByTags(tags: string[]): TemplatePattern[] {
  return FORM_TEMPLATES.filter(template =>
    tags.some(tag => template.tags.includes(tag))
  )
}

export function searchTemplates(query: string): TemplatePattern[] {
  const searchQuery = query.toLowerCase()
  return FORM_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(searchQuery) ||
    template.description.toLowerCase().includes(searchQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
    template.useCases.some(useCase => useCase.toLowerCase().includes(searchQuery))
  )
}

export function convertTemplateToFormTemplate(template: TemplatePattern): FormTemplate {
  return {
    id: `template_${template.id}_${Date.now()}`,
    name: template.name,
    description: template.description,
    fields: template.fields.map(field => ({ ...field })),
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function getCategoryById(id: string): FormTemplateCategory | undefined {
  return TEMPLATE_CATEGORIES.find(category => category.id === id)
}

export function getAllCategories(): FormTemplateCategory[] {
  return TEMPLATE_CATEGORIES
}