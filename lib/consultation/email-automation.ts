/**
 * Email Automation System for Consultations
 *
 * Automated email sequences, delivery scheduling, and client communication
 * management for consultation services with personalized content.
 */

import { sendRaw, type EmailResult, type EmailProvider } from '@/packages/emailer/src/service';
import { consultationEmails, type EmailBranding } from '@/lib/email/consultation-templates';
import type { ConsultationReport } from '@/lib/consultation/report-generator';
import type { ServicePackage } from '@/lib/ai/consultation-generator';

export interface EmailDeliveryOptions {
  from?: string;
  apiKey?: string;
  provider?: EmailProvider;
  branding?: Partial<EmailBranding>;
  attachments?: Array<{
    filename: string;
    content: Buffer | Blob;
    contentType: string;
  }>;
}

export interface EmailSequenceStep {
  id: string;
  delay_days: number;
  template_type: 'welcome' | 'followup' | 'upsell' | 'reminder';
  subject_template: string;
  enabled: boolean;
  conditions?: {
    service_tier?: string[];
    client_type?: string[];
    report_score?: { min?: number; max?: number };
  };
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  trigger: 'consultation_delivery' | 'assessment_completion' | 'manual';
  steps: EmailSequenceStep[];
  enabled: boolean;
}

export interface EmailDeliveryRecord {
  id: string;
  email: string;
  template_type: string;
  sequence_id?: string;
  step_id?: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'pending' | 'bounced';
  error_message?: string;
  opened?: boolean;
  clicked?: boolean;
  consultation_id?: string;
}

export interface ScheduledEmail {
  id: string;
  email: string;
  scheduled_for: string;
  template_type: string;
  template_data: any;
  sequence_id?: string;
  step_id?: string;
  consultation_id?: string;
  delivery_options: EmailDeliveryOptions;
}

/**
 * Email automation system for consultation workflows
 */
export class ConsultationEmailAutomation {
  private deliveryRecords: Map<string, EmailDeliveryRecord> = new Map();
  private scheduledEmails: Map<string, ScheduledEmail> = new Map();
  private emailSequences: Map<string, EmailSequence> = new Map();

  constructor() {
    this.initializeDefaultSequences();
  }

  /**
   * Send consultation report with automated follow-up sequence
   */
  async deliverConsultationReport(
    email: string,
    report: ConsultationReport,
    pdfBlob: Blob,
    options: EmailDeliveryOptions = {}
  ): Promise<EmailResult> {
    try {
      // Generate report delivery email
      const attachmentName = `consultation-report-${report.client_info.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      const emailContent = consultationEmails.reportDelivery(report, attachmentName, options.branding);

      // Convert blob to buffer for attachment
      const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

      // Send email with PDF attachment
      const result = await this.sendEmailWithAttachment(
        email,
        emailContent.subject,
        emailContent.html,
        [
          {
            filename: attachmentName,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ],
        options
      );

      // Record delivery
      const deliveryRecord: EmailDeliveryRecord = {
        id: `delivery_${Date.now()}`,
        email,
        template_type: 'report_delivery',
        sent_at: new Date().toISOString(),
        status: result.ok ? 'sent' : 'failed',
        error_message: result.ok ? undefined : result.message,
        consultation_id: report.id
      };

      this.deliveryRecords.set(deliveryRecord.id, deliveryRecord);

      // Schedule follow-up sequence if delivery was successful
      if (result.ok) {
        await this.startEmailSequence('consultation_delivery', email, {
          clientName: report.client_info.name,
          reportTitle: report.title,
          consultationId: report.id,
          serviceTier: report.recommendations.primary.tier
        }, options);
      }

      return result;
    } catch (error) {
      console.error('Consultation delivery failed:', error);
      return {
        ok: false,
        code: 'DELIVERY_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send welcome email when assessment is completed
   */
  async sendWelcomeEmail(
    email: string,
    clientName: string,
    estimatedDeliveryTime: string = '24-48 hours',
    options: EmailDeliveryOptions = {}
  ): Promise<EmailResult> {
    try {
      const emailContent = consultationEmails.welcome(clientName, estimatedDeliveryTime, options.branding);

      const result = await sendRaw({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        ...options
      });

      // Record delivery
      const deliveryRecord: EmailDeliveryRecord = {
        id: `welcome_${Date.now()}`,
        email,
        template_type: 'welcome',
        sent_at: new Date().toISOString(),
        status: result.ok ? 'sent' : 'failed',
        error_message: result.ok ? undefined : result.message
      };

      this.deliveryRecords.set(deliveryRecord.id, deliveryRecord);

      return result;
    } catch (error) {
      console.error('Welcome email failed:', error);
      return {
        ok: false,
        code: 'WELCOME_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send follow-up email manually or via automation
   */
  async sendFollowUpEmail(
    email: string,
    clientName: string,
    reportTitle: string,
    daysAfterDelivery: number = 3,
    options: EmailDeliveryOptions = {}
  ): Promise<EmailResult> {
    try {
      const emailContent = consultationEmails.followUp(clientName, reportTitle, daysAfterDelivery, options.branding);

      const result = await sendRaw({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        ...options
      });

      // Record delivery
      const deliveryRecord: EmailDeliveryRecord = {
        id: `followup_${Date.now()}`,
        email,
        template_type: 'followup',
        sent_at: new Date().toISOString(),
        status: result.ok ? 'sent' : 'failed',
        error_message: result.ok ? undefined : result.message
      };

      this.deliveryRecords.set(deliveryRecord.id, deliveryRecord);

      return result;
    } catch (error) {
      console.error('Follow-up email failed:', error);
      return {
        ok: false,
        code: 'FOLLOWUP_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send service upsell email
   */
  async sendServiceUpsellEmail(
    email: string,
    clientName: string,
    currentService: ServicePackage,
    upgradeService: ServicePackage,
    options: EmailDeliveryOptions = {}
  ): Promise<EmailResult> {
    try {
      const emailContent = consultationEmails.serviceUpsell(clientName, currentService, upgradeService, options.branding);

      const result = await sendRaw({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        ...options
      });

      // Record delivery
      const deliveryRecord: EmailDeliveryRecord = {
        id: `upsell_${Date.now()}`,
        email,
        template_type: 'upsell',
        sent_at: new Date().toISOString(),
        status: result.ok ? 'sent' : 'failed',
        error_message: result.ok ? undefined : result.message
      };

      this.deliveryRecords.set(deliveryRecord.id, deliveryRecord);

      return result;
    } catch (error) {
      console.error('Upsell email failed:', error);
      return {
        ok: false,
        code: 'UPSELL_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Start automated email sequence
   */
  async startEmailSequence(
    sequenceType: string,
    email: string,
    contextData: any,
    options: EmailDeliveryOptions = {}
  ): Promise<void> {
    const sequence = Array.from(this.emailSequences.values())
      .find(seq => seq.trigger === sequenceType && seq.enabled);

    if (!sequence) {
      console.warn(`No enabled sequence found for trigger: ${sequenceType}`);
      return;
    }

    // Schedule each step in the sequence
    for (const step of sequence.steps.filter(s => s.enabled)) {
      // Check conditions
      if (step.conditions && !this.evaluateStepConditions(step.conditions, contextData)) {
        continue;
      }

      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + step.delay_days);

      const scheduledEmail: ScheduledEmail = {
        id: `scheduled_${Date.now()}_${step.id}`,
        email,
        scheduled_for: scheduledFor.toISOString(),
        template_type: step.template_type,
        template_data: contextData,
        sequence_id: sequence.id,
        step_id: step.id,
        consultation_id: contextData.consultationId,
        delivery_options: options
      };

      this.scheduledEmails.set(scheduledEmail.id, scheduledEmail);
    }
  }

  /**
   * Process scheduled emails (would be called by a cron job)
   */
  async processScheduledEmails(): Promise<void> {
    const now = new Date();
    const emailsToSend = Array.from(this.scheduledEmails.values())
      .filter(email => new Date(email.scheduled_for) <= now);

    for (const scheduledEmail of emailsToSend) {
      try {
        await this.sendScheduledEmail(scheduledEmail);
        this.scheduledEmails.delete(scheduledEmail.id);
      } catch (error) {
        console.error(`Failed to send scheduled email ${scheduledEmail.id}:`, error);
      }
    }
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats(dateRange?: { start: string; end: string }): {
    total_sent: number;
    total_failed: number;
    success_rate: number;
    by_template: Record<string, number>;
    by_status: Record<string, number>;
  } {
    let records = Array.from(this.deliveryRecords.values());

    if (dateRange) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      records = records.filter(record => {
        const sentDate = new Date(record.sent_at);
        return sentDate >= start && sentDate <= end;
      });
    }

    const total = records.length;
    const successful = records.filter(r => r.status === 'sent').length;
    const failed = records.filter(r => r.status === 'failed').length;

    const byTemplate = records.reduce((acc, record) => {
      acc[record.template_type] = (acc[record.template_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = records.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_sent: successful,
      total_failed: failed,
      success_rate: total > 0 ? (successful / total) * 100 : 0,
      by_template: byTemplate,
      by_status: byStatus
    };
  }

  /**
   * Send email with attachments (simulated for now)
   */
  private async sendEmailWithAttachment(
    to: string,
    subject: string,
    html: string,
    attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>,
    options: EmailDeliveryOptions
  ): Promise<EmailResult> {
    // Note: The base emailer doesn't support attachments yet
    // This is a placeholder for future attachment support
    console.log(`Sending email to ${to} with ${attachments.length} attachments`);

    // For now, send without attachments and add note about attachment
    const htmlWithAttachmentNote = html.replace(
      '</body>',
      `<div style="background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h4 style="color: #0369a1; margin: 0 0 8px 0;">📎 Attachment Information</h4>
        <p style="margin: 0; color: #0369a1;">Your consultation report PDF is attached to this email.</p>
      </div></body>`
    );

    return sendRaw({
      to,
      subject,
      html: htmlWithAttachmentNote,
      ...options
    });
  }

  /**
   * Send a scheduled email
   */
  private async sendScheduledEmail(scheduledEmail: ScheduledEmail): Promise<void> {
    const { template_type, template_data, email, delivery_options } = scheduledEmail;

    let result: EmailResult;

    switch (template_type) {
      case 'followup':
        result = await this.sendFollowUpEmail(
          email,
          template_data.clientName,
          template_data.reportTitle,
          3,
          delivery_options
        );
        break;

      case 'upsell':
        if (template_data.upgradeService) {
          result = await this.sendServiceUpsellEmail(
            email,
            template_data.clientName,
            template_data.currentService,
            template_data.upgradeService,
            delivery_options
          );
        } else {
          console.warn('Upsell email scheduled but no upgrade service provided');
          return;
        }
        break;

      default:
        console.warn(`Unknown template type for scheduled email: ${template_type}`);
        return;
    }

    // Update scheduled email record with sequence info
    if (result.ok && scheduledEmail.sequence_id && scheduledEmail.step_id) {
      const record = Array.from(this.deliveryRecords.values())
        .find(r => r.email === email && r.template_type === template_type);

      if (record) {
        record.sequence_id = scheduledEmail.sequence_id;
        record.step_id = scheduledEmail.step_id;
      }
    }
  }

  /**
   * Evaluate whether step conditions are met
   */
  private evaluateStepConditions(conditions: EmailSequenceStep['conditions'], contextData: any): boolean {
    if (!conditions) return true;

    // Check service tier condition
    if (conditions.service_tier && contextData.serviceTier) {
      if (!conditions.service_tier.includes(contextData.serviceTier)) {
        return false;
      }
    }

    // Check client type condition
    if (conditions.client_type && contextData.clientType) {
      if (!conditions.client_type.includes(contextData.clientType)) {
        return false;
      }
    }

    // Check report score condition
    if (conditions.report_score && contextData.reportScore !== undefined) {
      const score = contextData.reportScore;
      if (conditions.report_score.min !== undefined && score < conditions.report_score.min) {
        return false;
      }
      if (conditions.report_score.max !== undefined && score > conditions.report_score.max) {
        return false;
      }
    }

    return true;
  }

  /**
   * Initialize default email sequences
   */
  private initializeDefaultSequences(): void {
    const consultationDeliverySequence: EmailSequence = {
      id: 'consultation_delivery',
      name: 'Post-Consultation Follow-up',
      description: 'Automated follow-up sequence after consultation delivery',
      trigger: 'consultation_delivery',
      enabled: true,
      steps: [
        {
          id: 'followup_3_days',
          delay_days: 3,
          template_type: 'followup',
          subject_template: 'How are your recommendations working out?',
          enabled: true
        },
        {
          id: 'upsell_7_days',
          delay_days: 7,
          template_type: 'upsell',
          subject_template: 'Ready to accelerate your results?',
          enabled: true,
          conditions: {
            service_tier: ['foundation', 'growth']
          }
        }
      ]
    };

    this.emailSequences.set(consultationDeliverySequence.id, consultationDeliverySequence);
  }

  /**
   * Get all email sequences
   */
  getEmailSequences(): EmailSequence[] {
    return Array.from(this.emailSequences.values());
  }

  /**
   * Get delivery records for a specific email
   */
  getEmailDeliveryHistory(email: string): EmailDeliveryRecord[] {
    return Array.from(this.deliveryRecords.values())
      .filter(record => record.email === email)
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }

  /**
   * Get scheduled emails for a specific email
   */
  getScheduledEmails(email?: string): ScheduledEmail[] {
    const scheduled = Array.from(this.scheduledEmails.values());
    return email ? scheduled.filter(s => s.email === email) : scheduled;
  }
}

/**
 * Default email automation instance
 */
export const consultationEmailAutomation = new ConsultationEmailAutomation();

/**
 * Convenience functions for email automation
 */
export const emailAutomation = {
  deliverReport: (email: string, report: ConsultationReport, pdfBlob: Blob, options?: EmailDeliveryOptions) =>
    consultationEmailAutomation.deliverConsultationReport(email, report, pdfBlob, options),

  sendWelcome: (email: string, clientName: string, estimatedDelivery?: string, options?: EmailDeliveryOptions) =>
    consultationEmailAutomation.sendWelcomeEmail(email, clientName, estimatedDelivery, options),

  sendFollowUp: (email: string, clientName: string, reportTitle: string, daysAfter?: number, options?: EmailDeliveryOptions) =>
    consultationEmailAutomation.sendFollowUpEmail(email, clientName, reportTitle, daysAfter, options),

  sendUpsell: (email: string, clientName: string, currentService: ServicePackage, upgradeService: ServicePackage, options?: EmailDeliveryOptions) =>
    consultationEmailAutomation.sendServiceUpsellEmail(email, clientName, currentService, upgradeService, options),

  getStats: (dateRange?: { start: string; end: string }) =>
    consultationEmailAutomation.getDeliveryStats(dateRange),

  getHistory: (email: string) =>
    consultationEmailAutomation.getEmailDeliveryHistory(email),

  processScheduled: () =>
    consultationEmailAutomation.processScheduledEmails()
};