import { ValidationRule } from "@/components/form-builder/form-builder-engine"

export interface ValidationFeedback {
  fieldId: string
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  score: number // 0-100 validation quality score
}

export interface ValidationError {
  rule: ValidationRule["type"]
  message: string
  severity: "error" | "critical"
  code: string
  position?: number
}

export interface ValidationWarning {
  message: string
  type: "security" | "usability" | "formatting" | "accessibility"
  suggestion?: string
}

export interface ValidationSuggestion {
  message: string
  type: "improvement" | "alternative" | "best_practice"
  action?: "auto_fix" | "user_choice" | "info_only"
  autoFixValue?: any
}

export interface ValidationFeedbackConfig {
  enableRealTimeValidation: boolean
  enableSmartSuggestions: boolean
  enableProgressiveValidation: boolean
  enableContextualHelp: boolean
  showValidationScore: boolean
  feedbackDelay: number
  validationMode: "strict" | "moderate" | "lenient"
}

export class ValidationFeedbackSystem {
  private config: ValidationFeedbackConfig
  private validationHistory: Map<string, ValidationFeedback[]> = new Map()
  private feedbackTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: Partial<ValidationFeedbackConfig> = {}) {
    this.config = {
      enableRealTimeValidation: true,
      enableSmartSuggestions: true,
      enableProgressiveValidation: true,
      enableContextualHelp: true,
      showValidationScore: true,
      feedbackDelay: 300,
      validationMode: "moderate",
      ...config
    }
  }

  validateField(
    fieldId: string,
    fieldType: string,
    value: any,
    rules: ValidationRule[],
    context?: any
  ): ValidationFeedback {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Basic validation against rules
    rules.forEach(rule => {
      const error = this.validateRule(value, rule, fieldType)
      if (error) {
        errors.push(error)
      }
    })

    // Smart suggestions and warnings
    if (this.config.enableSmartSuggestions) {
      const smartFeedback = this.generateSmartFeedback(fieldId, fieldType, value, context)
      warnings.push(...smartFeedback.warnings)
      suggestions.push(...smartFeedback.suggestions)
    }

    // Security analysis
    const securityWarnings = this.analyzeSecurityRisks(fieldType, value)
    warnings.push(...securityWarnings)

    // Usability analysis
    const usabilityWarnings = this.analyzeUsability(fieldType, value, rules)
    warnings.push(...usabilityWarnings)

    // Calculate validation score
    const score = this.calculateValidationScore(errors, warnings, suggestions)

    const feedback: ValidationFeedback = {
      fieldId,
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score
    }

    // Store in history for progressive validation
    this.storeValidationHistory(fieldId, feedback)

    return feedback
  }

  private validateRule(value: any, rule: ValidationRule, fieldType: string): ValidationError | null {
    switch (rule.type) {
      case "required":
        if (value === null || value === undefined || value === "") {
          return {
            rule: "required",
            message: rule.message || "This field is required",
            severity: "error",
            code: "REQUIRED_FIELD_EMPTY"
          }
        }
        break

      case "minLength":
        if (typeof rule.value === "number" && typeof value === "string") {
          if (value.length < rule.value) {
            return {
              rule: "minLength",
              message: rule.message || `Minimum ${rule.value} characters required`,
              severity: "error",
              code: "MIN_LENGTH_NOT_MET",
              position: value.length
            }
          }
        }
        break

      case "maxLength":
        if (typeof rule.value === "number" && typeof value === "string") {
          if (value.length > rule.value) {
            return {
              rule: "maxLength",
              message: rule.message || `Maximum ${rule.value} characters allowed`,
              severity: "error",
              code: "MAX_LENGTH_EXCEEDED",
              position: rule.value
            }
          }
        }
        break

      case "pattern":
        if (typeof rule.value === "string" && typeof value === "string") {
          try {
            const regex = new RegExp(rule.value)
            if (!regex.test(value)) {
              return {
                rule: "pattern",
                message: rule.message || "Invalid format",
                severity: "error",
                code: "PATTERN_MISMATCH"
              }
            }
          } catch (error) {
            return {
              rule: "pattern",
              message: "Invalid validation pattern",
              severity: "critical",
              code: "INVALID_PATTERN"
            }
          }
        }
        break

      case "email":
        if (typeof value === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            return {
              rule: "email",
              message: rule.message || "Invalid email address",
              severity: "error",
              code: "INVALID_EMAIL_FORMAT"
            }
          }
        }
        break

      case "number":
        if (typeof value !== "number" && isNaN(Number(value))) {
          return {
            rule: "number",
            message: rule.message || "Must be a valid number",
            severity: "error",
            code: "INVALID_NUMBER_FORMAT"
          }
        }
        break
    }

    return null
  }

  private generateSmartFeedback(
    fieldId: string,
    fieldType: string,
    value: any,
    context?: any
  ): { warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    switch (fieldType) {
      case "email":
        if (typeof value === "string" && value.length > 0) {
          // Check for common email mistakes
          if (value.includes("..")) {
            suggestions.push({
              message: "Double dots in email address may cause delivery issues",
              type: "improvement",
              action: "user_choice"
            })
          }

          // Suggest common domains
          if (value.includes("@") && !value.includes(".")) {
            const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
            const username = value.split("@")[0]
            suggestions.push({
              message: "Did you mean one of these?",
              type: "alternative",
              action: "user_choice",
              autoFixValue: `${username}@gmail.com`
            })
          }

          // Check for disposable email domains
          const disposableDomains = ["10minutemail.com", "tempmail.org", "guerrillamail.com"]
          const domain = value.split("@")[1]
          if (disposableDomains.includes(domain)) {
            warnings.push({
              message: "This appears to be a temporary email address",
              type: "usability",
              suggestion: "Consider using a permanent email address"
            })
          }
        }
        break

      case "phone":
        if (typeof value === "string" && value.length > 0) {
          // Check for international format
          if (!value.startsWith("+") && value.length > 10) {
            suggestions.push({
              message: "Consider adding country code",
              type: "improvement",
              action: "auto_fix",
              autoFixValue: `+1${value}`
            })
          }

          // Format suggestion
          if (value.replace(/\D/g, "").length === 10) {
            const formatted = value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
            suggestions.push({
              message: "Format phone number",
              type: "improvement",
              action: "auto_fix",
              autoFixValue: formatted
            })
          }
        }
        break

      case "text":
        if (typeof value === "string") {
          // Check for all caps
          if (value.length > 3 && value === value.toUpperCase()) {
            suggestions.push({
              message: "Consider using normal capitalization",
              type: "improvement",
              action: "auto_fix",
              autoFixValue: this.toTitleCase(value)
            })
          }

          // Check for extra spaces
          if (value.includes("  ")) {
            suggestions.push({
              message: "Remove extra spaces",
              type: "improvement",
              action: "auto_fix",
              autoFixValue: value.replace(/\s+/g, " ").trim()
            })
          }
        }
        break

      case "textarea":
        if (typeof value === "string") {
          // Suggest line breaks for long text
          if (value.length > 200 && !value.includes("\n")) {
            suggestions.push({
              message: "Consider breaking long text into paragraphs",
              type: "best_practice",
              action: "info_only"
            })
          }

          // Check for potential PII
          const piiPatterns = [
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /\b\d{16}\b/, // Credit card
            /\b\d{3}-\d{3}-\d{4}\b/ // Phone
          ]

          piiPatterns.forEach(pattern => {
            if (pattern.test(value)) {
              warnings.push({
                message: "This field may contain sensitive information",
                type: "security",
                suggestion: "Avoid entering personal identification numbers"
              })
            }
          })
        }
        break
    }

    return { warnings, suggestions }
  }

  private analyzeSecurityRisks(fieldType: string, value: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = []

    if (typeof value !== "string") return warnings

    // Check for potential XSS
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /onload=/i,
      /onerror=/i
    ]

    xssPatterns.forEach(pattern => {
      if (pattern.test(value)) {
        warnings.push({
          message: "Input contains potentially unsafe content",
          type: "security",
          suggestion: "Remove script tags and event handlers"
        })
      }
    })

    // Check for SQL injection patterns (for information only)
    const sqlPatterns = [
      /'\s*or\s*'1'\s*=\s*'1/i,
      /'\s*union\s*select/i,
      /'\s*drop\s*table/i
    ]

    sqlPatterns.forEach(pattern => {
      if (pattern.test(value)) {
        warnings.push({
          message: "Input contains SQL-like syntax",
          type: "security",
          suggestion: "This pattern may cause issues with data processing"
        })
      }
    })

    return warnings
  }

  private analyzeUsability(fieldType: string, value: any, rules: ValidationRule[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = []

    if (typeof value !== "string") return warnings

    // Check for overly complex passwords
    if (fieldType === "password" || fieldType === "text") {
      const hasPasswordRules = rules.some(rule => rule.type === "pattern" || rule.type === "minLength")
      if (hasPasswordRules && value.length > 0) {
        const complexity = this.calculatePasswordComplexity(value)
        if (complexity.score < 30) {
          warnings.push({
            message: "Password strength is low",
            type: "usability",
            suggestion: "Add numbers, symbols, or make it longer"
          })
        }
      }
    }

    // Check for accessibility issues
    if (value.length > 50 && fieldType === "text") {
      warnings.push({
        message: "Long text in single-line field",
        type: "accessibility",
        suggestion: "Consider using a textarea for longer content"
      })
    }

    return warnings
  }

  private calculatePasswordComplexity(password: string): { score: number; feedback: string[] } {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) score += 20
    else feedback.push("Use at least 8 characters")

    if (/[a-z]/.test(password)) score += 10
    else feedback.push("Add lowercase letters")

    if (/[A-Z]/.test(password)) score += 10
    else feedback.push("Add uppercase letters")

    if (/\d/.test(password)) score += 10
    else feedback.push("Add numbers")

    if (/[^a-zA-Z\d]/.test(password)) score += 15
    else feedback.push("Add special characters")

    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10

    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) score -= 10 // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 15 // Sequential characters

    return { score: Math.max(0, Math.min(100, score)), feedback }
  }

  private calculateValidationScore(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): number {
    let score = 100

    // Deduct for errors
    score -= errors.filter(e => e.severity === "critical").length * 30
    score -= errors.filter(e => e.severity === "error").length * 20

    // Deduct for warnings
    score -= warnings.filter(w => w.type === "security").length * 15
    score -= warnings.filter(w => w.type === "accessibility").length * 10
    score -= warnings.filter(w => w.type === "usability").length * 5

    // Bonus for having improvement suggestions addressed
    score += suggestions.filter(s => s.type === "improvement").length * 2

    return Math.max(0, Math.min(100, score))
  }

  private storeValidationHistory(fieldId: string, feedback: ValidationFeedback): void {
    if (!this.validationHistory.has(fieldId)) {
      this.validationHistory.set(fieldId, [])
    }

    const history = this.validationHistory.get(fieldId)!
    history.push(feedback)

    // Keep only last 10 validation attempts
    if (history.length > 10) {
      history.shift()
    }
  }

  private toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  getValidationHistory(fieldId: string): ValidationFeedback[] {
    return this.validationHistory.get(fieldId) || []
  }

  getFieldValidationTrends(fieldId: string): ValidationTrends {
    const history = this.getValidationHistory(fieldId)

    return {
      improvementTrend: this.calculateImprovementTrend(history),
      commonErrors: this.getCommonErrors(history),
      averageScore: this.getAverageScore(history),
      validationAttempts: history.length
    }
  }

  private calculateImprovementTrend(history: ValidationFeedback[]): "improving" | "stable" | "declining" {
    if (history.length < 3) return "stable"

    const recent = history.slice(-3)
    const scores = recent.map(h => h.score)

    const trend = scores[2] - scores[0]
    if (trend > 10) return "improving"
    if (trend < -10) return "declining"
    return "stable"
  }

  private getCommonErrors(history: ValidationFeedback[]): Array<{ error: string; count: number }> {
    const errorCounts: Record<string, number> = {}

    history.forEach(feedback => {
      feedback.errors.forEach(error => {
        errorCounts[error.code] = (errorCounts[error.code] || 0) + 1
      })
    })

    return Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private getAverageScore(history: ValidationFeedback[]): number {
    if (history.length === 0) return 0
    return history.reduce((sum, h) => sum + h.score, 0) / history.length
  }

  setupRealTimeValidation(
    element: HTMLElement,
    fieldId: string,
    fieldType: string,
    rules: ValidationRule[],
    onFeedback: (feedback: ValidationFeedback) => void
  ): void {
    if (!this.config.enableRealTimeValidation) return

    const validateWithDelay = (value: any) => {
      // Clear existing timer
      const existingTimer = this.feedbackTimers.get(fieldId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set new timer
      const timer = setTimeout(() => {
        const feedback = this.validateField(fieldId, fieldType, value, rules)
        onFeedback(feedback)
      }, this.config.feedbackDelay)

      this.feedbackTimers.set(fieldId, timer)
    }

    element.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement
      validateWithDelay(target.value)
    })

    element.addEventListener("blur", (event) => {
      const target = event.target as HTMLInputElement
      // Clear timer and validate immediately on blur
      const existingTimer = this.feedbackTimers.get(fieldId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      const feedback = this.validateField(fieldId, fieldType, target.value, rules)
      onFeedback(feedback)
    })
  }
}

export interface ValidationTrends {
  improvementTrend: "improving" | "stable" | "declining"
  commonErrors: Array<{ error: string; count: number }>
  averageScore: number
  validationAttempts: number
}

export const defaultValidationFeedbackConfig: ValidationFeedbackConfig = {
  enableRealTimeValidation: true,
  enableSmartSuggestions: true,
  enableProgressiveValidation: true,
  enableContextualHelp: true,
  showValidationScore: true,
  feedbackDelay: 300,
  validationMode: "moderate"
}

export function createValidationFeedbackSystem(config?: Partial<ValidationFeedbackConfig>): ValidationFeedbackSystem {
  return new ValidationFeedbackSystem(config)
}