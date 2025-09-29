import { QuestionnaireConfig } from '@/components/questionnaire-engine'

/**
 * Enhanced Business Consultation Questionnaire Configuration
 * Optimized for AI processing and dynamic question routing
 */

export interface ConsultationQuestionConfig {
  id: string
  text: string
  type: string
  required: boolean
  options?: Array<{ value: string; label: string }>
  allowCustom?: boolean
  placeholder?: string
  visibleIf?: {
    questionId: string
    value: string | string[] | boolean
  }
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    custom?: (value: any) => string | null
  }
  aiProcessing?: {
    weight: number // 1-10, importance for AI analysis
    category: 'demographic' | 'business' | 'goals' | 'challenges' | 'preferences' | 'qualification'
    keywords: string[] // Keywords for AI processing
  }
  analytics?: {
    trackTime?: boolean
    trackChanges?: boolean
  }
}

export interface ConsultationStepConfig {
  id: string
  title: string
  description?: string
  questions: ConsultationQuestionConfig[]
  routing?: {
    nextStep?: string
    skipIf?: Array<{
      questionId: string
      value: string | string[]
      skipToStep: string
    }>
  }
}

// Enhanced questionnaire configuration with AI optimization
export const ENHANCED_CONSULTATION_QUESTIONNAIRE: QuestionnaireConfig = {
  id: 'business-consultation-enhanced-v2',
  title: 'Business Growth Assessment',
  description: 'Comprehensive analysis to unlock your business potential',
  steps: [
    {
      id: 'business-profile',
      title: 'Business Profile',
      questions: [
        {
          id: 'business-type',
          text: 'What type of business do you operate?',
          type: 'chips',
          required: true,
          options: [
            { value: 'e-commerce', label: 'E-commerce & Online Retail' },
            { value: 'saas', label: 'SaaS & Technology' },
            { value: 'professional-services', label: 'Professional Services' },
            { value: 'consulting', label: 'Consulting & Advisory' },
            { value: 'retail', label: 'Physical Retail' },
            { value: 'manufacturing', label: 'Manufacturing & Production' },
            { value: 'healthcare', label: 'Healthcare & Medical' },
            { value: 'education', label: 'Education & Training' },
            { value: 'finance', label: 'Financial Services' },
            { value: 'real-estate', label: 'Real Estate' },
            { value: 'hospitality', label: 'Hospitality & Tourism' },
            { value: 'nonprofit', label: 'Non-profit & Social Impact' }
          ],
          allowCustom: true,
          // @ts-ignore - Extended properties for AI processing
          aiProcessing: {
            weight: 9,
            category: 'demographic',
            keywords: ['industry', 'sector', 'business-model', 'market']
          },
          analytics: {
            trackTime: true,
            trackChanges: true
          }
        },
        {
          id: 'company-age',
          text: 'How long has your business been operating?',
          type: 'select',
          required: true,
          options: [
            { value: 'startup', label: 'Pre-launch / Idea stage' },
            { value: 'less-than-1-year', label: 'Less than 1 year' },
            { value: '1-2-years', label: '1-2 years' },
            { value: '3-5-years', label: '3-5 years' },
            { value: '6-10-years', label: '6-10 years' },
            { value: 'over-10-years', label: 'Over 10 years' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 8,
            category: 'demographic',
            keywords: ['maturity', 'experience', 'lifecycle', 'stage']
          }
        },
        {
          id: 'company-size',
          text: 'What is your current team size?',
          type: 'select',
          required: true,
          options: [
            { value: 'solo', label: 'Solo entrepreneur (just me)' },
            { value: 'micro', label: '2-5 people' },
            { value: 'small', label: '6-20 people' },
            { value: 'medium', label: '21-100 people' },
            { value: 'large', label: '101-500 people' },
            { value: 'enterprise', label: '500+ people' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 9,
            category: 'demographic',
            keywords: ['scale', 'resources', 'structure', 'capacity']
          }
        },
        {
          id: 'annual-revenue',
          text: 'What is your approximate annual revenue?',
          type: 'select',
          required: true,
          options: [
            { value: 'pre-revenue', label: 'Pre-revenue/Startup' },
            { value: 'under-50k', label: 'Under $50K' },
            { value: '50k-100k', label: '$50K - $100K' },
            { value: '100k-250k', label: '$100K - $250K' },
            { value: '250k-500k', label: '$250K - $500K' },
            { value: '500k-1m', label: '$500K - $1M' },
            { value: '1m-5m', label: '$1M - $5M' },
            { value: '5m-10m', label: '$5M - $10M' },
            { value: 'over-10m', label: 'Over $10M' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 10,
            category: 'demographic',
            keywords: ['financial-performance', 'scale', 'growth-stage', 'resources']
          }
        }
      ]
    },
    {
      id: 'goals-objectives',
      title: 'Goals & Objectives',
      questions: [
        {
          id: 'primary-goals',
          text: 'What are your top business priorities? (Select all that apply)',
          type: 'chips-multi',
          required: true,
          options: [
            { value: 'increase-revenue', label: 'Increase Revenue' },
            { value: 'reduce-costs', label: 'Reduce Operating Costs' },
            { value: 'improve-efficiency', label: 'Improve Operational Efficiency' },
            { value: 'expand-market', label: 'Expand to New Markets' },
            { value: 'digital-transformation', label: 'Digital Transformation' },
            { value: 'team-growth', label: 'Scale Team & Operations' },
            { value: 'product-development', label: 'Product/Service Development' },
            { value: 'customer-acquisition', label: 'Customer Acquisition' },
            { value: 'customer-retention', label: 'Customer Retention & Loyalty' },
            { value: 'brand-building', label: 'Brand Building & Marketing' },
            { value: 'process-automation', label: 'Process Automation' },
            { value: 'compliance-governance', label: 'Compliance & Governance' }
          ],
          allowCustom: true,
          // @ts-ignore
          aiProcessing: {
            weight: 10,
            category: 'goals',
            keywords: ['objectives', 'priorities', 'focus-areas', 'outcomes']
          },
          analytics: {
            trackTime: true
          }
        },
        {
          id: 'success-metrics',
          text: 'How do you currently measure business success?',
          type: 'chips-multi',
          required: true,
          options: [
            { value: 'revenue-growth', label: 'Revenue Growth' },
            { value: 'profit-margins', label: 'Profit Margins' },
            { value: 'customer-count', label: 'Customer Count' },
            { value: 'customer-satisfaction', label: 'Customer Satisfaction/NPS' },
            { value: 'market-share', label: 'Market Share' },
            { value: 'operational-efficiency', label: 'Operational Efficiency' },
            { value: 'team-productivity', label: 'Team Productivity' },
            { value: 'brand-awareness', label: 'Brand Awareness' },
            { value: 'innovation-rate', label: 'Innovation Rate' },
            { value: 'cash-flow', label: 'Cash Flow' },
            { value: 'roi', label: 'Return on Investment' },
            { value: 'employee-satisfaction', label: 'Employee Satisfaction' }
          ],
          allowCustom: true,
          // @ts-ignore
          aiProcessing: {
            weight: 8,
            category: 'goals',
            keywords: ['kpis', 'metrics', 'measurement', 'success-criteria']
          }
        },
        {
          id: 'timeline',
          text: 'What is your timeline for achieving your primary goals?',
          type: 'select',
          required: true,
          options: [
            { value: 'immediate', label: 'Immediate (1-3 months)' },
            { value: 'short-term', label: 'Short-term (3-6 months)' },
            { value: 'medium-term', label: 'Medium-term (6-12 months)' },
            { value: 'long-term', label: 'Long-term (1-2 years)' },
            { value: 'strategic', label: 'Strategic (2+ years)' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 8,
            category: 'goals',
            keywords: ['urgency', 'timeline', 'planning-horizon', 'expectations']
          }
        },
        {
          id: 'revenue-target',
          text: 'What revenue goal would you like to achieve in the next 12 months?',
          type: 'select',
          required: false,
          visibleIf: {
            questionId: 'primary-goals',
            value: 'increase-revenue'
          },
          options: [
            { value: '10-percent', label: '10% increase' },
            { value: '25-percent', label: '25% increase' },
            { value: '50-percent', label: '50% increase' },
            { value: '100-percent', label: '100% increase (double)' },
            { value: '200-percent-plus', label: '200%+ increase (triple+)' },
            { value: 'first-revenue', label: 'Generate first revenue' },
            { value: 'break-even', label: 'Reach break-even' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 9,
            category: 'goals',
            keywords: ['growth-target', 'ambition', 'revenue-goal', 'expectations']
          }
        }
      ]
    },
    {
      id: 'challenges-obstacles',
      title: 'Challenges & Obstacles',
      questions: [
        {
          id: 'biggest-challenges',
          text: 'What are your biggest business challenges? (Select all that apply)',
          type: 'chips-multi',
          required: true,
          options: [
            { value: 'cash-flow', label: 'Cash Flow Management' },
            { value: 'lead-generation', label: 'Lead Generation & Marketing' },
            { value: 'sales-conversion', label: 'Sales Conversion' },
            { value: 'competition', label: 'Market Competition' },
            { value: 'talent-acquisition', label: 'Finding Quality Talent' },
            { value: 'employee-retention', label: 'Employee Retention' },
            { value: 'technology-adoption', label: 'Technology Implementation' },
            { value: 'process-inefficiencies', label: 'Inefficient Processes' },
            { value: 'customer-service', label: 'Customer Service Quality' },
            { value: 'scaling-operations', label: 'Scaling Operations' },
            { value: 'regulatory-compliance', label: 'Regulatory Compliance' },
            { value: 'supply-chain', label: 'Supply Chain Issues' },
            { value: 'pricing-strategy', label: 'Pricing Strategy' },
            { value: 'market-understanding', label: 'Understanding Market Needs' }
          ],
          allowCustom: true,
          // @ts-ignore
          aiProcessing: {
            weight: 10,
            category: 'challenges',
            keywords: ['pain-points', 'obstacles', 'problems', 'barriers']
          },
          analytics: {
            trackTime: true
          }
        },
        {
          id: 'biggest-opportunity',
          text: 'What do you see as your biggest untapped opportunity?',
          type: 'long-text',
          required: false,
          placeholder: 'Describe the opportunity you believe could have the biggest impact on your business...',
          // @ts-ignore
          validation: {
            maxLength: 500
          },
          aiProcessing: {
            weight: 9,
            category: 'challenges',
            keywords: ['opportunity', 'potential', 'growth-areas', 'market-gaps']
          }
        },
        {
          id: 'resource-constraints',
          text: 'What resource constraints are limiting your growth? (Select all that apply)',
          type: 'chips-multi',
          required: false,
          options: [
            { value: 'financial-capital', label: 'Financial Capital' },
            { value: 'human-resources', label: 'Human Resources/Talent' },
            { value: 'technology-infrastructure', label: 'Technology Infrastructure' },
            { value: 'time-bandwidth', label: 'Time & Bandwidth' },
            { value: 'market-knowledge', label: 'Market Knowledge/Expertise' },
            { value: 'network-connections', label: 'Network & Connections' },
            { value: 'operational-capacity', label: 'Operational Capacity' },
            { value: 'brand-recognition', label: 'Brand Recognition' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 7,
            category: 'challenges',
            keywords: ['constraints', 'limitations', 'resources', 'bottlenecks']
          }
        }
      ]
    },
    {
      id: 'current-situation',
      title: 'Current Situation',
      questions: [
        {
          id: 'current-marketing',
          text: 'Which marketing channels are you currently using? (Select all that apply)',
          type: 'chips-multi',
          required: false,
          options: [
            { value: 'social-media-organic', label: 'Social Media (Organic)' },
            { value: 'social-media-paid', label: 'Social Media (Paid Ads)' },
            { value: 'google-ads', label: 'Google Ads (Search/Display)' },
            { value: 'email-marketing', label: 'Email Marketing' },
            { value: 'content-marketing', label: 'Content Marketing/SEO' },
            { value: 'networking-referrals', label: 'Networking & Referrals' },
            { value: 'events-trade-shows', label: 'Events & Trade Shows' },
            { value: 'direct-sales', label: 'Direct Sales Outreach' },
            { value: 'partnerships', label: 'Strategic Partnerships' },
            { value: 'pr-media', label: 'PR & Media Coverage' },
            { value: 'word-of-mouth', label: 'Word of Mouth' },
            { value: 'none', label: 'Limited/No Marketing Currently' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 7,
            category: 'business',
            keywords: ['marketing-mix', 'channels', 'customer-acquisition', 'reach']
          }
        },
        {
          id: 'technology-stack',
          text: 'What business tools/software do you currently use? (Select all that apply)',
          type: 'chips-multi',
          required: false,
          options: [
            { value: 'crm-system', label: 'CRM System (Salesforce, HubSpot, etc.)' },
            { value: 'project-management', label: 'Project Management (Asana, Monday, etc.)' },
            { value: 'accounting-software', label: 'Accounting Software (QuickBooks, Xero, etc.)' },
            { value: 'email-platform', label: 'Email Marketing Platform' },
            { value: 'analytics-tools', label: 'Analytics Tools (Google Analytics, etc.)' },
            { value: 'automation-tools', label: 'Automation Tools (Zapier, etc.)' },
            { value: 'ecommerce-platform', label: 'E-commerce Platform' },
            { value: 'social-media-tools', label: 'Social Media Management Tools' },
            { value: 'communication-tools', label: 'Team Communication (Slack, Teams, etc.)' },
            { value: 'basic-tools', label: 'Basic tools only (Email, Office, etc.)' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 6,
            category: 'business',
            keywords: ['technology-maturity', 'tools', 'systems', 'automation']
          }
        },
        {
          id: 'budget-range',
          text: 'What is your monthly budget for business growth initiatives?',
          type: 'select',
          required: true,
          options: [
            { value: 'bootstrap', label: 'Bootstrap mode ($0 - $500)' },
            { value: 'startup', label: 'Startup budget ($500 - $2,000)' },
            { value: 'small-business', label: 'Small business ($2,000 - $5,000)' },
            { value: 'growth-stage', label: 'Growth stage ($5,000 - $15,000)' },
            { value: 'established', label: 'Established business ($15,000 - $50,000)' },
            { value: 'enterprise', label: 'Enterprise budget ($50,000+)' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 10,
            category: 'qualification',
            keywords: ['budget', 'investment-capacity', 'financial-readiness', 'spend']
          }
        }
      ]
    },
    {
      id: 'consultation-preferences',
      title: 'Consultation Preferences',
      questions: [
        {
          id: 'consultation-focus',
          text: 'Which areas would you like our consultation to prioritize? (Select up to 3)',
          type: 'chips-multi',
          required: true,
          options: [
            { value: 'business-strategy', label: 'Business Strategy & Planning' },
            { value: 'marketing-sales', label: 'Marketing & Sales Optimization' },
            { value: 'operations-processes', label: 'Operations & Process Improvement' },
            { value: 'financial-management', label: 'Financial Management & Planning' },
            { value: 'technology-digital', label: 'Technology & Digital Transformation' },
            { value: 'human-resources', label: 'Human Resources & Team Building' },
            { value: 'leadership-management', label: 'Leadership & Management Development' },
            { value: 'innovation-growth', label: 'Innovation & Growth Strategies' },
            { value: 'risk-management', label: 'Risk Management & Compliance' },
            { value: 'market-expansion', label: 'Market Expansion & Partnerships' }
          ],
          // @ts-ignore
          validation: {
            custom: (value: string[]) => {
              if (Array.isArray(value) && value.length > 3) {
                return 'Please select up to 3 focus areas'
              }
              return null
            }
          },
          aiProcessing: {
            weight: 9,
            category: 'preferences',
            keywords: ['focus-areas', 'priorities', 'specialization', 'needs']
          }
        },
        {
          id: 'decision-timeline',
          text: 'When are you looking to make a decision about business consulting?',
          type: 'select',
          required: true,
          options: [
            { value: 'immediately', label: 'Ready to start immediately' },
            { value: 'within-month', label: 'Within the next month' },
            { value: 'within-quarter', label: 'Within the next 3 months' },
            { value: 'researching', label: 'Currently researching options' },
            { value: 'future-consideration', label: 'Future consideration (6+ months)' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 8,
            category: 'qualification',
            keywords: ['urgency', 'decision-readiness', 'buying-timeline', 'intent']
          }
        },
        {
          id: 'previous-consulting',
          text: 'Have you worked with business consultants before?',
          type: 'select',
          required: false,
          options: [
            { value: 'never', label: 'No, this would be my first time' },
            { value: 'positive-experience', label: 'Yes, with positive results' },
            { value: 'mixed-experience', label: 'Yes, with mixed results' },
            { value: 'negative-experience', label: 'Yes, but it wasn\'t helpful' },
            { value: 'internal-only', label: 'Only internal consulting/coaching' }
          ],
          // @ts-ignore
          aiProcessing: {
            weight: 6,
            category: 'preferences',
            keywords: ['experience', 'expectations', 'trust-level', 'history']
          }
        }
      ]
    }
  ],
  progress: {
    style: 'bar',
    showNumbers: true,
    showTitles: true
  },
  navigation: {
    previousLabel: 'Previous',
    nextLabel: 'Continue',
    submitLabel: 'Complete Assessment'
  }
}

// Question routing and validation utilities
export const CONSULTATION_ROUTING_RULES = {
  skipToEnd: [
    {
      questionId: 'budget-range',
      value: 'bootstrap',
      condition: 'AND',
      additionalChecks: [
        { questionId: 'company-size', value: 'solo' },
        { questionId: 'annual-revenue', value: 'pre-revenue' }
      ],
      action: 'recommend-diy-resources'
    }
  ],

  prioritizeQuestions: [
    {
      questionId: 'primary-goals',
      value: 'increase-revenue',
      showNext: ['revenue-target', 'current-marketing']
    },
    {
      questionId: 'biggest-challenges',
      value: 'lead-generation',
      showNext: ['current-marketing', 'marketing-budget']
    }
  ]
}

// AI Processing weights and categories
export const AI_PROCESSING_CONFIG = {
  categoryWeights: {
    demographic: 0.25,
    business: 0.20,
    goals: 0.25,
    challenges: 0.20,
    preferences: 0.05,
    qualification: 0.05
  },

  minimumCompletionForAI: 0.70, // 70% completion required for AI processing

  qualificationThresholds: {
    highValue: {
      budget: ['growth-stage', 'established', 'enterprise'],
      revenue: ['1m-5m', '5m-10m', 'over-10m'],
      timeline: ['immediately', 'within-month']
    },

    mediumValue: {
      budget: ['small-business'],
      revenue: ['500k-1m'],
      timeline: ['within-quarter']
    }
  }
}