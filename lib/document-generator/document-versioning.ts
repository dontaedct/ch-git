/**
 * Document Versioning and History System
 * 
 * Manages document versions, history tracking, and change management
 * for generated PDF documents.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface DocumentVersion {
  id: string
  documentId: string
  version: number
  templateId: string
  data: any
  generatedAt: string
  generatedBy: string
  filePath: string
  fileSize: number
  changes?: string[]
  metadata: {
    checksum: string
    compressionRatio?: number
    quality: 'low' | 'medium' | 'high'
    format: 'A4' | 'Letter' | 'Legal'
    orientation: 'portrait' | 'landscape'
  }
  tags?: string[]
  notes?: string
}

export interface DocumentHistory {
  documentId: string
  versions: DocumentVersion[]
  currentVersion: number
  createdAt: string
  updatedAt: string
  totalVersions: number
  totalSize: number
}

export interface VersionComparison {
  versionA: DocumentVersion
  versionB: DocumentVersion
  differences: {
    dataChanges: DataChange[]
    templateChanges: TemplateChange[]
    metadataChanges: MetadataChange[]
  }
  summary: {
    hasDataChanges: boolean
    hasTemplateChanges: boolean
    hasMetadataChanges: boolean
    changeCount: number
  }
}

export interface DataChange {
  field: string
  type: 'added' | 'removed' | 'modified'
  oldValue?: any
  newValue?: any
}

export interface TemplateChange {
  field: string
  type: 'added' | 'removed' | 'modified'
  oldValue?: any
  newValue?: any
}

export interface MetadataChange {
  field: string
  type: 'added' | 'removed' | 'modified'
  oldValue?: any
  newValue?: any
}

export interface VersionQuery {
  documentId?: string
  templateId?: string
  generatedBy?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export class DocumentVersioning {
  private storagePath: string
  private historyFile: string

  constructor(storagePath: string = join(process.cwd(), 'document-history')) {
    this.storagePath = storagePath
    this.historyFile = join(storagePath, 'history.json')
    this.initializeStorage()
  }

  /**
   * Initialize storage directory and files
   */
  private initializeStorage(): void {
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true })
    }

    if (!existsSync(this.historyFile)) {
      writeFileSync(this.historyFile, JSON.stringify({}, null, 2))
    }
  }

  /**
   * Create a new document version
   */
  async createVersion(
    documentId: string,
    templateId: string,
    data: any,
    filePath: string,
    generatedBy: string,
    options: {
      changes?: string[]
      tags?: string[]
      notes?: string
      metadata?: Partial<DocumentVersion['metadata']>
    } = {}
  ): Promise<DocumentVersion> {
    const history = await this.loadHistory()
    const documentHistory = history[documentId] || {
      documentId,
      versions: [],
      currentVersion: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalVersions: 0,
      totalSize: 0
    }

    const versionNumber = documentHistory.currentVersion + 1
    const fileSize = this.getFileSize(filePath)
    const checksum = this.calculateChecksum(filePath)

    const version: DocumentVersion = {
      id: uuidv4(),
      documentId,
      version: versionNumber,
      templateId,
      data: { ...data },
      generatedAt: new Date().toISOString(),
      generatedBy,
      filePath,
      fileSize,
      changes: options.changes || [],
      metadata: {
        checksum,
        quality: 'medium',
        format: 'A4',
        orientation: 'portrait',
        ...options.metadata
      },
      tags: options.tags || [],
      notes: options.notes
    }

    // Add version to history
    documentHistory.versions.push(version)
    documentHistory.currentVersion = versionNumber
    documentHistory.updatedAt = new Date().toISOString()
    documentHistory.totalVersions = documentHistory.versions.length
    documentHistory.totalSize += fileSize

    // Save updated history
    history[documentId] = documentHistory
    await this.saveHistory(history)

    console.log(`Document version created: ${documentId} v${versionNumber}`)
    return version
  }

  /**
   * Get document history
   */
  async getDocumentHistory(documentId: string): Promise<DocumentHistory | null> {
    const history = await this.loadHistory()
    return history[documentId] || null
  }

  /**
   * Get specific version
   */
  async getVersion(documentId: string, version: number): Promise<DocumentVersion | null> {
    const documentHistory = await this.getDocumentHistory(documentId)
    if (!documentHistory) return null

    return documentHistory.versions.find(v => v.version === version) || null
  }

  /**
   * Get latest version
   */
  async getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
    const documentHistory = await this.getDocumentHistory(documentId)
    if (!documentHistory || documentHistory.versions.length === 0) return null

    return documentHistory.versions[documentHistory.versions.length - 1]
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    documentId: string,
    versionA: number,
    versionB: number
  ): Promise<VersionComparison | null> {
    const versionAData = await this.getVersion(documentId, versionA)
    const versionBData = await this.getVersion(documentId, versionB)

    if (!versionAData || !versionBData) return null

    const dataChanges = this.compareData(versionAData.data, versionBData.data)
    const templateChanges = this.compareTemplates(versionAData.templateId, versionBData.templateId)
    const metadataChanges = this.compareMetadata(versionAData.metadata, versionBData.metadata)

    return {
      versionA: versionAData,
      versionB: versionBData,
      differences: {
        dataChanges,
        templateChanges,
        metadataChanges
      },
      summary: {
        hasDataChanges: dataChanges.length > 0,
        hasTemplateChanges: templateChanges.length > 0,
        hasMetadataChanges: metadataChanges.length > 0,
        changeCount: dataChanges.length + templateChanges.length + metadataChanges.length
      }
    }
  }

  /**
   * Search versions
   */
  async searchVersions(query: VersionQuery): Promise<DocumentVersion[]> {
    const history = await this.loadHistory()
    let results: DocumentVersion[] = []

    // Collect all versions
    for (const documentHistory of Object.values(history)) {
      results.push(...documentHistory.versions)
    }

    // Apply filters
    if (query.documentId) {
      results = results.filter(v => v.documentId === query.documentId)
    }

    if (query.templateId) {
      results = results.filter(v => v.templateId === query.templateId)
    }

    if (query.generatedBy) {
      results = results.filter(v => v.generatedBy === query.generatedBy)
    }

    if (query.dateFrom) {
      results = results.filter(v => v.generatedAt >= query.dateFrom!)
    }

    if (query.dateTo) {
      results = results.filter(v => v.generatedAt <= query.dateTo!)
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(v => 
        v.tags && query.tags!.some(tag => v.tags!.includes(tag))
      )
    }

    // Sort by generation date (newest first)
    results.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())

    // Apply pagination
    if (query.offset) {
      results = results.slice(query.offset)
    }

    if (query.limit) {
      results = results.slice(0, query.limit)
    }

    return results
  }

  /**
   * Delete a version
   */
  async deleteVersion(documentId: string, version: number): Promise<boolean> {
    const history = await this.loadHistory()
    const documentHistory = history[documentId]

    if (!documentHistory) return false

    const versionIndex = documentHistory.versions.findIndex(v => v.version === version)
    if (versionIndex === -1) return false

    const versionData = documentHistory.versions[versionIndex]

    // Remove file if it exists
    if (existsSync(versionData.filePath)) {
      try {
        const fs = require('fs')
        fs.unlinkSync(versionData.filePath)
      } catch (error) {
        console.warn(`Failed to delete file: ${versionData.filePath}`, error)
      }
    }

    // Remove from history
    documentHistory.versions.splice(versionIndex, 1)
    documentHistory.totalVersions = documentHistory.versions.length
    documentHistory.totalSize -= versionData.fileSize
    documentHistory.updatedAt = new Date().toISOString()

    // Update current version if needed
    if (version === documentHistory.currentVersion) {
      documentHistory.currentVersion = documentHistory.versions.length > 0 
        ? documentHistory.versions[documentHistory.versions.length - 1].version 
        : 0
    }

    await this.saveHistory(history)
    console.log(`Document version deleted: ${documentId} v${version}`)
    return true
  }

  /**
   * Delete entire document history
   */
  async deleteDocumentHistory(documentId: string): Promise<boolean> {
    const history = await this.loadHistory()
    const documentHistory = history[documentId]

    if (!documentHistory) return false

    // Delete all files
    for (const version of documentHistory.versions) {
      if (existsSync(version.filePath)) {
        try {
          const fs = require('fs')
          fs.unlinkSync(version.filePath)
        } catch (error) {
          console.warn(`Failed to delete file: ${version.filePath}`, error)
        }
      }
    }

    // Remove from history
    delete history[documentId]
    await this.saveHistory(history)

    console.log(`Document history deleted: ${documentId}`)
    return true
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalDocuments: number
    totalVersions: number
    totalSize: number
    averageVersionsPerDocument: number
    oldestVersion?: string
    newestVersion?: string
  }> {
    const history = await this.loadHistory()
    const documents = Object.values(history)

    let totalVersions = 0
    let totalSize = 0
    let oldestDate: string | undefined
    let newestDate: string | undefined

    for (const doc of documents) {
      totalVersions += doc.totalVersions
      totalSize += doc.totalSize

      for (const version of doc.versions) {
        if (!oldestDate || version.generatedAt < oldestDate) {
          oldestDate = version.generatedAt
        }
        if (!newestDate || version.generatedAt > newestDate) {
          newestDate = version.generatedAt
        }
      }
    }

    return {
      totalDocuments: documents.length,
      totalVersions,
      totalSize,
      averageVersionsPerDocument: documents.length > 0 ? totalVersions / documents.length : 0,
      oldestVersion: oldestDate,
      newestVersion: newestDate
    }
  }

  /**
   * Compare data between versions
   */
  private compareData(dataA: any, dataB: any): DataChange[] {
    const changes: DataChange[] = []
    const allKeys = new Set([...Object.keys(dataA), ...Object.keys(dataB)])

    for (const key of allKeys) {
      const valueA = dataA[key]
      const valueB = dataB[key]

      if (!(key in dataA)) {
        changes.push({ field: key, type: 'added', newValue: valueB })
      } else if (!(key in dataB)) {
        changes.push({ field: key, type: 'removed', oldValue: valueA })
      } else if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        changes.push({ field: key, type: 'modified', oldValue: valueA, newValue: valueB })
      }
    }

    return changes
  }

  /**
   * Compare templates between versions
   */
  private compareTemplates(templateA: string, templateB: string): TemplateChange[] {
    const changes: TemplateChange[] = []

    if (templateA !== templateB) {
      changes.push({
        field: 'templateId',
        type: 'modified',
        oldValue: templateA,
        newValue: templateB
      })
    }

    return changes
  }

  /**
   * Compare metadata between versions
   */
  private compareMetadata(metadataA: any, metadataB: any): MetadataChange[] {
    const changes: MetadataChange[] = []
    const allKeys = new Set([...Object.keys(metadataA), ...Object.keys(metadataB)])

    for (const key of allKeys) {
      const valueA = metadataA[key]
      const valueB = metadataB[key]

      if (!(key in metadataA)) {
        changes.push({ field: key, type: 'added', newValue: valueB })
      } else if (!(key in metadataB)) {
        changes.push({ field: key, type: 'removed', oldValue: valueA })
      } else if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        changes.push({ field: key, type: 'modified', oldValue: valueA, newValue: valueB })
      }
    }

    return changes
  }

  /**
   * Get file size
   */
  private getFileSize(filePath: string): number {
    try {
      const fs = require('fs')
      const stats = fs.statSync(filePath)
      return stats.size
    } catch (error) {
      return 0
    }
  }

  /**
   * Calculate file checksum
   */
  private calculateChecksum(filePath: string): string {
    try {
      const crypto = require('crypto')
      const fileBuffer = readFileSync(filePath)
      return crypto.createHash('md5').update(fileBuffer).digest('hex')
    } catch (error) {
      return ''
    }
  }

  /**
   * Load history from file
   */
  private async loadHistory(): Promise<Record<string, DocumentHistory>> {
    try {
      const data = readFileSync(this.historyFile, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.warn('Failed to load history file, returning empty history')
      return {}
    }
  }

  /**
   * Save history to file
   */
  private async saveHistory(history: Record<string, DocumentHistory>): Promise<void> {
    try {
      writeFileSync(this.historyFile, JSON.stringify(history, null, 2))
    } catch (error) {
      console.error('Failed to save history file:', error)
      throw error
    }
  }
}

// Export singleton instance
export const documentVersioning = new DocumentVersioning()
