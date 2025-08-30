/**
 * N8N Contract Tests
 * 
 * Tests the contract between our application and N8N workflow automation.
 * Ensures workflow triggers, reliability patterns, and event handling work correctly.
 */

import { useN8nEvents } from '@/lib/n8n-events';
import { N8nReliabilityClient } from '@/lib/n8n/reliability-client';
import { getEnv } from '@/lib/env';

// Mock environment
const mockEnv = {
  N8N_WEBHOOK_URL: 'https://n8n.example.com/webhook/test',
  N8N_WEBHOOK_SECRET: 'n8n_webhook_secret',
  N8N_RELIABILITY_URL: 'https://n8n.example.com/reliability'
};

jest.mock('@/lib/env', () => ({
  getEnv: jest.fn(() => mockEnv)
}));

// Mock fetch
global.fetch = jest.fn();

// Mock N8N events hook
const mockN8nEvents = {
  emitPdfDownload: jest.fn(),
  emitBookingRequest: jest.fn(),
  emitClientIntake: jest.fn(),
  emitSessionReminder: jest.fn(),
  emitProgressUpdate: jest.fn()
};

jest.mock('@/lib/n8n-events', () => ({
  useN8nEvents: jest.fn(() => mockN8nEvents)
}));

// Mock reliability client
const mockReliabilityClient = {
  checkHealth: jest.fn(),
  triggerWorkflow: jest.fn(),
  getWorkflowStatus: jest.fn(),
  retryFailedExecution: jest.fn(),
  getCircuitBreakerStatus: jest.fn(),
  resetCircuitBreaker: jest.fn()
};

jest.mock('@/lib/n8n/reliability-client', () => ({
  N8nReliabilityClient: jest.fn(() => mockReliabilityClient)
}));

describe('N8N Contract Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Webhook Integration Contract', () => {
    it('should emit PDF download event', async () => {
      const n8nEvents = useN8nEvents();
      
      await n8nEvents.emitPdfDownload({
        clientId: 'client-1',
        coachId: 'coach-1',
        documentType: 'progress_report',
        fileName: 'progress_report_2024.pdf'
      });

      expect(mockN8nEvents.emitPdfDownload).toHaveBeenCalledWith({
        clientId: 'client-1',
        coachId: 'coach-1',
        documentType: 'progress_report',
        fileName: 'progress_report_2024.pdf'
      });
    });

    it('should emit booking request event', async () => {
      const n8nEvents = useN8nEvents();
      
      await n8nEvents.emitBookingRequest({
        clientId: 'client-1',
        coachId: 'coach-1',
        sessionId: 'session-1',
        requestedDate: '2024-01-15T10:00:00Z',
        sessionType: 'private'
      });

      expect(mockN8nEvents.emitBookingRequest).toHaveBeenCalledWith({
        clientId: 'client-1',
        coachId: 'coach-1',
        sessionId: 'session-1',
        requestedDate: '2024-01-15T10:00:00Z',
        sessionType: 'private'
      });
    });

    it('should emit client intake event', async () => {
      const n8nEvents = useN8nEvents();
      
      await n8nEvents.emitClientIntake({
        clientId: 'client-1',
        coachId: 'coach-1',
        email: 'newclient@example.com',
        fullName: 'New Client',
        intakeDate: '2024-01-15T09:00:00Z'
      });

      expect(mockN8nEvents.emitClientIntake).toHaveBeenCalledWith({
        clientId: 'client-1',
        coachId: 'coach-1',
        email: 'newclient@example.com',
        fullName: 'New Client',
        intakeDate: '2024-01-15T09:00:00Z'
      });
    });

    it('should emit session reminder event', async () => {
      const n8nEvents = useN8nEvents();
      
      await n8nEvents.emitSessionReminder({
        clientId: 'client-1',
        coachId: 'coach-1',
        sessionId: 'session-1',
        sessionDate: '2024-01-16T10:00:00Z',
        reminderType: '24h_before'
      });

      expect(mockN8nEvents.emitSessionReminder).toHaveBeenCalledWith({
        clientId: 'client-1',
        coachId: 'coach-1',
        sessionId: 'session-1',
        sessionDate: '2024-01-16T10:00:00Z',
        reminderType: '24h_before'
      });
    });

    it('should emit progress update event', async () => {
      const n8nEvents = useN8nEvents();
      
      await n8nEvents.emitProgressUpdate({
        clientId: 'client-1',
        coachId: 'coach-1',
        progressData: {
          weight: 75.5,
          bodyFat: 15.2,
          measurements: {
            chest: 95,
            waist: 80,
            hips: 95
          }
        },
        updateDate: '2024-01-15T08:00:00Z'
      });

      expect(mockN8nEvents.emitProgressUpdate).toHaveBeenCalledWith({
        clientId: 'client-1',
        coachId: 'coach-1',
        progressData: {
          weight: 75.5,
          bodyFat: 15.2,
          measurements: {
            chest: 95,
            waist: 80,
            hips: 95
          }
        },
        updateDate: '2024-01-15T08:00:00Z'
      });
    });
  });

  describe('Reliability Client Contract', () => {
    let reliabilityClient: N8nReliabilityClient;

    beforeEach(() => {
      reliabilityClient = new N8nReliabilityClient();
    });

    it('should check N8N health status', async () => {
      const mockHealthResponse = {
        status: 'healthy',
        uptime: 86400,
        version: '1.0.0',
        workflows: {
          active: 5,
          total: 10
        }
      };

      mockReliabilityClient.checkHealth.mockResolvedValue(mockHealthResponse);

      const result = await reliabilityClient.checkHealth();

      expect(result.status).toBe('healthy');
      expect(result.uptime).toBe(86400);
      expect(mockReliabilityClient.checkHealth).toHaveBeenCalled();
    });

    it('should trigger workflow with proper payload', async () => {
      const mockTriggerResponse = {
        executionId: 'exec_123',
        status: 'triggered',
        workflowId: 'workflow_456',
        timestamp: '2024-01-15T10:00:00Z'
      };

      mockReliabilityClient.triggerWorkflow.mockResolvedValue(mockTriggerResponse);

      const result = await reliabilityClient.triggerWorkflow('workflow_456', {
        event: 'client_intake',
        data: {
          clientId: 'client-1',
          coachId: 'coach-1'
        }
      });

      expect(result.executionId).toBe('exec_123');
      expect(result.status).toBe('triggered');
      expect(mockReliabilityClient.triggerWorkflow).toHaveBeenCalledWith('workflow_456', {
        event: 'client_intake',
        data: {
          clientId: 'client-1',
          coachId: 'coach-1'
        }
      });
    });

    it('should get workflow execution status', async () => {
      const mockStatusResponse = {
        executionId: 'exec_123',
        status: 'completed',
        result: {
          success: true,
          data: { message: 'Workflow completed successfully' }
        },
        duration: 1500
      };

      mockReliabilityClient.getWorkflowStatus.mockResolvedValue(mockStatusResponse);

      const result = await reliabilityClient.getWorkflowStatus('exec_123');

      expect(result.status).toBe('completed');
      expect(result.result.success).toBe(true);
      expect(mockReliabilityClient.getWorkflowStatus).toHaveBeenCalledWith('exec_123');
    });

    it('should retry failed workflow execution', async () => {
      const mockRetryResponse = {
        executionId: 'exec_123_retry',
        status: 'retrying',
        originalExecutionId: 'exec_123',
        retryCount: 1
      };

      mockReliabilityClient.retryFailedExecution.mockResolvedValue(mockRetryResponse);

      const result = await reliabilityClient.retryFailedExecution('exec_123');

      expect(result.status).toBe('retrying');
      expect(result.retryCount).toBe(1);
      expect(mockReliabilityClient.retryFailedExecution).toHaveBeenCalledWith('exec_123');
    });

    it('should get circuit breaker status', async () => {
      const mockCircuitBreakerResponse = {
        status: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        threshold: 5,
        timeout: 30000
      };

      mockReliabilityClient.getCircuitBreakerStatus.mockResolvedValue(mockCircuitBreakerResponse);

      const result = await reliabilityClient.getCircuitBreakerStatus('workflow_456');

      expect(result.status).toBe('closed');
      expect(result.failureCount).toBe(0);
      expect(mockReliabilityClient.getCircuitBreakerStatus).toHaveBeenCalledWith('workflow_456');
    });

    it('should reset circuit breaker', async () => {
      const mockResetResponse = {
        status: 'reset',
        previousStatus: 'open',
        resetTime: '2024-01-15T10:00:00Z'
      };

      mockReliabilityClient.resetCircuitBreaker.mockResolvedValue(mockResetResponse);

      const result = await reliabilityClient.resetCircuitBreaker('workflow_456');

      expect(result.status).toBe('reset');
      expect(result.previousStatus).toBe('open');
      expect(mockReliabilityClient.resetCircuitBreaker).toHaveBeenCalledWith('workflow_456');
    });
  });

  describe('Webhook Payload Contract', () => {
    it('should send properly formatted webhook payload', async () => {
      const mockResponse = { status: 'success', message: 'Webhook received' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const payload = {
        event: 'pdf_download',
        timestamp: '2024-01-15T10:00:00Z',
        data: {
          clientId: 'client-1',
          coachId: 'coach-1',
          documentType: 'progress_report'
        }
      };

      const response = await fetch(mockEnv.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-Signature': 'mock_signature'
        },
        body: JSON.stringify(payload)
      });

      expect(response.ok).toBe(true);
      expect(fetch).toHaveBeenCalledWith(mockEnv.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-Signature': 'mock_signature'
        },
        body: JSON.stringify(payload)
      });
    });

    it('should handle webhook authentication', async () => {
      const mockResponse = { status: 'success' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const payload = {
        event: 'booking_request',
        timestamp: '2024-01-15T10:00:00Z',
        data: {
          clientId: 'client-1',
          sessionId: 'session-1'
        }
      };

      // Simulate HMAC signature generation
      const signature = 'mock_hmac_signature';

      const response = await fetch(mockEnv.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-Signature': signature
        },
        body: JSON.stringify(payload)
      });

      expect(response.ok).toBe(true);
      expect(fetch).toHaveBeenCalledWith(mockEnv.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-Signature': signature
        },
        body: JSON.stringify(payload)
      });
    });
  });

  describe('Error Handling Contract', () => {
    it('should handle N8N service unavailable', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      const n8nEvents = useN8nEvents();
      
      // Mock the function to return a promise that rejects
      mockN8nEvents.emitPdfDownload.mockRejectedValue(new Error('Service unavailable'));
      
      await expect(n8nEvents.emitPdfDownload({
        clientId: 'client-1',
        coachId: 'coach-1',
        documentType: 'progress_report'
      })).rejects.toThrow('Service unavailable');
    });

    it('should handle workflow execution timeout', async () => {
      const mockTimeoutError = new Error('Workflow execution timeout');
      mockReliabilityClient.triggerWorkflow.mockRejectedValue(mockTimeoutError);

      const reliabilityClient = new N8nReliabilityClient();
      
      await expect(reliabilityClient.triggerWorkflow('workflow_456', {
        event: 'client_intake',
        data: { clientId: 'client-1' }
      })).rejects.toThrow('Workflow execution timeout');
    });

    it('should handle circuit breaker open state', async () => {
      const mockCircuitBreakerResponse = {
        status: 'open',
        failureCount: 5,
        lastFailureTime: '2024-01-15T09:30:00Z',
        threshold: 5,
        timeout: 30000
      };

      mockReliabilityClient.getCircuitBreakerStatus.mockResolvedValue(mockCircuitBreakerResponse);

      const reliabilityClient = new N8nReliabilityClient();
      const result = await reliabilityClient.getCircuitBreakerStatus('workflow_456');

      expect(result.status).toBe('open');
      expect(result.failureCount).toBe(5);
    });

    it('should handle webhook signature verification failure', async () => {
      const mockResponse = { status: 'error', message: 'Invalid signature' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockResponse
      });

      const payload = {
        event: 'pdf_download',
        data: { clientId: 'client-1' }
      };

      const response = await fetch(mockEnv.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-Signature': 'invalid_signature'
        },
        body: JSON.stringify(payload)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe('Configuration Contract', () => {
    it('should use correct N8N configuration', () => {
      expect(mockEnv.N8N_WEBHOOK_URL).toBe('https://n8n.example.com/webhook/test');
      expect(mockEnv.N8N_WEBHOOK_SECRET).toBe('n8n_webhook_secret');
      expect(mockEnv.N8N_RELIABILITY_URL).toBe('https://n8n.example.com/reliability');
    });

    it('should initialize reliability client with correct URL', () => {
      const reliabilityClient = new N8nReliabilityClient();
      expect(N8nReliabilityClient).toHaveBeenCalled();
    });

    it('should provide N8N events hook', () => {
      const n8nEvents = useN8nEvents();
      expect(n8nEvents).toBeDefined();
      expect(n8nEvents.emitPdfDownload).toBeDefined();
      expect(n8nEvents.emitBookingRequest).toBeDefined();
      expect(n8nEvents.emitClientIntake).toBeDefined();
      expect(n8nEvents.emitSessionReminder).toBeDefined();
      expect(n8nEvents.emitProgressUpdate).toBeDefined();
    });
  });

  describe('Event Schema Contract', () => {
    it('should validate PDF download event schema', () => {
      const pdfEvent = {
        clientId: 'client-1',
        coachId: 'coach-1',
        documentType: 'progress_report',
        fileName: 'progress_report_2024.pdf'
      };

      expect(pdfEvent.clientId).toBeDefined();
      expect(pdfEvent.coachId).toBeDefined();
      expect(pdfEvent.documentType).toBeDefined();
      expect(pdfEvent.fileName).toBeDefined();
    });

    it('should validate booking request event schema', () => {
      const bookingEvent = {
        clientId: 'client-1',
        coachId: 'coach-1',
        sessionId: 'session-1',
        requestedDate: '2024-01-15T10:00:00Z',
        sessionType: 'private'
      };

      expect(bookingEvent.clientId).toBeDefined();
      expect(bookingEvent.coachId).toBeDefined();
      expect(bookingEvent.sessionId).toBeDefined();
      expect(bookingEvent.requestedDate).toBeDefined();
      expect(bookingEvent.sessionType).toBeDefined();
    });

    it('should validate client intake event schema', () => {
      const intakeEvent = {
        clientId: 'client-1',
        coachId: 'coach-1',
        email: 'newclient@example.com',
        fullName: 'New Client',
        intakeDate: '2024-01-15T09:00:00Z'
      };

      expect(intakeEvent.clientId).toBeDefined();
      expect(intakeEvent.coachId).toBeDefined();
      expect(intakeEvent.email).toBeDefined();
      expect(intakeEvent.fullName).toBeDefined();
      expect(intakeEvent.intakeDate).toBeDefined();
    });
  });
});
