import { createClient } from '@supabase/supabase-js'
import { deploymentPipeline, AutomatedDeploymentPipeline } from './deployment-pipeline'

interface ClientDeploymentRequest {
  clientId: string
  templateId: string
  customizations: {
    branding: {
      primaryColor: string
      secondaryColor: string
      logo?: string
      companyName: string
    }
    features: Record<string, boolean>
    integrations: Record<string, any>
    content: Record<string, string>
  }
  deployment: {
    environment: 'staging' | 'production'
    subdomain?: string
    customDomain?: string
    sslEnabled: boolean
  }
  metadata: {
    projectName: string
    description?: string
    tags: string[]
  }
}

interface DeploymentResult {
  deploymentId: string
  status: 'success' | 'failed' | 'pending'
  deploymentUrl?: string
  stagingUrl?: string
  error?: string
  estimatedCompletionTime?: Date
}

export class ClientDeploymentEngine {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  private pipeline: AutomatedDeploymentPipeline

  constructor() {
    this.pipeline = deploymentPipeline
  }

  async deployClientApp(request: ClientDeploymentRequest): Promise<DeploymentResult> {
    try {
      await this.validateDeploymentRequest(request)

      const deploymentConfig = await this.prepareDeploymentConfig(request)

      const pipeline = await this.pipeline.createDeployment(deploymentConfig)

      this.executeDeploymentAsync(pipeline.id)

      return {
        deploymentId: pipeline.id,
        status: 'pending',
        estimatedCompletionTime: this.calculateEstimatedCompletion()
      }

    } catch (error) {
      return {
        deploymentId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async validateDeploymentRequest(request: ClientDeploymentRequest): Promise<void> {
    const { data: client, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', request.clientId)
      .single()

    if (error || !client) {
      throw new Error('Client not found')
    }

    if (!request.customizations.branding.companyName) {
      throw new Error('Company name is required')
    }

    if (!request.deployment.subdomain && !request.deployment.customDomain) {
      throw new Error('Either subdomain or custom domain is required')
    }

    if (request.deployment.subdomain) {
      const isSubdomainAvailable = await this.checkSubdomainAvailability(request.deployment.subdomain)
      if (!isSubdomainAvailable) {
        throw new Error('Subdomain is already taken')
      }
    }
  }

  private async prepareDeploymentConfig(request: ClientDeploymentRequest) {
    return {
      clientId: request.clientId,
      templateId: request.templateId,
      customizations: {
        ...request.customizations,
        deployment: request.deployment,
        metadata: request.metadata
      },
      environment: request.deployment.environment,
      subdomain: request.deployment.subdomain,
      domain: request.deployment.customDomain
    }
  }

  private async executeDeploymentAsync(deploymentId: string): Promise<void> {
    setTimeout(async () => {
      try {
        await this.pipeline.executeDeployment(deploymentId)
        await this.notifyDeploymentComplete(deploymentId)
      } catch (error) {
        await this.notifyDeploymentFailed(deploymentId, error)
      }
    }, 1000)
  }

  private calculateEstimatedCompletion(): Date {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30) // Estimated 30 minutes for deployment
    return now
  }

  async getDeploymentStatus(deploymentId: string): Promise<DeploymentResult> {
    const pipeline = await this.pipeline.getDeploymentPipeline(deploymentId)

    if (!pipeline) {
      return {
        deploymentId,
        status: 'failed',
        error: 'Deployment not found'
      }
    }

    return {
      deploymentId: pipeline.id,
      status: pipeline.status === 'completed' ? 'success' :
              pipeline.status === 'failed' ? 'failed' : 'pending',
      deploymentUrl: pipeline.deploymentUrl,
      stagingUrl: pipeline.config.environment === 'staging' ? pipeline.deploymentUrl : undefined
    }
  }

  async getClientDeployments(clientId: string) {
    return await this.pipeline.getClientDeployments(clientId)
  }

  async redeployClientApp(deploymentId: string): Promise<DeploymentResult> {
    try {
      await this.pipeline.retryDeployment(deploymentId)

      return {
        deploymentId,
        status: 'pending',
        estimatedCompletionTime: this.calculateEstimatedCompletion()
      }
    } catch (error) {
      return {
        deploymentId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async cancelDeployment(deploymentId: string): Promise<void> {
    await this.pipeline.cancelDeployment(deploymentId)
  }

  async createStagingDeployment(request: ClientDeploymentRequest): Promise<DeploymentResult> {
    const stagingRequest = {
      ...request,
      deployment: {
        ...request.deployment,
        environment: 'staging' as const,
        subdomain: `staging-${request.deployment.subdomain || request.clientId}`
      }
    }

    return await this.deployClientApp(stagingRequest)
  }

  async promoteToProduction(stagingDeploymentId: string): Promise<DeploymentResult> {
    const stagingPipeline = await this.pipeline.getDeploymentPipeline(stagingDeploymentId)

    if (!stagingPipeline || stagingPipeline.config.environment !== 'staging') {
      throw new Error('Invalid staging deployment')
    }

    const productionConfig = {
      ...stagingPipeline.config,
      environment: 'production' as const,
      subdomain: stagingPipeline.config.subdomain?.replace('staging-', '') || stagingPipeline.config.clientId
    }

    const productionPipeline = await this.pipeline.createDeployment(productionConfig)

    this.executeDeploymentAsync(productionPipeline.id)

    return {
      deploymentId: productionPipeline.id,
      status: 'pending',
      estimatedCompletionTime: this.calculateEstimatedCompletion()
    }
  }

  private async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('client_deployments')
      .select('id')
      .like('deployment_url', `%${subdomain}%`)
      .eq('status', 'active')

    return !data || data.length === 0
  }

  private async notifyDeploymentComplete(deploymentId: string): Promise<void> {
    const pipeline = await this.pipeline.getDeploymentPipeline(deploymentId)
    if (!pipeline) return

    await this.supabase
      .from('deployment_notifications')
      .insert({
        deployment_id: deploymentId,
        client_id: pipeline.clientId,
        type: 'deployment_complete',
        message: `Deployment completed successfully: ${pipeline.deploymentUrl}`,
        created_at: new Date().toISOString()
      })
  }

  private async notifyDeploymentFailed(deploymentId: string, error: any): Promise<void> {
    const pipeline = await this.pipeline.getDeploymentPipeline(deploymentId)
    if (!pipeline) return

    await this.supabase
      .from('deployment_notifications')
      .insert({
        deployment_id: deploymentId,
        client_id: pipeline.clientId,
        type: 'deployment_failed',
        message: `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        created_at: new Date().toISOString()
      })
  }

  async getDeploymentLogs(deploymentId: string) {
    const pipeline = await this.pipeline.getDeploymentPipeline(deploymentId)
    if (!pipeline) {
      throw new Error('Deployment not found')
    }

    return pipeline.steps.map(step => ({
      stepId: step.id,
      stepName: step.name,
      status: step.status,
      logs: step.logs,
      startTime: step.startTime,
      endTime: step.endTime,
      error: step.error
    }))
  }

  async getDeploymentMetrics() {
    const { data: deployments, error } = await this.supabase
      .from('deployment_pipelines')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw new Error(`Failed to get deployment metrics: ${error.message}`)
    }

    const total = deployments.length
    const successful = deployments.filter(d => d.status === 'completed').length
    const failed = deployments.filter(d => d.status === 'failed').length
    const pending = deployments.filter(d => d.status === 'pending' || d.status === 'running').length

    const averageDeploymentTime = deployments
      .filter(d => d.status === 'completed' && d.completed_at)
      .reduce((sum, d) => {
        const start = new Date(d.created_at).getTime()
        const end = new Date(d.completed_at).getTime()
        return sum + (end - start)
      }, 0) / successful

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageDeploymentTimeMinutes: averageDeploymentTime ? Math.round(averageDeploymentTime / (1000 * 60)) : 0
    }
  }
}

export const clientDeploymentEngine = new ClientDeploymentEngine()