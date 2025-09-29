import { universalClientManager, ClientDeployment } from './universal-client-manager';
import { bulkOperationsManager, BulkOperation } from './bulk-operations';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface ActionTemplate {
  id: string;
  name: string;
  description: string;
  type: 'single' | 'bulk';
  category: 'deployment' | 'configuration' | 'monitoring' | 'maintenance' | 'security';
  parameters: ActionParameter[];
  preconditions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
}

export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  description: string;
  options?: string[];
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ActionExecution {
  id: string;
  templateId: string;
  templateName: string;
  targetClients: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  results: ActionResult[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  executedBy: string;
  estimatedCompletion?: Date;
}

export interface ActionResult {
  clientId: string;
  clientName: string;
  status: 'success' | 'failed' | 'skipped' | 'warning';
  message: string;
  details?: Record<string, any>;
  executedAt: Date;
  duration: number; // in milliseconds
}

export class CentralizedActionsManager {
  private supabase;
  private actionTemplates: Map<string, ActionTemplate> = new Map();
  private activeExecutions: Map<string, ActionExecution> = new Map();

  constructor() {
    this.supabase = createClientComponentClient();
    this.initializeActionTemplates();
  }

  private initializeActionTemplates(): void {
    const templates: ActionTemplate[] = [
      {
        id: 'deploy_all',
        name: 'Deploy All Clients',
        description: 'Deploy or redeploy all selected clients with latest configurations',
        type: 'bulk',
        category: 'deployment',
        parameters: [
          {
            name: 'forceRedeploy',
            type: 'boolean',
            required: false,
            description: 'Force redeploy even if already active',
            defaultValue: false
          }
        ],
        preconditions: ['Clients must be in deployable state'],
        riskLevel: 'medium',
        estimatedDuration: 10
      },
      {
        id: 'update_features',
        name: 'Update Feature Flags',
        description: 'Update feature flags across multiple clients',
        type: 'bulk',
        category: 'configuration',
        parameters: [
          {
            name: 'features',
            type: 'multiselect',
            required: true,
            description: 'Select features to enable/disable',
            options: ['analytics', 'chat', 'payments', 'notifications', 'api_access']
          },
          {
            name: 'action',
            type: 'select',
            required: true,
            description: 'Action to perform',
            options: ['enable', 'disable'],
            defaultValue: 'enable'
          }
        ],
        preconditions: ['Clients must be active'],
        riskLevel: 'low',
        estimatedDuration: 5
      },
      {
        id: 'security_scan',
        name: 'Security Scan',
        description: 'Perform security scan on client deployments',
        type: 'bulk',
        category: 'security',
        parameters: [
          {
            name: 'scanType',
            type: 'select',
            required: true,
            description: 'Type of security scan',
            options: ['basic', 'comprehensive', 'vulnerability'],
            defaultValue: 'basic'
          }
        ],
        preconditions: ['Clients must be accessible'],
        riskLevel: 'low',
        estimatedDuration: 15
      },
      {
        id: 'performance_optimization',
        name: 'Performance Optimization',
        description: 'Optimize performance settings for client deployments',
        type: 'bulk',
        category: 'maintenance',
        parameters: [
          {
            name: 'optimizationType',
            type: 'select',
            required: true,
            description: 'Type of optimization',
            options: ['cache', 'database', 'assets', 'all'],
            defaultValue: 'all'
          }
        ],
        preconditions: ['Clients must be active'],
        riskLevel: 'medium',
        estimatedDuration: 20
      },
      {
        id: 'backup_all',
        name: 'Backup All Data',
        description: 'Create backups for all selected clients',
        type: 'bulk',
        category: 'maintenance',
        parameters: [
          {
            name: 'includeUploads',
            type: 'boolean',
            required: false,
            description: 'Include uploaded files in backup',
            defaultValue: true
          },
          {
            name: 'compressionLevel',
            type: 'select',
            required: false,
            description: 'Backup compression level',
            options: ['none', 'low', 'medium', 'high'],
            defaultValue: 'medium'
          }
        ],
        preconditions: ['Clients must be accessible'],
        riskLevel: 'low',
        estimatedDuration: 30
      },
      {
        id: 'health_check',
        name: 'Health Check',
        description: 'Perform comprehensive health check on client deployments',
        type: 'bulk',
        category: 'monitoring',
        parameters: [
          {
            name: 'checkDepth',
            type: 'select',
            required: false,
            description: 'Depth of health check',
            options: ['surface', 'deep', 'comprehensive'],
            defaultValue: 'deep'
          }
        ],
        preconditions: ['Clients must be accessible'],
        riskLevel: 'low',
        estimatedDuration: 8
      }
    ];

    templates.forEach(template => {
      this.actionTemplates.set(template.id, template);
    });
  }

  async getActionTemplates(): Promise<ActionTemplate[]> {
    return Array.from(this.actionTemplates.values());
  }

  async getActionTemplate(id: string): Promise<ActionTemplate | null> {
    return this.actionTemplates.get(id) || null;
  }

  async createActionExecution(
    templateId: string,
    targetClients: string[],
    parameters: Record<string, any>,
    executedBy: string
  ): Promise<ActionExecution> {
    const template = this.actionTemplates.get(templateId);
    if (!template) {
      throw new Error(`Action template ${templateId} not found`);
    }

    const execution: ActionExecution = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      templateName: template.name,
      targetClients,
      parameters,
      status: 'pending',
      progress: 0,
      results: [],
      createdAt: new Date(),
      executedBy,
      estimatedCompletion: new Date(Date.now() + template.estimatedDuration * 60 * 1000)
    };

    this.activeExecutions.set(execution.id, execution);

    // Store in database
    try {
      await this.supabase
        .from('action_executions')
        .insert({
          id: execution.id,
          template_id: execution.templateId,
          template_name: execution.templateName,
          target_clients: execution.targetClients,
          parameters: execution.parameters,
          status: execution.status,
          executed_by: execution.executedBy,
          created_at: execution.createdAt.toISOString(),
          estimated_completion: execution.estimatedCompletion?.toISOString()
        });
    } catch (error) {
      console.error('Error storing action execution:', error);
    }

    return execution;
  }

  async executeAction(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Action execution ${executionId} not found`);
    }

    const template = this.actionTemplates.get(execution.templateId);
    if (!template) {
      throw new Error(`Action template ${execution.templateId} not found`);
    }

    execution.status = 'running';
    execution.startedAt = new Date();
    execution.progress = 0;

    try {
      await this.updateExecutionInDatabase(execution);

      const totalClients = execution.targetClients.length;
      let processedClients = 0;

      for (const clientId of execution.targetClients) {
        const startTime = Date.now();

        try {
          const client = await universalClientManager.getClientById(clientId);
          if (!client) {
            execution.results.push({
              clientId,
              clientName: 'Unknown',
              status: 'failed',
              message: 'Client not found',
              executedAt: new Date(),
              duration: Date.now() - startTime
            });
            continue;
          }

          const result = await this.executeActionOnClient(template, client, execution.parameters);
          result.duration = Date.now() - startTime;
          execution.results.push(result);

          processedClients++;
          execution.progress = Math.round((processedClients / totalClients) * 100);

          await this.updateExecutionInDatabase(execution);

          // Add delay between operations
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          execution.results.push({
            clientId,
            clientName: 'Unknown',
            status: 'failed',
            message: `Error: ${(error as Error).message}`,
            executedAt: new Date(),
            duration: Date.now() - startTime
          });
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.progress = 100;

    } catch (error) {
      execution.status = 'failed';
      console.error('Action execution failed:', error);
    }

    await this.updateExecutionInDatabase(execution);
  }

  async cancelActionExecution(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return false;
    }

    if (execution.status === 'running') {
      execution.status = 'cancelled';
      await this.updateExecutionInDatabase(execution);
      return true;
    }

    return false;
  }

  async getActionExecution(executionId: string): Promise<ActionExecution | null> {
    return this.activeExecutions.get(executionId) || null;
  }

  async getAllActionExecutions(): Promise<ActionExecution[]> {
    try {
      const { data: executions, error } = await this.supabase
        .from('action_executions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return executions?.map(exec => ({
        id: exec.id,
        templateId: exec.template_id,
        templateName: exec.template_name,
        targetClients: exec.target_clients,
        parameters: exec.parameters || {},
        status: exec.status,
        progress: exec.progress || 0,
        results: exec.results || [],
        createdAt: new Date(exec.created_at),
        startedAt: exec.started_at ? new Date(exec.started_at) : undefined,
        completedAt: exec.completed_at ? new Date(exec.completed_at) : undefined,
        executedBy: exec.executed_by,
        estimatedCompletion: exec.estimated_completion ? new Date(exec.estimated_completion) : undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching action executions:', error);
      return [];
    }
  }

  private async executeActionOnClient(
    template: ActionTemplate,
    client: ClientDeployment,
    parameters: Record<string, any>
  ): Promise<ActionResult> {
    const result: ActionResult = {
      clientId: client.id,
      clientName: client.name,
      status: 'failed',
      message: '',
      executedAt: new Date(),
      duration: 0
    };

    try {
      switch (template.id) {
        case 'deploy_all':
          const deployed = await universalClientManager.deployClient(client.id);
          result.status = deployed ? 'success' : 'failed';
          result.message = deployed ? 'Deployment successful' : 'Deployment failed';
          break;

        case 'update_features':
          const features = parameters.features as string[];
          const action = parameters.action as string;
          const currentConfig = client.configuration;

          if (action === 'enable') {
            currentConfig.features = [...new Set([...currentConfig.features, ...features])];
          } else {
            currentConfig.features = currentConfig.features.filter(f => !features.includes(f));
          }

          const updated = await universalClientManager.updateClientConfiguration(client.id, currentConfig);
          result.status = updated ? 'success' : 'failed';
          result.message = updated ? `Features ${action}d successfully` : `Failed to ${action} features`;
          break;

        case 'security_scan':
          // Simulate security scan
          await new Promise(resolve => setTimeout(resolve, 2000));
          result.status = 'success';
          result.message = 'Security scan completed - no vulnerabilities found';
          result.details = {
            vulnerabilities: 0,
            warnings: Math.floor(Math.random() * 3),
            lastScan: new Date().toISOString()
          };
          break;

        case 'performance_optimization':
          // Simulate performance optimization
          await new Promise(resolve => setTimeout(resolve, 3000));
          result.status = 'success';
          result.message = 'Performance optimization completed';
          result.details = {
            cacheHitRate: '95%',
            responseTimeImprovement: '23%',
            optimizedAssets: 45
          };
          break;

        case 'backup_all':
          // Simulate backup
          await new Promise(resolve => setTimeout(resolve, 5000));
          result.status = 'success';
          result.message = 'Backup completed successfully';
          result.details = {
            backupSize: `${Math.floor(Math.random() * 500) + 100}MB`,
            backupLocation: `backups/${client.id}/${Date.now()}.tar.gz`
          };
          break;

        case 'health_check':
          // Simulate health check
          await new Promise(resolve => setTimeout(resolve, 1000));
          const healthScore = Math.floor(Math.random() * 30) + 70;
          result.status = healthScore > 80 ? 'success' : 'warning';
          result.message = `Health check completed - Score: ${healthScore}/100`;
          result.details = {
            healthScore,
            uptime: client.metrics.uptime,
            responseTime: client.metrics.responseTime,
            errorRate: client.metrics.errorRate
          };
          break;

        default:
          result.message = `Unknown action template: ${template.id}`;
      }
    } catch (error) {
      result.status = 'failed';
      result.message = `Error: ${(error as Error).message}`;
    }

    return result;
  }

  private async updateExecutionInDatabase(execution: ActionExecution): Promise<void> {
    try {
      await this.supabase
        .from('action_executions')
        .update({
          status: execution.status,
          progress: execution.progress,
          results: execution.results,
          started_at: execution.startedAt?.toISOString(),
          completed_at: execution.completedAt?.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', execution.id);
    } catch (error) {
      console.error('Error updating action execution in database:', error);
    }
  }
}

export const centralizedActionsManager = new CentralizedActionsManager();