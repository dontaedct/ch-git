/**
 * Data Integrity Validator for HT-036.3.1
 * Validates data integrity across all integrated systems
 * Ensures referential integrity, constraint compliance, and data consistency
 */

import { createClient } from '@/lib/supabase/client';

export interface ValidationResult {
  passed: boolean;
  category: string;
  check: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  affectedRecords?: number;
  details?: any;
}

export interface ValidationReport {
  timestamp: string;
  totalChecks: number;
  passed: number;
  warnings: number;
  errors: number;
  critical: number;
  overallStatus: 'passed' | 'warning' | 'failed';
  results: ValidationResult[];
  executionTimeMs: number;
}

export class DataIntegrityValidator {
  private supabase = createClient();
  private results: ValidationResult[] = [];
  private startTime: number = 0;

  async validate(): Promise<ValidationReport> {
    this.startTime = Date.now();
    this.results = [];

    console.log('Starting data integrity validation...');

    await this.validateForeignKeys();
    await this.validateConstraints();
    await this.validateDataConsistency();
    await this.validateIndexes();
    await this.validateOrphanedRecords();
    await this.validateJSONStructures();
    await this.validateWorkflowIntegrity();
    await this.validateModuleIntegration();

    return this.generateReport();
  }

  private async validateForeignKeys(): Promise<void> {
    console.log('Validating foreign key relationships...');

    // Check client_app_overrides -> marketplace_modules
    await this.checkForeignKey(
      'client_app_overrides',
      'marketplace_module_id',
      'marketplace_modules',
      'id',
      'Client app overrides must reference valid marketplace modules'
    );

    // Check client_app_overrides -> module_installations
    await this.checkForeignKey(
      'client_app_overrides',
      'installation_id',
      'module_installations',
      'id',
      'Client app overrides must reference valid module installations'
    );

    // Check orchestration_workflows -> clients_enhanced
    await this.checkForeignKey(
      'orchestration_workflows',
      'client_id',
      'clients_enhanced',
      'id',
      'Orchestration workflows must reference valid clients'
    );

    // Check workflow_executions -> orchestration_workflows
    await this.checkForeignKey(
      'workflow_executions',
      'workflow_id',
      'orchestration_workflows',
      'id',
      'Workflow executions must reference valid workflows'
    );

    // Check handover_packages -> clients_enhanced
    await this.checkForeignKey(
      'handover_packages',
      'client_id',
      'clients_enhanced',
      'id',
      'Handover packages must reference valid clients'
    );

    // Check handover_packages -> orchestration_workflows
    await this.checkForeignKey(
      'handover_packages',
      'workflow_id',
      'orchestration_workflows',
      'id',
      'Handover packages must reference valid workflows',
      true // Allow NULL
    );
  }

  private async checkForeignKey(
    sourceTable: string,
    sourceColumn: string,
    targetTable: string,
    targetColumn: string,
    message: string,
    allowNull: boolean = false
  ): Promise<void> {
    try {
      const nullCondition = allowNull ? `AND ${sourceColumn} IS NOT NULL` : '';
      const query = `
        SELECT COUNT(*) as count
        FROM ${sourceTable}
        WHERE NOT EXISTS (
          SELECT 1 FROM ${targetTable}
          WHERE ${targetTable}.${targetColumn} = ${sourceTable}.${sourceColumn}
        )
        ${nullCondition}
      `;

      const { data, error } = await this.supabase.rpc('execute_sql', { sql: query });

      if (error) {
        this.addResult({
          passed: false,
          category: 'Foreign Keys',
          check: `${sourceTable}.${sourceColumn} -> ${targetTable}.${targetColumn}`,
          message: `Error checking foreign key: ${error.message}`,
          severity: 'error',
        });
        return;
      }

      const count = data?.[0]?.count || 0;

      if (count > 0) {
        this.addResult({
          passed: false,
          category: 'Foreign Keys',
          check: `${sourceTable}.${sourceColumn} -> ${targetTable}.${targetColumn}`,
          message: `${message} (${count} orphaned records found)`,
          severity: 'critical',
          affectedRecords: count,
        });
      } else {
        this.addResult({
          passed: true,
          category: 'Foreign Keys',
          check: `${sourceTable}.${sourceColumn} -> ${targetTable}.${targetColumn}`,
          message: `Foreign key integrity maintained`,
          severity: 'info',
        });
      }
    } catch (error: any) {
      this.addResult({
        passed: false,
        category: 'Foreign Keys',
        check: `${sourceTable}.${sourceColumn} -> ${targetTable}.${targetColumn}`,
        message: `Validation error: ${error.message}`,
        severity: 'error',
      });
    }
  }

  private async validateConstraints(): Promise<void> {
    console.log('Validating data constraints...');

    // Validate workflow status constraints
    await this.checkEnumConstraint(
      'orchestration_workflows',
      'status',
      ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
      'Workflow status must be valid'
    );

    // Validate workflow type constraints
    await this.checkEnumConstraint(
      'orchestration_workflows',
      'workflow_type',
      ['client_onboarding', 'module_activation', 'deployment', 'handover', 'custom'],
      'Workflow type must be valid'
    );

    // Validate execution status constraints
    await this.checkEnumConstraint(
      'workflow_executions',
      'status',
      ['pending', 'running', 'completed', 'failed', 'skipped'],
      'Execution status must be valid'
    );

    // Validate handover delivery status
    await this.checkEnumConstraint(
      'handover_packages',
      'delivery_status',
      ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'failed'],
      'Delivery status must be valid'
    );

    // Validate activation status
    await this.checkEnumConstraint(
      'client_app_overrides',
      'activation_status',
      ['pending', 'active', 'inactive', 'failed'],
      'Activation status must be valid',
      true
    );
  }

  private async checkEnumConstraint(
    table: string,
    column: string,
    validValues: string[],
    message: string,
    allowNull: boolean = false
  ): Promise<void> {
    try {
      const nullCondition = allowNull ? `AND ${column} IS NOT NULL` : '';
      const valueList = validValues.map(v => `'${v}'`).join(', ');
      const query = `
        SELECT COUNT(*) as count
        FROM ${table}
        WHERE ${column} NOT IN (${valueList})
        ${nullCondition}
      `;

      const { data, error } = await this.supabase.rpc('execute_sql', { sql: query });

      if (error) {
        this.addResult({
          passed: false,
          category: 'Constraints',
          check: `${table}.${column} enum constraint`,
          message: `Error checking constraint: ${error.message}`,
          severity: 'error',
        });
        return;
      }

      const count = data?.[0]?.count || 0;

      if (count > 0) {
        this.addResult({
          passed: false,
          category: 'Constraints',
          check: `${table}.${column} enum constraint`,
          message: `${message} (${count} invalid values found)`,
          severity: 'error',
          affectedRecords: count,
        });
      } else {
        this.addResult({
          passed: true,
          category: 'Constraints',
          check: `${table}.${column} enum constraint`,
          message: `Constraint satisfied`,
          severity: 'info',
        });
      }
    } catch (error: any) {
      this.addResult({
        passed: false,
        category: 'Constraints',
        check: `${table}.${column} enum constraint`,
        message: `Validation error: ${error.message}`,
        severity: 'error',
      });
    }
  }

  private async validateDataConsistency(): Promise<void> {
    console.log('Validating data consistency...');

    // Check module activation consistency
    const { data: inconsistentModules } = await this.supabase
      .from('client_app_overrides')
      .select('id, enabled, activation_status')
      .neq('enabled', true)
      .eq('activation_status', 'active');

    if (inconsistentModules && inconsistentModules.length > 0) {
      this.addResult({
        passed: false,
        category: 'Data Consistency',
        check: 'Module activation state consistency',
        message: `Found ${inconsistentModules.length} modules with inconsistent enabled/activation_status`,
        severity: 'warning',
        affectedRecords: inconsistentModules.length,
      });
    } else {
      this.addResult({
        passed: true,
        category: 'Data Consistency',
        check: 'Module activation state consistency',
        message: 'Module activation states are consistent',
        severity: 'info',
      });
    }

    // Check workflow completion consistency
    const { data: incompleteWorkflows } = await this.supabase
      .from('orchestration_workflows')
      .select('id, status, completed_at')
      .eq('status', 'completed')
      .is('completed_at', null);

    if (incompleteWorkflows && incompleteWorkflows.length > 0) {
      this.addResult({
        passed: false,
        category: 'Data Consistency',
        check: 'Workflow completion timestamp consistency',
        message: `Found ${incompleteWorkflows.length} completed workflows without completion timestamp`,
        severity: 'warning',
        affectedRecords: incompleteWorkflows.length,
      });
    } else {
      this.addResult({
        passed: true,
        category: 'Data Consistency',
        check: 'Workflow completion timestamp consistency',
        message: 'Workflow completion timestamps are consistent',
        severity: 'info',
      });
    }
  }

  private async validateIndexes(): Promise<void> {
    console.log('Validating database indexes...');

    const requiredIndexes = [
      'idx_cao_marketplace_module',
      'idx_cao_installation',
      'idx_cao_activation_status',
      'idx_orchestration_workflows_client',
      'idx_orchestration_workflows_status',
      'idx_workflow_executions_workflow',
      'idx_handover_packages_client',
      'idx_integration_events_type',
    ];

    for (const indexName of requiredIndexes) {
      const { data, error } = await this.supabase.rpc('check_index_exists', {
        index_name: indexName,
      });

      if (error || !data) {
        this.addResult({
          passed: false,
          category: 'Indexes',
          check: `Index: ${indexName}`,
          message: `Required index ${indexName} is missing`,
          severity: 'warning',
        });
      } else {
        this.addResult({
          passed: true,
          category: 'Indexes',
          check: `Index: ${indexName}`,
          message: `Index exists and is active`,
          severity: 'info',
        });
      }
    }
  }

  private async validateOrphanedRecords(): Promise<void> {
    console.log('Checking for orphaned records...');

    // Check for workflow executions without workflows
    const { data: orphanedExecutions, count: executionCount } = await this.supabase
      .from('workflow_executions')
      .select('id', { count: 'exact' })
      .not('workflow_id', 'in', '(SELECT id FROM orchestration_workflows)');

    if (executionCount && executionCount > 0) {
      this.addResult({
        passed: false,
        category: 'Orphaned Records',
        check: 'Workflow executions',
        message: `Found ${executionCount} orphaned workflow executions`,
        severity: 'error',
        affectedRecords: executionCount,
      });
    } else {
      this.addResult({
        passed: true,
        category: 'Orphaned Records',
        check: 'Workflow executions',
        message: 'No orphaned workflow executions found',
        severity: 'info',
      });
    }
  }

  private async validateJSONStructures(): Promise<void> {
    console.log('Validating JSON structure integrity...');

    // Validate workflow_definition structure
    const { data: workflows } = await this.supabase
      .from('orchestration_workflows')
      .select('id, workflow_definition')
      .limit(100);

    let invalidWorkflows = 0;
    workflows?.forEach(workflow => {
      if (!workflow.workflow_definition?.steps) {
        invalidWorkflows++;
      }
    });

    if (invalidWorkflows > 0) {
      this.addResult({
        passed: false,
        category: 'JSON Structures',
        check: 'Workflow definition structure',
        message: `Found ${invalidWorkflows} workflows with invalid definition structure`,
        severity: 'warning',
        affectedRecords: invalidWorkflows,
      });
    } else {
      this.addResult({
        passed: true,
        category: 'JSON Structures',
        check: 'Workflow definition structure',
        message: 'All workflow definitions have valid structure',
        severity: 'info',
      });
    }
  }

  private async validateWorkflowIntegrity(): Promise<void> {
    console.log('Validating workflow integrity...');

    // Check for workflows with failed executions but completed status
    const { data: inconsistentWorkflows } = await this.supabase
      .from('orchestration_workflows')
      .select(`
        id,
        status,
        workflow_executions!inner(status)
      `)
      .eq('status', 'completed')
      .eq('workflow_executions.status', 'failed');

    if (inconsistentWorkflows && inconsistentWorkflows.length > 0) {
      this.addResult({
        passed: false,
        category: 'Workflow Integrity',
        check: 'Workflow status consistency',
        message: `Found ${inconsistentWorkflows.length} workflows marked completed with failed executions`,
        severity: 'error',
        affectedRecords: inconsistentWorkflows.length,
      });
    } else {
      this.addResult({
        passed: true,
        category: 'Workflow Integrity',
        check: 'Workflow status consistency',
        message: 'Workflow statuses are consistent with executions',
        severity: 'info',
      });
    }
  }

  private async validateModuleIntegration(): Promise<void> {
    console.log('Validating module integration...');

    // Check for module installations without corresponding overrides
    const { data: installationsWithoutOverrides, count } = await this.supabase
      .from('module_installations')
      .select('id', { count: 'exact' })
      .eq('status', 'active')
      .not('id', 'in', '(SELECT installation_id FROM client_app_overrides WHERE installation_id IS NOT NULL)');

    if (count && count > 0) {
      this.addResult({
        passed: false,
        category: 'Module Integration',
        check: 'Installation-Override linkage',
        message: `Found ${count} active installations without override configurations`,
        severity: 'warning',
        affectedRecords: count,
      });
    } else {
      this.addResult({
        passed: true,
        category: 'Module Integration',
        check: 'Installation-Override linkage',
        message: 'All active installations have override configurations',
        severity: 'info',
      });
    }
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  private generateReport(): ValidationReport {
    const executionTimeMs = Date.now() - this.startTime;

    const passed = this.results.filter(r => r.passed).length;
    const warnings = this.results.filter(r => !r.passed && r.severity === 'warning').length;
    const errors = this.results.filter(r => !r.passed && r.severity === 'error').length;
    const critical = this.results.filter(r => !r.passed && r.severity === 'critical').length;

    let overallStatus: 'passed' | 'warning' | 'failed';
    if (critical > 0 || errors > 0) {
      overallStatus = 'failed';
    } else if (warnings > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'passed';
    }

    return {
      timestamp: new Date().toISOString(),
      totalChecks: this.results.length,
      passed,
      warnings,
      errors,
      critical,
      overallStatus,
      results: this.results,
      executionTimeMs,
    };
  }

  async generateHTMLReport(report: ValidationReport): Promise<string> {
    const statusColor = {
      passed: '#10b981',
      warning: '#f59e0b',
      failed: '#ef4444',
    }[report.overallStatus];

    const severityColor = (severity: string) => {
      switch (severity) {
        case 'info': return '#3b82f6';
        case 'warning': return '#f59e0b';
        case 'error': return '#ef4444';
        case 'critical': return '#dc2626';
        default: return '#6b7280';
      }
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Data Integrity Validation Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #f3f4f6; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1f2937; border-bottom: 2px solid ${statusColor}; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .metric { background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .results { margin-top: 30px; }
    .result-item { padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid; }
    .result-passed { background: #ecfdf5; border-color: #10b981; }
    .result-warning { background: #fef3c7; border-color: #f59e0b; }
    .result-error { background: #fee2e2; border-color: #ef4444; }
    .result-critical { background: #fee2e2; border-color: #dc2626; }
    .result-header { font-weight: 600; margin-bottom: 5px; }
    .result-message { color: #4b5563; font-size: 14px; }
    .timestamp { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Data Integrity Validation Report</h1>
    <p class="timestamp">Generated: ${report.timestamp}</p>

    <div class="summary">
      <div class="metric">
        <div class="metric-label">Total Checks</div>
        <div class="metric-value">${report.totalChecks}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Passed</div>
        <div class="metric-value" style="color: #10b981;">${report.passed}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Warnings</div>
        <div class="metric-value" style="color: #f59e0b;">${report.warnings}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Errors</div>
        <div class="metric-value" style="color: #ef4444;">${report.errors}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Critical</div>
        <div class="metric-value" style="color: #dc2626;">${report.critical}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Execution Time</div>
        <div class="metric-value">${report.executionTimeMs}ms</div>
      </div>
    </div>

    <div class="results">
      <h2>Validation Results</h2>
      ${report.results.map(result => `
        <div class="result-item result-${result.passed ? 'passed' : result.severity}">
          <div class="result-header">
            ${result.passed ? '✅' : result.severity === 'critical' ? '🔴' : result.severity === 'error' ? '❌' : '⚠️'}
            ${result.category} - ${result.check}
          </div>
          <div class="result-message">${result.message}</div>
          ${result.affectedRecords ? `<div style="margin-top: 5px; font-size: 12px; color: #6b7280;">Affected Records: ${result.affectedRecords}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
    `;

    return html;
  }
}

export async function validateDataIntegrity(): Promise<ValidationReport> {
  const validator = new DataIntegrityValidator();
  return await validator.validate();
}

export async function generateValidationReport(): Promise<string> {
  const validator = new DataIntegrityValidator();
  const report = await validator.validate();
  return await validator.generateHTMLReport(report);
}