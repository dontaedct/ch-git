import { FormTemplate } from "@/components/form-builder/form-builder-engine"
import { SubmissionData } from "./submission-handler"

export interface IntegrationConfig {
  type: "webhook" | "email" | "database" | "api" | "zapier" | "slack" | "custom"
  enabled: boolean
  settings: Record<string, any>
  retryConfig?: {
    maxRetries: number
    retryDelay: number
    backoffMultiplier: number
  }
  authentication?: {
    type: "none" | "basic" | "bearer" | "apiKey" | "oauth"
    credentials: Record<string, string>
  }
}

export interface IntegrationResult {
  success: boolean
  integrationId: string
  message: string
  data?: any
  error?: string
  timestamp: number
  executionTime: number
}

export interface IntegrationContext {
  formTemplate: FormTemplate
  submissionData: SubmissionData
  userAgent: string
  timestamp: number
  metadata: Record<string, any>
}

export interface IntegrationProvider {
  id: string
  name: string
  description: string
  configSchema: Record<string, any>
  execute(data: SubmissionData, config: IntegrationConfig, context: IntegrationContext): Promise<IntegrationResult>
  validate(config: IntegrationConfig): { isValid: boolean; errors: string[] }
}

export class IntegrationsManager {
  private providers: Map<string, IntegrationProvider> = new Map()
  private integrations: Map<string, IntegrationConfig[]> = new Map()

  constructor() {
    this.registerBuiltInProviders()
  }

  registerProvider(provider: IntegrationProvider): void {
    this.providers.set(provider.id, provider)
  }

  getProvider(id: string): IntegrationProvider | undefined {
    return this.providers.get(id)
  }

  getAllProviders(): IntegrationProvider[] {
    return Array.from(this.providers.values())
  }

  addIntegration(formId: string, integration: IntegrationConfig): void {
    if (!this.integrations.has(formId)) {
      this.integrations.set(formId, [])
    }
    this.integrations.get(formId)!.push(integration)
  }

  removeIntegration(formId: string, integrationType: string): void {
    const formIntegrations = this.integrations.get(formId)
    if (formIntegrations) {
      const filtered = formIntegrations.filter(integration => integration.type !== integrationType)
      this.integrations.set(formId, filtered)
    }
  }

  getIntegrations(formId: string): IntegrationConfig[] {
    return this.integrations.get(formId) || []
  }

  async executeIntegrations(
    formId: string,
    submissionData: SubmissionData,
    template: FormTemplate
  ): Promise<IntegrationResult[]> {
    const integrations = this.getIntegrations(formId)
    const results: IntegrationResult[] = []

    const context: IntegrationContext = {
      formTemplate: template,
      submissionData,
      userAgent: submissionData.userAgent,
      timestamp: Date.now(),
      metadata: submissionData.metadata
    }

    for (const integration of integrations) {
      if (!integration.enabled) continue

      const provider = this.getProvider(integration.type)
      if (!provider) {
        results.push({
          success: false,
          integrationId: integration.type,
          message: `Provider ${integration.type} not found`,
          error: "PROVIDER_NOT_FOUND",
          timestamp: Date.now(),
          executionTime: 0
        })
        continue
      }

      try {
        const startTime = Date.now()
        const result = await this.executeWithRetry(provider, submissionData, integration, context)
        result.executionTime = Date.now() - startTime
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          integrationId: integration.type,
          message: `Integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: "EXECUTION_FAILED",
          timestamp: Date.now(),
          executionTime: 0
        })
      }
    }

    return results
  }

  private async executeWithRetry(
    provider: IntegrationProvider,
    data: SubmissionData,
    config: IntegrationConfig,
    context: IntegrationContext
  ): Promise<IntegrationResult> {
    const retryConfig = config.retryConfig || {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    }

    let lastError: Error | null = null
    let delay = retryConfig.retryDelay

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await provider.execute(data, config, context)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        if (attempt < retryConfig.maxRetries) {
          await this.delay(delay)
          delay *= retryConfig.backoffMultiplier
        }
      }
    }

    return {
      success: false,
      integrationId: config.type,
      message: `Failed after ${retryConfig.maxRetries + 1} attempts: ${lastError?.message}`,
      error: "MAX_RETRIES_EXCEEDED",
      timestamp: Date.now(),
      executionTime: 0
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private registerBuiltInProviders(): void {
    this.registerProvider(new WebhookProvider())
    this.registerProvider(new EmailProvider())
    this.registerProvider(new SlackProvider())
    this.registerProvider(new ZapierProvider())
  }

  validateIntegration(integration: IntegrationConfig): { isValid: boolean; errors: string[] } {
    const provider = this.getProvider(integration.type)
    if (!provider) {
      return { isValid: false, errors: [`Provider ${integration.type} not found`] }
    }

    return provider.validate(integration)
  }

  testIntegration(integration: IntegrationConfig, testData: SubmissionData): Promise<IntegrationResult> {
    const provider = this.getProvider(integration.type)
    if (!provider) {
      return Promise.resolve({
        success: false,
        integrationId: integration.type,
        message: "Provider not found",
        error: "PROVIDER_NOT_FOUND",
        timestamp: Date.now(),
        executionTime: 0
      })
    }

    const context: IntegrationContext = {
      formTemplate: {} as FormTemplate, // Mock template for testing
      submissionData: testData,
      userAgent: "Test",
      timestamp: Date.now(),
      metadata: { test: true }
    }

    return provider.execute(testData, integration, context)
  }
}

class WebhookProvider implements IntegrationProvider {
  id = "webhook"
  name = "Webhook"
  description = "Send form data to a custom webhook URL"

  configSchema = {
    url: { type: "string", required: true, description: "Webhook URL" },
    method: { type: "string", default: "POST", enum: ["POST", "PUT", "PATCH"] },
    headers: { type: "object", description: "Custom headers" },
    timeout: { type: "number", default: 30000, description: "Request timeout in milliseconds" }
  }

  async execute(
    data: SubmissionData,
    config: IntegrationConfig,
    context: IntegrationContext
  ): Promise<IntegrationResult> {
    const { url, method = "POST", headers = {}, timeout = 30000 } = config.settings

    const payload = {
      submissionId: data.submissionId,
      formId: data.formId,
      timestamp: data.timestamp,
      formData: data.formData,
      metadata: data.metadata,
      context: {
        userAgent: context.userAgent,
        formName: context.formTemplate.name
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const authHeaders = this.getAuthHeaders(config)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          ...authHeaders
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json().catch(() => null)

      return {
        success: true,
        integrationId: this.id,
        message: "Webhook executed successfully",
        data: responseData,
        timestamp: Date.now(),
        executionTime: 0
      }

    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  validate(config: IntegrationConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.settings.url) {
      errors.push("Webhook URL is required")
    } else {
      try {
        new URL(config.settings.url)
      } catch {
        errors.push("Invalid webhook URL format")
      }
    }

    if (config.settings.method && !["POST", "PUT", "PATCH"].includes(config.settings.method)) {
      errors.push("Invalid HTTP method")
    }

    return { isValid: errors.length === 0, errors }
  }

  private getAuthHeaders(config: IntegrationConfig): Record<string, string> {
    const auth = config.authentication
    if (!auth || auth.type === "none") return {}

    switch (auth.type) {
      case "basic":
        const basicAuth = btoa(`${auth.credentials.username}:${auth.credentials.password}`)
        return { "Authorization": `Basic ${basicAuth}` }

      case "bearer":
        return { "Authorization": `Bearer ${auth.credentials.token}` }

      case "apiKey":
        return { [auth.credentials.headerName || "X-API-Key"]: auth.credentials.apiKey }

      default:
        return {}
    }
  }
}

class EmailProvider implements IntegrationProvider {
  id = "email"
  name = "Email Notification"
  description = "Send email notifications when forms are submitted"

  configSchema = {
    to: { type: "array", required: true, description: "Recipient email addresses" },
    subject: { type: "string", required: true, description: "Email subject" },
    template: { type: "string", description: "Email template" },
    includeAttachments: { type: "boolean", default: false }
  }

  async execute(
    data: SubmissionData,
    config: IntegrationConfig,
    context: IntegrationContext
  ): Promise<IntegrationResult> {
    const { to, subject, template, includeAttachments = false } = config.settings

    // Mock email sending - in production, integrate with email service
    const emailData = {
      to: Array.isArray(to) ? to : [to],
      subject: this.processTemplate(subject, data, context),
      body: this.generateEmailBody(data, context, template),
      attachments: includeAttachments ? this.extractAttachments(data) : []
    }

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      integrationId: this.id,
      message: `Email sent to ${emailData.to.join(", ")}`,
      data: { messageId: `msg_${Date.now()}` },
      timestamp: Date.now(),
      executionTime: 0
    }
  }

  validate(config: IntegrationConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.settings.to || (Array.isArray(config.settings.to) && config.settings.to.length === 0)) {
      errors.push("At least one recipient email is required")
    }

    if (!config.settings.subject) {
      errors.push("Email subject is required")
    }

    // Validate email addresses
    const emails = Array.isArray(config.settings.to) ? config.settings.to : [config.settings.to]
    emails.forEach((email: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Invalid email address: ${email}`)
      }
    })

    return { isValid: errors.length === 0, errors }
  }

  private processTemplate(template: string, data: SubmissionData, context: IntegrationContext): string {
    return template
      .replace(/\{formName\}/g, context.formTemplate.name || "Form")
      .replace(/\{submissionId\}/g, data.submissionId)
      .replace(/\{timestamp\}/g, new Date(data.timestamp).toLocaleString())
  }

  private generateEmailBody(data: SubmissionData, context: IntegrationContext, template?: string): string {
    if (template) {
      return this.processTemplate(template, data, context)
    }

    let body = `New form submission received for "${context.formTemplate.name}"\n\n`
    body += `Submission ID: ${data.submissionId}\n`
    body += `Submitted: ${new Date(data.timestamp).toLocaleString()}\n\n`
    body += "Form Data:\n"

    Object.entries(data.formData).forEach(([key, value]) => {
      body += `${key}: ${value}\n`
    })

    return body
  }

  private extractAttachments(data: SubmissionData): any[] {
    const attachments: any[] = []

    Object.entries(data.formData).forEach(([key, value]) => {
      if (value instanceof File || (Array.isArray(value) && value[0] instanceof File)) {
        const files = Array.isArray(value) ? value : [value]
        files.forEach(file => {
          if (file instanceof File) {
            attachments.push({
              filename: file.name,
              content: file,
              contentType: file.type
            })
          }
        })
      }
    })

    return attachments
  }
}

class SlackProvider implements IntegrationProvider {
  id = "slack"
  name = "Slack Notification"
  description = "Send notifications to Slack channels"

  configSchema = {
    webhookUrl: { type: "string", required: true, description: "Slack webhook URL" },
    channel: { type: "string", description: "Channel name (optional)" },
    username: { type: "string", default: "Form Bot", description: "Bot username" },
    iconEmoji: { type: "string", default: ":memo:", description: "Bot icon emoji" }
  }

  async execute(
    data: SubmissionData,
    config: IntegrationConfig,
    context: IntegrationContext
  ): Promise<IntegrationResult> {
    const { webhookUrl, channel, username = "Form Bot", iconEmoji = ":memo:" } = config.settings

    const message = this.buildSlackMessage(data, context, config)

    const payload = {
      text: message.text,
      channel,
      username,
      icon_emoji: iconEmoji,
      attachments: message.attachments
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`)
    }

    return {
      success: true,
      integrationId: this.id,
      message: "Slack notification sent successfully",
      timestamp: Date.now(),
      executionTime: 0
    }
  }

  validate(config: IntegrationConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.settings.webhookUrl) {
      errors.push("Slack webhook URL is required")
    } else if (!config.settings.webhookUrl.includes("hooks.slack.com")) {
      errors.push("Invalid Slack webhook URL")
    }

    return { isValid: errors.length === 0, errors }
  }

  private buildSlackMessage(data: SubmissionData, context: IntegrationContext, config: IntegrationConfig) {
    const formName = context.formTemplate.name || "Form"

    return {
      text: `New submission for *${formName}*`,
      attachments: [
        {
          color: "good",
          fields: [
            {
              title: "Submission ID",
              value: data.submissionId,
              short: true
            },
            {
              title: "Submitted",
              value: new Date(data.timestamp).toLocaleString(),
              short: true
            },
            ...Object.entries(data.formData).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true
            }))
          ]
        }
      ]
    }
  }
}

class ZapierProvider implements IntegrationProvider {
  id = "zapier"
  name = "Zapier Webhook"
  description = "Trigger Zapier automations"

  configSchema = {
    webhookUrl: { type: "string", required: true, description: "Zapier webhook URL" },
    format: { type: "string", default: "standard", enum: ["standard", "custom"] }
  }

  async execute(
    data: SubmissionData,
    config: IntegrationConfig,
    context: IntegrationContext
  ): Promise<IntegrationResult> {
    const { webhookUrl, format = "standard" } = config.settings

    const payload = format === "standard"
      ? this.buildStandardPayload(data, context)
      : this.buildCustomPayload(data, context, config)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Zapier webhook error: ${response.status}`)
    }

    return {
      success: true,
      integrationId: this.id,
      message: "Zapier webhook triggered successfully",
      timestamp: Date.now(),
      executionTime: 0
    }
  }

  validate(config: IntegrationConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.settings.webhookUrl) {
      errors.push("Zapier webhook URL is required")
    } else if (!config.settings.webhookUrl.includes("hooks.zapier.com")) {
      errors.push("Invalid Zapier webhook URL")
    }

    return { isValid: errors.length === 0, errors }
  }

  private buildStandardPayload(data: SubmissionData, context: IntegrationContext) {
    return {
      form_name: context.formTemplate.name,
      submission_id: data.submissionId,
      form_id: data.formId,
      submitted_at: new Date(data.timestamp).toISOString(),
      user_agent: data.userAgent,
      form_data: data.formData,
      metadata: data.metadata
    }
  }

  private buildCustomPayload(data: SubmissionData, context: IntegrationContext, config: IntegrationConfig) {
    // Custom payload format based on configuration
    return {
      ...data.formData,
      _meta: {
        form: context.formTemplate.name,
        submission: data.submissionId,
        timestamp: data.timestamp
      }
    }
  }
}

export const defaultIntegrationConfig: IntegrationConfig = {
  type: "webhook",
  enabled: true,
  settings: {},
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  },
  authentication: {
    type: "none",
    credentials: {}
  }
}

export function createIntegrationsManager(): IntegrationsManager {
  return new IntegrationsManager()
}