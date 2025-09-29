/**
 * Industry-Specific Template Configurations
 *
 * Comprehensive industry configurations for the universal consultation template,
 * including industry-specific questionnaires, service packages, and content.
 */

import type { UniversalTemplateConfig } from './universal-config';
import type { QuestionnaireConfig } from '@/components/questionnaire-engine';
import type { ServicePackage } from '@/lib/ai/consultation-generator';
import { ENHANCED_CONSULTATION_QUESTIONNAIRE } from '@/lib/consultation/questionnaire-config';

export interface IndustryConfig {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  target_segments: string[];

  // Industry-specific customizations
  questionnaire_modifications: QuestionnaireModifications;
  default_service_packages: ServicePackage[];
  content_templates: IndustryContentTemplates;
  ai_prompts: IndustryAIPrompts;

  // Business context
  typical_challenges: string[];
  success_metrics: string[];
  regulatory_considerations: string[];

  // Template preferences
  preferred_colors: string[];
  recommended_features: string[];
  compliance_requirements: string[];
}

export interface QuestionnaireModifications {
  additional_questions: any[];
  modified_questions: Record<string, any>;
  removed_questions: string[];
  question_order_changes: Record<string, number>;
  conditional_logic_updates: any[];
}

export interface IndustryContentTemplates {
  hero_titles: string[];
  value_propositions: string[];
  service_descriptions: Record<string, string>;
  case_studies: Array<{
    title: string;
    company: string;
    challenge: string;
    solution: string;
    results: string;
  }>;
  testimonials: Array<{
    name: string;
    company: string;
    role: string;
    text: string;
  }>;
}

export interface IndustryAIPrompts {
  consultation_system_prompt: string;
  service_matching_prompt: string;
  recommendation_tone: string;
  industry_specific_context: string;
}

/**
 * Technology & SaaS Industry Configuration
 */
export const TECH_SAAS_CONFIG: IndustryConfig = {
  id: 'tech-saas',
  name: 'Technology & SaaS',
  description: 'Software companies, SaaS platforms, and technology startups',
  keywords: ['technology', 'saas', 'software', 'digital', 'platform', 'app', 'tech startup'],
  target_segments: ['B2B SaaS', 'Consumer Apps', 'Enterprise Software', 'AI/ML Companies'],

  questionnaire_modifications: {
    additional_questions: [
      {
        id: 'tech-stack',
        text: 'What is your primary technology stack?',
        type: 'chips-multi',
        options: [
          { value: 'javascript', label: 'JavaScript/Node.js' },
          { value: 'python', label: 'Python' },
          { value: 'java', label: 'Java' },
          { value: 'dotnet', label: '.NET' },
          { value: 'php', label: 'PHP' },
          { value: 'react', label: 'React/Next.js' },
          { value: 'aws', label: 'AWS' },
          { value: 'azure', label: 'Microsoft Azure' },
          { value: 'gcp', label: 'Google Cloud' }
        ]
      },
      {
        id: 'deployment-model',
        text: 'What is your software deployment model?',
        type: 'select',
        options: [
          { value: 'saas', label: 'Software as a Service (SaaS)' },
          { value: 'on-premise', label: 'On-Premise Installation' },
          { value: 'hybrid', label: 'Hybrid Cloud' },
          { value: 'marketplace', label: 'App Marketplace' },
          { value: 'api-first', label: 'API-First Platform' }
        ]
      },
      {
        id: 'user-base-size',
        text: 'What is your current active user base?',
        type: 'select',
        options: [
          { value: 'pre-launch', label: 'Pre-launch' },
          { value: 'under-100', label: 'Under 100 users' },
          { value: '100-1k', label: '100 - 1,000 users' },
          { value: '1k-10k', label: '1,000 - 10,000 users' },
          { value: '10k-100k', label: '10,000 - 100,000 users' },
          { value: 'over-100k', label: 'Over 100,000 users' }
        ]
      }
    ],
    modified_questions: {
      'biggest-challenges': {
        additional_options: [
          { value: 'technical-debt', label: 'Technical Debt Management' },
          { value: 'scalability', label: 'Platform Scalability' },
          { value: 'security-compliance', label: 'Security & Compliance' },
          { value: 'user-adoption', label: 'User Adoption & Retention' },
          { value: 'product-market-fit', label: 'Product-Market Fit' },
          { value: 'funding-runway', label: 'Funding & Runway Management' }
        ]
      }
    },
    removed_questions: [],
    question_order_changes: {},
    conditional_logic_updates: []
  },

  default_service_packages: [
    {
      id: 'tech-product-strategy',
      title: 'Product Strategy & Roadmap',
      description: 'Strategic product planning and technical roadmap development for SaaS companies',
      category: 'strategy',
      tier: 'foundation',
      price_band: '$$',
      timeline: '3-4 weeks',
      includes: [
        'Product-market fit analysis',
        'Technical architecture review',
        'Feature prioritization framework',
        'Go-to-market strategy',
        'Competitive positioning'
      ],
      industry_tags: ['tech-saas', 'software', 'startup'],
      eligibility_criteria: {
        'business-type': ['saas', 'technology'],
        'company-size': ['startup', 'small', 'medium']
      },
      content: {
        what_you_get: 'Comprehensive product strategy with technical roadmap and market positioning',
        why_this_fits: 'Perfect for SaaS companies looking to accelerate product development and market entry',
        timeline: '3-4 weeks with iterative feedback and technical validation',
        next_steps: 'Product discovery session and technical architecture assessment'
      }
    },
    {
      id: 'tech-scaling-ops',
      title: 'Technology Scaling & Operations',
      description: 'Infrastructure scaling, DevOps optimization, and operational excellence for growing tech companies',
      category: 'technology',
      tier: 'growth',
      price_band: '$$$',
      timeline: '6-8 weeks',
      includes: [
        'Infrastructure scaling assessment',
        'DevOps pipeline optimization',
        'Security & compliance framework',
        'Performance monitoring setup',
        'Team scaling strategy'
      ],
      industry_tags: ['tech-saas', 'software', 'platform'],
      eligibility_criteria: {
        'user-base-size': ['1k-10k', '10k-100k', 'over-100k'],
        'primary-goals': ['scaling', 'efficiency']
      },
      content: {
        what_you_get: 'Complete scaling framework with infrastructure optimization and operational processes',
        why_this_fits: 'Essential for tech companies experiencing rapid growth and scaling challenges',
        timeline: '6-8 weeks with phased implementation and monitoring',
        next_steps: 'Technical infrastructure audit and performance baseline assessment'
      }
    }
  ],

  content_templates: {
    hero_titles: [
      'Scale Your SaaS Business with Strategic Technology Consulting',
      'Accelerate Product Growth with Expert Tech Strategy',
      'Transform Your Software Vision into Market Reality',
      'Optimize Your Tech Stack for Exponential Growth'
    ],
    value_propositions: [
      'Product-market fit validation and optimization',
      'Scalable architecture and infrastructure planning',
      'DevOps and deployment automation',
      'Security and compliance frameworks',
      'Performance optimization and monitoring',
      'Technical debt reduction strategies'
    ],
    service_descriptions: {
      'product-strategy': 'Strategic product planning with technical validation',
      'architecture-review': 'Scalable system design and technology assessment',
      'devops-optimization': 'CI/CD pipeline and deployment automation',
      'security-audit': 'Security assessment and compliance framework'
    },
    case_studies: [
      {
        title: 'SaaS Platform Scaling Success',
        company: 'TechFlow Analytics',
        challenge: 'Platform couldn\'t handle 10x user growth, performance issues affecting customer retention',
        solution: 'Infrastructure redesign, microservices architecture, automated scaling',
        results: '99.9% uptime, 300% faster response times, successful scale to 50K+ users'
      }
    ],
    testimonials: [
      {
        name: 'Sarah Chen',
        company: 'CloudSync Solutions',
        role: 'CTO',
        text: 'The technical strategy and scaling guidance helped us avoid major architectural pitfalls. Our platform now handles 10x the load with better performance.'
      }
    ]
  },

  ai_prompts: {
    consultation_system_prompt: 'You are a technology and SaaS business consultant specializing in product strategy, technical architecture, and scaling operations. Focus on technical feasibility, market validation, and scalable growth strategies.',
    service_matching_prompt: 'Match services based on technical complexity, user base size, development stage, and scaling requirements. Prioritize technical debt reduction and infrastructure optimization for growing platforms.',
    recommendation_tone: 'Technical but accessible, focusing on practical implementation and measurable outcomes',
    industry_specific_context: 'Consider technical architecture, user acquisition costs, churn rates, product-market fit metrics, and development velocity when making recommendations.'
  },

  typical_challenges: [
    'Product-market fit validation',
    'Technical debt management',
    'Platform scalability issues',
    'User acquisition and retention',
    'Security and compliance',
    'Team scaling and hiring',
    'Feature prioritization',
    'Performance optimization'
  ],

  success_metrics: [
    'Monthly Recurring Revenue (MRR)',
    'Customer Acquisition Cost (CAC)',
    'Customer Lifetime Value (LTV)',
    'Churn Rate',
    'Daily/Monthly Active Users',
    'Platform Uptime',
    'Feature Adoption Rate',
    'Development Velocity'
  ],

  regulatory_considerations: [
    'GDPR compliance for user data',
    'SOC 2 certification',
    'PCI DSS for payment processing',
    'HIPAA for healthcare applications',
    'Industry-specific regulations'
  ],

  preferred_colors: ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4'],
  recommended_features: [
    'analytics_tracking',
    'crm_integration',
    'email_automation',
    'calendar_booking'
  ],
  compliance_requirements: ['data_privacy', 'security_audit', 'backup_recovery']
};

/**
 * Healthcare Industry Configuration
 */
export const HEALTHCARE_CONFIG: IndustryConfig = {
  id: 'healthcare',
  name: 'Healthcare & Medical',
  description: 'Healthcare providers, medical practices, and health technology companies',
  keywords: ['healthcare', 'medical', 'hospital', 'clinic', 'telemedicine', 'health tech'],
  target_segments: ['Medical Practices', 'Hospitals', 'Health Tech', 'Telemedicine'],

  questionnaire_modifications: {
    additional_questions: [
      {
        id: 'practice-type',
        text: 'What type of healthcare practice do you operate?',
        type: 'select',
        options: [
          { value: 'primary-care', label: 'Primary Care' },
          { value: 'specialty-practice', label: 'Specialty Practice' },
          { value: 'hospital-system', label: 'Hospital System' },
          { value: 'urgent-care', label: 'Urgent Care' },
          { value: 'telemedicine', label: 'Telemedicine Platform' },
          { value: 'health-tech', label: 'Health Technology' }
        ]
      },
      {
        id: 'patient-volume',
        text: 'What is your monthly patient volume?',
        type: 'select',
        options: [
          { value: 'under-100', label: 'Under 100 patients' },
          { value: '100-500', label: '100-500 patients' },
          { value: '500-1000', label: '500-1,000 patients' },
          { value: '1000-5000', label: '1,000-5,000 patients' },
          { value: 'over-5000', label: 'Over 5,000 patients' }
        ]
      },
      {
        id: 'compliance-needs',
        text: 'Which compliance requirements apply to your practice?',
        type: 'chips-multi',
        options: [
          { value: 'hipaa', label: 'HIPAA' },
          { value: 'hitech', label: 'HITECH' },
          { value: 'gdpr', label: 'GDPR' },
          { value: 'fda', label: 'FDA Regulations' },
          { value: 'joint-commission', label: 'Joint Commission' },
          { value: 'cms', label: 'CMS Requirements' }
        ]
      }
    ],
    modified_questions: {
      'biggest-challenges': {
        additional_options: [
          { value: 'patient-scheduling', label: 'Patient Scheduling & Flow' },
          { value: 'insurance-billing', label: 'Insurance & Billing' },
          { value: 'ehr-optimization', label: 'EHR System Optimization' },
          { value: 'telehealth-adoption', label: 'Telehealth Implementation' },
          { value: 'staff-burnout', label: 'Staff Burnout & Retention' },
          { value: 'quality-metrics', label: 'Quality Metrics & Reporting' }
        ]
      }
    },
    removed_questions: [],
    question_order_changes: {},
    conditional_logic_updates: []
  },

  default_service_packages: [
    {
      id: 'healthcare-digital-transformation',
      title: 'Healthcare Digital Transformation',
      description: 'Comprehensive digital modernization for healthcare practices and organizations',
      category: 'technology',
      tier: 'growth',
      price_band: '$$$',
      timeline: '8-12 weeks',
      includes: [
        'EHR system optimization',
        'Telehealth platform implementation',
        'Patient portal enhancement',
        'Workflow automation',
        'HIPAA compliance audit',
        'Staff training program'
      ],
      industry_tags: ['healthcare', 'medical', 'digital-health'],
      eligibility_criteria: {
        'practice-type': ['primary-care', 'specialty-practice', 'hospital-system'],
        'patient-volume': ['500-1000', '1000-5000', 'over-5000']
      },
      content: {
        what_you_get: 'Complete digital transformation with HIPAA-compliant systems and optimized workflows',
        why_this_fits: 'Essential for healthcare practices modernizing patient care and operational efficiency',
        timeline: '8-12 weeks with phased implementation to minimize disruption',
        next_steps: 'Healthcare technology assessment and compliance review'
      }
    },
    {
      id: 'practice-operations-optimization',
      title: 'Practice Operations Optimization',
      description: 'Operational efficiency and patient experience optimization for medical practices',
      category: 'operations',
      tier: 'foundation',
      price_band: '$$',
      timeline: '4-6 weeks',
      includes: [
        'Patient flow analysis',
        'Scheduling optimization',
        'Revenue cycle improvement',
        'Quality metrics framework',
        'Staff productivity enhancement'
      ],
      industry_tags: ['healthcare', 'medical-practice', 'operations'],
      eligibility_criteria: {
        'practice-type': ['primary-care', 'specialty-practice', 'urgent-care'],
        'primary-goals': ['efficiency', 'revenue']
      },
      content: {
        what_you_get: 'Streamlined operations with improved patient experience and revenue optimization',
        why_this_fits: 'Perfect for practices looking to improve efficiency and patient satisfaction',
        timeline: '4-6 weeks with immediate impact on daily operations',
        next_steps: 'Practice assessment and workflow analysis'
      }
    }
  ],

  content_templates: {
    hero_titles: [
      'Transform Your Healthcare Practice with Strategic Consulting',
      'Optimize Patient Care Through Operational Excellence',
      'Modernize Your Medical Practice for Better Outcomes',
      'Healthcare Innovation Consulting for Growing Practices'
    ],
    value_propositions: [
      'HIPAA-compliant digital transformation',
      'Patient experience optimization',
      'Revenue cycle improvement',
      'EHR and workflow optimization',
      'Telehealth implementation',
      'Quality metrics and reporting'
    ],
    service_descriptions: {
      'digital-transformation': 'Complete modernization with HIPAA compliance',
      'operations-optimization': 'Streamlined workflows and improved efficiency',
      'telehealth-setup': 'Secure telehealth platform implementation',
      'revenue-cycle': 'Billing and revenue optimization'
    },
    case_studies: [
      {
        title: 'Primary Care Practice Modernization',
        company: 'Valley Medical Group',
        challenge: 'Outdated systems causing patient delays and staff frustration, declining satisfaction scores',
        solution: 'EHR optimization, patient portal implementation, workflow redesign',
        results: '40% reduction in wait times, 95% patient satisfaction, 25% revenue increase'
      }
    ],
    testimonials: [
      {
        name: 'Dr. Michael Rodriguez',
        company: 'Coastal Family Medicine',
        role: 'Medical Director',
        text: 'The operational improvements transformed our practice. Patient satisfaction is at an all-time high and our staff is much more efficient.'
      }
    ]
  },

  ai_prompts: {
    consultation_system_prompt: 'You are a healthcare business consultant specializing in medical practice optimization, digital health transformation, and healthcare operations. Focus on patient outcomes, operational efficiency, and regulatory compliance.',
    service_matching_prompt: 'Match services based on practice type, patient volume, compliance needs, and current technology adoption. Prioritize patient safety, HIPAA compliance, and operational efficiency.',
    recommendation_tone: 'Professional and empathetic, emphasizing patient care improvements and practical healthcare solutions',
    industry_specific_context: 'Consider patient safety, regulatory compliance, clinical workflows, revenue cycle management, and healthcare quality metrics when making recommendations.'
  },

  typical_challenges: [
    'Patient scheduling and flow',
    'EHR system inefficiencies',
    'Insurance and billing complexity',
    'Staff burnout and retention',
    'Telehealth adoption',
    'Quality metrics reporting',
    'Regulatory compliance',
    'Revenue cycle optimization'
  ],

  success_metrics: [
    'Patient Satisfaction Scores',
    'Provider Efficiency Metrics',
    'Revenue per Patient',
    'Days in Accounts Receivable',
    'No-Show Rates',
    'Patient Wait Times',
    'Clinical Quality Measures',
    'Staff Retention Rate'
  ],

  regulatory_considerations: [
    'HIPAA Privacy and Security Rules',
    'HITECH Act compliance',
    'FDA medical device regulations',
    'CMS quality reporting',
    'State medical board requirements',
    'Joint Commission standards'
  ],

  preferred_colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
  recommended_features: [
    'pdf_generation',
    'email_automation',
    'calendar_booking',
    'analytics_tracking'
  ],
  compliance_requirements: ['hipaa_compliance', 'data_encryption', 'audit_logging']
};

/**
 * Professional Services Industry Configuration
 */
export const PROFESSIONAL_SERVICES_CONFIG: IndustryConfig = {
  id: 'professional-services',
  name: 'Professional Services',
  description: 'Law firms, accounting practices, consulting firms, and other professional service providers',
  keywords: ['legal', 'accounting', 'consulting', 'advisory', 'professional services', 'law firm'],
  target_segments: ['Law Firms', 'Accounting Firms', 'Management Consulting', 'Advisory Services'],

  questionnaire_modifications: {
    additional_questions: [
      {
        id: 'service-area',
        text: 'What is your primary service area?',
        type: 'select',
        options: [
          { value: 'legal-services', label: 'Legal Services' },
          { value: 'accounting-tax', label: 'Accounting & Tax' },
          { value: 'management-consulting', label: 'Management Consulting' },
          { value: 'financial-advisory', label: 'Financial Advisory' },
          { value: 'hr-consulting', label: 'HR Consulting' },
          { value: 'it-consulting', label: 'IT Consulting' }
        ]
      },
      {
        id: 'client-base-type',
        text: 'What type of clients do you primarily serve?',
        type: 'chips-multi',
        options: [
          { value: 'small-business', label: 'Small Businesses' },
          { value: 'mid-market', label: 'Mid-Market Companies' },
          { value: 'enterprise', label: 'Enterprise Clients' },
          { value: 'individuals', label: 'Individual Clients' },
          { value: 'nonprofits', label: 'Non-Profit Organizations' },
          { value: 'government', label: 'Government Entities' }
        ]
      },
      {
        id: 'billing-model',
        text: 'What is your primary billing model?',
        type: 'select',
        options: [
          { value: 'hourly', label: 'Hourly Billing' },
          { value: 'project-based', label: 'Project-Based Fees' },
          { value: 'retainer', label: 'Monthly Retainer' },
          { value: 'contingency', label: 'Contingency Fees' },
          { value: 'value-based', label: 'Value-Based Pricing' },
          { value: 'hybrid', label: 'Hybrid Model' }
        ]
      }
    ],
    modified_questions: {
      'biggest-challenges': {
        additional_options: [
          { value: 'client-acquisition', label: 'Client Acquisition & Retention' },
          { value: 'billing-collections', label: 'Billing & Collections' },
          { value: 'time-tracking', label: 'Time Tracking & Productivity' },
          { value: 'case-management', label: 'Case/Project Management' },
          { value: 'referral-network', label: 'Referral Network Development' },
          { value: 'practice-automation', label: 'Practice Automation' }
        ]
      }
    },
    removed_questions: [],
    question_order_changes: {},
    conditional_logic_updates: []
  },

  default_service_packages: [
    {
      id: 'practice-growth-strategy',
      title: 'Professional Practice Growth Strategy',
      description: 'Comprehensive growth strategy and business development for professional service firms',
      category: 'strategy',
      tier: 'foundation',
      price_band: '$$',
      timeline: '4-6 weeks',
      includes: [
        'Practice assessment and positioning',
        'Client acquisition strategy',
        'Service line optimization',
        'Referral network development',
        'Marketing and business development plan'
      ],
      industry_tags: ['professional-services', 'legal', 'accounting', 'consulting'],
      eligibility_criteria: {
        'service-area': ['legal-services', 'accounting-tax', 'management-consulting'],
        'primary-goals': ['growth', 'revenue']
      },
      content: {
        what_you_get: 'Strategic growth plan with actionable client acquisition and business development strategies',
        why_this_fits: 'Perfect for professional service firms looking to accelerate growth and build market presence',
        timeline: '4-6 weeks with practical implementation roadmap',
        next_steps: 'Practice assessment and market positioning analysis'
      }
    },
    {
      id: 'practice-operations-efficiency',
      title: 'Practice Operations & Efficiency',
      description: 'Operational optimization and practice management enhancement for professional services',
      category: 'operations',
      tier: 'growth',
      price_band: '$$$',
      timeline: '6-8 weeks',
      includes: [
        'Workflow optimization and automation',
        'Time tracking and billing efficiency',
        'Client management system enhancement',
        'Document management and collaboration',
        'Performance metrics and reporting'
      ],
      industry_tags: ['professional-services', 'practice-management', 'efficiency'],
      eligibility_criteria: {
        'company-size': ['small', 'medium', 'large'],
        'primary-goals': ['efficiency', 'automation']
      },
      content: {
        what_you_get: 'Streamlined operations with automated workflows and improved productivity metrics',
        why_this_fits: 'Essential for growing practices looking to scale efficiently and improve profitability',
        timeline: '6-8 weeks with phased implementation and training',
        next_steps: 'Operations audit and workflow analysis'
      }
    }
  ],

  content_templates: {
    hero_titles: [
      'Grow Your Professional Practice with Strategic Consulting',
      'Optimize Operations for Increased Profitability',
      'Transform Your Professional Services Firm',
      'Strategic Guidance for Professional Service Excellence'
    ],
    value_propositions: [
      'Client acquisition and retention strategies',
      'Practice management optimization',
      'Billing and revenue cycle improvement',
      'Workflow automation and efficiency',
      'Referral network development',
      'Performance metrics and analytics'
    ],
    service_descriptions: {
      'growth-strategy': 'Comprehensive business development and client acquisition',
      'operations-optimization': 'Streamlined workflows and practice management',
      'billing-efficiency': 'Time tracking and revenue optimization',
      'automation-setup': 'Practice automation and digital transformation'
    },
    case_studies: [
      {
        title: 'Law Firm Revenue Growth Success',
        company: 'Harrison & Associates',
        challenge: 'Stagnant revenue growth, inefficient billing processes, low client retention',
        solution: 'Business development strategy, billing automation, client experience enhancement',
        results: '45% revenue increase, 30% improvement in billing efficiency, 90% client retention'
      }
    ],
    testimonials: [
      {
        name: 'Jennifer Walsh',
        company: 'Walsh Accounting Group',
        role: 'Managing Partner',
        text: 'The strategic guidance helped us double our client base while improving operational efficiency. Our practice has never been stronger.'
      }
    ]
  },

  ai_prompts: {
    consultation_system_prompt: 'You are a professional services business consultant specializing in law firms, accounting practices, and consulting firms. Focus on client acquisition, practice management, and operational efficiency.',
    service_matching_prompt: 'Match services based on practice size, service area, client base type, and billing model. Prioritize revenue growth, operational efficiency, and client relationship management.',
    recommendation_tone: 'Professional and authoritative, emphasizing business development and practice optimization',
    industry_specific_context: 'Consider billable hour optimization, client retention, referral generation, regulatory requirements, and practice profitability when making recommendations.'
  },

  typical_challenges: [
    'Client acquisition and retention',
    'Billing and collections efficiency',
    'Time tracking and productivity',
    'Case/project management',
    'Referral network development',
    'Practice automation',
    'Competitive differentiation',
    'Fee structure optimization'
  ],

  success_metrics: [
    'Revenue Growth Rate',
    'Billable Hour Utilization',
    'Client Retention Rate',
    'Average Fee Per Client',
    'Collection Rate',
    'Referral Conversion Rate',
    'Practice Profitability',
    'Client Satisfaction Score'
  ],

  regulatory_considerations: [
    'Professional licensing requirements',
    'Client confidentiality rules',
    'Trust accounting regulations',
    'Continuing education requirements',
    'Professional liability insurance',
    'Bar association compliance'
  ],

  preferred_colors: ['#1E40AF', '#7C3AED', '#DC2626', '#059669'],
  recommended_features: [
    'pdf_generation',
    'email_automation',
    'calendar_booking',
    'crm_integration'
  ],
  compliance_requirements: ['client_confidentiality', 'document_retention', 'trust_accounting']
};

/**
 * Industry Configuration Registry
 */
export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  'tech-saas': TECH_SAAS_CONFIG,
  'healthcare': HEALTHCARE_CONFIG,
  'professional-services': PROFESSIONAL_SERVICES_CONFIG
};

/**
 * Universal/Default Configuration (fallback for unsupported industries)
 */
export const UNIVERSAL_CONFIG: IndustryConfig = {
  id: 'universal',
  name: 'Universal Business',
  description: 'General business consulting applicable across industries',
  keywords: ['business', 'universal', 'general', 'consulting'],
  target_segments: ['Small Business', 'Startups', 'Growing Companies'],

  questionnaire_modifications: {
    additional_questions: [],
    modified_questions: {},
    removed_questions: [],
    question_order_changes: {},
    conditional_logic_updates: []
  },

  default_service_packages: [
    {
      id: 'universal-business-strategy',
      title: 'Business Strategy Foundation',
      description: 'Essential strategic planning and business development for any industry',
      category: 'strategy',
      tier: 'foundation',
      price_band: '$$',
      timeline: '4-6 weeks',
      includes: [
        'Business assessment and analysis',
        'Strategic planning and roadmap',
        'Market positioning and competitive analysis',
        'Growth strategy development',
        'Implementation planning'
      ],
      industry_tags: ['universal', 'business', 'strategy'],
      eligibility_criteria: {},
      content: {
        what_you_get: 'Comprehensive business strategy with actionable growth plan',
        why_this_fits: 'Perfect for businesses looking to establish strategic direction and accelerate growth',
        timeline: '4-6 weeks with practical implementation support',
        next_steps: 'Business assessment and strategic planning session'
      }
    }
  ],

  content_templates: {
    hero_titles: [
      'Transform Your Business with Strategic Consulting',
      'Accelerate Growth with Expert Business Strategy',
      'Unlock Your Business Potential',
      'Strategic Guidance for Business Success'
    ],
    value_propositions: [
      'Strategic planning and business development',
      'Operational efficiency optimization',
      'Market positioning and competitive analysis',
      'Growth strategy and implementation',
      'Performance measurement and improvement',
      'Change management and transformation'
    ],
    service_descriptions: {
      'business-strategy': 'Comprehensive strategic planning and development',
      'operations-optimization': 'Streamlined operations and efficiency improvement',
      'growth-planning': 'Sustainable growth strategy and implementation',
      'performance-improvement': 'Metrics-driven performance enhancement'
    },
    case_studies: [],
    testimonials: []
  },

  ai_prompts: {
    consultation_system_prompt: 'You are a business consultant providing strategic guidance across industries. Focus on fundamental business principles, growth strategies, and operational excellence.',
    service_matching_prompt: 'Match services based on business fundamentals, growth stage, and operational needs. Prioritize strategic planning, operational efficiency, and sustainable growth.',
    recommendation_tone: 'Professional and supportive, emphasizing practical business solutions',
    industry_specific_context: 'Consider general business principles, market dynamics, operational efficiency, and growth potential when making recommendations.'
  },

  typical_challenges: [
    'Strategic planning and direction',
    'Revenue growth and profitability',
    'Operational efficiency',
    'Market positioning',
    'Team development and management',
    'Technology adoption',
    'Customer acquisition and retention',
    'Financial management'
  ],

  success_metrics: [
    'Revenue Growth',
    'Profit Margins',
    'Customer Satisfaction',
    'Market Share',
    'Operational Efficiency',
    'Employee Satisfaction',
    'Return on Investment',
    'Growth Rate'
  ],

  regulatory_considerations: [
    'General business compliance',
    'Tax obligations',
    'Employment law',
    'Industry-specific regulations'
  ],

  preferred_colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
  recommended_features: [
    'analytics_tracking',
    'email_automation',
    'pdf_generation',
    'crm_integration'
  ],
  compliance_requirements: ['data_privacy', 'business_compliance']
};

/**
 * Industry Configuration Manager
 */
export class IndustryConfigManager {
  private configs: Map<string, IndustryConfig> = new Map();

  constructor() {
    this.initializeConfigs();
  }

  /**
   * Get configuration for specific industry
   */
  getConfig(industryId: string): IndustryConfig {
    return this.configs.get(industryId) || UNIVERSAL_CONFIG;
  }

  /**
   * Get all available industry configurations
   */
  getAllConfigs(): IndustryConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Search configurations by keywords
   */
  searchConfigs(query: string): IndustryConfig[] {
    const searchTerm = query.toLowerCase();
    return this.getAllConfigs().filter(config =>
      config.name.toLowerCase().includes(searchTerm) ||
      config.description.toLowerCase().includes(searchTerm) ||
      config.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get best matching configuration for business type
   */
  getBestMatch(businessType: string, companySize?: string): IndustryConfig {
    const searchResults = this.searchConfigs(businessType);

    if (searchResults.length === 0) {
      return UNIVERSAL_CONFIG;
    }

    // For now, return the first match
    // In the future, could implement more sophisticated matching logic
    return searchResults[0];
  }

  /**
   * Generate customized questionnaire for industry
   */
  generateQuestionnaire(industryId: string): QuestionnaireConfig {
    const config = this.getConfig(industryId);
    const baseQuestionnaire = { ...ENHANCED_CONSULTATION_QUESTIONNAIRE };

    // Apply industry-specific modifications
    const modifications = config.questionnaire_modifications;

    // Add additional questions
    if (modifications.additional_questions.length > 0) {
      // Add to appropriate steps or create new step
      const industryStep = {
        id: `${industryId}-specific`,
        title: `${config.name} Specific Questions`,
        questions: modifications.additional_questions
      };
      baseQuestionnaire.steps.push(industryStep);
    }

    // Modify existing questions
    Object.entries(modifications.modified_questions).forEach(([questionId, modifications]) => {
      baseQuestionnaire.steps.forEach(step => {
        const question = step.questions.find(q => q.id === questionId);
        if (question) {
          Object.assign(question, modifications);
        }
      });
    });

    return baseQuestionnaire;
  }

  /**
   * Generate industry-specific template configuration
   */
  generateTemplateConfig(industryId: string): Partial<UniversalTemplateConfig> {
    const config = this.getConfig(industryId);

    return {
      industry: industryId,
      questionnaire: this.generateQuestionnaire(industryId),
      service_packages: config.default_service_packages,
      content: {
        landing_page: {
          hero_title: config.content_templates.hero_titles[0],
          hero_subtitle: config.description,
          hero_cta: 'Start Your Assessment',
          value_propositions: config.content_templates.value_propositions,
          features: []
        },
        questionnaire: {
          intro_text: `This assessment is specifically designed for ${config.name.toLowerCase()} businesses to provide you with the most relevant recommendations.`,
          completion_message: 'Thank you for completing the assessment. Your personalized consultation is being generated.',
          privacy_notice: 'Your information is secure and will only be used to provide your consultation.'
        },
        results_page: {
          title: 'Your Personalized Business Consultation',
          subtitle: `Tailored recommendations for ${config.name.toLowerCase()}`,
          next_steps_header: 'Recommended Next Steps',
          consultation_description: 'Based on your responses, here are our strategic recommendations.',
          contact_cta: 'Schedule Implementation Call'
        },
        email_templates: {
          welcome_subject: `Welcome to Your ${config.name} Business Assessment`,
          welcome_body: 'Thank you for starting your business assessment...',
          consultation_subject: 'Your Personalized Business Consultation is Ready',
          consultation_body: 'Your customized consultation report is attached...',
          follow_up_subject: 'Next Steps for Your Business Growth',
          follow_up_body: 'Following up on your consultation...'
        },
        legal: {}
      },
      branding: {
        primary_color: config.preferred_colors[0],
        secondary_color: config.preferred_colors[1],
        accent_color: config.preferred_colors[2],
        font_family: 'Inter, sans-serif',
        company_name: 'Your Company',
        social_links: {}
      },
      customization_options: {
        allow_branding_changes: true,
        allow_content_editing: true,
        allow_questionnaire_modification: true,
        allow_service_package_editing: true,
        allow_css_customization: true,
        protected_elements: [],
        required_elements: ['hero_title', 'company_name'],
        max_questionnaire_questions: 50,
        max_service_packages: 10,
        features: Object.fromEntries(
          config.recommended_features.map(feature => [feature, true])
        ) as any
      },
      restrictions: {
        max_monthly_consultations: 1000,
        max_clients: 100,
        allowed_domains: [],
        geo_restrictions: [],
        prohibited_content: [],
        required_disclaimers: config.compliance_requirements,
        max_file_upload_size: 10485760, // 10MB
        max_custom_css_size: 102400, // 100KB
        allowed_integrations: ['email', 'calendar', 'crm']
      },
      tags: [industryId, ...config.keywords],
      compatibility: ['web', 'mobile'],
      dependencies: ['questionnaire-engine', 'ai-consultation', 'pdf-export']
    };
  }

  private initializeConfigs(): void {
    Object.values(INDUSTRY_CONFIGS).forEach(config => {
      this.configs.set(config.id, config);
    });
    this.configs.set('universal', UNIVERSAL_CONFIG);
  }
}

/**
 * Default industry configuration manager instance
 */
export const industryConfigManager = new IndustryConfigManager();

/**
 * Convenience functions for industry configuration operations
 */
export const industryConfigs = {
  get: (industryId: string) => industryConfigManager.getConfig(industryId),
  getAll: () => industryConfigManager.getAllConfigs(),
  search: (query: string) => industryConfigManager.searchConfigs(query),
  getBestMatch: (businessType: string, companySize?: string) =>
    industryConfigManager.getBestMatch(businessType, companySize),
  generateQuestionnaire: (industryId: string) =>
    industryConfigManager.generateQuestionnaire(industryId),
  generateTemplate: (industryId: string) =>
    industryConfigManager.generateTemplateConfig(industryId)
};