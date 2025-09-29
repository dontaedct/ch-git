/**
 * N8N Workflow Integration System
 * Provides seamless integration with N8N automation platform for advanced workflow management
 */

export interface N8NCredentials {
  baseUrl: string;
  apiKey: string;
  username?: string;
  password?: string;
  webhookUrl?: string;
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  versionId: string;
  nodes: N8NNode[];
  connections: Record<string, N8NConnection[]>;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
  disabled?: boolean;
}

export interface N8NConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8NExecution {
  id: string;
  workflowId: string;
  mode: 'manual' | 'trigger' | 'webhook' | 'cli';
  retryOf?: string;
  retrySuccessId?: string;
  status: 'running' | 'success' | 'error' | 'canceled' | 'waiting';
  startedAt: string;
  stoppedAt?: string;
  workflowData: Partial<N8NWorkflow>;
  data?: {
    resultData: {
      runData: Record<string, any>;
      lastNodeExecuted?: string;
      error?: {
        message: string;
        name: string;
        stack?: string;
        node?: {
          name: string;
          type: string;
        };
      };
    };
  };
}

export interface N8NWebhook {
  workflowId: string;
  webhookId: string;
  node: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  isFullPath: boolean;
}

export interface N8NCredentialType {
  name: string;
  displayName: string;
  properties: Array<{
    displayName: string;
    name: string;
    type: string;
    required?: boolean;
    default?: any;
    description?: string;
  }>;
  authenticate?: Record<string, any>;
  test?: Record<string, any>;
}

/**
 * N8N Integration Manager
 */
export class N8NIntegration {
  private credentials: N8NCredentials;
  private apiClient: N8NAPIClient;

  constructor(credentials: N8NCredentials) {
    this.credentials = credentials;
    this.apiClient = new N8NAPIClient(credentials);
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8NWorkflow[]> {
    return this.apiClient.get('/workflows');
  }

  /**
   * Get specific workflow by ID
   */
  async getWorkflow(id: string): Promise<N8NWorkflow> {
    return this.apiClient.get(`/workflows/${id}`);
  }

  /**
   * Create new workflow
   */
  async createWorkflow(workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> {
    return this.apiClient.post('/workflows', workflow);
  }

  /**
   * Update existing workflow
   */
  async updateWorkflow(id: string, workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> {
    return this.apiClient.put(`/workflows/${id}`, workflow);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string): Promise<boolean> {
    await this.apiClient.delete(`/workflows/${id}`);
    return true;
  }

  /**
   * Activate/deactivate workflow
   */
  async toggleWorkflow(id: string, active: boolean): Promise<N8NWorkflow> {
    return this.apiClient.patch(`/workflows/${id}`, { active });
  }

  /**
   * Execute workflow manually
   */
  async executeWorkflow(id: string, data?: Record<string, any>): Promise<N8NExecution> {
    return this.apiClient.post(`/workflows/${id}/execute`, { data });
  }

  /**
   * Get workflow executions
   */
  async getExecutions(workflowId?: string, limit = 50): Promise<N8NExecution[]> {
    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId);
    params.append('limit', limit.toString());

    return this.apiClient.get(`/executions?${params.toString()}`);
  }

  /**
   * Get specific execution details
   */
  async getExecution(id: string): Promise<N8NExecution> {
    return this.apiClient.get(`/executions/${id}`);
  }

  /**
   * Stop running execution
   */
  async stopExecution(id: string): Promise<N8NExecution> {
    return this.apiClient.post(`/executions/${id}/stop`);
  }

  /**
   * Retry failed execution
   */
  async retryExecution(id: string): Promise<N8NExecution> {
    return this.apiClient.post(`/executions/${id}/retry`);
  }

  /**
   * Get available node types
   */
  async getNodeTypes(): Promise<any[]> {
    return this.apiClient.get('/node-types');
  }

  /**
   * Get workflow webhooks
   */
  async getWebhooks(workflowId?: string): Promise<N8NWebhook[]> {
    const params = workflowId ? `?workflowId=${workflowId}` : '';
    return this.apiClient.get(`/webhooks${params}`);
  }

  /**
   * Create workflow from template
   */
  async createFromTemplate(templateId: string, name: string): Promise<N8NWorkflow> {
    const template = await this.getTemplate(templateId);
    const workflow = {
      name,
      nodes: template.nodes,
      connections: template.connections,
      active: false,
      tags: ['template', templateId]
    };
    return this.createWorkflow(workflow);
  }

  /**
   * Get workflow template (internal method)
   */
  private async getTemplate(templateId: string): Promise<Partial<N8NWorkflow>> {
    // In real implementation, this would fetch from N8N template repository
    // For now, return basic templates
    return this.getWorkflowTemplates()[templateId] || this.getWorkflowTemplates()['basic-webhook'];
  }

  /**
   * Export workflow as JSON
   */
  async exportWorkflow(id: string): Promise<string> {
    const workflow = await this.getWorkflow(id);
    return JSON.stringify(workflow, null, 2);
  }

  /**
   * Import workflow from JSON
   */
  async importWorkflow(workflowJson: string, name?: string): Promise<N8NWorkflow> {
    const workflow = JSON.parse(workflowJson);
    if (name) {
      workflow.name = name;
    }
    delete workflow.id; // Remove ID for new workflow
    return this.createWorkflow(workflow);
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(id: string, days = 30): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    avgExecutionTime: number;
    lastExecution?: string;
  }> {
    const executions = await this.getExecutions(id, 1000);
    const recentExecutions = executions.filter(exec => {
      const execDate = new Date(exec.startedAt);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      return execDate > cutoffDate;
    });

    const successful = recentExecutions.filter(exec => exec.status === 'success');
    const failed = recentExecutions.filter(exec => exec.status === 'error');

    const executionTimes = recentExecutions
      .filter(exec => exec.stoppedAt)
      .map(exec => new Date(exec.stoppedAt!).getTime() - new Date(exec.startedAt).getTime());

    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;

    return {
      totalExecutions: recentExecutions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      avgExecutionTime,
      lastExecution: recentExecutions[0]?.startedAt
    };
  }

  /**
   * Monitor workflow health
   */
  async monitorWorkflowHealth(id: string): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    suggestions: string[];
  }> {
    const stats = await this.getWorkflowStats(id, 7);
    const workflow = await this.getWorkflow(id);

    const issues: string[] = [];
    const suggestions: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check error rate
    const errorRate = stats.totalExecutions > 0
      ? stats.failedExecutions / stats.totalExecutions
      : 0;

    if (errorRate > 0.1) {
      status = 'critical';
      issues.push(`High error rate: ${Math.round(errorRate * 100)}%`);
      suggestions.push('Review failed executions and fix workflow logic');
    } else if (errorRate > 0.05) {
      status = 'warning';
      issues.push(`Moderate error rate: ${Math.round(errorRate * 100)}%`);
      suggestions.push('Monitor error patterns and consider improvements');
    }

    // Check execution frequency
    if (workflow.active && stats.totalExecutions === 0) {
      status = 'warning';
      issues.push('No recent executions despite being active');
      suggestions.push('Check trigger configuration and webhook endpoints');
    }

    // Check execution time
    if (stats.avgExecutionTime > 300000) { // 5 minutes
      if (status === 'healthy') status = 'warning';
      issues.push(`Long execution time: ${Math.round(stats.avgExecutionTime / 1000)}s`);
      suggestions.push('Optimize workflow performance and reduce processing time');
    }

    return { status, issues, suggestions };
  }

  /**
   * Get predefined workflow templates
   */
  getWorkflowTemplates(): Record<string, Partial<N8NWorkflow>> {
    return {
      'basic-webhook': {
        name: 'Basic Webhook Handler',
        nodes: [
          {
            id: '1',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              httpMethod: 'POST',
              path: 'webhook',
              responseMode: 'onReceived'
            }
          },
          {
            id: '2',
            name: 'Set Response',
            type: 'n8n-nodes-base.set',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              values: {
                string: [
                  {
                    name: 'message',
                    value: 'Webhook received successfully'
                  }
                ]
              }
            }
          }
        ],
        connections: {
          'Webhook': {
            main: [
              [
                {
                  node: 'Set Response',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        }
      },
      'form-to-email': {
        name: 'Form Submission to Email',
        nodes: [
          {
            id: '1',
            name: 'Form Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              httpMethod: 'POST',
              path: 'form-submission'
            }
          },
          {
            id: '2',
            name: 'Send Email',
            type: 'n8n-nodes-base.emailSend',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              to: '={{$node["Form Webhook"].json["email"]}}',
              subject: 'Thank you for your submission',
              message: 'We have received your form submission and will get back to you soon.'
            }
          }
        ],
        connections: {
          'Form Webhook': {
            main: [
              [
                {
                  node: 'Send Email',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        }
      },
      'data-sync': {
        name: 'Database Sync Workflow',
        nodes: [
          {
            id: '1',
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              rule: {
                interval: [
                  {
                    field: 'hours',
                    value: 1
                  }
                ]
              }
            }
          },
          {
            id: '2',
            name: 'Source Database',
            type: 'n8n-nodes-base.postgres',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              operation: 'select',
              query: 'SELECT * FROM source_table WHERE updated_at > NOW() - INTERVAL \'1 hour\''
            }
          },
          {
            id: '3',
            name: 'Target Database',
            type: 'n8n-nodes-base.postgres',
            typeVersion: 1,
            position: [650, 300],
            parameters: {
              operation: 'insert',
              schema: 'public',
              table: 'target_table'
            }
          }
        ],
        connections: {
          'Schedule Trigger': {
            main: [
              [
                {
                  node: 'Source Database',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Source Database': {
            main: [
              [
                {
                  node: 'Target Database',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        }
      }
    };
  }
}

/**
 * N8N API Client
 */
class N8NAPIClient {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(credentials: N8NCredentials) {
    this.baseUrl = credentials.baseUrl.replace(/\/$/, '');
    this.apiKey = credentials.apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': this.apiKey
    };
  }

  async get(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post(endpoint: string, data?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async put(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async patch(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'DELETE',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status} ${response.statusText}`);
    }
  }
}

/**
 * N8N Workflow Builder Helper
 */
export class N8NWorkflowBuilder {
  private workflow: Partial<N8NWorkflow>;
  private nodeCounter = 0;

  constructor(name: string) {
    this.workflow = {
      name,
      nodes: [],
      connections: {},
      active: false,
      tags: []
    };
  }

  /**
   * Add node to workflow
   */
  addNode(type: string, name: string, parameters: Record<string, any>, position?: [number, number]): string {
    const nodeId = `node_${++this.nodeCounter}`;

    const node: N8NNode = {
      id: nodeId,
      name,
      type,
      typeVersion: 1,
      position: position || [250 + this.nodeCounter * 200, 300],
      parameters
    };

    this.workflow.nodes!.push(node);
    return nodeId;
  }

  /**
   * Connect two nodes
   */
  connectNodes(fromNode: string, toNode: string, outputIndex = 0): void {
    if (!this.workflow.connections![fromNode]) {
      this.workflow.connections![fromNode] = { main: [] };
    }

    if (!this.workflow.connections![fromNode].main[outputIndex]) {
      this.workflow.connections![fromNode].main[outputIndex] = [];
    }

    this.workflow.connections![fromNode].main[outputIndex].push({
      node: toNode,
      type: 'main',
      index: 0
    });
  }

  /**
   * Add webhook trigger
   */
  addWebhookTrigger(path: string, method = 'POST'): string {
    return this.addNode(
      'n8n-nodes-base.webhook',
      'Webhook Trigger',
      {
        httpMethod: method,
        path,
        responseMode: 'onReceived'
      }
    );
  }

  /**
   * Add schedule trigger
   */
  addScheduleTrigger(interval: { field: string; value: number }): string {
    return this.addNode(
      'n8n-nodes-base.scheduleTrigger',
      'Schedule Trigger',
      {
        rule: {
          interval: [interval]
        }
      }
    );
  }

  /**
   * Add email action
   */
  addEmailAction(to: string, subject: string, message: string): string {
    return this.addNode(
      'n8n-nodes-base.emailSend',
      'Send Email',
      {
        to,
        subject,
        message
      }
    );
  }

  /**
   * Add HTTP request action
   */
  addHttpRequest(url: string, method = 'POST', body?: any): string {
    const parameters: Record<string, any> = {
      url,
      requestMethod: method
    };

    if (body) {
      parameters.sendBody = true;
      parameters.bodyParameters = {
        parameters: Object.entries(body).map(([name, value]) => ({ name, value }))
      };
    }

    return this.addNode(
      'n8n-nodes-base.httpRequest',
      'HTTP Request',
      parameters
    );
  }

  /**
   * Add database operation
   */
  addDatabaseOperation(operation: string, query?: string, table?: string): string {
    const parameters: Record<string, any> = { operation };

    if (query) parameters.query = query;
    if (table) parameters.table = table;

    return this.addNode(
      'n8n-nodes-base.postgres',
      'Database Operation',
      parameters
    );
  }

  /**
   * Set workflow tags
   */
  setTags(tags: string[]): this {
    this.workflow.tags = tags;
    return this;
  }

  /**
   * Set workflow as active
   */
  setActive(active: boolean): this {
    this.workflow.active = active;
    return this;
  }

  /**
   * Build and return the workflow
   */
  build(): Partial<N8NWorkflow> {
    return { ...this.workflow };
  }
}

/**
 * Utility functions for N8N integration
 */
export const N8NUtils = {
  /**
   * Validate N8N connection
   */
  async validateConnection(credentials: N8NCredentials): Promise<boolean> {
    try {
      const client = new N8NAPIClient(credentials);
      await client.get('/workflows');
      return true;
    } catch (error) {
      console.error('N8N connection validation failed:', error);
      return false;
    }
  },

  /**
   * Generate webhook URL
   */
  generateWebhookUrl(baseUrl: string, path: string): string {
    return `${baseUrl.replace(/\/$/, '')}/webhook/${path}`;
  },

  /**
   * Parse N8N node expression
   */
  parseExpression(expression: string, data: Record<string, any>): any {
    // Simplified expression parser - in real implementation, use N8N's expression parser
    if (!expression.startsWith('={{') || !expression.endsWith('}}')) {
      return expression;
    }

    const expr = expression.slice(3, -2);

    try {
      // Basic support for $node["NodeName"].json["field"] syntax
      const nodeMatch = expr.match(/\$node\["([^"]+)"\]\.json(?:\["([^"]+)"\])?/);
      if (nodeMatch) {
        const [, nodeName, field] = nodeMatch;
        const nodeData = data[nodeName];
        return field ? nodeData?.[field] : nodeData;
      }

      // Basic support for $json["field"] syntax
      const jsonMatch = expr.match(/\$json\["([^"]+)"\]/);
      if (jsonMatch) {
        const [, field] = jsonMatch;
        return data[field];
      }

      return expression;
    } catch (error) {
      console.error('Error parsing N8N expression:', error);
      return expression;
    }
  },

  /**
   * Convert form data to N8N webhook format
   */
  formatWebhookData(formData: Record<string, any>): Record<string, any> {
    return {
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Agency-Toolkit/1.0'
      },
      params: {},
      query: {},
      body: formData
    };
  }
};

// Export singleton instance factory
export function createN8NIntegration(credentials: N8NCredentials): N8NIntegration {
  return new N8NIntegration(credentials);
}