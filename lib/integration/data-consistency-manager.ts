import { createClient } from '@/lib/supabase/client';

export interface ConsistencyRule {
  id: string;
  systems: string[];
  dataType: string;
  checkFn: (data: Record<string, any>[]) => boolean;
  repairFn?: (data: Record<string, any>[]) => Promise<void>;
  severity: 'critical' | 'warning' | 'info';
}

export interface ConsistencyViolation {
  id: string;
  ruleId: string;
  systems: string[];
  dataType: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export class DataConsistencyManager {
  private rules: Map<string, ConsistencyRule> = new Map();
  private violations: ConsistencyViolation[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  registerRule(rule: ConsistencyRule): void {
    this.rules.set(rule.id, rule);
  }

  async checkConsistency(): Promise<ConsistencyViolation[]> {
    const newViolations: ConsistencyViolation[] = [];

    for (const [ruleId, rule] of this.rules.entries()) {
      try {
        const data = await this.fetchDataForRule(rule);
        const isConsistent = rule.checkFn(data);

        if (!isConsistent) {
          const violation: ConsistencyViolation = {
            id: crypto.randomUUID(),
            ruleId,
            systems: rule.systems,
            dataType: rule.dataType,
            description: `Consistency violation detected for ${rule.dataType} across ${rule.systems.join(', ')}`,
            severity: rule.severity,
            detectedAt: new Date(),
            resolved: false
          };

          newViolations.push(violation);

          if (rule.repairFn) {
            await this.attemptRepair(rule, data, violation);
          }
        }
      } catch (error) {
        console.error(`Error checking rule ${ruleId}:`, error);
      }
    }

    this.violations.push(...newViolations);
    return newViolations;
  }

  private async fetchDataForRule(rule: ConsistencyRule): Promise<Record<string, any>[]> {
    const supabase = createClient();
    const dataBySystem: Record<string, any>[] = [];

    for (const system of rule.systems) {
      const tableName = this.getTableForSystemAndDataType(system, rule.dataType);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1000);

      if (error) {
        throw new Error(`Failed to fetch data from ${tableName}: ${error.message}`);
      }

      dataBySystem.push({
        system,
        data: data || []
      });
    }

    return dataBySystem;
  }

  private getTableForSystemAndDataType(system: string, dataType: string): string {
    const tableMap: Record<string, Record<string, string>> = {
      orchestration: {
        workflow: 'orchestration_workflows',
        execution: 'workflow_executions',
        trigger: 'workflow_triggers'
      },
      modules: {
        activation: 'module_activations',
        configuration: 'module_configurations',
        registry: 'module_registry'
      },
      marketplace: {
        installation: 'marketplace_installations',
        template: 'marketplace_templates',
        package: 'marketplace_packages'
      },
      handover: {
        package: 'handover_packages',
        documentation: 'handover_documentation',
        credentials: 'handover_credentials'
      }
    };

    return tableMap[system]?.[dataType] || `${system}_${dataType}`;
  }

  private async attemptRepair(
    rule: ConsistencyRule,
    data: Record<string, any>[],
    violation: ConsistencyViolation
  ): Promise<void> {
    if (!rule.repairFn) return;

    try {
      await rule.repairFn(data);
      violation.resolved = true;
      violation.resolvedAt = new Date();
    } catch (error) {
      console.error(`Failed to repair violation ${violation.id}:`, error);
    }
  }

  async enforceConsistency(systems: string[], dataType: string): Promise<void> {
    const matchingRules = Array.from(this.rules.values()).filter(
      rule => rule.systems.some(s => systems.includes(s)) && rule.dataType === dataType
    );

    for (const rule of matchingRules) {
      const data = await this.fetchDataForRule(rule);
      const isConsistent = rule.checkFn(data);

      if (!isConsistent && rule.repairFn) {
        await rule.repairFn(data);
      }
    }
  }

  async validateTransaction(
    systems: string[],
    dataType: string,
    transactionData: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const matchingRules = Array.from(this.rules.values()).filter(
      rule => rule.systems.some(s => systems.includes(s)) && rule.dataType === dataType
    );

    for (const rule of matchingRules) {
      const mockData = systems.map(system => ({
        system,
        data: [transactionData]
      }));

      const isValid = rule.checkFn(mockData);
      if (!isValid) {
        errors.push(`Transaction violates consistency rule: ${rule.id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  startPeriodicChecks(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkConsistency();
    }, intervalMs);
  }

  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getViolations(options?: {
    resolved?: boolean;
    severity?: 'critical' | 'warning' | 'info';
    system?: string;
  }): ConsistencyViolation[] {
    let filtered = this.violations;

    if (options?.resolved !== undefined) {
      filtered = filtered.filter(v => v.resolved === options.resolved);
    }

    if (options?.severity) {
      filtered = filtered.filter(v => v.severity === options.severity);
    }

    if (options?.system) {
      filtered = filtered.filter(v => v.systems.includes(options.system));
    }

    return filtered;
  }

  getCriticalViolations(): ConsistencyViolation[] {
    return this.getViolations({ resolved: false, severity: 'critical' });
  }

  clearResolvedViolations(): void {
    this.violations = this.violations.filter(v => !v.resolved);
  }
}

export const dataConsistencyManager = new DataConsistencyManager();

dataConsistencyManager.registerRule({
  id: 'orchestration-module-activation-consistency',
  systems: ['orchestration', 'modules'],
  dataType: 'activation',
  checkFn: (data) => {
    const orchestrationData = data.find(d => d.system === 'orchestration')?.data || [];
    const moduleData = data.find(d => d.system === 'modules')?.data || [];

    for (const workflow of orchestrationData) {
      if (workflow.triggers_module_activation) {
        const hasModuleActivation = moduleData.some(
          m => m.workflow_id === workflow.id || m.module_id === workflow.target_module_id
        );
        if (!hasModuleActivation) {
          return false;
        }
      }
    }
    return true;
  },
  repairFn: async (data) => {
    const supabase = createClient();
    const orchestrationData = data.find(d => d.system === 'orchestration')?.data || [];

    for (const workflow of orchestrationData) {
      if (workflow.triggers_module_activation && workflow.target_module_id) {
        await supabase.from('module_activations').upsert({
          workflow_id: workflow.id,
          module_id: workflow.target_module_id,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }
    }
  },
  severity: 'critical'
});

dataConsistencyManager.registerRule({
  id: 'marketplace-module-installation-consistency',
  systems: ['marketplace', 'modules'],
  dataType: 'installation',
  checkFn: (data) => {
    const marketplaceData = data.find(d => d.system === 'marketplace')?.data || [];
    const moduleData = data.find(d => d.system === 'modules')?.data || [];

    for (const installation of marketplaceData) {
      const hasModuleConfig = moduleData.some(
        m => m.installation_id === installation.id || m.module_id === installation.package_id
      );
      if (!hasModuleConfig) {
        return false;
      }
    }
    return true;
  },
  repairFn: async (data) => {
    const supabase = createClient();
    const marketplaceData = data.find(d => d.system === 'marketplace')?.data || [];

    for (const installation of marketplaceData) {
      await supabase.from('module_configurations').upsert({
        installation_id: installation.id,
        module_id: installation.package_id,
        configuration_data: installation.configuration,
        created_at: new Date().toISOString()
      });
    }
  },
  severity: 'critical'
});

dataConsistencyManager.registerRule({
  id: 'handover-module-package-consistency',
  systems: ['handover', 'modules'],
  dataType: 'package',
  checkFn: (data) => {
    const handoverData = data.find(d => d.system === 'handover')?.data || [];
    const moduleData = data.find(d => d.system === 'modules')?.data || [];

    for (const pkg of handoverData) {
      if (pkg.includes_modules) {
        const hasModuleData = moduleData.some(
          m => m.handover_package_id === pkg.id
        );
        if (!hasModuleData) {
          return false;
        }
      }
    }
    return true;
  },
  severity: 'warning'
});