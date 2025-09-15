/**
 * @fileoverview Comprehensive Naming Conventions System
 * @module lib/conventions/naming-conventions
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Comprehensive Naming Conventions System
 * Purpose: Enforce consistent naming conventions across the codebase
 * Safety: Comprehensive naming standards with automated enforcement
 */

// =============================================================================
// NAMING CONVENTIONS DEFINITIONS
// =============================================================================

export interface NamingConvention {
  pattern: RegExp
  description: string
  examples: string[]
  severity: 'error' | 'warning' | 'info'
}

export interface NamingRules {
  variables: NamingConvention
  functions: NamingConvention
  components: NamingConvention
  interfaces: NamingConvention
  types: NamingConvention
  constants: NamingConvention
  files: NamingConvention
  directories: NamingConvention
  cssClasses: NamingConvention
  apiEndpoints: NamingConvention
}

/**
 * Comprehensive naming conventions for the project
 */
export const namingConventions: NamingRules = {
  // Variables: camelCase
  variables: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    description: 'Variables should use camelCase',
    examples: ['userName', 'isLoading', 'hasPermission', 'currentIndex'],
    severity: 'error'
  },

  // Functions: camelCase
  functions: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    description: 'Functions should use camelCase',
    examples: ['getUserData', 'handleSubmit', 'validateInput', 'processPayment'],
    severity: 'error'
  },

  // Components: PascalCase
  components: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: 'React components should use PascalCase',
    examples: ['UserProfile', 'LoginForm', 'NavigationMenu', 'ErrorBoundary'],
    severity: 'error'
  },

  // Interfaces: PascalCase with descriptive names
  interfaces: {
    pattern: /^[A-Z][a-zA-Z0-9]*(Props|Config|Options|State|Data|Response|Request)?$/,
    description: 'Interfaces should use PascalCase and be descriptive',
    examples: ['UserProfileProps', 'ApiResponse', 'FormConfig', 'ValidationOptions'],
    severity: 'error'
  },

  // Types: PascalCase
  types: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: 'TypeScript types should use PascalCase',
    examples: ['UserRole', 'ThemeMode', 'ValidationResult', 'ApiStatus'],
    severity: 'error'
  },

  // Constants: SCREAMING_SNAKE_CASE or camelCase for local constants
  constants: {
    pattern: /^([A-Z][A-Z0-9_]*|[a-z][a-zA-Z0-9]*)$/,
    description: 'Constants should use SCREAMING_SNAKE_CASE for global constants or camelCase for local constants',
    examples: ['API_BASE_URL', 'MAX_RETRY_ATTEMPTS', 'defaultConfig', 'initialState'],
    severity: 'warning'
  },

  // Files: kebab-case for components, camelCase for utilities
  files: {
    pattern: /^([a-z][a-z0-9-]*\.(tsx?|jsx?)|[a-z][a-zA-Z0-9]*\.(ts|js))$/,
    description: 'Files should use kebab-case for components and camelCase for utilities',
    examples: ['user-profile.tsx', 'login-form.tsx', 'apiClient.ts', 'validationUtils.ts'],
    severity: 'error'
  },

  // Directories: kebab-case
  directories: {
    pattern: /^[a-z][a-z0-9-]*$/,
    description: 'Directories should use kebab-case',
    examples: ['user-management', 'api-routes', 'ui-components', 'validation-schemas'],
    severity: 'error'
  },

  // CSS Classes: kebab-case
  cssClasses: {
    pattern: /^[a-z][a-z0-9-]*$/,
    description: 'CSS classes should use kebab-case',
    examples: ['user-profile', 'login-form', 'navigation-menu', 'error-message'],
    severity: 'error'
  },

  // API Endpoints: kebab-case
  apiEndpoints: {
    pattern: /^\/[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)*$/,
    description: 'API endpoints should use kebab-case',
    examples: ['/api/user-profile', '/api/auth/login', '/api/payment-methods', '/api/order-history'],
    severity: 'error'
  }
}

// =============================================================================
// SPECIALIZED NAMING PATTERNS
// =============================================================================

/**
 * React-specific naming patterns
 */
export const reactNamingPatterns = {
  // Hook names: use + PascalCase
  hooks: {
    pattern: /^use[A-Z][a-zA-Z0-9]*$/,
    description: 'React hooks should start with "use" followed by PascalCase',
    examples: ['useUserData', 'useFormValidation', 'useLocalStorage', 'useApiCall'],
    severity: 'error'
  },

  // Event handlers: handle + PascalCase
  eventHandlers: {
    pattern: /^handle[A-Z][a-zA-Z0-9]*$/,
    description: 'Event handlers should start with "handle" followed by PascalCase',
    examples: ['handleSubmit', 'handleClick', 'handleChange', 'handleKeyDown'],
    severity: 'error'
  },

  // State setters: set + PascalCase
  stateSetters: {
    pattern: /^set[A-Z][a-zA-Z0-9]*$/,
    description: 'State setters should start with "set" followed by PascalCase',
    examples: ['setUserName', 'setIsLoading', 'setHasError', 'setCurrentPage'],
    severity: 'error'
  },

  // Props: camelCase
  props: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    description: 'Component props should use camelCase',
    examples: ['userName', 'isVisible', 'onSubmit', 'className'],
    severity: 'error'
  }
}

/**
 * API-specific naming patterns
 */
export const apiNamingPatterns = {
  // API routes: kebab-case
  routes: {
    pattern: /^\/api\/[a-z][a-z0-9-]*(\/[a-z][a-z0-9-]*)*$/,
    description: 'API routes should use kebab-case',
    examples: ['/api/user-profile', '/api/auth/login', '/api/payment-methods'],
    severity: 'error'
  },

  // Request/Response types: PascalCase + Request/Response
  requestResponse: {
    pattern: /^[A-Z][a-zA-Z0-9]*(Request|Response)$/,
    description: 'Request/Response types should use PascalCase with Request/Response suffix',
    examples: ['UserLoginRequest', 'PaymentResponse', 'ApiErrorResponse'],
    severity: 'error'
  },

  // HTTP methods: lowercase
  httpMethods: {
    pattern: /^(get|post|put|patch|delete|head|options)$/,
    description: 'HTTP methods should be lowercase',
    examples: ['get', 'post', 'put', 'patch', 'delete'],
    severity: 'error'
  }
}

/**
 * Database-specific naming patterns
 */
export const databaseNamingPatterns = {
  // Table names: snake_case
  tables: {
    pattern: /^[a-z][a-z0-9_]*$/,
    description: 'Database table names should use snake_case',
    examples: ['user_profiles', 'order_items', 'payment_methods', 'audit_logs'],
    severity: 'error'
  },

  // Column names: snake_case
  columns: {
    pattern: /^[a-z][a-z0-9_]*$/,
    description: 'Database column names should use snake_case',
    examples: ['user_id', 'created_at', 'is_active', 'first_name'],
    severity: 'error'
  },

  // Index names: snake_case with descriptive prefix
  indexes: {
    pattern: /^(idx_|uk_|pk_)[a-z][a-z0-9_]*$/,
    description: 'Database index names should use snake_case with descriptive prefix',
    examples: ['idx_user_email', 'uk_user_username', 'pk_user_id'],
    severity: 'error'
  }
}

// =============================================================================
// NAMING VALIDATION UTILITIES
// =============================================================================

/**
 * Validate a name against a naming convention
 */
export function validateName(
  name: string,
  convention: NamingConvention,
  context?: string
): { isValid: boolean; message?: string } {
  if (!convention.pattern.test(name)) {
    return {
      isValid: false,
      message: `${convention.description}. ${context ? `Context: ${context}` : ''} Examples: ${convention.examples.join(', ')}`
    }
  }

  return { isValid: true }
}

/**
 * Validate multiple names against their respective conventions
 */
export function validateNames(names: Record<string, { name: string; convention: NamingConvention; context?: string }>) {
  const results: Record<string, { isValid: boolean; message?: string }> = {}

  for (const [key, { name, convention, context }] of Object.entries(names)) {
    results[key] = validateName(name, convention, context)
  }

  return results
}

/**
 * Get naming convention for a specific type
 */
export function getConventionForType(type: keyof NamingRules): NamingConvention {
  return namingConventions[type]
}

/**
 * Suggest corrections for invalid names
 */
export function suggestCorrection(
  invalidName: string,
  convention: NamingConvention
): string[] {
  const suggestions: string[] = []

  // Basic transformations based on convention type
  if (convention === namingConventions.variables || convention === namingConventions.functions) {
    // Convert to camelCase
    const camelCase = invalidName
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^[A-Z]/, char => char.toLowerCase())
    suggestions.push(camelCase)
  }

  if (convention === namingConventions.components || convention === namingConventions.interfaces) {
    // Convert to PascalCase
    const pascalCase = invalidName
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^[a-z]/, char => char.toUpperCase())
    suggestions.push(pascalCase)
  }

  if (convention === namingConventions.constants) {
    // Convert to SCREAMING_SNAKE_CASE
    const screamingSnakeCase = invalidName
      .replace(/[-.\s]+/g, '_')
      .toUpperCase()
    suggestions.push(screamingSnakeCase)
  }

  if (convention === namingConventions.files || convention === namingConventions.directories) {
    // Convert to kebab-case
    const kebabCase = invalidName
      .replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)
      .replace(/[-_\s]+/g, '-')
      .replace(/^-+|-+$/g, '')
    suggestions.push(kebabCase)
  }

  return suggestions.filter(suggestion => suggestion !== invalidName)
}

// =============================================================================
// AUTOMATED ENFORCEMENT
// =============================================================================

/**
 * Generate ESLint rules for naming conventions
 */
export function generateESLintRules(): Record<string, any> {
  return {
    '@typescript-eslint/naming-convention': [
      'error',
      // Variables and functions
      {
        selector: 'variable',
        format: ['camelCase'],
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid'
      },
      {
        selector: 'function',
        format: ['camelCase'],
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid'
      },
      // Types and interfaces
      {
        selector: 'typeLike',
        format: ['PascalCase'],
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid'
      },
      // Constants
      {
        selector: 'variable',
        modifiers: ['const'],
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid'
      },
      // React components
      {
        selector: 'function',
        filter: {
          regex: '^[A-Z]',
          match: true
        },
        format: ['PascalCase'],
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid'
      }
    ]
  }
}

/**
 * Generate Prettier configuration for naming conventions
 */
export function generatePrettierConfig(): Record<string, any> {
  return {
    // Prettier doesn't handle naming conventions directly
    // But we can ensure consistent formatting
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    tabWidth: 2,
    printWidth: 80
  }
}

export default namingConventions
