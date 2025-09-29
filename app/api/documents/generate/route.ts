/**
 * Document Generation API Endpoint
 * 
 * Handles PDF generation requests with template processing,
 * versioning, and email notifications.
 */

import { NextRequest, NextResponse } from 'next/server'
import { pdfEngine } from '@/lib/document-generator/pdf-engine'
import { documentVersioning } from '@/lib/document-generator/document-versioning'
import { emailService } from '@/lib/email/notification-service'
import { z } from 'zod'

// Request validation schema
const generateDocumentSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  data: z.record(z.any()),
  options: z.object({
    filename: z.string().optional(),
    format: z.enum(['A4', 'Letter', 'Legal']).optional(),
    orientation: z.enum(['portrait', 'landscape']).optional(),
    quality: z.enum(['low', 'medium', 'high']).optional(),
    watermark: z.object({
      text: z.string(),
      opacity: z.number().min(0).max(1),
      position: z.enum(['center', 'top', 'bottom'])
    }).optional(),
    includeMetadata: z.boolean().optional()
  }).optional(),
  email: z.object({
    enabled: z.boolean(),
    templateId: z.string().optional(),
    recipients: z.array(z.string().email()),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    subject: z.string().optional(),
    customData: z.record(z.any()).optional()
  }).optional(),
  versioning: z.object({
    enabled: z.boolean(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    changes: z.array(z.string()).optional()
  }).optional(),
  metadata: z.object({
    tenantId: z.string().optional(),
    userId: z.string().optional(),
    source: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validationResult = generateDocumentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const {
      templateId,
      data,
      options = {},
      email = { enabled: false, recipients: [] },
      versioning = { enabled: true },
      metadata = {}
    } = validationResult.data

    // Check if template exists
    const template = pdfEngine.getTemplate(templateId)
    if (!template) {
      return NextResponse.json(
        { success: false, error: `Template not found: ${templateId}` },
        { status: 404 }
      )
    }

    // Generate PDF
    const generationResult = await pdfEngine.generatePDF({
      templateId,
      data,
      ...options
    })

    if (!generationResult.success) {
      return NextResponse.json(
        { success: false, error: generationResult.error },
        { status: 500 }
      )
    }

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Handle versioning
    let version: any = null
    if (versioning.enabled) {
      version = await documentVersioning.createVersion(
        documentId,
        templateId,
        data,
        generationResult.filePath!,
        metadata.userId || 'system',
        {
          changes: versioning.changes,
          tags: versioning.tags,
          notes: versioning.notes,
          metadata: {
            quality: options.quality || 'medium',
            format: options.format || 'A4',
            orientation: options.orientation || 'portrait'
          }
        }
      )
    }

    // Handle email notification
    let emailResult: any = null
    if (email.enabled && email.recipients.length > 0) {
      const emailTemplateId = email.templateId || 'document-notification'
      const emailTemplate = emailService.getTemplate(emailTemplateId)
      
      if (emailTemplate) {
        const emailData = {
          companyName: 'Agency Toolkit',
          recipientName: email.recipients[0].split('@')[0], // Extract name from email
          recipientEmail: email.recipients[0],
          documentType: template.name,
          documentReference: documentId,
          generatedAt: new Date().toISOString(),
          downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/documents/download/${documentId}`,
          ...email.customData
        }

        // Create email attachment
        const attachment = {
          filename: generationResult.filename!,
          content: require('fs').readFileSync(generationResult.filePath!),
          contentType: 'application/pdf'
        }

        emailResult = await emailService.sendEmail({
          to: email.recipients,
          cc: email.cc,
          bcc: email.bcc,
          subject: email.subject || `Your ${template.name} is ready`,
          templateId: emailTemplateId,
          templateData: emailData,
          attachments: [attachment]
        })
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        filename: generationResult.filename,
        filePath: generationResult.filePath,
        fileSize: generationResult.fileSize,
        generationTime: generationResult.generationTime,
        template: {
          id: templateId,
          name: template.name,
          version: template.metadata.version
        },
        version: version ? {
          id: version.id,
          version: version.version,
          createdAt: version.generatedAt
        } : null,
        email: emailResult ? {
          success: emailResult.success,
          messageId: emailResult.messageId,
          recipientCount: emailResult.recipientCount
        } : null,
        metadata: generationResult.metadata
      }
    })

  } catch (error) {
    console.error('Document generation failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const action = searchParams.get('action')

    if (action === 'templates') {
      // List available templates
      const templates = pdfEngine.listTemplates()
      return NextResponse.json({
        success: true,
        templates: templates.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          version: template.metadata.version,
          placeholders: template.placeholders.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            required: p.required,
            description: p.description
          }))
        }))
      })
    }

    if (action === 'template' && templateId) {
      // Get specific template details
      const template = pdfEngine.getTemplate(templateId)
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          version: template.metadata.version,
          placeholders: template.placeholders,
          branding: template.branding
        }
      })
    }

    if (action === 'analytics') {
      // Get generation analytics
      const stats = await documentVersioning.getStorageStats()
      return NextResponse.json({
        success: true,
        analytics: stats
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Document API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
