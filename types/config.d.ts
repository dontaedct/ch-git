/**
 * DCT Micro-Apps Configuration Types
 * 
 * Schema-first configuration system for universal micro-app flows.
 * Enables zero-code changes to questionnaires, themes, and plan catalogs.
 */

export interface ThemeTokens {
  /** Color palette for the entire application */
  colors: {
    /** Primary brand color (e.g., "#007AFF") */
    primary: string;
    /** Neutral color scale from light to dark */
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    /** Optional accent color for highlights */
    accent?: string;
  };
  
  /** Typography configuration */
  typography: {
    /** Font family stack (e.g., "SF Pro Display, system-ui, sans-serif") */
    fontFamily: string;
    /** Type scale definitions */
    scales: {
      /** Large display text (2.5rem default) */
      display: string;
      /** Section headlines (1.5rem default) */
      headline: string;
      /** Body text (1rem default) */
      body: string;
      /** Small captions (0.875rem default) */
      caption: string;
    };
  };
  
  /** Motion and animation settings */
  motion: {
    /** Base animation duration (e.g., "150ms") */
    duration: string;
    /** Easing function (e.g., "cubic-bezier(.2,.8,.2,1)") */
    easing: string;
  };
  
  /** Border radius values */
  radii: {
    /** Small radius (4px default) */
    sm: string;
    /** Medium radius (8px default) */
    md: string;
    /** Large radius (12px default) */
    lg: string;
  };
  
  /** Shadow definitions */
  shadows: {
    /** Subtle element shadow */
    sm: string;
    /** Card/modal shadow */
    md: string;
    /** Prominent shadow */
    lg: string;
  };
}

/** Individual question configuration */
export interface Question {
  /** Unique question identifier */
  id: string;
  /** Question text displayed to user */
  text: string;
  /** Type of input control */
  type: 'chips' | 'chips-multi' | 'select' | 'short-text' | 'long-text' | 'toggle';
  /** Whether question is required for progression */
  required: boolean;
  /** Available options for selection types */
  options?: Array<{
    /** Option value stored in answers */
    value: string;
    /** Display label for option */
    label: string;
  }>;
  /** Placeholder text for text inputs */
  placeholder?: string;
  /** Allow custom input for chips (adds "Other" option) */
  allowCustom?: boolean;
  /** Conditional visibility rule */
  visibleIf?: {
    /** Question ID to check */
    questionId: string;
    /** Required value(s) for visibility */
    values: string[];
  };
}

/** Group of questions shown together */
export interface Step {
  /** Unique step identifier */
  id: string;
  /** Step title/heading */
  title: string;
  /** Questions in this step */
  questions: Question[];
}

/** Complete questionnaire configuration */
export interface QuestionnaireConfig {
  /** Questionnaire metadata */
  id: string;
  title: string;
  description?: string;
  
  /** All questionnaire steps */
  steps: Step[];
  
  /** Progress display settings */
  progress: {
    /** Progress bar style */
    style: 'thinBar' | 'steps' | 'percentage';
    /** Show step numbers */
    showNumbers: boolean;
    /** Show step titles */
    showTitles?: boolean;
  };
  
  /** Navigation button labels */
  navigation: {
    previousLabel: string;
    nextLabel: string;
    submitLabel: string;
  };
}

/** Plan deck display configuration */
export interface PlanDeckConfig {
  /** Number of primary recommendations to show */
  primaryCount: number;
  /** Maximum number of alternate plans */
  alternatesCount: number;
  /** Rules for plan selection */
  selectionRules?: {
    /** Prefer plans matching these criteria */
    preferredTiers?: string[];
    /** Exclude plans with these features */
    excludeFeatures?: string[];
  };
}

/** Consultation card section types */
export type PlanCardSection = 
  | 'whatYouGet'    // Key deliverables and outcomes
  | 'whyThisFits'   // Personalized reasoning
  | 'timeline'      // Project duration and milestones
  | 'priceBand'     // Cost range (optional)
  | 'nextSteps';    // Recommended actions

/** Consultation template configuration */
export interface ConsultationTemplate {
  /** Brief summary generation settings */
  summary: {
    /** Minimum summary length in words */
    minWords: number;
    /** Maximum summary length in words */
    maxWords: number;
    /** Tone of voice (client's perspective) */
    tone: 'professional' | 'friendly' | 'direct';
  };
  
  /** Plan display configuration */
  planDeck: PlanDeckConfig;
  
  /** Ordered sections to display in plan cards */
  sections: PlanCardSection[];
  
  /** Available action buttons */
  actions: {
    /** Enable PDF download */
    downloadPdf: boolean;
    /** Enable email copy request */
    emailCopy: boolean;
    /** Booking CTA label */
    bookCtaLabel: string;
    /** External booking URL (configurable per client) */
    bookingUrl?: string;
  };
}

/** Individual plan in catalog */
export interface Plan {
  /** Unique plan identifier */
  id: string;
  /** Plan display name */
  title: string;
  /** Brief description */
  description: string;
  /** Price range display (optional) */
  priceBand?: string;
  /** List of included features/deliverables */
  includes: string[];
  /** Estimated timeline */
  timeline?: string;
  /** Plan tier/level */
  tier: 'foundation' | 'growth' | 'enterprise';
  /** Eligibility conditions */
  eligibleIf?: {
    /** Required answer values for plan to be available */
    [questionId: string]: string[];
  };
  /** Template content for sections */
  content: {
    whatYouGet?: string;
    whyThisFits?: string;
    timeline?: string;
    nextSteps?: string;
  };
}

/** Complete plan catalog */
export interface PlanCatalog {
  /** Catalog metadata */
  id: string;
  name: string;
  /** All available plans */
  plans: Plan[];
  /** Default plan selection logic */
  defaults: {
    /** Fallback plan if no eligibility matches */
    fallbackPlan: string;
    /** Prefer higher tier if multiple matches */
    preferHigherTier: boolean;
  };
}

/** Feature/service module definition */
export interface ModuleRegistry {
  /** Available modules for selection */
  modules: Array<{
    /** Unique module identifier */
    id: string;
    /** Display label */
    label: string;
    /** Brief description */
    description?: string;
    /** Available in these plan tiers */
    tiers?: Array<'foundation' | 'growth' | 'enterprise'>;
  }>;
}

/** Complete micro-app configuration */
export interface MicroAppConfig {
  /** App metadata */
  id: string;
  name: string;
  version: string;
  
  /** Theme customization */
  theme: ThemeTokens;
  
  /** Questionnaire setup */
  questionnaire: QuestionnaireConfig;
  
  /** Consultation template */
  consultation: ConsultationTemplate;
  
  /** Available plans */
  catalog: PlanCatalog;
  
  /** Feature modules */
  modules: ModuleRegistry;
  
  /** Integration settings */
  integrations: {
    /** N8N webhook configuration */
    n8n?: {
      /** Webhook endpoint URL */
      webhookUrl: string;
      /** Events to send */
      enabledEvents: Array<
        | 'lead_started_questionnaire'
        | 'lead_completed_questionnaire' 
        | 'consultation_generated'
        | 'pdf_downloaded'
        | 'email_copy_requested'
      >;
    };
    
    /** Email service settings */
    email?: {
      /** From address for automated emails */
      fromAddress: string;
      /** Subject line template */
      subjectTemplate: string;
    };
  };
}