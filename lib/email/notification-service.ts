/**
 * Email Notification Service
 * 
 * Handles email notifications with templates, attachments, tracking,
 * and queue management for PDF document delivery.
 */

import nodemailer from 'nodemailer'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import handlebars from 'handlebars'
import { v4 as uuidv4 } from 'uuid'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlTemplate: string
  textTemplate?: string
  placeholders: EmailPlaceholder[]
  metadata: {
    version: string
    createdAt: string
    updatedAt: string
    createdBy: string
  }
}

export interface EmailPlaceholder {
  name: string
  type: 'text' | 'html' | 'image' | 'link' | 'date' | 'number' | 'currency'
  required: boolean
  defaultValue?: any
  description?: string
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  cid?: string // Content ID for inline images
}

export interface EmailOptions {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  templateId?: string
  templateData?: Record<string, any>
  html?: string
  text?: string
  attachments?: EmailAttachment[]
  replyTo?: string
  priority?: 'high' | 'normal' | 'low'
  headers?: Record<string, string>
}

export interface EmailDeliveryResult {
  success: boolean
  messageId?: string
  error?: string
  deliveryTime?: number
  recipientCount?: number
}

export interface EmailTracking {
  messageId: string
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
  recipient: string
  sentAt?: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  bouncedAt?: string
  errorMessage?: string
  metadata: {
    templateId?: string
    subject: string
    ipAddress?: string
    userAgent?: string
  }
}

export interface EmailQueueItem {
  id: string
  options: EmailOptions
  priority: number
  scheduledAt: string
  attempts: number
  maxAttempts: number
  status: 'pending' | 'processing' | 'sent' | 'failed'
  createdAt: string
  updatedAt: string
  metadata: {
    tenantId?: string
    userId?: string
    source: string
  }
}

export interface EmailAnalytics {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalFailed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  averageDeliveryTime: number
  topTemplates: Array<{
    templateId: string
    templateName: string
    count: number
    deliveryRate: number
  }>
  hourlyStats: Array<{
    hour: number
    sent: number
    delivered: number
    opened: number
  }>
}

export class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null
  private templates: Map<string, EmailTemplate> = new Map()
  private queue: EmailQueueItem[] = []
  private tracking: Map<string, EmailTracking> = new Map()
  private isProcessing = false
  private config: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
    pool: boolean
    maxConnections: number
    maxMessages: number
  }

  constructor(config?: Partial<EmailNotificationService['config']>) {
    this.config = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      ...config
    }

    this.initializeTransporter()
    this.initializeHandlebars()
    this.loadDefaultTemplates()
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransporter({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth,
      pool: this.config.pool,
      maxConnections: this.config.maxConnections,
      maxMessages: this.config.maxMessages
    })

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service connection failed:', error)
      } else {
        console.log('Email service connected successfully')
      }
    })
  }

  /**
   * Initialize Handlebars helpers
   */
  private initializeHandlebars(): void {
    // Date formatting helper
    handlebars.registerHelper('formatDate', (date: any, format: string) => {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
      
      switch (format) {
        case 'short': return d.toLocaleDateString()
        case 'long': return d.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
        case 'time': return d.toLocaleTimeString()
        default: return d.toISOString()
      }
    })

    // Currency formatting helper
    handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'USD') => {
      if (typeof amount !== 'number') return ''
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount)
    })

    // Link helper
    handlebars.registerHelper('link', (url: string, text: string) => {
      return `<a href="${url}" style="color: #2563eb; text-decoration: underline;">${text}</a>`
    })

    // Conditional helper
    handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
    })
  }

  /**
   * Register email template
   */
  registerTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template)
    console.log(`Email template registered: ${template.name} (${template.id})`)
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * List all templates
   */
  listTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Send email immediately
   */
  async sendEmail(options: EmailOptions): Promise<EmailDeliveryResult> {
    const startTime = Date.now()

    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized')
      }

      let html = options.html
      let text = options.text
      let subject = options.subject

      // Process template if templateId is provided
      if (options.templateId && options.templateData) {
        const template = this.getTemplate(options.templateId)
        if (!template) {
          throw new Error(`Template not found: ${options.templateId}`)
        }

        const compiledHtml = handlebars.compile(template.htmlTemplate)
        const compiledText = template.textTemplate ? handlebars.compile(template.textTemplate) : null
        const compiledSubject = handlebars.compile(template.subject)

        html = compiledHtml(options.templateData)
        text = compiledText ? compiledText(options.templateData) : undefined
        subject = compiledSubject(options.templateData)
      }

      const messageId = uuidv4()
      const mailOptions = {
        from: this.config.auth.user,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject,
        html,
        text,
        attachments: options.attachments,
        replyTo: options.replyTo,
        priority: options.priority,
        headers: {
          'X-Message-ID': messageId,
          ...options.headers
        }
      }

      const info = await this.transporter.sendMail(mailOptions)

      const deliveryTime = Date.now() - startTime
      const recipientCount = this.countRecipients(options.to, options.cc, options.bcc)

      // Track email
      this.trackEmail(messageId, 'sent', options.to, {
        templateId: options.templateId,
        subject: options.subject
      })

      return {
        success: true,
        messageId,
        deliveryTime,
        recipientCount
      }

    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        deliveryTime: Date.now() - startTime
      }
    }
  }

  /**
   * Queue email for later sending
   */
  async queueEmail(
    options: EmailOptions,
    priority: number = 5,
    scheduledAt?: string,
    metadata: Partial<EmailQueueItem['metadata']> = {}
  ): Promise<string> {
    const queueItem: EmailQueueItem = {
      id: uuidv4(),
      options,
      priority,
      scheduledAt: scheduledAt || new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        source: 'api',
        ...metadata
      }
    }

    this.queue.push(queueItem)
    this.queue.sort((a, b) => b.priority - a.priority) // Higher priority first

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue()
    }

    return queueItem.id
  }

  /**
   * Process email queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const item = this.queue.shift()
      if (!item) break

      // Check if it's time to send
      if (new Date(item.scheduledAt) > new Date()) {
        this.queue.unshift(item) // Put back at front
        break
      }

      item.status = 'processing'
      item.attempts++

      try {
        const result = await this.sendEmail(item.options)

        if (result.success) {
          item.status = 'sent'
          console.log(`Queued email sent successfully: ${item.id}`)
        } else {
          throw new Error(result.error || 'Unknown error')
        }

      } catch (error) {
        console.error(`Email queue item failed: ${item.id}`, error)

        if (item.attempts >= item.maxAttempts) {
          item.status = 'failed'
          console.error(`Email queue item failed permanently: ${item.id}`)
        } else {
          item.status = 'pending'
          // Exponential backoff: wait 2^attempts minutes
          const delayMinutes = Math.pow(2, item.attempts)
          item.scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString()
          this.queue.push(item) // Add back to queue
        }
      }

      item.updatedAt = new Date().toISOString()
    }

    this.isProcessing = false

    // Schedule next processing if there are pending items
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 60000) // Check every minute
    }
  }

  /**
   * Track email status
   */
  private trackEmail(
    messageId: string,
    status: EmailTracking['status'],
    recipient: string | string[],
    metadata: Partial<EmailTracking['metadata']>
  ): void {
    const recipients = Array.isArray(recipient) ? recipient : [recipient]

    for (const email of recipients) {
      const tracking: EmailTracking = {
        messageId,
        status,
        recipient: email,
        sentAt: status === 'sent' ? new Date().toISOString() : undefined,
        deliveredAt: status === 'delivered' ? new Date().toISOString() : undefined,
        openedAt: status === 'opened' ? new Date().toISOString() : undefined,
        clickedAt: status === 'clicked' ? new Date().toISOString() : undefined,
        bouncedAt: status === 'bounced' ? new Date().toISOString() : undefined,
        metadata: {
          subject: '',
          ...metadata
        }
      }

      this.tracking.set(`${messageId}-${email}`, tracking)
    }
  }

  /**
   * Update email tracking status
   */
  updateTrackingStatus(messageId: string, recipient: string, status: EmailTracking['status'], metadata?: any): void {
    const key = `${messageId}-${recipient}`
    const tracking = this.tracking.get(key)

    if (tracking) {
      tracking.status = status
      tracking.updatedAt = new Date().toISOString()

      switch (status) {
        case 'delivered':
          tracking.deliveredAt = new Date().toISOString()
          break
        case 'opened':
          tracking.openedAt = new Date().toISOString()
          break
        case 'clicked':
          tracking.clickedAt = new Date().toISOString()
          break
        case 'bounced':
          tracking.bouncedAt = new Date().toISOString()
          tracking.errorMessage = metadata?.errorMessage
          break
        case 'failed':
          tracking.errorMessage = metadata?.errorMessage
          break
      }

      this.tracking.set(key, tracking)
    }
  }

  /**
   * Get email analytics
   */
  getAnalytics(dateFrom?: string, dateTo?: string): EmailAnalytics {
    const tracking = Array.from(this.tracking.values())
    let filteredTracking = tracking

    // Filter by date range if provided
    if (dateFrom || dateTo) {
      filteredTracking = tracking.filter(t => {
        const sentDate = t.sentAt ? new Date(t.sentAt) : null
        if (!sentDate) return false

        if (dateFrom && sentDate < new Date(dateFrom)) return false
        if (dateTo && sentDate > new Date(dateTo)) return false
        return true
      })
    }

    const totalSent = filteredTracking.length
    const totalDelivered = filteredTracking.filter(t => t.deliveredAt).length
    const totalOpened = filteredTracking.filter(t => t.openedAt).length
    const totalClicked = filteredTracking.filter(t => t.clickedAt).length
    const totalBounced = filteredTracking.filter(t => t.bouncedAt).length
    const totalFailed = filteredTracking.filter(t => t.status === 'failed').length

    // Calculate rates
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0

    // Calculate average delivery time
    const deliveredEmails = filteredTracking.filter(t => t.deliveredAt && t.sentAt)
    const averageDeliveryTime = deliveredEmails.length > 0
      ? deliveredEmails.reduce((sum, t) => {
          const deliveryTime = new Date(t.deliveredAt!).getTime() - new Date(t.sentAt!).getTime()
          return sum + deliveryTime
        }, 0) / deliveredEmails.length
      : 0

    // Top templates
    const templateStats = new Map<string, { count: number; delivered: number }>()
    filteredTracking.forEach(t => {
      if (t.metadata.templateId) {
        const stats = templateStats.get(t.metadata.templateId) || { count: 0, delivered: 0 }
        stats.count++
        if (t.deliveredAt) stats.delivered++
        templateStats.set(t.metadata.templateId, stats)
      }
    })

    const topTemplates = Array.from(templateStats.entries())
      .map(([templateId, stats]) => ({
        templateId,
        templateName: this.getTemplate(templateId)?.name || templateId,
        count: stats.count,
        deliveryRate: stats.count > 0 ? (stats.delivered / stats.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Hourly stats
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
      const hourEmails = filteredTracking.filter(t => {
        if (!t.sentAt) return false
        const sentHour = new Date(t.sentAt).getHours()
        return sentHour === hour
      })

      return {
        hour,
        sent: hourEmails.length,
        delivered: hourEmails.filter(t => t.deliveredAt).length,
        opened: hourEmails.filter(t => t.openedAt).length
      }
    })

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalFailed,
      deliveryRate,
      openRate,
      clickRate,
      bounceRate,
      averageDeliveryTime,
      topTemplates,
      hourlyStats
    }
  }

  /**
   * Count total recipients
   */
  private countRecipients(to: string | string[], cc?: string | string[], bcc?: string | string[]): number {
    let count = Array.isArray(to) ? to.length : 1
    if (cc) count += Array.isArray(cc) ? cc.length : 1
    if (bcc) count += Array.isArray(bcc) ? bcc.length : 1
    return count
  }

  /**
   * Load default email templates
   */
  private loadDefaultTemplates(): void {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'document-notification',
        name: 'Document Notification',
        subject: 'Your {{documentType}} is ready',
        htmlTemplate: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>{{companyName}}</h1>
              </div>
              <div class="content">
                <h2>Your {{documentType}} is ready!</h2>
                <p>Hello {{recipientName}},</p>
                <p>Your {{documentType}} has been generated and is ready for download.</p>
                <p><strong>Document Details:</strong></p>
                <ul>
                  <li>Type: {{documentType}}</li>
                  <li>Generated: {{formatDate generatedAt 'long'}}</li>
                  <li>Reference: {{documentReference}}</li>
                </ul>
                <p>You can download your document using the button below:</p>
                <a href="{{downloadUrl}}" class="button">Download Document</a>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>{{companyName}} Team</p>
              </div>
              <div class="footer">
                <p>This email was sent to {{recipientEmail}}. If you didn't request this document, please ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        textTemplate: `
          Your {{documentType}} is ready!
          
          Hello {{recipientName}},
          
          Your {{documentType}} has been generated and is ready for download.
          
          Document Details:
          - Type: {{documentType}}
          - Generated: {{formatDate generatedAt 'long'}}
          - Reference: {{documentReference}}
          
          Download your document: {{downloadUrl}}
          
          If you have any questions, please don't hesitate to contact us.
          
          Best regards,
          {{companyName}} Team
        `,
        placeholders: [
          { name: 'companyName', type: 'text', required: true },
          { name: 'recipientName', type: 'text', required: true },
          { name: 'recipientEmail', type: 'text', required: true },
          { name: 'documentType', type: 'text', required: true },
          { name: 'documentReference', type: 'text', required: true },
          { name: 'generatedAt', type: 'date', required: true },
          { name: 'downloadUrl', type: 'link', required: true }
        ],
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        }
      }
    ]

    defaultTemplates.forEach(template => {
      this.registerTemplate(template)
    })
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.transporter) {
      this.transporter.close()
      this.transporter = null
    }
  }
}

// Export singleton instance
export const emailService = new EmailNotificationService()
