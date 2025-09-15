import { FormTemplate } from "@/components/form-builder/form-builder-engine"
import { ValidationRuleEngine } from "./validation"

export interface SubmissionConfig {
  endpoint?: string
  method: "POST" | "PUT" | "PATCH"
  headers?: Record<string, string>
  timeout: number
  retryAttempts: number
  retryDelay: number
  enableEncryption: boolean
  validateBeforeSubmit: boolean
  enableDuplicateDetection: boolean
  enableRateLimiting: boolean
}

export interface SubmissionData {
  formId: string
  submissionId: string
  timestamp: number
  userAgent: string
  ipAddress?: string
  formData: Record<string, any>
  metadata: {
    formVersion: string
    submissionDuration: number
    validationScore: number
    deviceInfo: DeviceInfo
  }
}

export interface DeviceInfo {
  platform: string
  browser: string
  screenResolution: string
  timezone: string
  language: string
}

export interface SubmissionResponse {
  success: boolean
  submissionId: string
  message: string
  errors?: SubmissionError[]
  data?: any
  redirectUrl?: string
  nextSteps?: string[]
}

export interface SubmissionError {
  field?: string
  code: string
  message: string
  severity: "error" | "warning"
}

export interface SubmissionStatus {
  id: string
  status: "pending" | "processing" | "completed" | "failed" | "retrying"
  progress: number
  message: string
  submittedAt: number
  updatedAt: number
  attempts: number
  errors: SubmissionError[]
}

export class FormSubmissionHandler {
  private config: SubmissionConfig
  private submissions: Map<string, SubmissionStatus> = new Map()
  private submissionQueue: SubmissionData[] = []
  private isProcessing = false

  constructor(config: Partial<SubmissionConfig> = {}) {
    this.config = {
      method: "POST",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableEncryption: true,
      validateBeforeSubmit: true,
      enableDuplicateDetection: true,
      enableRateLimiting: true,
      ...config
    }
  }

  async submitForm(
    template: FormTemplate,
    formData: Record<string, any>,
    options: Partial<SubmissionConfig> = {}
  ): Promise<SubmissionResponse> {
    const submissionConfig = { ...this.config, ...options }
    const submissionId = this.generateSubmissionId()

    try {
      // Pre-submission validation
      if (submissionConfig.validateBeforeSubmit) {
        const validationResult = this.validateSubmissionData(template, formData)
        if (!validationResult.isValid) {
          return {
            success: false,
            submissionId,
            message: "Validation failed",
            errors: validationResult.errors
          }
        }
      }

      // Duplicate detection
      if (submissionConfig.enableDuplicateDetection) {
        const isDuplicate = this.checkForDuplicate(template.id, formData)
        if (isDuplicate) {
          return {
            success: false,
            submissionId,
            message: "Duplicate submission detected",
            errors: [{ code: "DUPLICATE_SUBMISSION", message: "This form has already been submitted", severity: "error" }]
          }
        }
      }

      // Rate limiting
      if (submissionConfig.enableRateLimiting) {
        const isRateLimited = this.checkRateLimit()
        if (isRateLimited) {
          return {
            success: false,
            submissionId,
            message: "Rate limit exceeded",
            errors: [{ code: "RATE_LIMITED", message: "Too many submissions. Please wait before submitting again", severity: "error" }]
          }
        }
      }

      // Create submission data
      const submissionData = this.createSubmissionData(template, formData, submissionId)

      // Update submission status
      this.updateSubmissionStatus(submissionId, {
        id: submissionId,
        status: "processing",
        progress: 10,
        message: "Preparing submission...",
        submittedAt: Date.now(),
        updatedAt: Date.now(),
        attempts: 1,
        errors: []
      })

      // Process submission
      const response = await this.processSubmission(submissionData, submissionConfig)

      // Update final status
      this.updateSubmissionStatus(submissionId, {
        id: submissionId,
        status: response.success ? "completed" : "failed",
        progress: 100,
        message: response.message,
        submittedAt: submissionData.timestamp,
        updatedAt: Date.now(),
        attempts: 1,
        errors: response.errors || []
      })

      return response

    } catch (error) {
      const errorResponse: SubmissionResponse = {
        success: false,
        submissionId,
        message: error instanceof Error ? error.message : "Submission failed",
        errors: [{ code: "SUBMISSION_ERROR", message: "An unexpected error occurred", severity: "error" }]
      }

      this.updateSubmissionStatus(submissionId, {
        id: submissionId,
        status: "failed",
        progress: 0,
        message: errorResponse.message,
        submittedAt: Date.now(),
        updatedAt: Date.now(),
        attempts: 1,
        errors: errorResponse.errors || []
      })

      return errorResponse
    }
  }

  private async processSubmission(
    submissionData: SubmissionData,
    config: SubmissionConfig
  ): Promise<SubmissionResponse> {
    let attempts = 0
    let lastError: Error | null = null

    while (attempts < config.retryAttempts) {
      attempts++

      try {
        this.updateSubmissionStatus(submissionData.submissionId, {
          id: submissionData.submissionId,
          status: attempts > 1 ? "retrying" : "processing",
          progress: 20 + (attempts * 20),
          message: attempts > 1 ? `Retrying submission (attempt ${attempts})...` : "Submitting form...",
          submittedAt: submissionData.timestamp,
          updatedAt: Date.now(),
          attempts,
          errors: []
        })

        // Encrypt data if enabled
        const processedData = config.enableEncryption
          ? await this.encryptSubmissionData(submissionData)
          : submissionData

        // Submit to endpoint
        const response = await this.sendSubmission(processedData, config)

        if (response.success) {
          // Store successful submission
          this.storeSubmissionRecord(submissionData, response)
          return response
        } else {
          lastError = new Error(response.message)
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error")

        if (attempts < config.retryAttempts) {
          await this.delay(config.retryDelay * attempts)
        }
      }
    }

    return {
      success: false,
      submissionId: submissionData.submissionId,
      message: lastError?.message || "Submission failed after all retry attempts",
      errors: [{ code: "SUBMISSION_FAILED", message: "Failed to submit form", severity: "error" }]
    }
  }

  private async sendSubmission(
    submissionData: SubmissionData,
    config: SubmissionConfig
  ): Promise<SubmissionResponse> {
    if (!config.endpoint) {
      // Mock submission for development/testing
      return this.mockSubmission(submissionData)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    try {
      const response = await fetch(config.endpoint, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          ...config.headers
        },
        body: JSON.stringify(submissionData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result as SubmissionResponse

    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private mockSubmission(submissionData: SubmissionData): Promise<SubmissionResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate random success/failure for testing
        const success = Math.random() > 0.1 // 90% success rate

        resolve({
          success,
          submissionId: submissionData.submissionId,
          message: success ? "Form submitted successfully" : "Simulated submission failure",
          data: success ? { id: submissionData.submissionId, timestamp: Date.now() } : undefined,
          errors: success ? undefined : [
            { code: "MOCK_ERROR", message: "This is a simulated error for testing", severity: "error" }
          ]
        })
      }, 1000 + Math.random() * 2000) // 1-3 second delay
    })
  }

  private validateSubmissionData(
    template: FormTemplate,
    formData: Record<string, any>
  ): { isValid: boolean; errors: SubmissionError[] } {
    const errors: SubmissionError[] = []

    template.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.id]
        if (value === undefined || value === null || value === "") {
          errors.push({
            field: field.id,
            code: "REQUIRED_FIELD_MISSING",
            message: `${field.label} is required`,
            severity: "error"
          })
        }
      }

      // Run field validation
      if (field.validation && formData[field.id] !== undefined) {
        const fieldValue = formData[field.id]
        field.validation.forEach(rule => {
          const validationResult = ValidationRuleEngine.validateField(fieldValue, [rule])
          if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
              errors.push({
                field: field.id,
                code: `VALIDATION_${rule.type.toUpperCase()}`,
                message: error,
                severity: "error"
              })
            })
          }
        })
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private checkForDuplicate(formId: string, formData: Record<string, any>): boolean {
    // Simple duplicate detection based on form data hash
    const dataHash = this.generateDataHash(formData)
    const duplicateKey = `submission_${formId}_${dataHash}`

    if (typeof localStorage !== 'undefined') {
      const lastSubmission = localStorage.getItem(duplicateKey)
      if (lastSubmission) {
        const timestamp = parseInt(lastSubmission)
        const timeDiff = Date.now() - timestamp
        // Consider it a duplicate if submitted within last 5 minutes
        return timeDiff < 5 * 60 * 1000
      }
    }

    return false
  }

  private checkRateLimit(): boolean {
    const rateLimitKey = "form_submission_rate_limit"
    const maxSubmissions = 10
    const timeWindow = 60 * 1000 // 1 minute

    if (typeof localStorage !== 'undefined') {
      const rateLimitData = localStorage.getItem(rateLimitKey)
      if (rateLimitData) {
        const { count, timestamp } = JSON.parse(rateLimitData)
        const timeDiff = Date.now() - timestamp

        if (timeDiff < timeWindow) {
          if (count >= maxSubmissions) {
            return true // Rate limited
          }
          // Update count
          localStorage.setItem(rateLimitKey, JSON.stringify({
            count: count + 1,
            timestamp
          }))
        } else {
          // Reset counter
          localStorage.setItem(rateLimitKey, JSON.stringify({
            count: 1,
            timestamp: Date.now()
          }))
        }
      } else {
        // Initialize counter
        localStorage.setItem(rateLimitKey, JSON.stringify({
          count: 1,
          timestamp: Date.now()
        }))
      }
    }

    return false
  }

  private createSubmissionData(
    template: FormTemplate,
    formData: Record<string, any>,
    submissionId: string
  ): SubmissionData {
    return {
      formId: template.id,
      submissionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      formData: this.sanitizeFormData(formData),
      metadata: {
        formVersion: "1.0",
        submissionDuration: this.calculateSubmissionDuration(),
        validationScore: this.calculateValidationScore(template, formData),
        deviceInfo: this.getDeviceInfo()
      }
    }
  }

  private sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "string") {
        // Basic XSS protection
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "")
      } else {
        sanitized[key] = value
      }
    })

    return sanitized
  }

  private async encryptSubmissionData(submissionData: SubmissionData): Promise<SubmissionData> {
    // Simple encryption placeholder - in production, use proper encryption
    const encryptedData = { ...submissionData }

    // Encrypt sensitive form data
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const key = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt"]
        )

        const encoder = new TextEncoder()
        const data = encoder.encode(JSON.stringify(submissionData.formData))

        const encrypted = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: new Uint8Array(12) },
          key,
          data
        )

        encryptedData.formData = { encrypted: Array.from(new Uint8Array(encrypted)) }
      } catch (error) {
        console.warn("Encryption failed, sending unencrypted data")
      }
    }

    return encryptedData
  }

  private storeSubmissionRecord(submissionData: SubmissionData, response: SubmissionResponse): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const record = {
          submissionId: submissionData.submissionId,
          formId: submissionData.formId,
          timestamp: submissionData.timestamp,
          success: response.success,
          dataHash: this.generateDataHash(submissionData.formData)
        }

        // Store for duplicate detection
        const duplicateKey = `submission_${submissionData.formId}_${record.dataHash}`
        localStorage.setItem(duplicateKey, submissionData.timestamp.toString())

        // Store submission history
        const historyKey = "form_submission_history"
        const history = JSON.parse(localStorage.getItem(historyKey) || "[]")
        history.push(record)

        // Keep only last 50 submissions
        if (history.length > 50) {
          history.splice(0, history.length - 50)
        }

        localStorage.setItem(historyKey, JSON.stringify(history))
      } catch (error) {
        console.warn("Failed to store submission record:", error)
      }
    }
  }

  private generateSubmissionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateDataHash(data: Record<string, any>): string {
    const str = JSON.stringify(data, Object.keys(data).sort())
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private calculateSubmissionDuration(): number {
    // Placeholder - would track from form start to submission
    return Math.floor(Math.random() * 300000) // 0-5 minutes
  }

  private calculateValidationScore(template: FormTemplate, formData: Record<string, any>): number {
    let score = 100
    let fieldsChecked = 0

    template.fields.forEach(field => {
      const value = formData[field.id]
      if (value !== undefined && value !== null && value !== "") {
        fieldsChecked++

        // Check if validation rules pass
        if (field.validation) {
          field.validation.forEach(rule => {
            const result = ValidationRuleEngine.validateField(value, [rule])
            if (!result.isValid) {
              score -= 10
            }
          })
        }
      } else if (field.required) {
        score -= 20
      }
    })

    // Bonus for completing optional fields
    const completionRate = fieldsChecked / template.fields.length
    score += completionRate * 10

    return Math.max(0, Math.min(100, score))
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      platform: navigator.platform,
      browser: this.getBrowserInfo(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    }
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Edge")) return "Edge"
    return "Unknown"
  }

  private updateSubmissionStatus(submissionId: string, status: SubmissionStatus): void {
    this.submissions.set(submissionId, status)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Public methods for status tracking
  getSubmissionStatus(submissionId: string): SubmissionStatus | null {
    return this.submissions.get(submissionId) || null
  }

  getAllSubmissions(): SubmissionStatus[] {
    return Array.from(this.submissions.values())
  }

  cancelSubmission(submissionId: string): boolean {
    const status = this.submissions.get(submissionId)
    if (status && (status.status === "pending" || status.status === "processing")) {
      this.updateSubmissionStatus(submissionId, {
        ...status,
        status: "failed",
        message: "Submission cancelled by user",
        updatedAt: Date.now()
      })
      return true
    }
    return false
  }

  getSubmissionHistory(): Array<{ submissionId: string; formId: string; timestamp: number; success: boolean }> {
    if (typeof localStorage !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem("form_submission_history") || "[]")
      } catch (error) {
        console.warn("Failed to load submission history:", error)
      }
    }
    return []
  }

  clearSubmissionHistory(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem("form_submission_history")
      localStorage.removeItem("form_submission_rate_limit")
    }
    this.submissions.clear()
  }
}

export const defaultSubmissionConfig: SubmissionConfig = {
  method: "POST",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableEncryption: true,
  validateBeforeSubmit: true,
  enableDuplicateDetection: true,
  enableRateLimiting: true
}

export function createFormSubmissionHandler(config?: Partial<SubmissionConfig>): FormSubmissionHandler {
  return new FormSubmissionHandler(config)
}