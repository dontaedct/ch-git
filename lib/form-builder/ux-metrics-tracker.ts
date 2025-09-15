/**
 * UX Metrics Tracker for Form Builder
 * Implements comprehensive user experience tracking and analytics
 * Part of HT-023.4.1 User Experience Optimization
 */

export interface UXMetricsData {
  sessionId: string
  formId: string
  userId?: string
  startTime: number
  endTime?: number
  completionStatus: "completed" | "abandoned" | "in_progress"

  // Form-level metrics
  totalFields: number
  requiredFields: number
  completedFields: number
  formProgress: number

  // Time-based metrics
  totalTime: number
  averageFieldTime: number
  fastestFieldTime: number
  slowestFieldTime: number

  // Interaction metrics
  fieldInteractions: Record<string, FieldInteractionMetrics>
  errorEncounters: ErrorMetrics[]
  validationAttempts: number
  focusChanges: number
  scrollEvents: number

  // UX score components
  usabilityScore: number
  completionEfficiency: number
  errorRecoveryRate: number
  userSatisfactionScore?: number

  // Device and context
  deviceType: "desktop" | "mobile" | "tablet"
  screenSize: { width: number; height: number }
  browserInfo: string
  userAgent: string
}

export interface FieldInteractionMetrics {
  fieldId: string
  fieldType: string
  label: string

  // Time metrics
  focusTime: number
  blurTime?: number
  totalFocusTime: number
  averageInputDelay: number

  // Interaction counts
  focusCount: number
  inputEvents: number
  validationErrors: number
  correctionAttempts: number

  // Completion status
  completed: boolean
  abandoned: boolean
  finalValue?: any

  // UX indicators
  hesitationTime: number // time between focus and first input
  confidenceScore: number // based on editing patterns
}

export interface ErrorMetrics {
  fieldId: string
  errorType: string
  errorMessage: string
  timestamp: number
  recoveryTime?: number
  recoveryMethod: "correction" | "help_viewed" | "abandoned"
  userFrustrationLevel: "low" | "medium" | "high"
}

export interface UXRecommendation {
  type: "field_order" | "validation_timing" | "help_text" | "field_type" | "form_length"
  priority: "high" | "medium" | "low"
  fieldId?: string
  issue: string
  suggestion: string
  expectedImprovement: string
  implementationEffort: "low" | "medium" | "high"
}

export class UXMetricsTracker {
  private metrics: UXMetricsData
  private fieldStartTimes: Record<string, number> = {}
  private inputDelays: Record<string, number[]> = {}
  private hesitationTimers: Record<string, number> = {}
  private observers: Map<string, MutationObserver> = new Map()

  constructor(formId: string, userId?: string) {
    this.metrics = {
      sessionId: this.generateSessionId(),
      formId,
      userId,
      startTime: Date.now(),
      completionStatus: "in_progress",
      totalFields: 0,
      requiredFields: 0,
      completedFields: 0,
      formProgress: 0,
      totalTime: 0,
      averageFieldTime: 0,
      fastestFieldTime: Infinity,
      slowestFieldTime: 0,
      fieldInteractions: {},
      errorEncounters: [],
      validationAttempts: 0,
      focusChanges: 0,
      scrollEvents: 0,
      usabilityScore: 0,
      completionEfficiency: 0,
      errorRecoveryRate: 0,
      deviceType: this.detectDeviceType(),
      screenSize: { width: window.innerWidth, height: window.innerHeight },
      browserInfo: navigator.userAgent.split(' ')[0],
      userAgent: navigator.userAgent
    }

    this.setupEventListeners()
  }

  private generateSessionId(): string {
    return `ux_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private detectDeviceType(): "desktop" | "mobile" | "tablet" {
    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }

  private setupEventListeners(): void {
    // Track scroll events for engagement
    window.addEventListener("scroll", this.handleScroll.bind(this), { passive: true })

    // Track window visibility for abandonment detection
    document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this))

    // Track window resize for responsive metrics
    window.addEventListener("resize", this.handleResize.bind(this))
  }

  initializeForm(fields: Array<{ id: string; type: string; required: boolean; label: string }>): void {
    this.metrics.totalFields = fields.length
    this.metrics.requiredFields = fields.filter(f => f.required).length

    fields.forEach(field => {
      this.metrics.fieldInteractions[field.id] = {
        fieldId: field.id,
        fieldType: field.type,
        label: field.label,
        focusTime: 0,
        totalFocusTime: 0,
        averageInputDelay: 0,
        focusCount: 0,
        inputEvents: 0,
        validationErrors: 0,
        correctionAttempts: 0,
        completed: false,
        abandoned: false,
        hesitationTime: 0,
        confidenceScore: 0
      }
    })
  }

  trackFieldFocus(fieldId: string): void {
    const timestamp = Date.now()
    this.fieldStartTimes[fieldId] = timestamp
    this.hesitationTimers[fieldId] = timestamp

    const fieldMetrics = this.metrics.fieldInteractions[fieldId]
    if (fieldMetrics) {
      fieldMetrics.focusTime = timestamp
      fieldMetrics.focusCount += 1
      this.metrics.focusChanges += 1
    }
  }

  trackFieldBlur(fieldId: string): void {
    const timestamp = Date.now()
    const startTime = this.fieldStartTimes[fieldId]

    if (startTime) {
      const focusTime = timestamp - startTime
      const fieldMetrics = this.metrics.fieldInteractions[fieldId]

      if (fieldMetrics) {
        fieldMetrics.blurTime = timestamp
        fieldMetrics.totalFocusTime += focusTime

        // Update form-level timing metrics
        this.metrics.averageFieldTime = this.calculateAverageFieldTime()
        this.metrics.fastestFieldTime = Math.min(this.metrics.fastestFieldTime, focusTime)
        this.metrics.slowestFieldTime = Math.max(this.metrics.slowestFieldTime, focusTime)
      }

      delete this.fieldStartTimes[fieldId]
    }
  }

  trackFieldInput(fieldId: string, value: any): void {
    const timestamp = Date.now()
    const fieldMetrics = this.metrics.fieldInteractions[fieldId]
    const hesitationStart = this.hesitationTimers[fieldId]

    if (fieldMetrics) {
      fieldMetrics.inputEvents += 1

      // Calculate hesitation time (time from focus to first input)
      if (hesitationStart && fieldMetrics.inputEvents === 1) {
        fieldMetrics.hesitationTime = timestamp - hesitationStart
        delete this.hesitationTimers[fieldId]
      }

      // Track input delay patterns
      const lastInputTime = this.inputDelays[fieldId]?.slice(-1)[0] || fieldMetrics.focusTime
      const inputDelay = timestamp - lastInputTime

      if (!this.inputDelays[fieldId]) {
        this.inputDelays[fieldId] = []
      }
      this.inputDelays[fieldId].push(inputDelay)

      fieldMetrics.averageInputDelay = this.inputDelays[fieldId].reduce((a, b) => a + b, 0) / this.inputDelays[fieldId].length

      // Update completion status
      if (value && value !== "") {
        fieldMetrics.completed = true
        fieldMetrics.finalValue = value
        this.updateFormProgress()
      }

      // Calculate confidence score based on editing patterns
      fieldMetrics.confidenceScore = this.calculateConfidenceScore(fieldId)
    }
  }

  trackValidationError(fieldId: string, errorType: string, errorMessage: string): void {
    const timestamp = Date.now()
    const fieldMetrics = this.metrics.fieldInteractions[fieldId]

    if (fieldMetrics) {
      fieldMetrics.validationErrors += 1
      this.metrics.validationAttempts += 1
    }

    this.metrics.errorEncounters.push({
      fieldId,
      errorType,
      errorMessage,
      timestamp,
      recoveryMethod: "correction", // Will be updated when error is resolved
      userFrustrationLevel: this.calculateFrustrationLevel(fieldId)
    })
  }

  trackErrorRecovery(fieldId: string, recoveryMethod: "correction" | "help_viewed" | "abandoned"): void {
    const lastError = this.metrics.errorEncounters
      .filter(e => e.fieldId === fieldId)
      .sort((a, b) => b.timestamp - a.timestamp)[0]

    if (lastError && !lastError.recoveryTime) {
      lastError.recoveryTime = Date.now() - lastError.timestamp
      lastError.recoveryMethod = recoveryMethod

      if (recoveryMethod === "correction") {
        const fieldMetrics = this.metrics.fieldInteractions[fieldId]
        if (fieldMetrics) {
          fieldMetrics.correctionAttempts += 1
        }
      }
    }

    this.updateErrorRecoveryRate()
  }

  trackFormCompletion(completed: boolean): void {
    this.metrics.endTime = Date.now()
    this.metrics.totalTime = this.metrics.endTime - this.metrics.startTime
    this.metrics.completionStatus = completed ? "completed" : "abandoned"

    if (!completed) {
      // Track abandonment point
      const lastActiveField = this.getLastActiveField()
      if (lastActiveField) {
        this.metrics.fieldInteractions[lastActiveField].abandoned = true
      }
    }

    this.calculateFinalScores()
  }

  trackUserSatisfaction(score: number): void {
    this.metrics.userSatisfactionScore = score
    this.calculateFinalScores()
  }

  private handleScroll(): void {
    this.metrics.scrollEvents += 1
  }

  private handleVisibilityChange(): void {
    if (document.hidden && this.metrics.completionStatus === "in_progress") {
      // User might be abandoning the form
      this.trackFormCompletion(false)
    }
  }

  private handleResize(): void {
    this.metrics.screenSize = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    this.metrics.deviceType = this.detectDeviceType()
  }

  private calculateAverageFieldTime(): number {
    const completedFields = Object.values(this.metrics.fieldInteractions)
      .filter(f => f.totalFocusTime > 0)

    if (completedFields.length === 0) return 0

    const totalTime = completedFields.reduce((sum, field) => sum + field.totalFocusTime, 0)
    return totalTime / completedFields.length
  }

  private calculateConfidenceScore(fieldId: string): number {
    const fieldMetrics = this.metrics.fieldInteractions[fieldId]
    if (!fieldMetrics) return 0

    // Factors that indicate confidence:
    // - Low hesitation time
    // - Consistent input delays
    // - Few corrections
    // - No validation errors

    let score = 100

    // Penalize long hesitation
    if (fieldMetrics.hesitationTime > 3000) score -= 20
    else if (fieldMetrics.hesitationTime > 1000) score -= 10

    // Penalize validation errors
    score -= fieldMetrics.validationErrors * 15

    // Penalize excessive corrections
    if (fieldMetrics.correctionAttempts > 2) score -= (fieldMetrics.correctionAttempts - 2) * 10

    // Reward consistent input patterns
    const inputDelays = this.inputDelays[fieldId] || []
    if (inputDelays.length > 1) {
      const variance = this.calculateVariance(inputDelays)
      if (variance < 500) score += 10 // Consistent typing rhythm
    }

    return Math.max(0, Math.min(100, score))
  }

  private calculateFrustrationLevel(fieldId: string): "low" | "medium" | "high" {
    const fieldMetrics = this.metrics.fieldInteractions[fieldId]
    if (!fieldMetrics) return "low"

    const errorCount = fieldMetrics.validationErrors
    const hesitation = fieldMetrics.hesitationTime
    const corrections = fieldMetrics.correctionAttempts

    if (errorCount >= 3 || hesitation > 5000 || corrections >= 3) return "high"
    if (errorCount >= 2 || hesitation > 2000 || corrections >= 2) return "medium"
    return "low"
  }

  private updateFormProgress(): void {
    const completedFields = Object.values(this.metrics.fieldInteractions)
      .filter(f => f.completed).length

    this.metrics.completedFields = completedFields
    this.metrics.formProgress = this.metrics.totalFields > 0
      ? Math.round((completedFields / this.metrics.totalFields) * 100)
      : 0
  }

  private updateErrorRecoveryRate(): void {
    const errorsWithRecovery = this.metrics.errorEncounters
      .filter(e => e.recoveryMethod === "correction")

    this.metrics.errorRecoveryRate = this.metrics.errorEncounters.length > 0
      ? (errorsWithRecovery.length / this.metrics.errorEncounters.length) * 100
      : 100
  }

  private getLastActiveField(): string | null {
    const interactions = Object.values(this.metrics.fieldInteractions)
      .filter(f => f.focusTime > 0)
      .sort((a, b) => (b.blurTime || b.focusTime) - (a.blurTime || a.focusTime))

    return interactions.length > 0 ? interactions[0].fieldId : null
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length
    return variance
  }

  private calculateFinalScores(): void {
    // Usability Score (0-100)
    this.metrics.usabilityScore = this.calculateUsabilityScore()

    // Completion Efficiency (0-100)
    this.metrics.completionEfficiency = this.calculateCompletionEfficiency()
  }

  private calculateUsabilityScore(): number {
    let score = 100

    // Factor in error rate
    const errorRate = this.metrics.errorEncounters.length / Math.max(this.metrics.totalFields, 1)
    score -= errorRate * 20

    // Factor in hesitation patterns
    const avgHesitation = Object.values(this.metrics.fieldInteractions)
      .reduce((sum, field) => sum + field.hesitationTime, 0) / this.metrics.totalFields

    if (avgHesitation > 3000) score -= 15
    else if (avgHesitation > 1500) score -= 10

    // Factor in completion rate
    score += this.metrics.formProgress * 0.3

    // Factor in user satisfaction if available
    if (this.metrics.userSatisfactionScore) {
      score = (score + this.metrics.userSatisfactionScore) / 2
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private calculateCompletionEfficiency(): number {
    if (this.metrics.totalTime === 0) return 0

    // Expected time per field (baseline: 30 seconds)
    const expectedTime = this.metrics.totalFields * 30000
    const actualTime = this.metrics.totalTime

    // Efficiency = (expected / actual) * 100, capped at 100
    const efficiency = (expectedTime / actualTime) * 100
    return Math.min(100, Math.round(efficiency))
  }

  generateUXRecommendations(): UXRecommendation[] {
    const recommendations: UXRecommendation[] = []

    // Analyze field order
    const fieldOrderRecommendation = this.analyzeFieldOrder()
    if (fieldOrderRecommendation) recommendations.push(fieldOrderRecommendation)

    // Analyze validation timing
    const validationRecommendation = this.analyzeValidationTiming()
    if (validationRecommendation) recommendations.push(validationRecommendation)

    // Analyze error-prone fields
    const errorFieldRecommendations = this.analyzeErrorProneFields()
    recommendations.push(...errorFieldRecommendations)

    // Analyze form length
    const lengthRecommendation = this.analyzeFormLength()
    if (lengthRecommendation) recommendations.push(lengthRecommendation)

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private analyzeFieldOrder(): UXRecommendation | null {
    const fields = Object.values(this.metrics.fieldInteractions)
    const avgHesitationTime = fields.reduce((sum, f) => sum + f.hesitationTime, 0) / fields.length

    if (avgHesitationTime > 2000) {
      return {
        type: "field_order",
        priority: "medium",
        issue: "Users are hesitating longer than expected when filling out fields",
        suggestion: "Consider reordering fields to start with simpler, more familiar information",
        expectedImprovement: "Reduce average hesitation time by 30-40%",
        implementationEffort: "low"
      }
    }

    return null
  }

  private analyzeValidationTiming(): UXRecommendation | null {
    const avgErrors = this.metrics.errorEncounters.length / this.metrics.totalFields

    if (avgErrors > 0.5) {
      return {
        type: "validation_timing",
        priority: "high",
        issue: "High error rate suggests validation timing or messaging issues",
        suggestion: "Implement real-time validation with helpful error messages",
        expectedImprovement: "Reduce error rate by 40-60%",
        implementationEffort: "medium"
      }
    }

    return null
  }

  private analyzeErrorProneFields(): UXRecommendation[] {
    const recommendations: UXRecommendation[] = []

    Object.values(this.metrics.fieldInteractions).forEach(field => {
      if (field.validationErrors > 2 || field.hesitationTime > 5000) {
        recommendations.push({
          type: "help_text",
          priority: "high",
          fieldId: field.fieldId,
          issue: `Field "${field.label}" has high error rate or hesitation time`,
          suggestion: "Add clearer help text, examples, or change field type",
          expectedImprovement: "Reduce field errors by 50%",
          implementationEffort: "low"
        })
      }
    })

    return recommendations
  }

  private analyzeFormLength(): UXRecommendation | null {
    if (this.metrics.totalFields > 12 && this.metrics.formProgress < 80) {
      return {
        type: "form_length",
        priority: "medium",
        issue: "Long form with low completion rate",
        suggestion: "Consider breaking into multiple steps or removing non-essential fields",
        expectedImprovement: "Increase completion rate by 20-30%",
        implementationEffort: "high"
      }
    }

    return null
  }

  getMetrics(): UXMetricsData {
    return { ...this.metrics }
  }

  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2)
  }

  destroy(): void {
    // Clean up event listeners
    window.removeEventListener("scroll", this.handleScroll)
    document.removeEventListener("visibilitychange", this.handleVisibilityChange)
    window.removeEventListener("resize", this.handleResize)

    // Clean up observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Export factory function
export function createUXMetricsTracker(formId: string, userId?: string): UXMetricsTracker {
  return new UXMetricsTracker(formId, userId)
}

// Export utility functions for analytics
export function calculateUXScore(metrics: UXMetricsData): number {
  const weights = {
    usabilityScore: 0.4,
    completionEfficiency: 0.3,
    errorRecoveryRate: 0.2,
    formProgress: 0.1
  }

  return Math.round(
    metrics.usabilityScore * weights.usabilityScore +
    metrics.completionEfficiency * weights.completionEfficiency +
    metrics.errorRecoveryRate * weights.errorRecoveryRate +
    metrics.formProgress * weights.formProgress
  )
}

export function generateUXReport(metrics: UXMetricsData): string {
  const uxScore = calculateUXScore(metrics)

  return `
# UX Analytics Report

## Overall UX Score: ${uxScore}/100

### Form Completion Metrics
- **Completion Status**: ${metrics.completionStatus}
- **Form Progress**: ${metrics.formProgress}%
- **Total Time**: ${Math.round(metrics.totalTime / 1000)}s
- **Average Field Time**: ${Math.round(metrics.averageFieldTime / 1000)}s

### Error Analysis
- **Total Errors**: ${metrics.errorEncounters.length}
- **Error Recovery Rate**: ${Math.round(metrics.errorRecoveryRate)}%
- **Validation Attempts**: ${metrics.validationAttempts}

### User Behavior
- **Focus Changes**: ${metrics.focusChanges}
- **Scroll Events**: ${metrics.scrollEvents}
- **Device Type**: ${metrics.deviceType}

### Field Performance
${Object.values(metrics.fieldInteractions)
  .sort((a, b) => b.validationErrors - a.validationErrors)
  .slice(0, 5)
  .map(field => `- **${field.label}**: ${field.validationErrors} errors, ${Math.round(field.hesitationTime / 1000)}s hesitation`)
  .join('\n')}

### Recommendations
Based on the analysis, consider implementing the following improvements:
1. Focus on fields with high error rates
2. Optimize form flow for better completion rates
3. Implement better validation feedback
4. Consider responsive design improvements for ${metrics.deviceType} users
  `.trim()
}