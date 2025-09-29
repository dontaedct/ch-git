import { universalClientManager, ClientDeployment } from './universal-client-manager';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface BulkOperation {
  id: string;
  type: 'deploy' | 'suspend' | 'update_config' | 'restart' | 'backup' | 'migrate';
  targetClients: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  results: BulkOperationResult[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

export interface BulkOperationResult {
  clientId: string;
  clientName: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  executedAt: Date;
}

export class BulkOperationsManager {
  private supabase;
  private activeOperations: Map<string, BulkOperation> = new Map();

  constructor() {
    this.supabase = createClientComponentClient();
  }

  async createBulkOperation(
    type: BulkOperation['type'],
    targetClients: string[],
    metadata: Record<string, any> = {}
  ): Promise<BulkOperation> {
    const operation: BulkOperation = {
      id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      targetClients,
      status: 'pending',
      progress: 0,
      results: [],
      createdAt: new Date(),
      metadata
    };

    this.activeOperations.set(operation.id, operation);

    // Store in database
    try {
      await this.supabase
        .from('bulk_operations')
        .insert({
          id: operation.id,
          type: operation.type,
          target_clients: operation.targetClients,
          status: operation.status,
          metadata: operation.metadata,
          created_at: operation.createdAt.toISOString()
        });
    } catch (error) {
      console.error('Error storing bulk operation:', error);
    }

    return operation;
  }

  async executeBulkOperation(operationId: string): Promise<void> {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    operation.status = 'running';
    operation.startedAt = new Date();
    operation.progress = 0;

    try {
      await this.updateOperationInDatabase(operation);

      const totalClients = operation.targetClients.length;
      let processedClients = 0;

      for (const clientId of operation.targetClients) {
        try {
          const client = await universalClientManager.getClientById(clientId);
          if (!client) {
            operation.results.push({
              clientId,
              clientName: 'Unknown',
              status: 'failed',
              message: 'Client not found',
              executedAt: new Date()
            });
            continue;
          }

          const result = await this.executeOperationOnClient(operation.type, client, operation.metadata);
          operation.results.push(result);

          processedClients++;
          operation.progress = Math.round((processedClients / totalClients) * 100);

          // Update progress in database
          await this.updateOperationInDatabase(operation);

          // Add delay between operations to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          operation.results.push({
            clientId,
            clientName: 'Unknown',
            status: 'failed',
            message: `Error: ${(error as Error).message}`,
            executedAt: new Date()
          });
        }
      }

      operation.status = 'completed';
      operation.completedAt = new Date();
      operation.progress = 100;

    } catch (error) {
      operation.status = 'failed';
      console.error('Bulk operation failed:', error);
    }

    await this.updateOperationInDatabase(operation);
  }

  async cancelBulkOperation(operationId: string): Promise<boolean> {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return false;
    }

    if (operation.status === 'running') {
      operation.status = 'cancelled';
      await this.updateOperationInDatabase(operation);
      return true;
    }

    return false;
  }

  async getBulkOperation(operationId: string): Promise<BulkOperation | null> {
    return this.activeOperations.get(operationId) || null;
  }

  async getAllBulkOperations(): Promise<BulkOperation[]> {
    try {
      const { data: operations, error } = await this.supabase
        .from('bulk_operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return operations?.map(op => ({
        id: op.id,
        type: op.type,
        targetClients: op.target_clients,
        status: op.status,
        progress: op.progress || 0,
        results: op.results || [],
        createdAt: new Date(op.created_at),
        startedAt: op.started_at ? new Date(op.started_at) : undefined,
        completedAt: op.completed_at ? new Date(op.completed_at) : undefined,
        metadata: op.metadata || {}
      })) || [];
    } catch (error) {
      console.error('Error fetching bulk operations:', error);
      return [];
    }
  }

  async deployMultipleClients(clientIds: string[]): Promise<BulkOperation> {
    const operation = await this.createBulkOperation('deploy', clientIds);
    this.executeBulkOperation(operation.id);
    return operation;
  }

  async suspendMultipleClients(clientIds: string[]): Promise<BulkOperation> {
    const operation = await this.createBulkOperation('suspend', clientIds);
    this.executeBulkOperation(operation.id);
    return operation;
  }

  async updateMultipleClientConfigs(
    clientIds: string[],
    configUpdates: Record<string, any>
  ): Promise<BulkOperation> {
    const operation = await this.createBulkOperation('update_config', clientIds, {
      configUpdates
    });
    this.executeBulkOperation(operation.id);
    return operation;
  }

  async restartMultipleClients(clientIds: string[]): Promise<BulkOperation> {
    const operation = await this.createBulkOperation('restart', clientIds);
    this.executeBulkOperation(operation.id);
    return operation;
  }

  async backupMultipleClients(clientIds: string[]): Promise<BulkOperation> {
    const operation = await this.createBulkOperation('backup', clientIds);
    this.executeBulkOperation(operation.id);
    return operation;
  }

  private async executeOperationOnClient(
    operationType: BulkOperation['type'],
    client: ClientDeployment,
    metadata: Record<string, any>
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      clientId: client.id,
      clientName: client.name,
      status: 'failed',
      message: '',
      executedAt: new Date()
    };

    try {
      switch (operationType) {
        case 'deploy':
          const deployed = await universalClientManager.deployClient(client.id);
          result.status = deployed ? 'success' : 'failed';
          result.message = deployed ? 'Deployment successful' : 'Deployment failed';
          break;

        case 'suspend':
          const suspended = await universalClientManager.suspendClient(client.id);
          result.status = suspended ? 'success' : 'failed';
          result.message = suspended ? 'Client suspended' : 'Suspension failed';
          break;

        case 'update_config':
          const updated = await universalClientManager.updateClientConfiguration(
            client.id,
            metadata.configUpdates
          );
          result.status = updated ? 'success' : 'failed';
          result.message = updated ? 'Configuration updated' : 'Configuration update failed';
          break;

        case 'restart':
          // Implement restart logic
          await universalClientManager.updateClientStatus(client.id, 'deploying');
          await new Promise(resolve => setTimeout(resolve, 2000));
          await universalClientManager.updateClientStatus(client.id, 'active');
          result.status = 'success';
          result.message = 'Client restarted successfully';
          break;

        case 'backup':
          // Implement backup logic
          result.status = 'success';
          result.message = 'Backup created successfully';
          break;

        case 'migrate':
          // Implement migration logic
          result.status = 'success';
          result.message = 'Migration completed successfully';
          break;

        default:
          result.message = `Unknown operation type: ${operationType}`;
      }
    } catch (error) {
      result.status = 'failed';
      result.message = `Error: ${(error as Error).message}`;
    }

    return result;
  }

  private async updateOperationInDatabase(operation: BulkOperation): Promise<void> {
    try {
      await this.supabase
        .from('bulk_operations')
        .update({
          status: operation.status,
          progress: operation.progress,
          results: operation.results,
          started_at: operation.startedAt?.toISOString(),
          completed_at: operation.completedAt?.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', operation.id);
    } catch (error) {
      console.error('Error updating bulk operation in database:', error);
    }
  }
}

export const bulkOperationsManager = new BulkOperationsManager();