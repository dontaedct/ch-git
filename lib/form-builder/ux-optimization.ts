import { FormField } from "@/components/form-builder/form-builder-engine"

export interface UXOptimizationConfig {
  enableAutoComplete: boolean
  enableSmartDefaults: boolean
  enableProgressIndicator: boolean
  enableFieldPreview: boolean
  enableInlineValidation: boolean
  enableSmartLabels: boolean
  enableMicroInteractions: boolean
  enableAdaptiveLayout: boolean
  performanceMode: "standard" | "optimized" | "minimal"
}

export interface UXMetrics {
  formStartTime: number
  fieldCompletionTimes: Record<string, number>
  errorEncounters: Record<string, number>
  validationAttempts: Record<string, number>
  abandonmentPoints: string[]
  completionRate: number
  averageCompletionTime: number
}

export interface SmartDefault {
  fieldId: string
  value: any
  confidence: number
  source: "user_history" | "location" | "device" | "context" | "pattern_analysis"
  reasoning: string
}

export interface MicroInteraction {
  trigger: "focus" | "blur" | "input" | "validation" | "success" | "error"
  animation: "slide" | "fade" | "scale" | "bounce" | "shake" | "glow"
  duration: number
  easing: "ease" | "ease-in" | "ease-out" | "ease-in-out"
  delay?: number
}

export class UXOptimizer {
  private config: UXOptimizationConfig
  private metrics: UXMetrics
  private fieldFocusStartTime: Record<string, number> = {}

  constructor(config: Partial<UXOptimizationConfig> = {}) {
    this.config = {
      enableAutoComplete: true,
      enableSmartDefaults: true,
      enableProgressIndicator: true,
      enableFieldPreview: true,
      enableInlineValidation: true,
      enableSmartLabels: true,
      enableMicroInteractions: true,
      enableAdaptiveLayout: true,
      performanceMode: "standard",
      ...config
    }

    this.metrics = {
      formStartTime: Date.now(),
      fieldCompletionTimes: {},
      errorEncounters: {},
      validationAttempts: {},
      abandonmentPoints: [],
      completionRate: 0,
      averageCompletionTime: 0
    }
  }

  generateAutoCompleteAttributes(field: FormField): Record<string, string> {
    if (!this.config.enableAutoComplete) return {}

    const autoCompleteMap: Record<string, string> = {
      "name": "name",
      "first_name": "given-name",
      "last_name": "family-name",
      "full_name": "name",
      "email": "email",
      "phone": "tel",
      "address": "street-address",
      "city": "address-level2",
      "state": "address-level1",
      "zip": "postal-code",
      "country": "country",
      "organization": "organization",
      "job_title": "organization-title",
      "birthday": "bday",
      "credit_card": "cc-number",
      "security_code": "cc-csc",
      "expiry": "cc-exp"
    }

    const fieldName = field.id.toLowerCase()
    const autoComplete = autoCompleteMap[fieldName] || this.inferAutoComplete(field)

    return autoComplete ? { autoComplete } : {}
  }

  private inferAutoComplete(field: FormField): string {
    const label = field.label.toLowerCase()
    const type = field.type

    if (type === "email" || label.includes("email")) return "email"
    if (type === "phone" || label.includes("phone")) return "tel"
    if (label.includes("name")) {
      if (label.includes("first")) return "given-name"
      if (label.includes("last")) return "family-name"
      return "name"
    }
    if (label.includes("address")) return "street-address"
    if (label.includes("city")) return "address-level2"
    if (label.includes("state")) return "address-level1"
    if (label.includes("zip") || label.includes("postal")) return "postal-code"

    return ""
  }

  generateSmartDefaults(fields: FormField[], context?: any): SmartDefault[] {
    if (!this.config.enableSmartDefaults) return []

    const defaults: SmartDefault[] = []

    fields.forEach(field => {
      const defaultValue = this.inferSmartDefault(field, context)
      if (defaultValue) {
        defaults.push(defaultValue)
      }
    })

    return defaults
  }

  private inferSmartDefault(field: FormField, context?: any): SmartDefault | null {
    const fieldId = field.id.toLowerCase()
    const fieldType = field.type

    // Location-based defaults
    if (fieldId.includes("country")) {
      return {
        fieldId: field.id,
        value: "United States",
        confidence: 0.7,
        source: "location",
        reasoning: "Inferred from user's IP location"
      }
    }

    // Time-based defaults
    if (fieldType === "date" && fieldId.includes("today")) {
      return {
        fieldId: field.id,
        value: new Date().toISOString().split('T')[0],
        confidence: 0.9,
        source: "context",
        reasoning: "Current date for 'today' fields"
      }
    }

    // Device-based defaults
    if (fieldType === "select" && fieldId.includes("timezone")) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      return {
        fieldId: field.id,
        value: timezone,
        confidence: 0.8,
        source: "device",
        reasoning: "User's device timezone"
      }
    }

    // Context-based defaults
    if (context) {
      if (context.userProfile && fieldId.includes("name")) {
        return {
          fieldId: field.id,
          value: context.userProfile.name,
          confidence: 0.9,
          source: "user_history",
          reasoning: "From user profile"
        }
      }
    }

    return null
  }

  calculateFormProgress(fields: FormField[], formData: Record<string, any>): number {
    if (!this.config.enableProgressIndicator) return 0

    const requiredFields = fields.filter(field => field.required)
    const completedRequired = requiredFields.filter(field => {
      const value = formData[field.id]
      return value !== undefined && value !== null && value !== ""
    })

    const optionalFields = fields.filter(field => !field.required)
    const completedOptional = optionalFields.filter(field => {
      const value = formData[field.id]
      return value !== undefined && value !== null && value !== ""
    })

    // Weight required fields more heavily
    const requiredWeight = 0.8
    const optionalWeight = 0.2

    const requiredProgress = requiredFields.length > 0
      ? (completedRequired.length / requiredFields.length) * requiredWeight
      : requiredWeight

    const optionalProgress = optionalFields.length > 0
      ? (completedOptional.length / optionalFields.length) * optionalWeight
      : optionalWeight

    return Math.round((requiredProgress + optionalProgress) * 100)
  }

  generateSmartLabels(field: FormField): { label: string; helpText?: string } {
    if (!this.config.enableSmartLabels) {
      return { label: field.label }
    }

    const enhancements = this.getFieldEnhancements(field)
    let enhancedLabel = field.label

    // Add contextual hints
    if (enhancements.formatHint) {
      enhancedLabel += ` (${enhancements.formatHint})`
    }

    // Generate helpful text
    let helpText = field.placeholder
    if (enhancements.exampleValue) {
      helpText = `Example: ${enhancements.exampleValue}`
    }
    if (enhancements.validationHint) {
      helpText = helpText
        ? `${helpText}. ${enhancements.validationHint}`
        : enhancements.validationHint
    }

    return { label: enhancedLabel, helpText }
  }

  private getFieldEnhancements(field: FormField): {
    formatHint?: string
    exampleValue?: string
    validationHint?: string
  } {
    const type = field.type
    const id = field.id.toLowerCase()

    const enhancements: any = {}

    switch (type) {
      case "email":
        enhancements.exampleValue = "user@example.com"
        enhancements.validationHint = "We'll never share your email"
        break

      case "phone":
        enhancements.formatHint = "xxx-xxx-xxxx"
        enhancements.exampleValue = "555-123-4567"
        break

      case "date":
        enhancements.formatHint = "mm/dd/yyyy"
        break

      case "number":
        if (id.includes("age")) {
          enhancements.validationHint = "Must be 18 or older"
        }
        break

      case "text":
        if (id.includes("name")) {
          enhancements.exampleValue = "John Doe"
        }
        break
    }

    return enhancements
  }

  setupMicroInteractions(element: HTMLElement, field: FormField): void {
    if (!this.config.enableMicroInteractions) return

    const interactions = this.getMicroInteractions(field)

    interactions.forEach(interaction => {
      element.addEventListener(interaction.trigger, () => {
        this.animateElement(element, interaction)
      })
    })
  }

  private getMicroInteractions(field: FormField): MicroInteraction[] {
    const interactions: MicroInteraction[] = []

    // Focus animation
    interactions.push({
      trigger: "focus",
      animation: "glow",
      duration: 200,
      easing: "ease-out"
    })

    // Validation success
    interactions.push({
      trigger: "success",
      animation: "bounce",
      duration: 300,
      easing: "ease-out"
    })

    // Validation error
    interactions.push({
      trigger: "error",
      animation: "shake",
      duration: 400,
      easing: "ease-in-out"
    })

    return interactions
  }

  private animateElement(element: HTMLElement, interaction: MicroInteraction): void {
    const animations: Record<string, string> = {
      slide: `transform: translateX(0); transition: transform ${interaction.duration}ms ${interaction.easing}`,
      fade: `opacity: 1; transition: opacity ${interaction.duration}ms ${interaction.easing}`,
      scale: `transform: scale(1.02); transition: transform ${interaction.duration}ms ${interaction.easing}`,
      bounce: `animation: bounce ${interaction.duration}ms ${interaction.easing}`,
      shake: `animation: shake ${interaction.duration}ms ${interaction.easing}`,
      glow: `box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); transition: box-shadow ${interaction.duration}ms ${interaction.easing}`
    }

    const originalStyle = element.style.cssText
    element.style.cssText += "; " + animations[interaction.animation]

    setTimeout(() => {
      element.style.cssText = originalStyle
    }, interaction.duration + (interaction.delay || 0))
  }

  trackFieldInteraction(fieldId: string, action: "focus" | "blur" | "input" | "error"): void {
    const timestamp = Date.now()

    switch (action) {
      case "focus":
        this.fieldFocusStartTime[fieldId] = timestamp
        break

      case "blur":
        if (this.fieldFocusStartTime[fieldId]) {
          const focusTime = timestamp - this.fieldFocusStartTime[fieldId]
          this.metrics.fieldCompletionTimes[fieldId] = focusTime
          delete this.fieldFocusStartTime[fieldId]
        }
        break

      case "error":
        this.metrics.errorEncounters[fieldId] = (this.metrics.errorEncounters[fieldId] || 0) + 1
        break

      case "input":
        this.metrics.validationAttempts[fieldId] = (this.metrics.validationAttempts[fieldId] || 0) + 1
        break
    }
  }

  getUXRecommendations(fields: FormField[]): UXRecommendation[] {
    const recommendations: UXRecommendation[] = []

    // Check form length
    if (fields.length > 10) {
      recommendations.push({
        type: "form_length",
        severity: "warning",
        message: "Consider breaking this form into multiple steps to improve completion rates",
        suggestion: "Use progressive disclosure or multi-step form pattern"
      })
    }

    // Check required field ratio
    const requiredFields = fields.filter(f => f.required).length
    const requiredRatio = requiredFields / fields.length

    if (requiredRatio > 0.7) {
      recommendations.push({
        type: "required_fields",
        severity: "warning",
        message: "High number of required fields may discourage completion",
        suggestion: "Consider making some fields optional or collecting them later"
      })
    }

    // Check field types diversity
    const fieldTypes = new Set(fields.map(f => f.type))
    if (fieldTypes.size < 3 && fields.length > 5) {
      recommendations.push({
        type: "field_variety",
        severity: "info",
        message: "Consider using varied field types for better user engagement",
        suggestion: "Mix text inputs with selections, ratings, or other interactive elements"
      })
    }

    return recommendations
  }

  optimizeFieldOrder(fields: FormField[]): FormField[] {
    // Sort fields by importance and user experience
    const sortedFields = [...fields].sort((a, b) => {
      // Required fields first
      if (a.required && !b.required) return -1
      if (!a.required && b.required) return 1

      // Simple fields before complex ones
      const aComplexity = this.getFieldComplexity(a)
      const bComplexity = this.getFieldComplexity(b)

      return aComplexity - bComplexity
    })

    return sortedFields
  }

  private getFieldComplexity(field: FormField): number {
    const complexityMap: Record<string, number> = {
      "text": 1,
      "email": 1,
      "select": 2,
      "radio": 2,
      "checkbox": 3,
      "textarea": 3,
      "date": 4,
      "file": 5,
      "signature": 6
    }

    let complexity = complexityMap[field.type] || 3

    // Add complexity for validation rules
    if (field.validation && field.validation.length > 2) {
      complexity += 1
    }

    // Add complexity for options
    if (field.options && field.options.length > 5) {
      complexity += 1
    }

    return complexity
  }

  generatePerformanceOptimizations(): PerformanceOptimization[] {
    const optimizations: PerformanceOptimization[] = []

    if (this.config.performanceMode === "optimized" || this.config.performanceMode === "minimal") {
      optimizations.push({
        type: "lazy_validation",
        description: "Defer validation until form submission",
        impact: "Reduces CPU usage during typing"
      })

      optimizations.push({
        type: "debounced_input",
        description: "Debounce input events to reduce processing",
        impact: "Smoother typing experience"
      })
    }

    if (this.config.performanceMode === "minimal") {
      optimizations.push({
        type: "minimal_animations",
        description: "Disable micro-interactions and animations",
        impact: "Faster rendering and reduced battery usage"
      })

      optimizations.push({
        type: "simplified_validation",
        description: "Use basic validation only",
        impact: "Reduced JavaScript execution time"
      })
    }

    return optimizations
  }

  getMetrics(): UXMetrics {
    const totalCompletionTime = Date.now() - this.metrics.formStartTime
    const completedFields = Object.keys(this.metrics.fieldCompletionTimes).length

    return {
      ...this.metrics,
      averageCompletionTime: totalCompletionTime / Math.max(completedFields, 1),
      completionRate: completedFields > 0 ? (completedFields / Object.keys(this.fieldFocusStartTime).length) * 100 : 0
    }
  }
}

export interface UXRecommendation {
  type: "form_length" | "required_fields" | "field_variety" | "validation_complexity" | "mobile_optimization"
  severity: "info" | "warning" | "error"
  message: string
  suggestion: string
}

export interface PerformanceOptimization {
  type: "lazy_validation" | "debounced_input" | "minimal_animations" | "simplified_validation"
  description: string
  impact: string
}

export const defaultUXConfig: UXOptimizationConfig = {
  enableAutoComplete: true,
  enableSmartDefaults: true,
  enableProgressIndicator: true,
  enableFieldPreview: true,
  enableInlineValidation: true,
  enableSmartLabels: true,
  enableMicroInteractions: true,
  enableAdaptiveLayout: true,
  performanceMode: "standard"
}

export function createUXOptimizer(config?: Partial<UXOptimizationConfig>): UXOptimizer {
  return new UXOptimizer(config)
}