/**
 * Batch Document Generation API Endpoint
 * 
 * Handles batch PDF generation for multiple documents
 * with progress tracking and queue management.
 */

import { NextRequest, NextResponse } from 'next/server'
import { pdfEngine } from '@/lib/document-generator/pdf-engine'
import { documentVersioning } from '@/lib/document-generator/document-versioning'
import { emailService } from '@/lib/email/notification-service'
import { z } from 'zod'

// Batch request validation schema
const batchGenerateSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  documents: z.array(z.object({
    id: z.string().optional(),
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
      }).optional()
    }).optional(),
    email: z.object({
      enabled: z.boolean(),
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
    }).optional()
  })).min(1, 'At least one document is required'),
  batchOptions: z.object({
    maxConcurrency: z.number().min(1).max(10).optional(),
    emailTemplateId: z.string().optional(),
    versioningEnabled: z.boolean().optional(),
    metadata: z.object({
      tenantId: z.string().optional(),
      userId: z.string().optional(),
      source: z.string().optional()
    }).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validationResult = batchGenerateSchema.safeParse(body)
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
      documents,
      batchOptions = {}
    } = validationResult.data

    const {
      maxConcurrency = 3,
      emailTemplateId = 'document-notification',
      versioningEnabled = true,
      metadata = {}
    } = batchOptions

    // Check if template exists
    const template = pdfEngine.getTemplate(templateId)
    if (!template) {
      return NextResponse.json(
        { success: false, error: `Template not found: ${templateId}` },
        { status: 404 }
      )
    }

    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const results: any[] = []
    const errors: any[] = []

    // Process documents in batches with concurrency control
    const processBatch = async (batch: typeof documents) => {
      const promises = batch.map(async (doc, index) => {
        try {
          const documentId = doc.id || `${batchId}_${index}`
          
          // Generate PDF
          const generationResult = await pdfEngine.generatePDF({
            templateId,
            data: doc.data,
            ...doc.options
          })

          if (!generationResult.success) {
            throw new Error(generationResult.error || 'PDF generation failed')
          }

          let version: any = null
          if (versioningEnabled && doc.versioning?.enabled !== false) {
            version = await documentVersioning.createVersion(
              documentId,
              templateId,
              doc.data,
              generationResult.filePath!,
              metadata.userId || 'system',
              {
                changes: doc.versioning?.changes,
                tags: doc.versioning?.tags,
                notes: doc.versioning?.notes,
                metadata: {
                  quality: doc.options?.quality || 'medium',
                  format: doc.options?.format || 'A4',
                  orientation: doc.options?.orientation || 'portrait'
                }
              }
            )
          }

          // Handle email notification
          let emailResult: any = null
          if (doc.email?.enabled && doc.email.recipients.length > 0) {
            const emailTemplate = emailService.getTemplate(emailTemplateId)
            
            if (emailTemplate) {
              const emailData = {
                companyName: 'Agency Toolkit',
                recipientName: doc.email.recipients[0].split('@')[0],
                recipientEmail: doc.email.recipients[0],
                documentType: template.name,
                documentReference: documentId,
                generatedAt: new Date().toISOString(),
                downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/documents/download/${documentId}`,
                ...doc.email.customData
              }

              const attachment = {
                filename: generationResult.filename!,
                content: require('fs').readFileSync(generationResult.filePath!),
                contentType: 'application/pdf'
              }

              emailResult = await emailService.sendEmail({
                to: doc.email.recipients,
                cc: doc.email.cc,
                bcc: doc.email.bcc,
                subject: doc.email.subject || `Your ${template.name} is ready`,
                templateId: emailTemplateId,
                templateData: emailData,
                attachments: [attachment]
              })
            }
          }

          return {
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
          }

        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            documentId: doc.id || `batch_${index}`
          }
        }
      })

      return Promise.all(promises)
    }

    // Process documents in chunks
    const chunkSize = maxConcurrency
    for (let i = 0; i < documents.length; i += chunkSize) {
      const chunk = documents.slice(i, i + chunkSize)
      const chunkResults = await processBatch(chunk)
      
      chunkResults.forEach(result => {
        if (result.success) {
          results.push(result.document)
        } else {
          errors.push({
            documentId: result.documentId,
            error: result.error
          })
        }
      })
    }

    // Calculate batch statistics
    const totalDocuments = documents.length
    const successfulDocuments = results.length
    const failedDocuments = errors.length
    const successRate = totalDocuments > 0 ? (successfulDocuments / totalDocuments) * 100 : 0

    const totalFileSize = results.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
    const totalGenerationTime = results.reduce((sum, doc) => sum + (doc.generationTime || 0), 0)
    const averageGenerationTime = successfulDocuments > 0 ? totalGenerationTime / successfulDocuments : 0

    return NextResponse.json({
      success: true,
      batch: {
        id: batchId,
        templateId,
        totalDocuments,
        successfulDocuments,
        failedDocuments,
        successRate,
        totalFileSize,
        totalGenerationTime,
        averageGenerationTime,
        processedAt: new Date().toISOString()
      },
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Batch document generation failed:', error)
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
    const action = searchParams.get('action')

    if (action === 'status') {
      // Get batch processing status (placeholder for future implementation)
      return NextResponse.json({
        success: true,
        status: {
          activeBatches: 0,
          queuedDocuments: 0,
          processingRate: 0,
          averageProcessingTime: 0
        }
      })
    }

    if (action === 'templates') {
      // List available templates for batch processing
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
            required: p.required
          }))
        }))
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Batch API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
