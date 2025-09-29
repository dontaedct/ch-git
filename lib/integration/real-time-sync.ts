import { createClient } from '@/lib/supabase/client';
import { dataFlowOrchestrator } from './data-flow-orchestrator';

type ChangePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, any>;
  old: Record<string, any>;
  table: string;
  schema: string;
};

export class RealTimeSyncService {
  private subscriptions: Map<string, any> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const supabase = createClient();

    this.setupOrchestrationSync(supabase);
    this.setupModulesSync(supabase);
    this.setupMarketplaceSync(supabase);
    this.setupHandoverSync(supabase);

    this.isInitialized = true;
  }

  private setupOrchestrationSync(supabase: any): void {
    const workflowChannel = supabase
      .channel('orchestration-workflows')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orchestration_workflows'
        },
        (payload: ChangePayload) => this.handleOrchestrationChange(payload)
      )
      .subscribe();

    this.subscriptions.set('orchestration-workflows', workflowChannel);

    const executionChannel = supabase
      .channel('orchestration-executions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions'
        },
        (payload: ChangePayload) => this.handleExecutionChange(payload)
      )
      .subscribe();

    this.subscriptions.set('orchestration-executions', executionChannel);
  }

  private setupModulesSync(supabase: any): void {
    const activationChannel = supabase
      .channel('module-activations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_activations'
        },
        (payload: ChangePayload) => this.handleModuleActivationChange(payload)
      )
      .subscribe();

    this.subscriptions.set('module-activations', activationChannel);

    const configChannel = supabase
      .channel('module-configurations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_configurations'
        },
        (payload: ChangePayload) => this.handleModuleConfigChange(payload)
      )
      .subscribe();

    this.subscriptions.set('module-configurations', configChannel);
  }

  private setupMarketplaceSync(supabase: any): void {
    const installationChannel = supabase
      .channel('marketplace-installations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_installations'
        },
        (payload: ChangePayload) => this.handleMarketplaceInstallation(payload)
      )
      .subscribe();

    this.subscriptions.set('marketplace-installations', installationChannel);

    const templateChannel = supabase
      .channel('marketplace-templates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_templates'
        },
        (payload: ChangePayload) => this.handleTemplateChange(payload)
      )
      .subscribe();

    this.subscriptions.set('marketplace-templates', templateChannel);
  }

  private setupHandoverSync(supabase: any): void {
    const packageChannel = supabase
      .channel('handover-packages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'handover_packages'
        },
        (payload: ChangePayload) => this.handleHandoverPackage(payload)
      )
      .subscribe();

    this.subscriptions.set('handover-packages', packageChannel);
  }

  private async handleOrchestrationChange(payload: ChangePayload): Promise<void> {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const workflow = payload.new;

      if (workflow.triggers_module_activation) {
        await dataFlowOrchestrator.syncData('orchestration-to-modules', {
          workflowId: workflow.id,
          status: workflow.status,
          moduleId: workflow.target_module_id,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private async handleExecutionChange(payload: ChangePayload): Promise<void> {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const execution = payload.new;

      if (execution.status === 'completed' || execution.status === 'failed') {
        await dataFlowOrchestrator.syncData('orchestration-to-handover', {
          executionId: execution.id,
          status: execution.status,
          outputs: execution.outputs,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private async handleModuleActivationChange(payload: ChangePayload): Promise<void> {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const activation = payload.new;

      if (activation.status === 'active') {
        await dataFlowOrchestrator.syncData('modules-to-handover', {
          moduleId: activation.module_id,
          configuration: activation.configuration_data,
          activatedAt: activation.activated_at,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private async handleModuleConfigChange(payload: ChangePayload): Promise<void> {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const config = payload.new;

      await dataFlowOrchestrator.syncData('modules-to-handover', {
        moduleId: config.module_id,
        configuration: config.configuration_data,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async handleMarketplaceInstallation(payload: ChangePayload): Promise<void> {
    if (payload.eventType === 'INSERT') {
      const installation = payload.new;

      await dataFlowOrchestrator.syncData('marketplace-to-modules', {
        packageId: installation.package_id,
        installationConfig: installation.configuration,
        clientId: installation.client_id,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async handleTemplateChange(payload: ChangePayload): Promise<void> {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const template = payload.new;

      if (template.requires_module_activation) {
        await dataFlowOrchestrator.syncData('marketplace-to-modules', {
          packageId: template.id,
          installationConfig: template.default_config,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private async handleHandoverPackage(payload: ChangePayload): Promise<void> {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const pkg = payload.new;
      console.log('Handover package synchronized:', pkg.id);
    }
  }

  async syncSpecificTable(table: string, recordId: string): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) {
      throw new Error(`Failed to sync table ${table}: ${error.message}`);
    }

    const payload: ChangePayload = {
      eventType: 'UPDATE',
      new: data,
      old: {},
      table,
      schema: 'public'
    };

    switch (table) {
      case 'orchestration_workflows':
        await this.handleOrchestrationChange(payload);
        break;
      case 'workflow_executions':
        await this.handleExecutionChange(payload);
        break;
      case 'module_activations':
        await this.handleModuleActivationChange(payload);
        break;
      case 'module_configurations':
        await this.handleModuleConfigChange(payload);
        break;
      case 'marketplace_installations':
        await this.handleMarketplaceInstallation(payload);
        break;
      case 'marketplace_templates':
        await this.handleTemplateChange(payload);
        break;
      case 'handover_packages':
        await this.handleHandoverPackage(payload);
        break;
    }
  }

  async shutdown(): Promise<void> {
    const supabase = createClient();

    for (const [name, channel] of this.subscriptions.entries()) {
      await supabase.removeChannel(channel);
      this.subscriptions.delete(name);
    }

    this.isInitialized = false;
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  isSubscribed(channelName: string): boolean {
    return this.subscriptions.has(channelName);
  }
}

export const realTimeSyncService = new RealTimeSyncService();