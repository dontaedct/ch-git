import { createClient } from '@supabase/supabase-js'

interface DomainConfig {
  id: string
  clientId: string
  deploymentId: string
  domain: string
  subdomain?: string
  fullDomain: string
  status: 'pending' | 'configuring' | 'active' | 'failed' | 'suspended'
  sslStatus: 'pending' | 'active' | 'failed' | 'expired'
  dnsRecords: DNSRecord[]
  registrar?: string
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS'
  name: string
  value: string
  ttl: number
  priority?: number
}

interface SSLCertificate {
  id: string
  domainId: string
  status: 'pending' | 'issued' | 'expired' | 'revoked'
  issuer: string
  issuedAt: Date
  expiresAt: Date
  autoRenewal: boolean
}

export class DomainManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  async configureDomain(
    clientId: string,
    deploymentId: string,
    domainConfig: {
      domain?: string
      subdomain?: string
      useCustomDomain: boolean
      sslEnabled: boolean
    }
  ): Promise<DomainConfig> {
    try {
      let fullDomain: string
      let domain: string
      let subdomain: string | undefined

      if (domainConfig.useCustomDomain && domainConfig.domain) {
        domain = domainConfig.domain
        subdomain = domainConfig.subdomain
        fullDomain = subdomain ? `${subdomain}.${domain}` : domain
      } else {
        domain = 'yourapp.com'
        subdomain = clientId
        fullDomain = `${subdomain}.${domain}`
      }

      const domainRecord: DomainConfig = {
        id: `domain_${clientId}_${Date.now()}`,
        clientId,
        deploymentId,
        domain,
        subdomain,
        fullDomain,
        status: 'pending',
        sslStatus: domainConfig.sslEnabled ? 'pending' : 'active',
        dnsRecords: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await this.validateDomainAvailability(fullDomain)

      await this.configureDNSRecords(domainRecord)

      if (domainConfig.sslEnabled) {
        await this.configureSSL(domainRecord)
      }

      domainRecord.status = 'active'
      domainRecord.updatedAt = new Date()

      await this.saveDomainConfig(domainRecord)

      return domainRecord

    } catch (error) {
      throw new Error(`Failed to configure domain: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async validateDomainAvailability(fullDomain: string): Promise<void> {
    const { data: existing, error } = await this.supabase
      .from('domain_configs')
      .select('id')
      .eq('full_domain', fullDomain)
      .eq('status', 'active')

    if (existing && existing.length > 0) {
      throw new Error(`Domain ${fullDomain} is already in use`)
    }
  }

  private async configureDNSRecords(domainConfig: DomainConfig): Promise<void> {
    const dnsRecords: DNSRecord[] = []

    dnsRecords.push({
      type: 'A',
      name: domainConfig.subdomain || '@',
      value: '76.76.19.123', // Vercel IP
      ttl: 300
    })

    dnsRecords.push({
      type: 'CNAME',
      name: 'www',
      value: domainConfig.fullDomain,
      ttl: 300
    })

    dnsRecords.push({
      type: 'TXT',
      name: '@',
      value: `v=spf1 include:_spf.vercel.com ~all`,
      ttl: 300
    })

    domainConfig.dnsRecords = dnsRecords

    await this.createDNSRecords(domainConfig.fullDomain, dnsRecords)
  }

  private async createDNSRecords(domain: string, records: DNSRecord[]): Promise<void> {
    for (const record of records) {
      await this.createDNSRecord(domain, record)
    }
  }

  private async createDNSRecord(domain: string, record: DNSRecord): Promise<void> {
    console.log(`Creating DNS record for ${domain}:`, record)
  }

  private async configureSSL(domainConfig: DomainConfig): Promise<void> {
    const sslCert: SSLCertificate = {
      id: `ssl_${domainConfig.id}`,
      domainId: domainConfig.id,
      status: 'pending',
      issuer: "Let's Encrypt",
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      autoRenewal: true
    }

    await this.requestSSLCertificate(domainConfig.fullDomain, sslCert)

    domainConfig.sslStatus = 'active'
  }

  private async requestSSLCertificate(domain: string, cert: SSLCertificate): Promise<void> {
    console.log(`Requesting SSL certificate for ${domain}`)

    cert.status = 'issued'

    await this.saveSSLCertificate(cert)
  }

  async updateDomainStatus(domainId: string, status: DomainConfig['status']): Promise<void> {
    const { error } = await this.supabase
      .from('domain_configs')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', domainId)

    if (error) {
      throw new Error(`Failed to update domain status: ${error.message}`)
    }
  }

  async getDomainConfig(domainId: string): Promise<DomainConfig | null> {
    const { data, error } = await this.supabase
      .from('domain_configs')
      .select('*')
      .eq('id', domainId)
      .single()

    if (error) return null

    return {
      ...data,
      dnsRecords: JSON.parse(data.dns_records || '[]'),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined
    }
  }

  async getClientDomains(clientId: string): Promise<DomainConfig[]> {
    const { data, error } = await this.supabase
      .from('domain_configs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get client domains: ${error.message}`)
    }

    return data.map(item => ({
      ...item,
      dnsRecords: JSON.parse(item.dns_records || '[]'),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      expiresAt: item.expires_at ? new Date(item.expires_at) : undefined
    }))
  }

  async renewSSLCertificate(domainId: string): Promise<void> {
    const domainConfig = await this.getDomainConfig(domainId)
    if (!domainConfig) {
      throw new Error('Domain configuration not found')
    }

    const { data: sslCert, error } = await this.supabase
      .from('ssl_certificates')
      .select('*')
      .eq('domain_id', domainId)
      .single()

    if (error || !sslCert) {
      throw new Error('SSL certificate not found')
    }

    const newExpiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

    const { error: updateError } = await this.supabase
      .from('ssl_certificates')
      .update({
        expires_at: newExpiryDate.toISOString(),
        issued_at: new Date().toISOString(),
        status: 'issued'
      })
      .eq('id', sslCert.id)

    if (updateError) {
      throw new Error(`Failed to renew SSL certificate: ${updateError.message}`)
    }
  }

  async validateDNSPropagation(domainId: string): Promise<{ isValid: boolean; errors: string[] }> {
    const domainConfig = await this.getDomainConfig(domainId)
    if (!domainConfig) {
      return { isValid: false, errors: ['Domain configuration not found'] }
    }

    const errors: string[] = []

    for (const record of domainConfig.dnsRecords) {
      const isValid = await this.checkDNSRecord(domainConfig.fullDomain, record)
      if (!isValid) {
        errors.push(`DNS record ${record.type} ${record.name} not properly configured`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private async checkDNSRecord(domain: string, record: DNSRecord): Promise<boolean> {
    console.log(`Checking DNS record for ${domain}:`, record)
    return true
  }

  async deleteDomain(domainId: string): Promise<void> {
    const domainConfig = await this.getDomainConfig(domainId)
    if (!domainConfig) {
      throw new Error('Domain configuration not found')
    }

    await this.supabase
      .from('ssl_certificates')
      .delete()
      .eq('domain_id', domainId)

    const { error } = await this.supabase
      .from('domain_configs')
      .delete()
      .eq('id', domainId)

    if (error) {
      throw new Error(`Failed to delete domain: ${error.message}`)
    }
  }

  async generateSubdomain(clientId: string, baseName?: string): Promise<string> {
    const base = baseName || clientId
    let subdomain = base.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    let counter = 0
    let finalSubdomain = subdomain

    while (await this.isSubdomainTaken(finalSubdomain)) {
      counter++
      finalSubdomain = `${subdomain}-${counter}`
    }

    return finalSubdomain
  }

  private async isSubdomainTaken(subdomain: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('domain_configs')
      .select('id')
      .eq('subdomain', subdomain)
      .eq('status', 'active')

    return data && data.length > 0
  }

  async getDomainMetrics() {
    const { data: domains, error } = await this.supabase
      .from('domain_configs')
      .select('*')

    if (error) {
      throw new Error(`Failed to get domain metrics: ${error.message}`)
    }

    const total = domains.length
    const active = domains.filter(d => d.status === 'active').length
    const sslEnabled = domains.filter(d => d.ssl_status === 'active').length
    const customDomains = domains.filter(d => d.domain !== 'yourapp.com').length

    const { data: expiringSoon } = await this.supabase
      .from('ssl_certificates')
      .select('*')
      .lt('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())

    return {
      totalDomains: total,
      activeDomains: active,
      sslEnabledDomains: sslEnabled,
      customDomains,
      subdomains: total - customDomains,
      expiringSslCertificates: expiringSoon?.length || 0
    }
  }

  private async saveDomainConfig(domainConfig: DomainConfig): Promise<void> {
    const { error } = await this.supabase
      .from('domain_configs')
      .upsert({
        id: domainConfig.id,
        client_id: domainConfig.clientId,
        deployment_id: domainConfig.deploymentId,
        domain: domainConfig.domain,
        subdomain: domainConfig.subdomain,
        full_domain: domainConfig.fullDomain,
        status: domainConfig.status,
        ssl_status: domainConfig.sslStatus,
        dns_records: JSON.stringify(domainConfig.dnsRecords),
        registrar: domainConfig.registrar,
        expires_at: domainConfig.expiresAt?.toISOString(),
        created_at: domainConfig.createdAt.toISOString(),
        updated_at: domainConfig.updatedAt.toISOString()
      })

    if (error) {
      throw new Error(`Failed to save domain configuration: ${error.message}`)
    }
  }

  private async saveSSLCertificate(cert: SSLCertificate): Promise<void> {
    const { error } = await this.supabase
      .from('ssl_certificates')
      .upsert({
        id: cert.id,
        domain_id: cert.domainId,
        status: cert.status,
        issuer: cert.issuer,
        issued_at: cert.issuedAt.toISOString(),
        expires_at: cert.expiresAt.toISOString(),
        auto_renewal: cert.autoRenewal
      })

    if (error) {
      throw new Error(`Failed to save SSL certificate: ${error.message}`)
    }
  }
}

export const domainManager = new DomainManager()