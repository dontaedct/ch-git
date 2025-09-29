import { createClient } from '@supabase/supabase-js'

interface InfrastructureResource {
  id: string
  type: 'database' | 'storage' | 'cdn' | 'api' | 'auth' | 'domain'
  name: string
  status: 'creating' | 'active' | 'inactive' | 'failed' | 'deleting'
  config: Record<string, any>
  clientId: string
  deploymentId: string
  createdAt: Date
  updatedAt: Date
}

interface InfrastructureTemplate {
  id: string
  name: string
  description: string
  resources: {
    type: string
    config: Record<string, any>
    dependencies?: string[]
  }[]
}

interface ClientInfrastructure {
  clientId: string
  resources: InfrastructureResource[]
  status: 'provisioning' | 'ready' | 'error' | 'scaling'
  lastUpdated: Date
}

export class InfrastructureManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  async provisionClientInfrastructure(
    clientId: string,
    deploymentId: string,
    templateId: string,
    customConfig?: Record<string, any>
  ): Promise<ClientInfrastructure> {
    try {
      const template = await this.getInfrastructureTemplate(templateId)

      const infrastructure: ClientInfrastructure = {
        clientId,
        resources: [],
        status: 'provisioning',
        lastUpdated: new Date()
      }

      for (const resourceTemplate of template.resources) {
        const resource = await this.createResource(
          clientId,
          deploymentId,
          resourceTemplate,
          customConfig
        )
        infrastructure.resources.push(resource)
      }

      infrastructure.status = 'ready'
      infrastructure.lastUpdated = new Date()

      await this.saveClientInfrastructure(infrastructure)

      return infrastructure

    } catch (error) {
      throw new Error(`Failed to provision infrastructure: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async createResource(
    clientId: string,
    deploymentId: string,
    template: any,
    customConfig?: Record<string, any>
  ): Promise<InfrastructureResource> {
    const resourceId = `${template.type}_${clientId}_${Date.now()}`

    const resource: InfrastructureResource = {
      id: resourceId,
      type: template.type,
      name: `${clientId}-${template.type}`,
      status: 'creating',
      config: { ...template.config, ...customConfig },
      clientId,
      deploymentId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    switch (template.type) {
      case 'database':
        await this.createDatabaseResource(resource)
        break
      case 'storage':
        await this.createStorageResource(resource)
        break
      case 'cdn':
        await this.createCDNResource(resource)
        break
      case 'api':
        await this.createAPIResource(resource)
        break
      case 'auth':
        await this.createAuthResource(resource)
        break
      case 'domain':
        await this.createDomainResource(resource)
        break
      default:
        throw new Error(`Unknown resource type: ${template.type}`)
    }

    resource.status = 'active'
    resource.updatedAt = new Date()

    await this.saveResource(resource)

    return resource
  }

  private async createDatabaseResource(resource: InfrastructureResource): Promise<void> {
    const dbConfig = {
      name: resource.name,
      region: resource.config.region || 'us-east-1',
      tier: resource.config.tier || 'small',
      version: resource.config.version || '15.0',
      backupEnabled: resource.config.backupEnabled !== false,
      ...resource.config
    }

    resource.config = {
      ...resource.config,
      connectionString: `postgresql://client_${resource.clientId}:${this.generateSecurePassword()}@db.supabase.co:5432/${resource.name}`,
      adminUrl: `https://supabase.com/dashboard/project/${resource.id}`,
      ...dbConfig
    }
  }

  private async createStorageResource(resource: InfrastructureResource): Promise<void> {
    const storageConfig = {
      name: resource.name,
      region: resource.config.region || 'us-east-1',
      buckets: resource.config.buckets || ['public', 'private'],
      maxFileSize: resource.config.maxFileSize || '50MB',
      allowedFileTypes: resource.config.allowedFileTypes || ['image/*', 'application/pdf'],
      ...resource.config
    }

    resource.config = {
      ...resource.config,
      endpoint: `https://${resource.id}.supabase.co/storage/v1`,
      publicUrl: `https://${resource.id}.supabase.co/storage/v1/object/public`,
      ...storageConfig
    }
  }

  private async createCDNResource(resource: InfrastructureResource): Promise<void> {
    const cdnConfig = {
      name: resource.name,
      origin: resource.config.origin,
      cachingPolicy: resource.config.cachingPolicy || 'aggressive',
      compressionEnabled: resource.config.compressionEnabled !== false,
      ...resource.config
    }

    resource.config = {
      ...resource.config,
      distributionUrl: `https://${resource.id}.cloudfront.net`,
      ...cdnConfig
    }
  }

  private async createAPIResource(resource: InfrastructureResource): Promise<void> {
    const apiConfig = {
      name: resource.name,
      version: resource.config.version || 'v1',
      rateLimit: resource.config.rateLimit || 1000,
      authRequired: resource.config.authRequired !== false,
      cors: resource.config.cors !== false,
      ...resource.config
    }

    resource.config = {
      ...resource.config,
      endpoint: `https://api-${resource.clientId}.vercel.app`,
      apiKey: this.generateApiKey(),
      ...apiConfig
    }
  }

  private async createAuthResource(resource: InfrastructureResource): Promise<void> {
    const authConfig = {
      name: resource.name,
      providers: resource.config.providers || ['email', 'google'],
      jwtExpiry: resource.config.jwtExpiry || '1h',
      refreshTokenExpiry: resource.config.refreshTokenExpiry || '30d',
      ...resource.config
    }

    resource.config = {
      ...resource.config,
      authUrl: `https://auth-${resource.clientId}.supabase.co`,
      jwtSecret: this.generateJWTSecret(),
      ...authConfig
    }
  }

  private async createDomainResource(resource: InfrastructureResource): Promise<void> {
    const domainConfig = {
      domain: resource.config.domain,
      subdomain: resource.config.subdomain,
      sslEnabled: resource.config.sslEnabled !== false,
      autoRenewal: resource.config.autoRenewal !== false,
      ...resource.config
    }

    const fullDomain = domainConfig.subdomain
      ? `${domainConfig.subdomain}.${domainConfig.domain}`
      : domainConfig.domain

    resource.config = {
      ...resource.config,
      fullDomain,
      sslCertificate: domainConfig.sslEnabled ? 'auto-generated' : null,
      ...domainConfig
    }
  }

  async getClientInfrastructure(clientId: string): Promise<ClientInfrastructure | null> {
    const { data, error } = await this.supabase
      .from('client_infrastructure')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (error) return null

    const { data: resources } = await this.supabase
      .from('infrastructure_resources')
      .select('*')
      .eq('client_id', clientId)

    return {
      clientId: data.client_id,
      resources: resources || [],
      status: data.status,
      lastUpdated: new Date(data.last_updated)
    }
  }

  async updateResourceStatus(resourceId: string, status: InfrastructureResource['status']): Promise<void> {
    const { error } = await this.supabase
      .from('infrastructure_resources')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId)

    if (error) {
      throw new Error(`Failed to update resource status: ${error.message}`)
    }
  }

  async scaleResource(resourceId: string, scaleConfig: Record<string, any>): Promise<void> {
    const { data: resource, error } = await this.supabase
      .from('infrastructure_resources')
      .select('*')
      .eq('id', resourceId)
      .single()

    if (error || !resource) {
      throw new Error('Resource not found')
    }

    const updatedConfig = {
      ...JSON.parse(resource.config),
      ...scaleConfig
    }

    const { error: updateError } = await this.supabase
      .from('infrastructure_resources')
      .update({
        config: JSON.stringify(updatedConfig),
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId)

    if (updateError) {
      throw new Error(`Failed to scale resource: ${updateError.message}`)
    }
  }

  async deleteClientInfrastructure(clientId: string): Promise<void> {
    const infrastructure = await this.getClientInfrastructure(clientId)
    if (!infrastructure) return

    for (const resource of infrastructure.resources) {
      await this.deleteResource(resource.id)
    }

    const { error } = await this.supabase
      .from('client_infrastructure')
      .delete()
      .eq('client_id', clientId)

    if (error) {
      throw new Error(`Failed to delete client infrastructure: ${error.message}`)
    }
  }

  private async deleteResource(resourceId: string): Promise<void> {
    await this.updateResourceStatus(resourceId, 'deleting')

    const { error } = await this.supabase
      .from('infrastructure_resources')
      .delete()
      .eq('id', resourceId)

    if (error) {
      throw new Error(`Failed to delete resource: ${error.message}`)
    }
  }

  private async getInfrastructureTemplate(templateId: string): Promise<InfrastructureTemplate> {
    const templates: Record<string, InfrastructureTemplate> = {
      'basic': {
        id: 'basic',
        name: 'Basic Infrastructure',
        description: 'Database, storage, and basic API',
        resources: [
          { type: 'database', config: { tier: 'small' } },
          { type: 'storage', config: { buckets: ['public'] } },
          { type: 'api', config: { rateLimit: 500 } }
        ]
      },
      'enterprise': {
        id: 'enterprise',
        name: 'Enterprise Infrastructure',
        description: 'Full infrastructure with CDN, auth, and domain',
        resources: [
          { type: 'database', config: { tier: 'large', backupEnabled: true } },
          { type: 'storage', config: { buckets: ['public', 'private', 'secure'] } },
          { type: 'api', config: { rateLimit: 10000, authRequired: true } },
          { type: 'auth', config: { providers: ['email', 'google', 'github'] } },
          { type: 'cdn', config: { cachingPolicy: 'aggressive' } },
          { type: 'domain', config: { sslEnabled: true } }
        ]
      }
    }

    const template = templates[templateId]
    if (!template) {
      throw new Error(`Infrastructure template ${templateId} not found`)
    }

    return template
  }

  private async saveClientInfrastructure(infrastructure: ClientInfrastructure): Promise<void> {
    const { error } = await this.supabase
      .from('client_infrastructure')
      .upsert({
        client_id: infrastructure.clientId,
        status: infrastructure.status,
        last_updated: infrastructure.lastUpdated.toISOString()
      })

    if (error) {
      throw new Error(`Failed to save client infrastructure: ${error.message}`)
    }
  }

  private async saveResource(resource: InfrastructureResource): Promise<void> {
    const { error } = await this.supabase
      .from('infrastructure_resources')
      .upsert({
        id: resource.id,
        type: resource.type,
        name: resource.name,
        status: resource.status,
        config: JSON.stringify(resource.config),
        client_id: resource.clientId,
        deployment_id: resource.deploymentId,
        created_at: resource.createdAt.toISOString(),
        updated_at: resource.updatedAt.toISOString()
      })

    if (error) {
      throw new Error(`Failed to save resource: ${error.message}`)
    }
  }

  private generateSecurePassword(): string {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
  }

  private generateApiKey(): string {
    return 'sk_' + Math.random().toString(36).slice(-24)
  }

  private generateJWTSecret(): string {
    return Math.random().toString(36).slice(-32)
  }

  async getInfrastructureMetrics() {
    const { data: resources, error } = await this.supabase
      .from('infrastructure_resources')
      .select('*')

    if (error) {
      throw new Error(`Failed to get infrastructure metrics: ${error.message}`)
    }

    const byType = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatus = resources.reduce((acc, resource) => {
      acc[resource.status] = (acc[resource.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalResources: resources.length,
      resourcesByType: byType,
      resourcesByStatus: byStatus,
      activeResources: resources.filter(r => r.status === 'active').length
    }
  }
}

export const infrastructureManager = new InfrastructureManager()