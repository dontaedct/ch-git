type EventHandler = (data: any) => void | Promise<void>;

export interface SystemEvent {
  id: string;
  type: string;
  source: 'orchestration' | 'modules' | 'marketplace' | 'handover';
  target?: 'orchestration' | 'modules' | 'marketplace' | 'handover';
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  processed: boolean;
}

export class CrossSystemEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventQueue: SystemEvent[] = [];
  private processing = false;
  private maxQueueSize = 1000;

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  async emit(event: Omit<SystemEvent, 'id' | 'timestamp' | 'processed'>): Promise<void> {
    const fullEvent: SystemEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      processed: false
    };

    if (this.eventQueue.length >= this.maxQueueSize) {
      console.warn('Event queue full, dropping oldest events');
      this.eventQueue.shift();
    }

    this.eventQueue.push(fullEvent);

    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.eventQueue.length > 0) {
      const sortedQueue = this.eventQueue.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      const event = sortedQueue.shift();
      if (!event) break;

      await this.processEvent(event);
      event.processed = true;
    }

    this.processing = false;
  }

  private async processEvent(event: SystemEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises: Promise<void>[] = [];

    for (const handler of handlers) {
      promises.push(
        Promise.resolve(handler(event.data)).catch(error => {
          console.error(`Error in event handler for ${event.type}:`, error);
        })
      );
    }

    await Promise.all(promises);
  }

  getQueueSize(): number {
    return this.eventQueue.length;
  }

  getProcessedEvents(): SystemEvent[] {
    return this.eventQueue.filter(e => e.processed);
  }

  clearProcessedEvents(): void {
    this.eventQueue = this.eventQueue.filter(e => !e.processed);
  }

  getEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const eventBus = new CrossSystemEventBus();

eventBus.on('workflow.created', async (data) => {
  console.log('Workflow created:', data);

  if (data.autoActivateModules) {
    await eventBus.emit({
      type: 'module.activation.requested',
      source: 'orchestration',
      target: 'modules',
      data: {
        workflowId: data.id,
        moduleIds: data.requiredModules
      },
      priority: 'high'
    });
  }
});

eventBus.on('workflow.execution.completed', async (data) => {
  console.log('Workflow execution completed:', data);

  await eventBus.emit({
    type: 'handover.package.preparation.requested',
    source: 'orchestration',
    target: 'handover',
    data: {
      executionId: data.id,
      workflowId: data.workflowId,
      outputs: data.outputs
    },
    priority: 'medium'
  });
});

eventBus.on('module.activated', async (data) => {
  console.log('Module activated:', data);

  await eventBus.emit({
    type: 'orchestration.workflow.module.ready',
    source: 'modules',
    target: 'orchestration',
    data: {
      moduleId: data.moduleId,
      workflowId: data.workflowId,
      capabilities: data.capabilities
    },
    priority: 'high'
  });
});

eventBus.on('module.configuration.updated', async (data) => {
  console.log('Module configuration updated:', data);

  await eventBus.emit({
    type: 'handover.configuration.sync',
    source: 'modules',
    target: 'handover',
    data: {
      moduleId: data.moduleId,
      configuration: data.configuration
    },
    priority: 'low'
  });
});

eventBus.on('marketplace.installation.completed', async (data) => {
  console.log('Marketplace installation completed:', data);

  await eventBus.emit({
    type: 'module.installation.apply',
    source: 'marketplace',
    target: 'modules',
    data: {
      packageId: data.packageId,
      installationId: data.installationId,
      configuration: data.configuration
    },
    priority: 'high'
  });
});

eventBus.on('marketplace.template.updated', async (data) => {
  console.log('Marketplace template updated:', data);

  await eventBus.emit({
    type: 'orchestration.template.available',
    source: 'marketplace',
    target: 'orchestration',
    data: {
      templateId: data.templateId,
      version: data.version,
      capabilities: data.capabilities
    },
    priority: 'low'
  });
});

eventBus.on('handover.package.created', async (data) => {
  console.log('Handover package created:', data);

  if (data.notifyClient) {
    await eventBus.emit({
      type: 'notification.send',
      source: 'handover',
      data: {
        recipientId: data.clientId,
        message: `Your package ${data.packageId} is ready for handover`,
        type: 'handover_ready'
      },
      priority: 'medium'
    });
  }
});

eventBus.on('handover.package.delivered', async (data) => {
  console.log('Handover package delivered:', data);

  await eventBus.emit({
    type: 'analytics.track',
    source: 'handover',
    data: {
      event: 'package_delivered',
      packageId: data.packageId,
      clientId: data.clientId,
      timestamp: new Date().toISOString()
    },
    priority: 'low'
  });
});

eventBus.on('system.error', async (data) => {
  console.error('System error:', data);

  await eventBus.emit({
    type: 'monitoring.alert',
    source: data.source,
    data: {
      severity: 'critical',
      message: data.error,
      system: data.source,
      timestamp: new Date().toISOString()
    },
    priority: 'critical'
  });
});

eventBus.on('data.sync.failed', async (data) => {
  console.error('Data sync failed:', data);

  await eventBus.emit({
    type: 'data.consistency.check',
    source: data.source,
    target: data.target,
    data: {
      dataType: data.dataType,
      syncId: data.syncId,
      retryCount: data.retryCount
    },
    priority: 'high'
  });
});