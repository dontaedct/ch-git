import { FormField } from "@/components/form-builder/form-builder-engine"
import { TemplatePattern } from "./templates"

export interface ClientRequirement {
  id: string
  name: string
  description: string
  industry: string
  businessType: "B2B" | "B2C" | "B2B2C"
  priority: "high" | "medium" | "low"
  estimatedVolume: "low" | "medium" | "high"
  compliance?: string[]
  integrations?: string[]
}

export interface ClientTemplatePattern extends TemplatePattern {
  clientRequirement: ClientRequirement
  customFields?: FormField[]
  branding?: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    fontFamily?: string
  }
  businessLogic?: {
    autoResponders?: boolean
    notifications?: string[]
    followUpSequence?: boolean
    dataProcessing?: string[]
  }
}

export const CLIENT_REQUIREMENTS: ClientRequirement[] = [
  {
    id: "healthcare-intake",
    name: "Healthcare Patient Intake",
    description: "HIPAA-compliant patient registration and medical history forms",
    industry: "Healthcare",
    businessType: "B2C",
    priority: "high",
    estimatedVolume: "high",
    compliance: ["HIPAA", "ADA"],
    integrations: ["EHR Systems", "Insurance Verification", "Appointment Scheduling"]
  },
  {
    id: "real-estate-lead",
    name: "Real Estate Lead Capture",
    description: "Property inquiry and buyer/seller qualification forms",
    industry: "Real Estate",
    businessType: "B2C",
    priority: "high",
    estimatedVolume: "medium",
    compliance: ["RESPA", "Fair Housing"],
    integrations: ["CRM", "MLS", "Email Marketing"]
  },
  {
    id: "saas-onboarding",
    name: "SaaS User Onboarding",
    description: "User registration and setup forms for software platforms",
    industry: "Technology",
    businessType: "B2B",
    priority: "high",
    estimatedVolume: "high",
    compliance: ["GDPR", "CCPA"],
    integrations: ["Auth Systems", "Payment Processing", "Analytics"]
  },
  {
    id: "restaurant-reservation",
    name: "Restaurant Reservations",
    description: "Table booking and event planning forms",
    industry: "Hospitality",
    businessType: "B2C",
    priority: "medium",
    estimatedVolume: "high",
    compliance: ["ADA"],
    integrations: ["POS Systems", "Calendar", "SMS Notifications"]
  },
  {
    id: "legal-consultation",
    name: "Legal Consultation Intake",
    description: "Client intake and case evaluation forms",
    industry: "Legal",
    businessType: "B2C",
    priority: "high",
    estimatedVolume: "low",
    compliance: ["Attorney-Client Privilege", "State Bar Requirements"],
    integrations: ["Case Management", "Billing Systems", "Document Management"]
  },
  {
    id: "education-enrollment",
    name: "Educational Enrollment",
    description: "Student registration and course enrollment forms",
    industry: "Education",
    businessType: "B2C",
    priority: "high",
    estimatedVolume: "medium",
    compliance: ["FERPA", "ADA"],
    integrations: ["LMS", "Payment Processing", "Student Information Systems"]
  },
  {
    id: "financial-application",
    name: "Financial Service Applications",
    description: "Loan applications and financial service forms",
    industry: "Financial Services",
    businessType: "B2C",
    priority: "high",
    estimatedVolume: "medium",
    compliance: ["KYC", "AML", "GDPR", "SOX"],
    integrations: ["Credit Bureaus", "Banking APIs", "Identity Verification"]
  },
  {
    id: "ecommerce-checkout",
    name: "E-commerce Checkout",
    description: "Product ordering and payment processing forms",
    industry: "E-commerce",
    businessType: "B2C",
    priority: "high",
    estimatedVolume: "high",
    compliance: ["PCI DSS", "GDPR"],
    integrations: ["Payment Gateways", "Inventory Management", "Shipping APIs"]
  }
]

export const CLIENT_TEMPLATE_PATTERNS: ClientTemplatePattern[] = [
  {
    id: "healthcare-patient-intake",
    name: "Patient Registration & Medical History",
    description: "Comprehensive patient intake form with medical history and insurance information",
    categoryId: "registration",
    complexity: "complex",
    estimatedTimeToComplete: "10-15 minutes",
    tags: ["healthcare", "HIPAA", "medical", "patient-intake"],
    useCases: ["New patient registration", "Medical history collection", "Insurance verification"],
    clientRequirement: CLIENT_REQUIREMENTS[0],
    fields: [
      {
        id: "patient_name",
        type: "text",
        label: "Full Legal Name",
        placeholder: "Enter your full legal name",
        required: true,
        validation: [
          { type: "required", message: "Full name is required" },
          { type: "minLength", value: 2, message: "Name must be at least 2 characters" }
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
        id: "ssn",
        type: "text",
        label: "Social Security Number",
        placeholder: "XXX-XX-XXXX",
        required: true,
        validation: [
          { type: "required", message: "SSN is required" },
          { type: "pattern", value: "^\\d{3}-\\d{2}-\\d{4}$", message: "Please enter in format XXX-XX-XXXX" }
        ]
      },
      {
        id: "insurance_provider",
        type: "text",
        label: "Insurance Provider",
        placeholder: "Enter your insurance company name",
        required: true,
        validation: [
          { type: "required", message: "Insurance provider is required" }
        ]
      },
      {
        id: "policy_number",
        type: "text",
        label: "Policy Number",
        placeholder: "Enter your policy number",
        required: true,
        validation: [
          { type: "required", message: "Policy number is required" }
        ]
      },
      {
        id: "emergency_contact",
        type: "text",
        label: "Emergency Contact Name",
        placeholder: "Enter emergency contact name",
        required: true,
        validation: [
          { type: "required", message: "Emergency contact is required" }
        ]
      },
      {
        id: "emergency_phone",
        type: "phone",
        label: "Emergency Contact Phone",
        placeholder: "(555) 123-4567",
        required: true,
        validation: [
          { type: "required", message: "Emergency contact phone is required" }
        ]
      },
      {
        id: "current_medications",
        type: "textarea",
        label: "Current Medications",
        placeholder: "List all current medications and dosages...",
        required: false,
        validation: [
          { type: "maxLength", value: 1000, message: "Please limit to 1000 characters" }
        ]
      },
      {
        id: "allergies",
        type: "textarea",
        label: "Known Allergies",
        placeholder: "List any known allergies or sensitivities...",
        required: false,
        validation: [
          { type: "maxLength", value: 500, message: "Please limit to 500 characters" }
        ]
      },
      {
        id: "medical_history",
        type: "checkbox",
        label: "Medical History (check all that apply)",
        required: false,
        options: ["Diabetes", "Heart Disease", "High Blood Pressure", "Cancer", "Stroke", "Asthma", "Depression", "Anxiety", "Other"]
      }
    ],
    branding: {
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      fontFamily: "Inter"
    },
    businessLogic: {
      autoResponders: true,
      notifications: ["Patient", "Provider", "Insurance"],
      followUpSequence: true,
      dataProcessing: ["HIPAA Encryption", "Secure Storage", "Audit Logging"]
    }
  },
  {
    id: "real-estate-buyer-qualification",
    name: "Buyer Qualification & Property Interest",
    description: "Comprehensive buyer qualification form for real estate agents",
    categoryId: "contact",
    complexity: "medium",
    estimatedTimeToComplete: "8-10 minutes",
    tags: ["real-estate", "buyer-qualification", "property-search"],
    useCases: ["Buyer qualification", "Property matching", "Lead scoring"],
    clientRequirement: CLIENT_REQUIREMENTS[1],
    fields: [
      {
        id: "buyer_name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        validation: [
          { type: "required", message: "Name is required" }
        ]
      },
      {
        id: "buyer_email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        validation: [
          { type: "required", message: "Email is required" },
          { type: "email", message: "Please enter a valid email" }
        ]
      },
      {
        id: "buyer_phone",
        type: "phone",
        label: "Phone Number",
        placeholder: "(555) 123-4567",
        required: true,
        validation: [
          { type: "required", message: "Phone number is required" }
        ]
      },
      {
        id: "price_range",
        type: "select",
        label: "Price Range",
        placeholder: "Select your budget range",
        required: true,
        options: ["Under $200k", "$200k - $300k", "$300k - $500k", "$500k - $750k", "$750k - $1M", "Over $1M"],
        validation: [
          { type: "required", message: "Price range is required" }
        ]
      },
      {
        id: "property_type",
        type: "checkbox",
        label: "Property Types of Interest",
        required: true,
        options: ["Single Family Home", "Townhouse", "Condominium", "Multi-Family", "Land/Lot", "Commercial"],
        validation: [
          { type: "required", message: "Please select at least one property type" }
        ]
      },
      {
        id: "preferred_locations",
        type: "textarea",
        label: "Preferred Locations/Neighborhoods",
        placeholder: "List preferred areas, neighborhoods, or zip codes...",
        required: true,
        validation: [
          { type: "required", message: "Please specify preferred locations" }
        ]
      },
      {
        id: "timeline",
        type: "radio",
        label: "Timeline to Purchase",
        required: true,
        options: ["Immediately", "Within 3 months", "3-6 months", "6-12 months", "Just browsing"],
        validation: [
          { type: "required", message: "Please select your timeline" }
        ]
      },
      {
        id: "financing_status",
        type: "radio",
        label: "Financing Status",
        required: true,
        options: ["Pre-approved", "Need financing assistance", "Cash buyer", "Not sure"],
        validation: [
          { type: "required", message: "Please select your financing status" }
        ]
      },
      {
        id: "additional_requirements",
        type: "textarea",
        label: "Additional Requirements or Comments",
        placeholder: "Any specific requirements, preferences, or questions...",
        required: false,
        validation: [
          { type: "maxLength", value: 500, message: "Please limit to 500 characters" }
        ]
      }
    ],
    branding: {
      primaryColor: "#059669",
      secondaryColor: "#6b7280",
      fontFamily: "Roboto"
    },
    businessLogic: {
      autoResponders: true,
      notifications: ["Lead", "Agent", "Broker"],
      followUpSequence: true,
      dataProcessing: ["Lead Scoring", "CRM Integration", "Market Analysis"]
    }
  },
  {
    id: "saas-enterprise-onboarding",
    name: "Enterprise SaaS Onboarding",
    description: "Comprehensive enterprise customer onboarding and setup form",
    categoryId: "registration",
    complexity: "complex",
    estimatedTimeToComplete: "12-15 minutes",
    tags: ["saas", "enterprise", "onboarding", "B2B"],
    useCases: ["Enterprise onboarding", "Account setup", "Integration planning"],
    clientRequirement: CLIENT_REQUIREMENTS[2],
    fields: [
      {
        id: "company_name",
        type: "text",
        label: "Company Name",
        placeholder: "Enter your company name",
        required: true,
        validation: [
          { type: "required", message: "Company name is required" }
        ]
      },
      {
        id: "company_size",
        type: "select",
        label: "Company Size",
        placeholder: "Select number of employees",
        required: true,
        options: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
        validation: [
          { type: "required", message: "Company size is required" }
        ]
      },
      {
        id: "industry",
        type: "select",
        label: "Industry",
        placeholder: "Select your industry",
        required: true,
        options: ["Technology", "Healthcare", "Financial Services", "Manufacturing", "Retail", "Education", "Government", "Non-profit", "Other"],
        validation: [
          { type: "required", message: "Industry is required" }
        ]
      },
      {
        id: "primary_contact",
        type: "text",
        label: "Primary Contact Name",
        placeholder: "Enter primary contact name",
        required: true,
        validation: [
          { type: "required", message: "Primary contact is required" }
        ]
      },
      {
        id: "contact_email",
        type: "email",
        label: "Primary Contact Email",
        placeholder: "Enter contact email",
        required: true,
        validation: [
          { type: "required", message: "Contact email is required" },
          { type: "email", message: "Please enter a valid email" }
        ]
      },
      {
        id: "use_cases",
        type: "checkbox",
        label: "Primary Use Cases",
        required: true,
        options: ["Project Management", "Team Collaboration", "Customer Support", "Sales & CRM", "Marketing Automation", "Analytics & Reporting", "Document Management", "HR & Payroll"],
        validation: [
          { type: "required", message: "Please select at least one use case" }
        ]
      },
      {
        id: "integration_needs",
        type: "checkbox",
        label: "Integration Requirements",
        required: false,
        options: ["Salesforce", "HubSpot", "Slack", "Microsoft 365", "Google Workspace", "Jira", "Zendesk", "QuickBooks", "Custom API"]
      },
      {
        id: "expected_users",
        type: "number",
        label: "Expected Number of Users",
        placeholder: "Enter expected user count",
        required: true,
        validation: [
          { type: "required", message: "Expected user count is required" },
          { type: "number", message: "Please enter a valid number" }
        ]
      },
      {
        id: "implementation_timeline",
        type: "radio",
        label: "Preferred Implementation Timeline",
        required: true,
        options: ["ASAP", "Within 2 weeks", "Within 1 month", "Within 3 months", "Flexible"],
        validation: [
          { type: "required", message: "Please select implementation timeline" }
        ]
      },
      {
        id: "special_requirements",
        type: "textarea",
        label: "Special Requirements or Questions",
        placeholder: "Any specific requirements, compliance needs, or questions...",
        required: false,
        validation: [
          { type: "maxLength", value: 1000, message: "Please limit to 1000 characters" }
        ]
      }
    ],
    branding: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      fontFamily: "Inter"
    },
    businessLogic: {
      autoResponders: true,
      notifications: ["Customer Success", "Technical Team", "Sales"],
      followUpSequence: true,
      dataProcessing: ["Account Provisioning", "Integration Setup", "Training Scheduling"]
    }
  }
]

export function getClientTemplatesByIndustry(industry: string): ClientTemplatePattern[] {
  return CLIENT_TEMPLATE_PATTERNS.filter(template =>
    template.clientRequirement.industry.toLowerCase() === industry.toLowerCase()
  )
}

export function getClientTemplatesByBusinessType(businessType: ClientRequirement["businessType"]): ClientTemplatePattern[] {
  return CLIENT_TEMPLATE_PATTERNS.filter(template =>
    template.clientRequirement.businessType === businessType
  )
}

export function getClientTemplateById(id: string): ClientTemplatePattern | undefined {
  return CLIENT_TEMPLATE_PATTERNS.find(template => template.id === id)
}

export function getClientRequirementById(id: string): ClientRequirement | undefined {
  return CLIENT_REQUIREMENTS.find(req => req.id === id)
}

export function getAllClientTemplates(): ClientTemplatePattern[] {
  return CLIENT_TEMPLATE_PATTERNS
}

export function getAllClientRequirements(): ClientRequirement[] {
  return CLIENT_REQUIREMENTS
}

export function getIndustries(): string[] {
  return [...new Set(CLIENT_REQUIREMENTS.map(req => req.industry))]
}

export function getComplianceRequirements(): string[] {
  return [...new Set(CLIENT_REQUIREMENTS.flatMap(req => req.compliance || []))]
}

export function getIntegrationOptions(): string[] {
  return [...new Set(CLIENT_REQUIREMENTS.flatMap(req => req.integrations || []))]
}