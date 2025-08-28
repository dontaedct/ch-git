/**
 * Email Service
 * 
 * Handles email copy requests with template support and provider integration
 */

import { getClientSettings } from '@/lib/config/client-settings'

interface EmailData {
  to: string
  subject: string
  clientName: string
  planTitle: string
  date: string
  pdfBlob?: Blob
  filename?: string
}

interface EmailTemplateContext {
  clientName: string
  planTitle: string
  date: string
}

/**
 * Process email subject template with context variables
 */
function processTemplate(template: string, context: EmailTemplateContext): string {
  return template
    .replace(/\{\{clientName\}\}/g, context.clientName)
    .replace(/\{\{planTitle\}\}/g, context.planTitle)
    .replace(/\{\{date\}\}/g, context.date)
}

/**
 * Send email copy request (stub implementation)
 */
export async function requestEmailCopy(data: EmailData): Promise<{ success: boolean; message: string }> {
  const settings = getClientSettings()
  
  // Process the email subject template
  const processedSubject = processTemplate(settings.emailSubjectTemplate, {
    clientName: data.clientName,
    planTitle: data.planTitle,
    date: data.date
  })

  console.log('Email copy request:', {
    to: data.to,
    subject: processedSubject,
    originalTemplate: settings.emailSubjectTemplate,
    hasAttachment: !!data.pdfBlob,
    attachmentFilename: data.filename
  })

  // Simulate email provider integration
  // In production, this would integrate with:
  // - SendGrid, Mailgun, AWS SES, etc.
  // - or use existing n8n webhook for email automation
  
  const isEmailProviderConfigured = checkEmailProviderConfig()
  
  if (!isEmailProviderConfigured) {
    return {
      success: false,
      message: 'Email provider not configured. This is a stub implementation for demonstration.'
    }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // For demo purposes, always return success
  return {
    success: true,
    message: `Email sent to ${data.to} with subject: "${processedSubject}"`
  }
}

/**
 * Check if email provider is configured
 */
function checkEmailProviderConfig(): boolean {
  // Check for common email provider environment variables
  return !!(
    process.env.SENDGRID_API_KEY ??
    process.env.MAILGUN_API_KEY ??
    process.env.AWS_SES_REGION ??
    process.env.SMTP_HOST ??
    process.env.N8N_WEBHOOK_URL // Can use N8N for email automation
  )
}

/**
 * Get available email providers
 */
export function getEmailProviderStatus(): { 
  configured: boolean 
  providers: Array<{ name: string; available: boolean }>
} {
  const providers = [
    { name: 'SendGrid', available: !!process.env.SENDGRID_API_KEY },
    { name: 'Mailgun', available: !!process.env.MAILGUN_API_KEY },
    { name: 'AWS SES', available: !!process.env.AWS_SES_REGION },
    { name: 'SMTP', available: !!process.env.SMTP_HOST },
    { name: 'N8N Webhook', available: !!process.env.N8N_WEBHOOK_URL }
  ]

  return {
    configured: providers.some(p => p.available),
    providers
  }
}

/**
 * Email modal component data
 */
export interface EmailModalData {
  isOpen: boolean
  email: string
  clientName: string
  planTitle: string
  isLoading: boolean
  onEmailChange: (email: string) => void
  onSubmit: () => void
  onClose: () => void
}

/**
 * Create email modal state manager
 */
export function createEmailModal(
  initialEmail = '',
  clientName = 'Unknown Client',
  planTitle = 'Consultation Plan'
): EmailModalData {
  let state = {
    isOpen: false,
    email: initialEmail,
    clientName,
    planTitle,
    isLoading: false
  }

  const listeners: Array<() => void> = []

  const notify = () => {
    listeners.forEach(listener => listener())
  }

  return {
    get isOpen() { return state.isOpen },
    get email() { return state.email },
    get clientName() { return state.clientName },
    get planTitle() { return state.planTitle },
    get isLoading() { return state.isLoading },
    
    onEmailChange: (email: string) => {
      state.email = email
      notify()
    },
    
    onSubmit: async () => {
      if (!state.email || state.isLoading) return
      
      state.isLoading = true
      notify()
      
      try {
        const result = await requestEmailCopy({
          to: state.email,
          subject: '', // Will be processed in requestEmailCopy
          clientName: state.clientName,
          planTitle: state.planTitle,
          date: new Date().toLocaleDateString()
        })
        
        if (result.success) {
          state.isOpen = false
          // Show success message
          console.log('Email sent successfully:', result.message)
        } else {
          // Show error message
          console.error('Email failed:', result.message)
        }
      } catch (error) {
        console.error('Email request error:', error)
      } finally {
        state.isLoading = false
        notify()
      }
    },
    
    onClose: () => {
      if (!state.isLoading) {
        state.isOpen = false
        notify()
      }
    }
  }
}