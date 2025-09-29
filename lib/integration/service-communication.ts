/**
 * HT-036.3.3: Inter-Service Communication Layer
 *
 * Handles communication between orchestration, modules, marketplace,
 * and handover systems with reliability and performance optimization.
 */

export interface ServiceMessage {
  id: string;
  from: string;
  to: string;
  type: string;
  payload: any;
  timestamp: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  correlationId?: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    service: string;
    timestamp: number;
    duration: number;
  };
}

export interface CommunicationConfig {
  timeout: number;
  retries: number;
  backoffMs: number;
  enableCircuitBreaker: boolean;
}

class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly threshold: number = 5;
  private readonly resetTimeout: number = 60000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

export class ServiceCommunicationLayer {
  private config: CommunicationConfig;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private messageQueue: ServiceMessage[];

  constructor(config?: Partial<CommunicationConfig>) {
    this.config = {
      timeout: 10000,
      retries: 3,
      backoffMs: 1000,
      enableCircuitBreaker: true,
      ...config
    };
    this.circuitBreakers = new Map();
    this.messageQueue = [];
  }

  async send<T = any>(
    message: Omit<ServiceMessage, 'id' | 'timestamp'>
  ): Promise<ServiceResponse<T>> {
    const fullMessage: ServiceMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now()
    };

    this.messageQueue.push(fullMessage);

    const circuitBreaker = this.getCircuitBreaker(message.to);

    try {
      if (this.config.enableCircuitBreaker) {
        return await circuitBreaker.execute(() =>
          this.sendWithRetry<T>(fullMessage)
        );
      } else {
        return await this.sendWithRetry<T>(fullMessage);
      }
    } finally {
      this.messageQueue = this.messageQueue.filter(m => m.id !== fullMessage.id);
    }
  }

  private async sendWithRetry<T>(
    message: ServiceMessage,
    attempt: number = 1
  ): Promise<ServiceResponse<T>> {
    const startTime = Date.now();

    try {
      const response = await this.deliverMessage<T>(message);

      return {
        success: true,
        data: response,
        metadata: {
          service: message.to,
          timestamp: Date.now(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      if (attempt < this.config.retries) {
        await this.delay(this.config.backoffMs * attempt);
        return this.sendWithRetry<T>(message, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Communication failed',
        metadata: {
          service: message.to,
          timestamp: Date.now(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  private async deliverMessage<T>(message: ServiceMessage): Promise<T> {
    const serviceEndpoint = this.getServiceEndpoint(message.to);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(serviceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Message-Id': message.id,
          'X-From-Service': message.from,
          'X-Correlation-Id': message.correlationId || message.id
        },
        body: JSON.stringify({
          type: message.type,
          payload: message.payload,
          timestamp: message.timestamp
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Service responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private getServiceEndpoint(serviceName: string): string {
    const endpoints: Record<string, string> = {
      orchestration: '/api/orchestration/messages',
      modules: '/api/modules/messages',
      marketplace: '/api/marketplace/messages',
      handover: '/api/handover/messages',
      webhooks: '/api/webhooks/emit',
      integrations: '/api/integrations/messages'
    };

    return endpoints[serviceName] || `/api/${serviceName}/messages`;
  }

  private getCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker());
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async broadcast(
    message: Omit<ServiceMessage, 'id' | 'timestamp' | 'to'>
  ): Promise<ServiceResponse[]> {
    const services = [
      'orchestration',
      'modules',
      'marketplace',
      'handover',
      'integrations'
    ];

    const promises = services
      .filter(service => service !== message.from)
      .map(service =>
        this.send({
          ...message,
          to: service
        })
      );

    return Promise.all(promises);
  }

  async request<T = any>(
    serviceName: string,
    endpoint: string,
    data?: any
  ): Promise<ServiceResponse<T>> {
    return this.send<T>({
      from: 'api-gateway',
      to: serviceName,
      type: 'request',
      payload: { endpoint, data }
    });
  }

  getHealth(): {
    circuitBreakers: Record<string, string>;
    queueLength: number;
  } {
    const circuitBreakers: Record<string, string> = {};

    this.circuitBreakers.forEach((breaker, service) => {
      circuitBreakers[service] = breaker.getState();
    });

    return {
      circuitBreakers,
      queueLength: this.messageQueue.length
    };
  }
}

export const serviceCommunication = new ServiceCommunicationLayer();

export async function sendServiceMessage<T = any>(
  from: string,
  to: string,
  type: string,
  payload: any
): Promise<ServiceResponse<T>> {
  return serviceCommunication.send<T>({
    from,
    to,
    type,
    payload
  });
}

export async function broadcastMessage(
  from: string,
  type: string,
  payload: any
): Promise<ServiceResponse[]> {
  return serviceCommunication.broadcast({
    from,
    type,
    payload
  });
}

export async function requestService<T = any>(
  serviceName: string,
  endpoint: string,
  data?: any
): Promise<ServiceResponse<T>> {
  return serviceCommunication.request<T>(serviceName, endpoint, data);
}