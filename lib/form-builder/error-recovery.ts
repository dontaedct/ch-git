import { FormField } from "@/components/form-builder/form-builder-engine"
import { ValidationError } from "./validation-feedback"

export interface ErrorRecoveryConfig {
  enableAutoRecovery: boolean
  enableSuggestions: boolean
  enableFormStateRecovery: boolean
  enableGracefulDegradation: boolean
  maxRecoveryAttempts: number
  recoveryDelay: number
  persistFormData: boolean
}

export interface FormError {
  id: string
  type: "validation" | "network" | "system" | "user" | "configuration"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  context: {
    fieldId?: string
    formId?: string
    timestamp: number
    userAgent?: string
    formData?: Record<string, any>
  }
  recoverable: boolean
  recoveryActions: RecoveryAction[]
}

export interface RecoveryAction {
  id: string
  type: "retry" | "skip" | "fix" | "report" | "save_draft" | "reload"
  label: string
  description: string
  automatic: boolean
  priority: "high" | "medium" | "low"
  callback?: () => Promise<boolean>
}

export interface ErrorState {
  hasErrors: boolean
  errors: FormError[]
  recoveryInProgress: boolean
  recoveryAttempts: number
  lastErrorTime: number
  formBackup?: Record<string, any>
}

export class ErrorRecoveryManager {
  private config: ErrorRecoveryConfig
  private errorState: ErrorState
  private recoveryTimers: Map<string, NodeJS.Timeout> = new Map()
  private formStateBackups: Map<string, Record<string, any>> = new Map()

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = {
      enableAutoRecovery: true,
      enableSuggestions: true,
      enableFormStateRecovery: true,
      enableGracefulDegradation: true,
      maxRecoveryAttempts: 3,
      recoveryDelay: 1000,
      persistFormData: true,
      ...config
    }

    this.errorState = {
      hasErrors: false,
      errors: [],
      recoveryInProgress: false,
      recoveryAttempts: 0,
      lastErrorTime: 0
    }

    this.setupGlobalErrorHandlers()
  }

  handleValidationError(
    fieldId: string,
    validationErrors: ValidationError[],
    formData: Record<string, any>
  ): FormError[] {
    const formErrors: FormError[] = []

    validationErrors.forEach(error => {
      const formError: FormError = {
        id: `validation_${fieldId}_${Date.now()}`,
        type: "validation",
        severity: error.severity === "critical" ? "critical" : "medium",
        message: error.message,
        context: {
          fieldId,
          timestamp: Date.now(),
          formData: this.sanitizeFormData(formData)
        },
        recoverable: true,
        recoveryActions: this.generateValidationRecoveryActions(fieldId, error, formData)
      }

      formErrors.push(formError)
    })

    this.addErrors(formErrors)
    return formErrors
  }

  handleNetworkError(
    operation: "submit" | "save" | "validate",
    error: Error,
    formData: Record<string, any>
  ): FormError {
    const formError: FormError = {
      id: `network_${operation}_${Date.now()}`,
      type: "network",
      severity: operation === "submit" ? "high" : "medium",
      message: this.getNetworkErrorMessage(error),
      context: {
        timestamp: Date.now(),
        formData: this.sanitizeFormData(formData)
      },
      recoverable: true,
      recoveryActions: this.generateNetworkRecoveryActions(operation, formData)
    }

    this.addErrors([formError])
    return formError
  }

  handleSystemError(
    error: Error,
    context: { component?: string; operation?: string; formData?: Record<string, any> }
  ): FormError {
    const formError: FormError = {
      id: `system_${Date.now()}`,
      type: "system",
      severity: "high",
      message: this.getSystemErrorMessage(error),
      context: {
        timestamp: Date.now(),
        formData: context.formData ? this.sanitizeFormData(context.formData) : undefined
      },
      recoverable: this.isSystemErrorRecoverable(error),
      recoveryActions: this.generateSystemRecoveryActions(error, context)
    }

    this.addErrors([formError])
    return formError
  }

  private generateValidationRecoveryActions(
    fieldId: string,
    error: ValidationError,
    formData: Record<string, any>
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = []

    switch (error.rule) {
      case "required":
        actions.push({
          id: "focus_field",
          type: "fix",
          label: "Focus on field",
          description: "Navigate to the field that needs attention",
          automatic: true,
          priority: "high",
          callback: async () => {
            const element = document.getElementById(fieldId)
            if (element) {
              element.focus()
              element.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            return true
          }
        })
        break

      case "email":
        // Suggest email corrections
        const emailValue = formData[fieldId] as string
        if (emailValue && this.config.enableSuggestions) {
          const suggestions = this.generateEmailSuggestions(emailValue)
          suggestions.forEach(suggestion => {
            actions.push({
              id: `suggestion_${suggestion}`,
              type: "fix",
              label: `Use ${suggestion}`,
              description: `Did you mean ${suggestion}?`,
              automatic: false,
              priority: "medium",
              callback: async () => {
                const element = document.getElementById(fieldId) as HTMLInputElement
                if (element) {
                  element.value = suggestion
                  element.dispatchEvent(new Event("input", { bubbles: true }))
                }
                return true
              }
            })
          })
        }
        break

      case "minLength":
      case "maxLength":
        actions.push({
          id: "show_hint",
          type: "fix",
          label: "Show hint",
          description: "Display character count and requirements",
          automatic: true,
          priority: "medium",
          callback: async () => {
            this.showCharacterHint(fieldId, error)
            return true
          }
        })
        break
    }

    // Universal skip action for non-required fields
    const field = this.getFieldById(fieldId)
    if (field && !field.required) {
      actions.push({
        id: "skip_field",
        type: "skip",
        label: "Skip this field",
        description: "Continue without filling this optional field",
        automatic: false,
        priority: "low",
        callback: async () => {
          this.clearFieldError(fieldId)
          return true
        }
      })
    }

    return actions
  }

  private generateNetworkRecoveryActions(
    operation: string,
    formData: Record<string, any>
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = []

    // Retry action
    actions.push({
      id: "retry_operation",
      type: "retry",
      label: "Try again",
      description: `Retry ${operation} operation`,
      automatic: this.config.enableAutoRecovery,
      priority: "high",
      callback: async () => {
        return this.retryOperation(operation, formData)
      }
    })

    // Save draft action for submit operations
    if (operation === "submit" && this.config.persistFormData) {
      actions.push({
        id: "save_draft",
        type: "save_draft",
        label: "Save as draft",
        description: "Save your progress locally",
        automatic: false,
        priority: "medium",
        callback: async () => {
          this.saveFormDraft(formData)
          return true
        }
      })
    }

    // Report issue action
    actions.push({
      id: "report_issue",
      type: "report",
      label: "Report issue",
      description: "Let us know about this problem",
      automatic: false,
      priority: "low",
      callback: async () => {
        this.reportIssue("network", operation, formData)
        return true
      }
    })

    return actions
  }

  private generateSystemRecoveryActions(
    error: Error,
    context: { component?: string; operation?: string; formData?: Record<string, any> }
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = []

    // Reload page action
    actions.push({
      id: "reload_page",
      type: "reload",
      label: "Reload page",
      description: "Refresh the page to reset the form",
      automatic: false,
      priority: "medium",
      callback: async () => {
        if (context.formData) {
          this.saveFormDraft(context.formData)
        }
        window.location.reload()
        return true
      }
    })

    // Report system error
    actions.push({
      id: "report_system_error",
      type: "report",
      label: "Report error",
      description: "Send error details to support",
      automatic: false,
      priority: "low",
      callback: async () => {
        this.reportSystemError(error, context)
        return true
      }
    })

    return actions
  }

  private generateEmailSuggestions(email: string): string[] {
    const suggestions: string[] = []
    const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]

    if (email.includes("@")) {
      const [username, domain] = email.split("@")

      // Suggest common domains for common typos
      const domainTypos: Record<string, string> = {
        "gmial.com": "gmail.com",
        "gmail.co": "gmail.com",
        "yahooo.com": "yahoo.com",
        "hotmial.com": "hotmail.com",
        "outlok.com": "outlook.com"
      }

      if (domainTypos[domain]) {
        suggestions.push(`${username}@${domainTypos[domain]}`)
      }

      // If domain is incomplete, suggest completions
      if (!domain.includes(".")) {
        commonDomains.forEach(commonDomain => {
          if (commonDomain.startsWith(domain)) {
            suggestions.push(`${username}@${commonDomain}`)
          }
        })
      }
    }

    return suggestions.slice(0, 3) // Limit to 3 suggestions
  }

  private showCharacterHint(fieldId: string, error: ValidationError): void {
    const element = document.getElementById(fieldId)
    if (!element) return

    const hint = document.createElement("div")
    hint.id = `${fieldId}-hint`
    hint.className = "character-hint"
    hint.style.cssText = `
      position: absolute;
      background: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      margin-top: 2px;
    `

    const currentLength = (element as HTMLInputElement).value.length
    const rule = error.rule
    const limit = error.position || 0

    if (rule === "minLength") {
      hint.textContent = `${currentLength}/${limit} characters minimum required`
    } else if (rule === "maxLength") {
      hint.textContent = `${currentLength}/${limit} characters (${limit - currentLength} remaining)`
    }

    // Remove existing hint
    const existingHint = document.getElementById(`${fieldId}-hint`)
    if (existingHint) {
      existingHint.remove()
    }

    element.parentNode?.appendChild(hint)

    // Remove hint after 3 seconds
    setTimeout(() => {
      hint.remove()
    }, 3000)
  }

  private async retryOperation(operation: string, formData: Record<string, any>): Promise<boolean> {
    try {
      // Implement retry logic based on operation
      switch (operation) {
        case "submit":
          // Retry form submission
          return await this.submitForm(formData)
        case "save":
          // Retry save operation
          return await this.saveForm(formData)
        case "validate":
          // Retry validation
          return await this.validateForm(formData)
        default:
          return false
      }
    } catch (error) {
      return false
    }
  }

  private async submitForm(formData: Record<string, any>): Promise<boolean> {
    // Placeholder for actual submit logic
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.3), 1000)
    })
  }

  private async saveForm(formData: Record<string, any>): Promise<boolean> {
    // Placeholder for actual save logic
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500)
    })
  }

  private async validateForm(formData: Record<string, any>): Promise<boolean> {
    // Placeholder for actual validation logic
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 300)
    })
  }

  saveFormDraft(formData: Record<string, any>, formId?: string): void {
    if (!this.config.persistFormData) return

    const draftKey = `form_draft_${formId || "default"}`
    const draft = {
      data: this.sanitizeFormData(formData),
      timestamp: Date.now(),
      version: "1.0"
    }

    try {
      localStorage.setItem(draftKey, JSON.stringify(draft))
    } catch (error) {
      console.warn("Failed to save form draft:", error)
    }
  }

  loadFormDraft(formId?: string): Record<string, any> | null {
    if (!this.config.persistFormData) return null

    const draftKey = `form_draft_${formId || "default"}`

    try {
      const draft = localStorage.getItem(draftKey)
      if (draft) {
        const parsed = JSON.parse(draft)
        // Check if draft is not too old (24 hours)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.data
        }
      }
    } catch (error) {
      console.warn("Failed to load form draft:", error)
    }

    return null
  }

  clearFormDraft(formId?: string): void {
    const draftKey = `form_draft_${formId || "default"}`
    try {
      localStorage.removeItem(draftKey)
    } catch (error) {
      console.warn("Failed to clear form draft:", error)
    }
  }

  private reportIssue(type: string, operation: string, formData?: Record<string, any>): void {
    // Placeholder for issue reporting
    console.log("Issue reported:", { type, operation, timestamp: Date.now() })
  }

  private reportSystemError(error: Error, context: any): void {
    // Placeholder for system error reporting
    console.error("System error reported:", { error: error.message, context, timestamp: Date.now() })
  }

  private addErrors(errors: FormError[]): void {
    this.errorState.errors.push(...errors)
    this.errorState.hasErrors = true
    this.errorState.lastErrorTime = Date.now()

    // Auto-recovery for recoverable errors
    if (this.config.enableAutoRecovery) {
      this.attemptAutoRecovery(errors)
    }
  }

  private clearFieldError(fieldId: string): void {
    this.errorState.errors = this.errorState.errors.filter(
      error => error.context.fieldId !== fieldId
    )
    this.errorState.hasErrors = this.errorState.errors.length > 0
  }

  private attemptAutoRecovery(errors: FormError[]): void {
    if (this.errorState.recoveryAttempts >= this.config.maxRecoveryAttempts) {
      return
    }

    this.errorState.recoveryInProgress = true
    this.errorState.recoveryAttempts++

    setTimeout(() => {
      errors.forEach(error => {
        const autoActions = error.recoveryActions.filter(action => action.automatic)
        autoActions.forEach(action => {
          if (action.callback) {
            action.callback().catch(() => {
              // Auto-recovery failed, user intervention needed
            })
          }
        })
      })

      this.errorState.recoveryInProgress = false
    }, this.config.recoveryDelay)
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.handleSystemError(new Error(event.reason), {
        component: "global",
        operation: "promise_rejection"
      })
    })

    // Handle JavaScript errors
    window.addEventListener("error", (event) => {
      this.handleSystemError(new Error(event.message), {
        component: "global",
        operation: "javascript_error"
      })
    })
  }

  private getNetworkErrorMessage(error: Error): string {
    if (error.message.includes("fetch")) {
      return "Network connection failed. Please check your internet connection."
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again."
    }
    return "Network error occurred. Please try again."
  }

  private getSystemErrorMessage(error: Error): string {
    if (error.message.includes("chunk")) {
      return "Application update detected. Please refresh the page."
    }
    if (error.message.includes("memory")) {
      return "Browser memory issue. Please close other tabs and try again."
    }
    return "An unexpected error occurred. Please refresh the page."
  }

  private isSystemErrorRecoverable(error: Error): boolean {
    const recoverablePatterns = [
      "chunk",
      "network",
      "timeout",
      "AbortError"
    ]

    return recoverablePatterns.some(pattern =>
      error.message.toLowerCase().includes(pattern)
    )
  }

  private sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    Object.entries(formData).forEach(([key, value]) => {
      // Remove sensitive fields
      if (this.isSensitiveField(key)) {
        sanitized[key] = "[REDACTED]"
      } else {
        sanitized[key] = value
      }
    })

    return sanitized
  }

  private isSensitiveField(fieldName: string): boolean {
    const sensitivePatterns = [
      "password",
      "ssn",
      "credit",
      "cvv",
      "pin",
      "secret"
    ]

    return sensitivePatterns.some(pattern =>
      fieldName.toLowerCase().includes(pattern)
    )
  }

  private getFieldById(fieldId: string): FormField | null {
    // This would normally come from form context
    // Placeholder implementation
    return null
  }

  getErrorState(): ErrorState {
    return { ...this.errorState }
  }

  clearAllErrors(): void {
    this.errorState = {
      hasErrors: false,
      errors: [],
      recoveryInProgress: false,
      recoveryAttempts: 0,
      lastErrorTime: 0
    }
  }

  executeRecoveryAction(errorId: string, actionId: string): Promise<boolean> {
    const error = this.errorState.errors.find(e => e.id === errorId)
    if (!error) return Promise.resolve(false)

    const action = error.recoveryActions.find(a => a.id === actionId)
    if (!action || !action.callback) return Promise.resolve(false)

    return action.callback()
  }
}

export const defaultErrorRecoveryConfig: ErrorRecoveryConfig = {
  enableAutoRecovery: true,
  enableSuggestions: true,
  enableFormStateRecovery: true,
  enableGracefulDegradation: true,
  maxRecoveryAttempts: 3,
  recoveryDelay: 1000,
  persistFormData: true
}

export function createErrorRecoveryManager(config?: Partial<ErrorRecoveryConfig>): ErrorRecoveryManager {
  return new ErrorRecoveryManager(config)
}