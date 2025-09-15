import {
  Template,
  TemplateVersion,
  VersionedTemplate,
  VersionChange,
  CompatibilityInfo,
  Migration
} from '../core/types'

export interface VersionCreateOptions {
  changes?: VersionChange[]
  breaking?: boolean
  rollbackPoint?: boolean
  description?: string
}

export interface VersionRollbackOptions {
  targetVersion: string
  force?: boolean
  preserveData?: boolean
}

export interface VersionComparisonResult {
  differences: VersionDifference[]
  compatibility: CompatibilityInfo
  migrationRequired: boolean
}

export interface VersionDifference {
  path: string
  type: 'added' | 'modified' | 'removed'
  oldValue?: any
  newValue?: any
  impact: 'breaking' | 'feature' | 'fix' | 'style'
}

export class TemplateVersionManager {
  private templates: Map<string, Template> = new Map()
  private versions: Map<string, TemplateVersion[]> = new Map()
  private migrations: Map<string, Migration[]> = new Map()

  async createVersion(template: Template, options: VersionCreateOptions = {}): Promise<TemplateVersion> {
    const existingVersions = this.versions.get(template.id) || []
    const currentVersion = this.parseVersion(template.version)

    // Determine next version number
    let nextVersion: string
    if (options.breaking) {
      nextVersion = `${currentVersion.major + 1}.0.0`
    } else if (options.changes?.some(c => c.impact === 'feature')) {
      nextVersion = `${currentVersion.major}.${currentVersion.minor + 1}.0`
    } else {
      nextVersion = `${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch + 1}`
    }

    // Create version record
    const version: TemplateVersion = {
      version: nextVersion,
      timestamp: new Date(),
      changes: options.changes || this.detectChanges(template, existingVersions),
      compatibility: this.calculateCompatibility(template, existingVersions),
      rollbackPoint: options.rollbackPoint || false
    }

    // Store version
    existingVersions.push(version)
    this.versions.set(template.id, existingVersions)

    // Update template version
    const versionedTemplate = {
      ...template,
      version: nextVersion,
      metadata: {
        ...template.metadata,
        version: nextVersion,
        updatedAt: new Date()
      }
    }

    this.templates.set(template.id, versionedTemplate)

    return version
  }

  async getVersionHistory(templateId: string): Promise<TemplateVersion[]> {
    return this.versions.get(templateId) || []
  }

  async getVersion(templateId: string, version: string): Promise<TemplateVersion | null> {
    const versions = this.versions.get(templateId) || []
    return versions.find(v => v.version === version) || null
  }

  async rollbackTemplate(templateId: string, options: VersionRollbackOptions): Promise<Template> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const targetVersion = await this.getVersion(templateId, options.targetVersion)
    if (!targetVersion) {
      throw new Error(`Version not found: ${options.targetVersion}`)
    }

    // Check if rollback is safe
    if (!options.force && !this.isRollbackSafe(template.version, options.targetVersion)) {
      throw new Error(`Rollback from ${template.version} to ${options.targetVersion} may cause data loss. Use force option to proceed.`)
    }

    // Create rollback template
    const rolledBackTemplate: Template = {
      ...template,
      version: options.targetVersion,
      metadata: {
        ...template.metadata,
        version: options.targetVersion,
        updatedAt: new Date()
      }
    }

    // Apply migrations if needed
    const migrations = await this.getMigrationsForRollback(template.version, options.targetVersion)
    if (migrations.length > 0) {
      for (const migration of migrations) {
        await this.applyMigration(rolledBackTemplate, migration)
      }
    }

    this.templates.set(templateId, rolledBackTemplate)
    return rolledBackTemplate
  }

  async compareVersions(templateId: string, version1: string, version2: string): Promise<VersionComparisonResult> {
    const v1 = await this.getVersion(templateId, version1)
    const v2 = await this.getVersion(templateId, version2)

    if (!v1 || !v2) {
      throw new Error('One or both versions not found')
    }

    const differences = this.calculateDifferences(v1, v2)
    const compatibility = this.calculateVersionCompatibility(v1, v2)
    const migrationRequired = this.isMigrationRequired(version1, version2)

    return {
      differences,
      compatibility,
      migrationRequired
    }
  }

  async migrateTemplate(templateId: string, targetVersion: string): Promise<Template> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const migrations = await this.getMigrations(template.version, targetVersion)
    let migratedTemplate = { ...template }

    for (const migration of migrations) {
      migratedTemplate = await this.applyMigration(migratedTemplate, migration)
    }

    migratedTemplate.version = targetVersion
    migratedTemplate.metadata.version = targetVersion
    migratedTemplate.metadata.updatedAt = new Date()

    this.templates.set(templateId, migratedTemplate)
    return migratedTemplate
  }

  async createMigration(
    fromVersion: string,
    toVersion: string,
    migrationScript: string,
    description: string,
    automatic: boolean = false
  ): Promise<Migration> {
    const migration: Migration = {
      fromVersion,
      toVersion,
      script: migrationScript,
      description,
      automatic
    }

    const key = `${fromVersion}-${toVersion}`
    const existing = this.migrations.get(key) || []
    existing.push(migration)
    this.migrations.set(key, existing)

    return migration
  }

  async getBranchVersions(templateId: string, baseVersion: string): Promise<TemplateVersion[]> {
    const versions = this.versions.get(templateId) || []
    return versions.filter(v => this.isVersionDescendant(v.version, baseVersion))
  }

  async createBranch(templateId: string, branchName: string, fromVersion?: string): Promise<Template> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const baseVersion = fromVersion || template.version
    const branchTemplate: Template = {
      ...template,
      id: `${templateId}_${branchName}`,
      name: `${template.name} (${branchName})`,
      version: `${baseVersion}-${branchName}`,
      metadata: {
        ...template.metadata,
        id: `${templateId}_${branchName}`,
        name: `${template.name} (${branchName})`,
        version: `${baseVersion}-${branchName}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    this.templates.set(branchTemplate.id, branchTemplate)
    return branchTemplate
  }

  async mergeBranch(templateId: string, branchId: string): Promise<Template> {
    const mainTemplate = this.templates.get(templateId)
    const branchTemplate = this.templates.get(branchId)

    if (!mainTemplate || !branchTemplate) {
      throw new Error('Template or branch not found')
    }

    // Simple merge strategy - overwrites main with branch changes
    const mergedTemplate: Template = {
      ...mainTemplate,
      content: branchTemplate.content,
      schema: branchTemplate.schema,
      metadata: {
        ...mainTemplate.metadata,
        updatedAt: new Date()
      }
    }

    // Create new version for the merge
    await this.createVersion(mergedTemplate, {
      changes: [{
        type: 'modified',
        path: 'merged',
        description: `Merged branch ${branchId}`,
        impact: 'feature'
      }],
      description: `Merged branch ${branchId}`
    })

    return mergedTemplate
  }

  private parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version.split('.').map(Number)
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    }
  }

  private detectChanges(template: Template, existingVersions: TemplateVersion[]): VersionChange[] {
    if (existingVersions.length === 0) {
      return [{
        type: 'added',
        path: 'template',
        description: 'Initial template creation',
        impact: 'feature'
      }]
    }

    // In a real implementation, this would compare with the previous version
    // For now, return a generic change
    return [{
      type: 'modified',
      path: 'template',
      description: 'Template updated',
      impact: 'feature'
    }]
  }

  private calculateCompatibility(template: Template, existingVersions: TemplateVersion[]): CompatibilityInfo {
    if (existingVersions.length === 0) {
      return {
        minVersion: template.version,
        maxVersion: template.version,
        breaking: false,
        migrations: []
      }
    }

    const lastVersion = existingVersions[existingVersions.length - 1]
    return {
      minVersion: lastVersion.version,
      maxVersion: template.version,
      breaking: false,
      migrations: []
    }
  }

  private calculateDifferences(v1: TemplateVersion, v2: TemplateVersion): VersionDifference[] {
    const differences: VersionDifference[] = []

    // Compare changes between versions
    const allChanges = [...(v1.changes || []), ...(v2.changes || [])]
    const changePaths = new Set(allChanges.map(c => c.path))

    changePaths.forEach(path => {
      const v1Changes = v1.changes?.filter(c => c.path === path) || []
      const v2Changes = v2.changes?.filter(c => c.path === path) || []

      if (v1Changes.length !== v2Changes.length) {
        differences.push({
          path,
          type: 'modified',
          impact: 'feature'
        })
      }
    })

    return differences
  }

  private calculateVersionCompatibility(v1: TemplateVersion, v2: TemplateVersion): CompatibilityInfo {
    const version1 = this.parseVersion(v1.version)
    const version2 = this.parseVersion(v2.version)

    const breaking = version1.major !== version2.major

    return {
      minVersion: v1.version,
      maxVersion: v2.version,
      breaking,
      migrations: []
    }
  }

  private isMigrationRequired(fromVersion: string, toVersion: string): boolean {
    const from = this.parseVersion(fromVersion)
    const to = this.parseVersion(toVersion)

    // Migration required for major version changes
    return from.major !== to.major
  }

  private isRollbackSafe(currentVersion: string, targetVersion: string): boolean {
    const current = this.parseVersion(currentVersion)
    const target = this.parseVersion(targetVersion)

    // Generally safe to rollback within the same major version
    return current.major === target.major
  }

  private async getMigrations(fromVersion: string, toVersion: string): Promise<Migration[]> {
    const key = `${fromVersion}-${toVersion}`
    return this.migrations.get(key) || []
  }

  private async getMigrationsForRollback(fromVersion: string, toVersion: string): Promise<Migration[]> {
    // For rollbacks, we need reverse migrations
    const key = `${toVersion}-${fromVersion}`
    return this.migrations.get(key) || []
  }

  private async applyMigration(template: Template, migration: Migration): Promise<Template> {
    // In a real implementation, this would execute the migration script
    // For now, just return the template unchanged
    console.log(`Applying migration: ${migration.description}`)
    return template
  }

  private isVersionDescendant(version: string, baseVersion: string): boolean {
    return version.startsWith(baseVersion)
  }

  // Utility methods for version management
  async getLatestVersion(templateId: string): Promise<TemplateVersion | null> {
    const versions = this.versions.get(templateId) || []
    if (versions.length === 0) return null

    return versions.reduce((latest, current) => {
      const latestParsed = this.parseVersion(latest.version)
      const currentParsed = this.parseVersion(current.version)

      if (currentParsed.major > latestParsed.major) return current
      if (currentParsed.major === latestParsed.major && currentParsed.minor > latestParsed.minor) return current
      if (currentParsed.major === latestParsed.major && currentParsed.minor === latestParsed.minor && currentParsed.patch > latestParsed.patch) return current

      return latest
    })
  }

  async getRollbackPoints(templateId: string): Promise<TemplateVersion[]> {
    const versions = this.versions.get(templateId) || []
    return versions.filter(v => v.rollbackPoint)
  }

  async tagVersion(templateId: string, version: string, tag: string): Promise<void> {
    const templateVersion = await this.getVersion(templateId, version)
    if (!templateVersion) {
      throw new Error(`Version not found: ${version}`)
    }

    // In a real implementation, this would store tags
    console.log(`Tagged version ${version} as ${tag}`)
  }

  async getVersionsByTag(templateId: string, tag: string): Promise<TemplateVersion[]> {
    // In a real implementation, this would query tags
    return []
  }

  async isVersionCompatible(templateId: string, version1: string, version2: string): Promise<boolean> {
    const comparison = await this.compareVersions(templateId, version1, version2)
    return !comparison.compatibility.breaking
  }

  async getVersionDependencies(templateId: string, version: string): Promise<string[]> {
    const templateVersion = await this.getVersion(templateId, version)
    if (!templateVersion) {
      return []
    }

    // Extract dependencies from changes and compatibility info
    const dependencies: string[] = []

    templateVersion.changes?.forEach(change => {
      if (change.path.includes('inheritance') || change.path.includes('branding')) {
        dependencies.push(change.path)
      }
    })

    return dependencies
  }
}