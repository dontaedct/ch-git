import { Database } from '@/types/supabase';

type Json = Database['public']['Tables'];

export interface DataFlowConfig {
  sourceSystem: 'orchestration' | 'modules' | 'marketplace' | 'handover';
  targetSystem: 'orchestration' | 'modules' | 'marketplace' | 'handover';
  dataType: string;
  syncMode: 'realtime' | 'batch' | 'on-demand';
  transformFn?: (data: any) => any;
  validationFn?: (data: any) => boolean;
}

export interface SyncOperation {
  id: string;
  sourceSystem: string;
  targetSystem: string;
  dataType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: Date;
  error?: string;
  retryCount: number;
}

export class DataFlowOrchestrator {
  private syncConfigs: Map<string, DataFlowConfig> = new Map();
  private activeOperations: Map<string, SyncOperation> = new Map();
  private maxRetries = 3;

  registerDataFlow(id: string, config: DataFlowConfig): void {
    this.syncConfigs.set(id, config);
  }

  async syncData(flowId: string, data: any): Promise<void> {
    const config = this.syncConfigs.get(flowId);
    if (!config) {
      throw new Error(`Data flow ${flowId} not registered`);
    }

    const operation: SyncOperation = {
      id: crypto.randomUUID(),
      sourceSystem: config.sourceSystem,
      targetSystem: config.targetSystem,
      dataType: config.dataType,
      status: 'pending',
      timestamp: new Date(),
      retryCount: 0
    };

    this.activeOperations.set(operation.id, operation);

    try {
      operation.status = 'in_progress';

      if (config.validationFn && !config.validationFn(data)) {
        throw new Error('Data validation failed');
      }

      const transformedData = config.transformFn ? config.transformFn(data) : data;

      await this.executeSync(config, transformedData);

      operation.status = 'completed';
    } catch (error) {
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : 'Unknown error';

      if (operation.retryCount < this.maxRetries) {
        operation.retryCount++;
        await this.retrySyncWithBackoff(flowId, data, operation.retryCount);
      } else {
        throw error;
      }
    } finally {
      this.activeOperations.set(operation.id, operation);
    }
  }

  private async executeSync(config: DataFlowConfig, data: any): Promise<void> {
    switch (config.targetSystem) {
      case 'orchestration':
        await this.syncToOrchestration(data, config.dataType);
        break;
      case 'modules':
        await this.syncToModules(data, config.dataType);
        break;
      case 'marketplace':
        await this.syncToMarketplace(data, config.dataType);
        break;
      case 'handover':
        await this.syncToHandover(data, config.dataType);
        break;
    }
  }

  private async syncToOrchestration(data: any, dataType: string): Promise<void> {
    const endpoint = this.getEndpointForDataType('orchestration', dataType);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync to orchestration: ${response.statusText}`);
    }
  }

  private async syncToModules(data: any, dataType: string): Promise<void> {
    const endpoint = this.getEndpointForDataType('modules', dataType);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync to modules: ${response.statusText}`);
    }
  }

  private async syncToMarketplace(data: any, dataType: string): Promise<void> {
    const endpoint = this.getEndpointForDataType('marketplace', dataType);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync to marketplace: ${response.statusText}`);
    }
  }

  private async syncToHandover(data: any, dataType: string): Promise<void> {
    const endpoint = this.getEndpointForDataType('handover', dataType);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync to handover: ${response.statusText}`);
    }
  }

  private getEndpointForDataType(system: string, dataType: string): string {
    const endpoints: Record<string, Record<string, string>> = {
      orchestration: {
        workflow: '/api/orchestration/workflows/sync',
        trigger: '/api/orchestration/triggers/sync',
        execution: '/api/orchestration/executions/sync'
      },
      modules: {
        activation: '/api/modules/activations/sync',
        configuration: '/api/modules/configurations/sync',
        registry: '/api/modules/registry/sync'
      },
      marketplace: {
        installation: '/api/marketplace/installations/sync',
        template: '/api/marketplace/templates/sync',
        package: '/api/marketplace/packages/sync'
      },
      handover: {
        package: '/api/handover/packages/sync',
        documentation: '/api/handover/documentation/sync',
        credentials: '/api/handover/credentials/sync'
      }
    };

    return endpoints[system]?.[dataType] || `/api/${system}/sync`;
  }

  private async retrySyncWithBackoff(flowId: string, data: any, retryCount: number): Promise<void> {
    const backoffMs = Math.pow(2, retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    return this.syncData(flowId, data);
  }

  async batchSync(operations: Array<{ flowId: string; data: any }>): Promise<void> {
    const results = await Promise.allSettled(
      operations.map(op => this.syncData(op.flowId, op.data))
    );

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`Batch sync completed with ${failures.length} failures`);
    }
  }

  getOperationStatus(operationId: string): SyncOperation | undefined {
    return this.activeOperations.get(operationId);
  }

  getActiveOperations(): SyncOperation[] {
    return Array.from(this.activeOperations.values());
  }

  clearCompletedOperations(): void {
    for (const [id, operation] of this.activeOperations.entries()) {
      if (operation.status === 'completed') {
        this.activeOperations.delete(id);
      }
    }
  }
}

export const dataFlowOrchestrator = new DataFlowOrchestrator();

dataFlowOrchestrator.registerDataFlow('orchestration-to-modules', {
  sourceSystem: 'orchestration',
  targetSystem: 'modules',
  dataType: 'activation',
  syncMode: 'realtime',
  transformFn: (data) => ({
    moduleId: data.workflowId,
    activationStatus: data.status,
    timestamp: new Date().toISOString()
  }),
  validationFn: (data) => !!data.workflowId && !!data.status
});

dataFlowOrchestrator.registerDataFlow('marketplace-to-modules', {
  sourceSystem: 'marketplace',
  targetSystem: 'modules',
  dataType: 'installation',
  syncMode: 'realtime',
  transformFn: (data) => ({
    moduleId: data.packageId,
    configurationData: data.installationConfig,
    timestamp: new Date().toISOString()
  }),
  validationFn: (data) => !!data.packageId
});

dataFlowOrchestrator.registerDataFlow('modules-to-handover', {
  sourceSystem: 'modules',
  targetSystem: 'handover',
  dataType: 'configuration',
  syncMode: 'on-demand',
  transformFn: (data) => ({
    packageId: data.moduleId,
    configurationSnapshot: data.configuration,
    timestamp: new Date().toISOString()
  }),
  validationFn: (data) => !!data.moduleId && !!data.configuration
});

dataFlowOrchestrator.registerDataFlow('orchestration-to-handover', {
  sourceSystem: 'orchestration',
  targetSystem: 'handover',
  dataType: 'execution',
  syncMode: 'batch',
  transformFn: (data) => ({
    workflowExecutionId: data.executionId,
    completionStatus: data.status,
    artifacts: data.outputs,
    timestamp: new Date().toISOString()
  }),
  validationFn: (data) => !!data.executionId
});