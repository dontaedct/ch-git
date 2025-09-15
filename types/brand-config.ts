/**
 * @fileoverview Brand Configuration Types and Interfaces
 * @module types/brand-config
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.3: Brand Inheritance and Override System
 * Comprehensive brand configuration system supporting inheritance from presets
 * and client-specific overrides for complete white-labeling capabilities.
 */

/**
 * Brand configuration interface supporting inheritance and overrides
 */
export interface BrandConfig {
  /** Unique brand identifier */
  id: string;
  /** Brand display name */
  name: string;
  /** Brand description */
  description?: string;
  /** Base preset this brand inherits from */
  basePreset?: string;
  /** Brand-specific overrides */
  overrides: BrandOverrides;
  /** Brand metadata */
  metadata: BrandMetadata;
  /** Creation and update timestamps */
  timestamps: BrandTimestamps;
}

/**
 * Brand overrides that can be applied to any preset
 */
export interface BrandOverrides {
  /** Color palette overrides */
  colors?: {
    /** Primary brand color */
    primary?: string;
    /** Secondary brand color */
    secondary?: string;
    /** Accent color */
    accent?: string;
    /** Custom color palette */
    custom?: Record<string, string>;
    /** Neutral color overrides */
    neutral?: Partial<{
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
    }>;
  };
  
  /** Typography overrides */
  typography?: {
    /** Font family override */
    fontFamily?: string;
    /** Font weights */
    fontWeights?: {
      light?: number;
      normal?: number;
      medium?: number;
      semibold?: number;
      bold?: number;
    };
    /** Type scale overrides */
    scales?: Partial<{
      display: string;
      headline: string;
      body: string;
      caption: string;
    }>;
  };
  
  /** Logo and brand assets */
  assets?: {
    /** Primary logo URL */
    logo?: string;
    /** Logo variant for dark backgrounds */
    logoDark?: string;
    /** Favicon URL */
    favicon?: string;
    /** Brand icon */
    icon?: string;
  };
  
  /** Brand-specific content */
  content?: {
    /** Brand tagline */
    tagline?: string;
    /** Brand description */
    description?: string;
    /** Contact information */
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
      website?: string;
    };
  };
  
  /** Layout and spacing overrides */
  layout?: {
    /** Border radius overrides */
    radii?: Partial<{
      sm: string;
      md: string;
      lg: string;
    }>;
    /** Shadow overrides */
    shadows?: Partial<{
      sm: string;
      md: string;
      lg: string;
    }>;
    /** Spacing overrides */
    spacing?: Partial<{
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    }>;
  };
  
  /** Motion and animation overrides */
  motion?: {
    /** Animation duration */
    duration?: string;
    /** Easing function */
    easing?: string;
    /** Disable animations */
    disabled?: boolean;
  };
}

/**
 * Brand metadata for categorization and management
 */
export interface BrandMetadata {
  /** Industry category */
  industry?: string;
  /** Brand style category */
  style?: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant' | 'playful';
  /** Color scheme type */
  colorScheme?: 'monochrome' | 'duotone' | 'multicolor' | 'gradient';
  /** Brand maturity level */
  maturity?: 'startup' | 'growing' | 'established' | 'enterprise';
  /** Target audience */
  audience?: string[];
  /** Brand keywords for search */
  keywords?: string[];
  /** Brand version */
  version?: string;
}

/**
 * Brand timestamps for tracking changes
 */
export interface BrandTimestamps {
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Last applied timestamp */
  lastApplied?: string;
}

/**
 * Brand preset template for inheritance
 */
export interface BrandPreset {
  /** Preset identifier */
  id: string;
  /** Preset name */
  name: string;
  /** Preset description */
  description: string;
  /** Base configuration */
  baseConfig: BrandOverrides;
  /** Preset metadata */
  metadata: BrandMetadata;
  /** Preset category */
  category: 'industry' | 'style' | 'template';
}

/**
 * Brand inheritance configuration
 */
export interface BrandInheritance {
  /** Base preset to inherit from */
  basePreset: string;
  /** Inheritance mode */
  mode: 'merge' | 'override' | 'extend';
  /** Override priority levels */
  priority: {
    /** Client overrides (highest priority) */
    client: number;
    /** Environment overrides */
    environment: number;
    /** Preset defaults (lowest priority) */
    preset: number;
  };
}

/**
 * Brand validation result
 */
export interface BrandValidationResult {
  /** Validation success status */
  valid: boolean;
  /** Validation errors */
  errors: BrandValidationError[];
  /** Validation warnings */
  warnings: BrandValidationWarning[];
  /** Accessibility score */
  accessibilityScore?: number;
  /** Usability score */
  usabilityScore?: number;
}

/**
 * Brand validation error
 */
export interface BrandValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Path to the invalid property */
  path: string;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
}

/**
 * Brand validation warning
 */
export interface BrandValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Path to the property */
  path: string;
  /** Severity level */
  severity: 'warning' | 'info';
  /** Suggested fix */
  suggestion?: string;
  /** WCAG level if accessibility related */
  wcagLevel?: string;
}

/**
 * Brand configuration merge strategy
 */
export type BrandMergeStrategy = 'deep' | 'shallow' | 'replace';

/**
 * Brand configuration context for inheritance
 */
export interface BrandContext {
  /** Current brand configuration */
  brand: BrandConfig;
  /** Base preset configuration */
  preset: BrandPreset;
  /** Environment overrides */
  environment: Partial<BrandOverrides>;
  /** Client-specific overrides */
  client: Partial<BrandOverrides>;
  /** Merge strategy */
  strategy: BrandMergeStrategy;
}

/**
 * Brand configuration service interface
 */
export interface BrandConfigService {
  /** Create new brand configuration */
  createBrand(config: Omit<BrandConfig, 'id' | 'timestamps'>): Promise<BrandConfig>;
  
  /** Get brand configuration by ID */
  getBrand(id: string): Promise<BrandConfig | null>;
  
  /** Update brand configuration */
  updateBrand(id: string, updates: Partial<BrandConfig>): Promise<BrandConfig>;
  
  /** Delete brand configuration */
  deleteBrand(id: string): Promise<boolean>;
  
  /** List all brand configurations */
  listBrands(): Promise<BrandConfig[]>;
  
  /** Get brand preset by ID */
  getPreset(id: string): Promise<BrandPreset | null>;
  
  /** List available brand presets */
  listPresets(): Promise<BrandPreset[]>;
  
  /** Apply brand configuration */
  applyBrand(id: string): Promise<boolean>;
  
  /** Validate brand configuration */
  validateBrand(config: BrandConfig): Promise<BrandValidationResult>;
  
  /** Merge brand configurations */
  mergeBrands(base: BrandConfig, override: Partial<BrandOverrides>): BrandConfig;
  
  /** Export brand configuration */
  exportBrand(id: string): Promise<string>;
  
  /** Import brand configuration */
  importBrand(config: string): Promise<BrandConfig>;
}
