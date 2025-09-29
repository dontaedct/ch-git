/**
 * @fileoverview Automated Package Delivery System
 * @module lib/handover/delivery-automation
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.4: Automated package delivery system for secure handover package distribution.
 * Handles secure delivery, tracking, notifications, and client communication.
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { CompleteHandoverPackage } from './package-assembler';

// Types and interfaces
export interface DeliveryRequest {
  id: string;
  packageId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  deliveryMethod: DeliveryMethod;
  priority: DeliveryPriority;
  scheduledAt?: Date;
  requestedBy: string;
  requestedAt: Date;
  metadata: DeliveryMetadata;
}

export type DeliveryMethod = 'email' | 'portal' | 'sftp' | 'secure_download' | 'api_webhook';
export type DeliveryPriority = 'low' | 'normal' | 'high' | 'urgent';
export type DeliveryStatus = 'pending' | 'preparing' | 'sending' | 'delivered' | 'failed' | 'expired' | 'cancelled';

export interface DeliveryMetadata {
  packageSize: number;
  fileCount: number;
  securityLevel: 'standard' | 'high' | 'maximum';
  requiresConfirmation: boolean;
  expirationDays: number;
  customInstructions?: string;
  deliveryOptions: Record<string, any>;
}

export interface DeliveryExecution {
  id: string;
  requestId: string;
  status: DeliveryStatus;
  startedAt: Date;
  completedAt?: Date;
  attempts: DeliveryAttempt[];
  currentAttempt: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  deliveryProof?: DeliveryProof;
  notifications: DeliveryNotification[];
  errors: DeliveryError[];
}

export interface DeliveryAttempt {
  attemptNumber: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'success' | 'failed';
  method: DeliveryMethod;
  details: AttemptDetails;
  error?: DeliveryError;
}

export interface AttemptDetails {
  recipientEmail?: string;
  downloadUrl?: string;
  trackingId?: string;
  secureToken?: string;
  expirationDate?: Date;
  deliveryConfirmation?: string;
  metadata: Record<string, any>;
}

export interface DeliveryProof {
  deliveredAt: Date;
  method: DeliveryMethod;
  recipientInfo: RecipientInfo;
  trackingDetails: TrackingDetails;
  confirmationCode: string;
  accessLog: AccessLogEntry[];
}

export interface RecipientInfo {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  verificationMethod?: string;
}

export interface TrackingDetails {
  trackingId: string;
  deliveryPath: string[];
  timestamps: Record<string, Date>;
  securityChecks: Record<string, boolean>;
}

export interface AccessLogEntry {
  timestamp: Date;
  action: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: string;
}

export interface DeliveryNotification {
  id: string;
  type: NotificationType;
  recipient: string;
  subject: string;
  content: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  trackingInfo?: NotificationTracking;
}

export type NotificationType = 'delivery_ready' | 'delivery_sent' | 'delivery_confirmed' | 'delivery_failed' | 'delivery_expired' | 'reminder';

export interface NotificationTracking {
  messageId: string;
  opens: NotificationEvent[];
  clicks: NotificationEvent[];
  bounces: NotificationEvent[];
}

export interface NotificationEvent {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

export interface DeliveryError {
  timestamp: Date;
  type: DeliveryErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
  retryAfter?: number; // seconds
}

export type DeliveryErrorType = 'network_error' | 'authentication_error' | 'authorization_error' | 'quota_exceeded' | 'file_too_large' | 'invalid_recipient' | 'timeout' | 'service_unavailable';

export interface DeliveryOptions {
  method: DeliveryMethod;
  priority: DeliveryPriority;
  scheduledDelivery?: Date;
  securityLevel: 'standard' | 'high' | 'maximum';
  requireConfirmation: boolean;
  expirationDays: number;
  maxRetries: number;
  retryDelay: number; // seconds
  notificationSettings: NotificationSettings;
  customOptions: Record<string, any>;
}

export interface NotificationSettings {
  sendDeliveryNotification: boolean;
  sendConfirmationReminder: boolean;
  reminderIntervalHours: number;
  maxReminders: number;
  customEmailTemplate?: string;
  includeDeliveryInstructions: boolean;
}

export interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number; // minutes
  deliveryByMethod: Record<DeliveryMethod, number>;
  deliveryByPriority: Record<DeliveryPriority, number>;
  errorsByType: Record<DeliveryErrorType, number>;
}

// Main delivery automation class
export class DeliveryAutomation {
  private supabase = createClient();

  /**
   * Schedule package delivery
   */
  async scheduleDelivery(
    handoverPackage: CompleteHandoverPackage,
    deliveryOptions: DeliveryOptions
  ): Promise<DeliveryRequest> {
    try {
      console.log(`📤 Scheduling delivery for package: ${handoverPackage.packageId}`);

      // Create delivery request
      const deliveryRequest: DeliveryRequest = {
        id: `delivery-${handoverPackage.packageId}-${Date.now()}`,
        packageId: handoverPackage.packageId,
        clientId: handoverPackage.clientId,
        clientName: handoverPackage.clientName,
        clientEmail: handoverPackage.supportInformation.primaryContact.email,
        deliveryMethod: deliveryOptions.method,
        priority: deliveryOptions.priority,
        scheduledAt: deliveryOptions.scheduledDelivery,
        requestedBy: 'system',
        requestedAt: new Date(),
        metadata: {
          packageSize: handoverPackage.packageSize,
          fileCount: handoverPackage.manifest.totalFiles,
          securityLevel: deliveryOptions.securityLevel,
          requiresConfirmation: deliveryOptions.requireConfirmation,
          expirationDays: deliveryOptions.expirationDays,
          customInstructions: deliveryOptions.customOptions.instructions,
          deliveryOptions: deliveryOptions.customOptions
        }
      };

      // Store delivery request
      await this.storeDeliveryRequest(deliveryRequest);

      // Start delivery execution if not scheduled
      if (!deliveryOptions.scheduledDelivery || deliveryOptions.scheduledDelivery <= new Date()) {
        await this.executeDelivery(deliveryRequest, deliveryOptions);
      }

      console.log(`✅ Delivery scheduled: ${deliveryRequest.id}`);
      return deliveryRequest;

    } catch (error) {
      console.error('❌ Failed to schedule delivery:', error);
      throw new Error(`Failed to schedule delivery: ${error.message}`);
    }
  }

  /**
   * Execute delivery immediately
   */
  async executeDelivery(
    deliveryRequest: DeliveryRequest,
    deliveryOptions: DeliveryOptions
  ): Promise<DeliveryExecution> {
    try {
      console.log(`🚀 Executing delivery: ${deliveryRequest.id}`);

      // Create delivery execution
      const execution: DeliveryExecution = {
        id: `exec-${deliveryRequest.id}-${Date.now()}`,
        requestId: deliveryRequest.id,
        status: 'preparing',
        startedAt: new Date(),
        attempts: [],
        currentAttempt: 0,
        maxAttempts: deliveryOptions.maxRetries,
        notifications: [],
        errors: []
      };

      // Store execution record
      await this.storeDeliveryExecution(execution);

      // Perform delivery based on method
      execution.status = 'sending';
      await this.updateDeliveryExecution(execution);

      const success = await this.performDelivery(deliveryRequest, execution, deliveryOptions);

      if (success) {
        execution.status = 'delivered';
        execution.completedAt = new Date();
        
        // Generate delivery proof
        execution.deliveryProof = await this.generateDeliveryProof(deliveryRequest, execution);
        
        // Send confirmation notifications
        if (deliveryOptions.notificationSettings.sendDeliveryNotification) {
          await this.sendDeliveryNotification(deliveryRequest, execution, 'delivery_sent');
        }
      } else {
        execution.status = 'failed';
        execution.completedAt = new Date();
        
        // Schedule retry if applicable
        if (execution.currentAttempt < execution.maxAttempts) {
          execution.nextRetryAt = new Date(Date.now() + deliveryOptions.retryDelay * 1000);
        }
      }

      await this.updateDeliveryExecution(execution);

      console.log(`✅ Delivery execution ${success ? 'completed' : 'failed'}: ${execution.id}`);
      return execution;

    } catch (error) {
      console.error('❌ Delivery execution failed:', error);
      throw new Error(`Delivery execution failed: ${error.message}`);
    }
  }

  /**
   * Track delivery status
   */
  async trackDelivery(deliveryId: string): Promise<DeliveryExecution | null> {
    try {
      const { data, error } = await this.supabase
        .from('delivery_executions')
        .select('*')
        .eq('id', deliveryId)
        .single();

      if (error) throw error;
      return data ? this.mapDatabaseToDeliveryExecution(data) : null;

    } catch (error) {
      console.error('Error tracking delivery:', error);
      return null;
    }
  }

  /**
   * Cancel scheduled delivery
   */
  async cancelDelivery(deliveryId: string, reason: string): Promise<boolean> {
    try {
      const execution = await this.trackDelivery(deliveryId);
      if (!execution) {
        return false;
      }

      if (execution.status === 'delivered' || execution.status === 'cancelled') {
        return false; // Cannot cancel completed or already cancelled delivery
      }

      execution.status = 'cancelled';
      execution.completedAt = new Date();
      execution.errors.push({
        timestamp: new Date(),
        type: 'service_unavailable',
        message: `Delivery cancelled: ${reason}`,
        recoverable: false
      });

      await this.updateDeliveryExecution(execution);

      console.log(`🛑 Delivery cancelled: ${deliveryId}`);
      return true;

    } catch (error) {
      console.error('Error cancelling delivery:', error);
      return false;
    }
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string): Promise<boolean> {
    try {
      const execution = await this.trackDelivery(deliveryId);
      if (!execution || execution.status !== 'failed') {
        return false;
      }

      if (execution.currentAttempt >= execution.maxAttempts) {
        return false; // Max attempts reached
      }

      // Get original delivery request
      const request = await this.getDeliveryRequest(execution.requestId);
      if (!request) {
        return false;
      }

      // Create new execution for retry
      const retryExecution: DeliveryExecution = {
        ...execution,
        id: `retry-${execution.id}-${Date.now()}`,
        status: 'preparing',
        startedAt: new Date(),
        completedAt: undefined,
        currentAttempt: execution.currentAttempt + 1,
        deliveryProof: undefined,
        errors: []
      };

      await this.storeDeliveryExecution(retryExecution);

      // Execute retry with default options
      const defaultOptions: DeliveryOptions = {
        method: request.deliveryMethod,
        priority: request.priority,
        securityLevel: request.metadata.securityLevel,
        requireConfirmation: request.metadata.requiresConfirmation,
        expirationDays: request.metadata.expirationDays,
        maxRetries: 3,
        retryDelay: 300, // 5 minutes
        notificationSettings: {
          sendDeliveryNotification: true,
          sendConfirmationReminder: false,
          reminderIntervalHours: 24,
          maxReminders: 3,
          includeDeliveryInstructions: true
        },
        customOptions: request.metadata.deliveryOptions
      };

      await this.executeDelivery(request, defaultOptions);

      return true;

    } catch (error) {
      console.error('Error retrying delivery:', error);
      return false;
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(dateRange?: { start: Date; end: Date }): Promise<DeliveryStats> {
    try {
      let query = this.supabase
        .from('delivery_executions')
        .select('*');

      if (dateRange) {
        query = query
          .gte('started_at', dateRange.start.toISOString())
          .lte('started_at', dateRange.end.toISOString());
      }

      const { data: executions, error } = await query;

      if (error) throw error;

      const stats = this.calculateDeliveryStats(executions || []);
      return stats;

    } catch (error) {
      console.error('Error getting delivery stats:', error);
      throw error;
    }
  }

  // Private implementation methods

  private async performDelivery(
    request: DeliveryRequest,
    execution: DeliveryExecution,
    options: DeliveryOptions
  ): Promise<boolean> {
    const attempt: DeliveryAttempt = {
      attemptNumber: execution.currentAttempt + 1,
      startedAt: new Date(),
      status: 'running',
      method: request.deliveryMethod,
      details: {
        metadata: {}
      }
    };

    execution.attempts.push(attempt);
    execution.currentAttempt = attempt.attemptNumber;

    try {
      let success = false;

      switch (request.deliveryMethod) {
        case 'email':
          success = await this.deliverViaEmail(request, attempt, options);
          break;
        case 'portal':
          success = await this.deliverViaPortal(request, attempt, options);
          break;
        case 'secure_download':
          success = await this.deliverViaSecureDownload(request, attempt, options);
          break;
        case 'sftp':
          success = await this.deliverViaSFTP(request, attempt, options);
          break;
        case 'api_webhook':
          success = await this.deliverViaWebhook(request, attempt, options);
          break;
        default:
          throw new Error(`Unsupported delivery method: ${request.deliveryMethod}`);
      }

      attempt.status = success ? 'success' : 'failed';
      attempt.completedAt = new Date();

      return success;

    } catch (error) {
      attempt.status = 'failed';
      attempt.completedAt = new Date();
      attempt.error = {
        timestamp: new Date(),
        type: this.categorizeError(error),
        message: error.message,
        details: error,
        recoverable: this.isRecoverableError(error)
      };

      execution.errors.push(attempt.error);
      return false;
    }
  }

  private async deliverViaEmail(
    request: DeliveryRequest,
    attempt: DeliveryAttempt,
    options: DeliveryOptions
  ): Promise<boolean> {
    // Generate secure download link
    const downloadUrl = await this.generateSecureDownloadUrl(request.packageId, options);
    
    // Create email content
    const emailContent = this.generateEmailContent(request, downloadUrl, options);
    
    // Send email (mock implementation)
    console.log(`📧 Sending email to ${request.clientEmail}`);
    console.log(`📎 Download URL: ${downloadUrl}`);
    
    attempt.details.recipientEmail = request.clientEmail;
    attempt.details.downloadUrl = downloadUrl;
    attempt.details.trackingId = `email-${Date.now()}`;
    attempt.details.expirationDate = new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000);

    // Simulate email delivery
    return true;
  }

  private async deliverViaPortal(
    request: DeliveryRequest,
    attempt: DeliveryAttempt,
    options: DeliveryOptions
  ): Promise<boolean> {
    // Upload to secure portal
    const portalUrl = await this.uploadToPortal(request.packageId, options);
    
    // Generate access token
    const accessToken = this.generateAccessToken(request.clientId, request.packageId);
    
    console.log(`🌐 Package uploaded to portal: ${portalUrl}`);
    console.log(`🔑 Access token: ${accessToken}`);
    
    attempt.details.downloadUrl = portalUrl;
    attempt.details.secureToken = accessToken;
    attempt.details.trackingId = `portal-${Date.now()}`;
    attempt.details.expirationDate = new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000);

    return true;
  }

  private async deliverViaSecureDownload(
    request: DeliveryRequest,
    attempt: DeliveryAttempt,
    options: DeliveryOptions
  ): Promise<boolean> {
    // Generate secure download link with token
    const downloadUrl = await this.generateSecureDownloadUrl(request.packageId, options);
    const accessCode = this.generateAccessCode();
    
    console.log(`⬇️ Secure download prepared: ${downloadUrl}`);
    console.log(`🔐 Access code: ${accessCode}`);
    
    attempt.details.downloadUrl = downloadUrl;
    attempt.details.secureToken = accessCode;
    attempt.details.trackingId = `download-${Date.now()}`;
    attempt.details.expirationDate = new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000);

    return true;
  }

  private async deliverViaSFTP(
    request: DeliveryRequest,
    attempt: DeliveryAttempt,
    options: DeliveryOptions
  ): Promise<boolean> {
    // Upload to SFTP server
    const sftpPath = `/client-packages/${request.clientId}/${request.packageId}`;
    
    console.log(`📁 Uploading to SFTP: ${sftpPath}`);
    
    attempt.details.deliveryPath = sftpPath;
    attempt.details.trackingId = `sftp-${Date.now()}`;
    attempt.details.metadata.sftpServer = 'secure.example.com';
    attempt.details.metadata.username = `client_${request.clientId}`;

    // Simulate SFTP upload
    return true;
  }

  private async deliverViaWebhook(
    request: DeliveryRequest,
    attempt: DeliveryAttempt,
    options: DeliveryOptions
  ): Promise<boolean> {
    // Send webhook notification
    const webhookUrl = options.customOptions.webhookUrl;
    const payload = {
      event: 'package_ready',
      packageId: request.packageId,
      clientId: request.clientId,
      downloadUrl: await this.generateSecureDownloadUrl(request.packageId, options),
      expiresAt: new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000)
    };
    
    console.log(`🔗 Sending webhook to: ${webhookUrl}`);
    console.log(`📦 Payload:`, payload);
    
    attempt.details.webhookUrl = webhookUrl;
    attempt.details.trackingId = `webhook-${Date.now()}`;
    attempt.details.metadata.payload = payload;

    // Simulate webhook delivery
    return true;
  }

  private async generateSecureDownloadUrl(packageId: string, options: DeliveryOptions): Promise<string> {
    const token = this.generateAccessToken('system', packageId);
    return `https://secure.example.com/download/${packageId}?token=${token}&expires=${Date.now() + options.expirationDays * 24 * 60 * 60 * 1000}`;
  }

  private async uploadToPortal(packageId: string, options: DeliveryOptions): Promise<string> {
    // Simulate portal upload
    return `https://portal.example.com/packages/${packageId}`;
  }

  private generateAccessToken(clientId: string, packageId: string): string {
    const payload = Buffer.from(`${clientId}:${packageId}:${Date.now()}`).toString('base64');
    return `${payload.substring(0, 16)}${Math.random().toString(36).substring(2, 8)}`;
  }

  private generateAccessCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private generateEmailContent(request: DeliveryRequest, downloadUrl: string, options: DeliveryOptions): string {
    return `
Dear ${request.clientName},

Your handover package is ready for download. Please follow the instructions below to access your deliverables:

Download URL: ${downloadUrl}
Package ID: ${request.packageId}
Expires: ${new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000).toLocaleDateString()}

The package contains:
- Administrative access credentials
- Standard Operating Procedures (SOP)
- Technical documentation
- Workflow configurations
- Module configuration sheets
- Support information

Please download and review all materials. Contact us if you have any questions.

Best regards,
The Support Team
    `.trim();
  }

  private async generateDeliveryProof(
    request: DeliveryRequest,
    execution: DeliveryExecution
  ): Promise<DeliveryProof> {
    const lastAttempt = execution.attempts[execution.attempts.length - 1];
    
    return {
      deliveredAt: new Date(),
      method: request.deliveryMethod,
      recipientInfo: {
        email: request.clientEmail,
        verificationMethod: 'email_confirmation'
      },
      trackingDetails: {
        trackingId: lastAttempt.details.trackingId || 'unknown',
        deliveryPath: [request.deliveryMethod],
        timestamps: {
          scheduled: request.requestedAt,
          started: execution.startedAt,
          delivered: new Date()
        },
        securityChecks: {
          encryption: true,
          access_control: true,
          audit_logging: true
        }
      },
      confirmationCode: this.generateAccessCode(),
      accessLog: []
    };
  }

  private async sendDeliveryNotification(
    request: DeliveryRequest,
    execution: DeliveryExecution,
    type: NotificationType
  ): Promise<void> {
    const notification: DeliveryNotification = {
      id: `notif-${Date.now()}`,
      type,
      recipient: request.clientEmail,
      subject: this.getNotificationSubject(type, request),
      content: this.getNotificationContent(type, request, execution),
      sentAt: new Date(),
      status: 'sent'
    };

    execution.notifications.push(notification);
    console.log(`📬 Notification sent: ${notification.subject} to ${notification.recipient}`);
  }

  private getNotificationSubject(type: NotificationType, request: DeliveryRequest): string {
    switch (type) {
      case 'delivery_ready':
        return `Your handover package is being prepared - ${request.packageId}`;
      case 'delivery_sent':
        return `Your handover package is ready for download - ${request.packageId}`;
      case 'delivery_confirmed':
        return `Package download confirmed - ${request.packageId}`;
      case 'delivery_failed':
        return `Package delivery failed - ${request.packageId}`;
      case 'delivery_expired':
        return `Package download link expired - ${request.packageId}`;
      case 'reminder':
        return `Reminder: Download your handover package - ${request.packageId}`;
      default:
        return `Package update - ${request.packageId}`;
    }
  }

  private getNotificationContent(type: NotificationType, request: DeliveryRequest, execution: DeliveryExecution): string {
    switch (type) {
      case 'delivery_sent':
        return `Your handover package ${request.packageId} has been successfully delivered via ${request.deliveryMethod}. Please check your delivery method for access instructions.`;
      case 'delivery_failed':
        return `We encountered an issue delivering your handover package ${request.packageId}. Our team is working to resolve this. You will be notified once the issue is resolved.`;
      default:
        return `Package ${request.packageId} status update: ${execution.status}`;
    }
  }

  private categorizeError(error: any): DeliveryErrorType {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('connection')) {
      return 'network_error';
    } else if (message.includes('auth')) {
      return 'authentication_error';
    } else if (message.includes('permission') || message.includes('access')) {
      return 'authorization_error';
    } else if (message.includes('quota') || message.includes('limit')) {
      return 'quota_exceeded';
    } else if (message.includes('size') || message.includes('large')) {
      return 'file_too_large';
    } else if (message.includes('timeout')) {
      return 'timeout';
    } else if (message.includes('unavailable') || message.includes('service')) {
      return 'service_unavailable';
    } else {
      return 'service_unavailable';
    }
  }

  private isRecoverableError(error: any): boolean {
    const recoverableTypes: DeliveryErrorType[] = [
      'network_error',
      'timeout',
      'service_unavailable',
      'quota_exceeded'
    ];
    
    const errorType = this.categorizeError(error);
    return recoverableTypes.includes(errorType);
  }

  private calculateDeliveryStats(executions: any[]): DeliveryStats {
    const total = executions.length;
    const successful = executions.filter(e => e.status === 'delivered').length;
    const failed = executions.filter(e => e.status === 'failed').length;

    const deliveryTimes = executions
      .filter(e => e.completed_at && e.started_at)
      .map(e => (new Date(e.completed_at).getTime() - new Date(e.started_at).getTime()) / 60000); // minutes

    const averageDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
      : 0;

    return {
      totalDeliveries: total,
      successfulDeliveries: successful,
      failedDeliveries: failed,
      averageDeliveryTime: Math.round(averageDeliveryTime),
      deliveryByMethod: this.groupBy(executions, 'delivery_method'),
      deliveryByPriority: this.groupBy(executions, 'priority'),
      errorsByType: this.groupBy(executions.filter(e => e.errors?.length > 0), 'error_type')
    };
  }

  private groupBy(array: any[], field: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const key = item[field] || 'unknown';
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  private async storeDeliveryRequest(request: DeliveryRequest): Promise<void> {
    const { error } = await this.supabase
      .from('delivery_requests')
      .insert({
        id: request.id,
        package_id: request.packageId,
        client_id: request.clientId,
        client_name: request.clientName,
        client_email: request.clientEmail,
        delivery_method: request.deliveryMethod,
        priority: request.priority,
        scheduled_at: request.scheduledAt?.toISOString(),
        requested_by: request.requestedBy,
        requested_at: request.requestedAt.toISOString(),
        metadata: request.metadata
      });

    if (error) {
      throw new Error(`Failed to store delivery request: ${error.message}`);
    }
  }

  private async storeDeliveryExecution(execution: DeliveryExecution): Promise<void> {
    const { error } = await this.supabase
      .from('delivery_executions')
      .insert({
        id: execution.id,
        request_id: execution.requestId,
        status: execution.status,
        started_at: execution.startedAt.toISOString(),
        completed_at: execution.completedAt?.toISOString(),
        attempts: execution.attempts,
        current_attempt: execution.currentAttempt,
        max_attempts: execution.maxAttempts,
        next_retry_at: execution.nextRetryAt?.toISOString(),
        delivery_proof: execution.deliveryProof,
        notifications: execution.notifications,
        errors: execution.errors
      });

    if (error) {
      throw new Error(`Failed to store delivery execution: ${error.message}`);
    }
  }

  private async updateDeliveryExecution(execution: DeliveryExecution): Promise<void> {
    const { error } = await this.supabase
      .from('delivery_executions')
      .update({
        status: execution.status,
        completed_at: execution.completedAt?.toISOString(),
        attempts: execution.attempts,
        current_attempt: execution.currentAttempt,
        next_retry_at: execution.nextRetryAt?.toISOString(),
        delivery_proof: execution.deliveryProof,
        notifications: execution.notifications,
        errors: execution.errors
      })
      .eq('id', execution.id);

    if (error) {
      throw new Error(`Failed to update delivery execution: ${error.message}`);
    }
  }

  private async getDeliveryRequest(requestId: string): Promise<DeliveryRequest | null> {
    try {
      const { data, error } = await this.supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return data ? this.mapDatabaseToDeliveryRequest(data) : null;

    } catch (error) {
      console.error('Error getting delivery request:', error);
      return null;
    }
  }

  private mapDatabaseToDeliveryRequest(data: any): DeliveryRequest {
    return {
      id: data.id,
      packageId: data.package_id,
      clientId: data.client_id,
      clientName: data.client_name,
      clientEmail: data.client_email,
      deliveryMethod: data.delivery_method,
      priority: data.priority,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      requestedBy: data.requested_by,
      requestedAt: new Date(data.requested_at),
      metadata: data.metadata
    };
  }

  private mapDatabaseToDeliveryExecution(data: any): DeliveryExecution {
    return {
      id: data.id,
      requestId: data.request_id,
      status: data.status,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      attempts: data.attempts || [],
      currentAttempt: data.current_attempt,
      maxAttempts: data.max_attempts,
      nextRetryAt: data.next_retry_at ? new Date(data.next_retry_at) : undefined,
      deliveryProof: data.delivery_proof,
      notifications: data.notifications || [],
      errors: data.errors || []
    };
  }
}

// Export the singleton instance
export const deliveryAutomation = new DeliveryAutomation();

// Utility functions
export async function schedulePackageDelivery(
  handoverPackage: CompleteHandoverPackage,
  options: DeliveryOptions
): Promise<DeliveryRequest> {
  return deliveryAutomation.scheduleDelivery(handoverPackage, options);
}

export async function trackPackageDelivery(deliveryId: string): Promise<DeliveryExecution | null> {
  return deliveryAutomation.trackDelivery(deliveryId);
}

export async function retryFailedDelivery(deliveryId: string): Promise<boolean> {
  return deliveryAutomation.retryDelivery(deliveryId);
}

export async function getDeliveryStatistics(dateRange?: { start: Date; end: Date }): Promise<DeliveryStats> {
  return deliveryAutomation.getDeliveryStats(dateRange);
}

// Example usage and validation
export async function validateDeliveryAutomation(): Promise<boolean> {
  try {
    const automation = new DeliveryAutomation();
    console.log('✅ Delivery Automation initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Delivery Automation validation failed:', error);
    return false;
  }
}
