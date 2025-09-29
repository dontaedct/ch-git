/**
 * Tenant Apps Types
 * Multi-tenant application management system types
 */

export interface TenantApp {
  id: string;
  name: string;
  slug: string;
  admin_email: string;
  template_id: string;
  status: 'sandbox' | 'production' | 'disabled';
  environment: 'development' | 'staging' | 'production';
  archived: boolean;
  
  // App configuration
  config: Record<string, any>;
  theme_config: Record<string, any>;
  
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  
  // App URLs
  admin_url: string | null;
  public_url: string | null;
  
  // Statistics
  submissions_count: number;
  documents_count: number;
  last_activity_at: string | null;
}

export interface CreateTenantAppRequest {
  name: string;
  admin_email: string;
  template_id?: string;
}

export interface DuplicateTenantAppRequest {
  source_app_id: string;
  new_name: string;
  new_admin_email: string;
}

export interface UpdateTenantAppRequest {
  id: string;
  name?: string;
  admin_email?: string;
  status?: 'sandbox' | 'production' | 'disabled';
  config?: Record<string, any>;
  theme_config?: Record<string, any>;
}

export interface TenantAppTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'lead-capture' | 'ecommerce' | 'consultation' | 'booking' | 'survey';
  features: string[];
  preview_url?: string;
  is_premium: boolean;
}

export interface TenantAppStats {
  total_apps: number;
  active_apps: number;
  sandbox_apps: number;
  production_apps: number;
  disabled_apps: number;
  total_submissions: number;
  total_documents: number;
  avg_delivery_time: string;
  system_health: number;
}

export interface TenantAppActivity {
  id: string;
  app_id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  type: 'creation' | 'update' | 'deployment' | 'submission' | 'document' | 'user_action';
}

// Available templates
export const TENANT_APP_TEMPLATES: TenantAppTemplate[] = [
  {
    id: 'lead-form-pdf',
    name: 'Lead Form + PDF Receipt',
    description: 'Simple lead capture form with automatic PDF generation and email delivery',
    icon: '📝',
    category: 'lead-capture',
    features: [
      'Contact form with validation',
      'Automatic PDF generation',
      'Email delivery system',
      'Admin dashboard',
      'Submission tracking'
    ],
    is_premium: false
  },
  {
    id: 'consultation-booking',
    name: 'Consultation Booking System',
    description: 'Complete booking system with calendar integration and automated confirmations',
    icon: '📅',
    category: 'booking',
    features: [
      'Calendar integration',
      'Booking form',
      'Email confirmations',
      'Admin management',
      'Payment integration ready'
    ],
    is_premium: true
  },
  {
    id: 'ecommerce-catalog',
    name: 'E-Commerce Product Catalog',
    description: 'Product showcase with inquiry forms and quote generation',
    icon: '🛍️',
    category: 'ecommerce',
    features: [
      'Product catalog',
      'Inquiry forms',
      'Quote generation',
      'Inventory tracking',
      'Customer management'
    ],
    is_premium: true
  },
  {
    id: 'survey-feedback',
    name: 'Survey & Feedback System',
    description: 'Multi-step surveys with analytics and report generation',
    icon: '📊',
    category: 'survey',
    features: [
      'Multi-step surveys',
      'Conditional logic',
      'Analytics dashboard',
      'Report generation',
      'Data export'
    ],
    is_premium: false
  },
  {
    id: 'consultation-ai',
    name: 'AI Consultation Generator',
    description: 'AI-powered consultation system with personalized recommendations',
    icon: '🤖',
    category: 'consultation',
    features: [
      'AI-powered recommendations',
      'Personalized reports',
      'Multi-step questionnaire',
      'PDF generation',
      'Email automation'
    ],
    is_premium: true
  },
  {
    id: 'universal-consultation',
    name: 'Universal Consultation Template (HT-030)',
    description: 'Complete universal consultation micro-app with AI-powered generation, white-labeling, and multi-industry support',
    icon: '🎯',
    category: 'consultation',
    features: [
      '3-page workflow (Landing → Questionnaire → Results)',
      'AI consultation generation with service recommendations',
      'Universal template system with industry customization',
      'White-labeling and client branding management',
      'Service package management system',
      'Automated email delivery and PDF generation',
      'Admin dashboard with client management',
      'Multi-tenant support',
      'Production-ready deployment pipeline'
    ],
    is_premium: true
  }
];

// App status configurations
export const APP_STATUS_CONFIG = {
  sandbox: {
    label: 'Sandbox Mode',
    description: 'Testing environment - not accessible to public',
    color: 'blue',
    icon: '🧪'
  },
  production: {
    label: 'Production',
    description: 'Live and accessible to users',
    color: 'green',
    icon: '🚀'
  },
  disabled: {
    label: 'Disabled',
    description: 'App is inactive and not accessible',
    color: 'red',
    icon: '⏸️'
  },
  archived: {
    label: 'Archived',
    description: 'App is archived and hidden from main view',
    color: 'gray',
    icon: '📦'
  }
} as const;

// Environment configurations
export const ENVIRONMENT_CONFIG = {
  development: {
    label: 'Development',
    description: 'Local development environment',
    color: 'yellow',
    icon: '💻'
  },
  staging: {
    label: 'Staging',
    description: 'Pre-production testing environment',
    color: 'orange',
    icon: '🔧'
  },
  production: {
    label: 'Production',
    description: 'Live production environment',
    color: 'green',
    icon: '🌐'
  }
} as const;
