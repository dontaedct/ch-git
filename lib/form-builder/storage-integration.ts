import { FormTemplate } from "@/components/form-builder/form-builder-engine"
import { SubmissionData } from "./submission-handler"

export interface StorageConfig {
  provider: "localStorage" | "sessionStorage" | "indexedDB" | "supabase" | "firebase" | "custom"
  enableEncryption: boolean
  enableCompression: boolean
  maxStorageSize: number
  ttl: number // Time to live in milliseconds
  customProvider?: StorageProvider
}

export interface StorageProvider {
  store(key: string, data: any, options?: StorageOptions): Promise<StorageResult>
  retrieve(key: string, options?: StorageOptions): Promise<StorageResult>
  delete(key: string): Promise<boolean>
  list(prefix?: string): Promise<string[]>
  clear(): Promise<boolean>
}

export interface StorageOptions {
  ttl?: number
  encrypt?: boolean
  compress?: boolean
  metadata?: Record<string, any>
}

export interface StorageResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    storedAt: number
    size: number
    compressed: boolean
    encrypted: boolean
  }
}

export interface FormDataRecord {
  id: string
  formId: string
  submissionId?: string
  data: Record<string, any>
  status: "draft" | "submitted" | "completed" | "failed"
  createdAt: number
  updatedAt: number
  metadata: {
    formVersion: string
    userAgent: string
    deviceInfo: any
    validationScore?: number
  }
}

export class FormStorageManager {
  private config: StorageConfig
  private provider: StorageProvider
  private encryptionKey?: CryptoKey

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      provider: "localStorage",
      enableEncryption: false,
      enableCompression: false,
      maxStorageSize: 5 * 1024 * 1024, // 5MB
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      ...config
    }

    this.provider = this.createProvider()
    this.initializeEncryption()
  }

  async saveFormDraft(
    formId: string,
    formData: Record<string, any>,
    template: FormTemplate
  ): Promise<StorageResult> {
    const draftId = this.generateDraftId(formId)

    const record: FormDataRecord = {
      id: draftId,
      formId,
      data: formData,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        formVersion: "1.0",
        userAgent: navigator.userAgent,
        deviceInfo: this.getDeviceInfo()
      }
    }

    const options: StorageOptions = {
      ttl: this.config.ttl,
      encrypt: this.config.enableEncryption,
      compress: this.config.enableCompression,
      metadata: {
        type: "draft",
        formName: template.name
      }
    }

    return await this.provider.store(`draft_${draftId}`, record, options)
  }

  async loadFormDraft(formId: string): Promise<FormDataRecord | null> {
    const draftId = this.generateDraftId(formId)
    const result = await this.provider.retrieve(`draft_${draftId}`)

    if (result.success && result.data) {
      // Check if draft is still valid (not expired)
      const record = result.data as FormDataRecord
      const age = Date.now() - record.createdAt

      if (age > this.config.ttl) {
        await this.deleteDraft(formId)
        return null
      }

      return record
    }

    return null
  }

  async saveSubmission(submissionData: SubmissionData): Promise<StorageResult> {
    const record: FormDataRecord = {
      id: submissionData.submissionId,
      formId: submissionData.formId,
      submissionId: submissionData.submissionId,
      data: submissionData.formData,
      status: "submitted",
      createdAt: submissionData.timestamp,
      updatedAt: Date.now(),
      metadata: {
        formVersion: submissionData.metadata.formVersion,
        userAgent: submissionData.userAgent,
        deviceInfo: submissionData.metadata.deviceInfo,
        validationScore: submissionData.metadata.validationScore
      }
    }

    const options: StorageOptions = {
      encrypt: this.config.enableEncryption,
      compress: this.config.enableCompression,
      metadata: {
        type: "submission",
        ipAddress: submissionData.ipAddress
      }
    }

    return await this.provider.store(`submission_${submissionData.submissionId}`, record, options)
  }

  async getSubmissionHistory(formId?: string, limit: number = 50): Promise<FormDataRecord[]> {
    const prefix = formId ? `submission_${formId}` : "submission_"
    const keys = await this.provider.list(prefix)

    const submissions: FormDataRecord[] = []

    for (const key of keys.slice(0, limit)) {
      const result = await this.provider.retrieve(key)
      if (result.success && result.data) {
        submissions.push(result.data as FormDataRecord)
      }
    }

    // Sort by creation date (newest first)
    return submissions.sort((a, b) => b.createdAt - a.createdAt)
  }

  async deleteDraft(formId: string): Promise<boolean> {
    const draftId = this.generateDraftId(formId)
    return await this.provider.delete(`draft_${draftId}`)
  }

  async deleteSubmission(submissionId: string): Promise<boolean> {
    return await this.provider.delete(`submission_${submissionId}`)
  }

  async clearExpiredData(): Promise<{ deleted: number; errors: string[] }> {
    const keys = await this.provider.list()
    const cutoff = Date.now() - this.config.ttl

    let deleted = 0
    const errors: string[] = []

    for (const key of keys) {
      try {
        const result = await this.provider.retrieve(key)
        if (result.success && result.data) {
          const record = result.data as FormDataRecord
          if (record.createdAt < cutoff) {
            await this.provider.delete(key)
            deleted++
          }
        }
      } catch (error) {
        errors.push(`Failed to process ${key}: ${error}`)
      }
    }

    return { deleted, errors }
  }

  async getStorageStats(): Promise<{
    totalRecords: number
    totalSize: number
    draftCount: number
    submissionCount: number
    oldestRecord: number
    newestRecord: number
  }> {
    const keys = await this.provider.list()

    let totalSize = 0
    let draftCount = 0
    let submissionCount = 0
    let oldestRecord = Date.now()
    let newestRecord = 0

    for (const key of keys) {
      const result = await this.provider.retrieve(key)
      if (result.success && result.data && result.metadata) {
        totalSize += result.metadata.size || 0

        const record = result.data as FormDataRecord
        oldestRecord = Math.min(oldestRecord, record.createdAt)
        newestRecord = Math.max(newestRecord, record.createdAt)

        if (key.startsWith("draft_")) {
          draftCount++
        } else if (key.startsWith("submission_")) {
          submissionCount++
        }
      }
    }

    return {
      totalRecords: keys.length,
      totalSize,
      draftCount,
      submissionCount,
      oldestRecord: oldestRecord === Date.now() ? 0 : oldestRecord,
      newestRecord
    }
  }

  private createProvider(): StorageProvider {
    switch (this.config.provider) {
      case "localStorage":
        return new LocalStorageProvider()
      case "sessionStorage":
        return new SessionStorageProvider()
      case "indexedDB":
        return new IndexedDBProvider()
      case "custom":
        if (this.config.customProvider) {
          return this.config.customProvider
        }
        throw new Error("Custom provider not specified")
      default:
        return new LocalStorageProvider()
    }
  }

  private async initializeEncryption(): Promise<void> {
    if (this.config.enableEncryption && typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        this.encryptionKey = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"]
        )
      } catch (error) {
        console.warn("Failed to initialize encryption:", error)
        this.config.enableEncryption = false
      }
    }
  }

  private generateDraftId(formId: string): string {
    // Generate a consistent draft ID for a form
    return `${formId}_draft`
  }

  private getDeviceInfo(): any {
    return {
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth
    }
  }
}

class LocalStorageProvider implements StorageProvider {
  async store(key: string, data: any, options: StorageOptions = {}): Promise<StorageResult> {
    try {
      const serialized = JSON.stringify({
        data,
        metadata: {
          storedAt: Date.now(),
          ttl: options.ttl,
          encrypted: options.encrypt || false,
          compressed: options.compress || false,
          ...options.metadata
        }
      })

      const size = new Blob([serialized]).size

      // Check storage limits
      if (size > 5 * 1024 * 1024) { // 5MB limit for localStorage
        return {
          success: false,
          error: "Data too large for localStorage"
        }
      }

      localStorage.setItem(key, serialized)

      return {
        success: true,
        metadata: {
          storedAt: Date.now(),
          size,
          compressed: false,
          encrypted: false
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Storage failed"
      }
    }
  }

  async retrieve(key: string): Promise<StorageResult> {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) {
        return { success: false, error: "Key not found" }
      }

      const parsed = JSON.parse(stored)

      // Check TTL
      if (parsed.metadata?.ttl) {
        const age = Date.now() - parsed.metadata.storedAt
        if (age > parsed.metadata.ttl) {
          await this.delete(key)
          return { success: false, error: "Data expired" }
        }
      }

      return {
        success: true,
        data: parsed.data,
        metadata: parsed.metadata
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Retrieval failed"
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      return false
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (!prefix || key.startsWith(prefix))) {
        keys.push(key)
      }
    }
    return keys
  }

  async clear(): Promise<boolean> {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      return false
    }
  }
}

class SessionStorageProvider implements StorageProvider {
  async store(key: string, data: any, options: StorageOptions = {}): Promise<StorageResult> {
    try {
      const serialized = JSON.stringify({
        data,
        metadata: {
          storedAt: Date.now(),
          ttl: options.ttl,
          encrypted: options.encrypt || false,
          compressed: options.compress || false,
          ...options.metadata
        }
      })

      sessionStorage.setItem(key, serialized)

      return {
        success: true,
        metadata: {
          storedAt: Date.now(),
          size: new Blob([serialized]).size,
          compressed: false,
          encrypted: false
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Storage failed"
      }
    }
  }

  async retrieve(key: string): Promise<StorageResult> {
    try {
      const stored = sessionStorage.getItem(key)
      if (!stored) {
        return { success: false, error: "Key not found" }
      }

      const parsed = JSON.parse(stored)
      return {
        success: true,
        data: parsed.data,
        metadata: parsed.metadata
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Retrieval failed"
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      sessionStorage.removeItem(key)
      return true
    } catch (error) {
      return false
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (!prefix || key.startsWith(prefix))) {
        keys.push(key)
      }
    }
    return keys
  }

  async clear(): Promise<boolean> {
    try {
      sessionStorage.clear()
      return true
    } catch (error) {
      return false
    }
  }
}

class IndexedDBProvider implements StorageProvider {
  private dbName = "FormBuilderStorage"
  private version = 1
  private storeName = "formData"

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "key" })
          store.createIndex("storedAt", "metadata.storedAt", { unique: false })
        }
      }
    })
  }

  async store(key: string, data: any, options: StorageOptions = {}): Promise<StorageResult> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)

      const record = {
        key,
        data,
        metadata: {
          storedAt: Date.now(),
          ttl: options.ttl,
          encrypted: options.encrypt || false,
          compressed: options.compress || false,
          ...options.metadata
        }
      }

      const request = store.put(record)

      return new Promise((resolve) => {
        request.onsuccess = () => {
          resolve({
            success: true,
            metadata: {
              storedAt: Date.now(),
              size: JSON.stringify(record).length,
              compressed: false,
              encrypted: false
            }
          })
        }

        request.onerror = () => {
          resolve({
            success: false,
            error: "IndexedDB storage failed"
          })
        }
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Storage failed"
      }
    }
  }

  async retrieve(key: string): Promise<StorageResult> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result
          if (!result) {
            resolve({ success: false, error: "Key not found" })
            return
          }

          // Check TTL
          if (result.metadata?.ttl) {
            const age = Date.now() - result.metadata.storedAt
            if (age > result.metadata.ttl) {
              this.delete(key)
              resolve({ success: false, error: "Data expired" })
              return
            }
          }

          resolve({
            success: true,
            data: result.data,
            metadata: result.metadata
          })
        }

        request.onerror = () => {
          resolve({
            success: false,
            error: "IndexedDB retrieval failed"
          })
        }
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Retrieval failed"
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(true)
        request.onerror = () => resolve(false)
      })
    } catch (error) {
      return false
    }
  }

  async list(prefix?: string): Promise<string[]> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.getAllKeys()

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const keys = request.result as string[]
          const filtered = prefix ? keys.filter(key => key.startsWith(prefix)) : keys
          resolve(filtered)
        }

        request.onerror = () => resolve([])
      })
    } catch (error) {
      return []
    }
  }

  async clear(): Promise<boolean> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(true)
        request.onerror = () => resolve(false)
      })
    } catch (error) {
      return false
    }
  }
}

export const defaultStorageConfig: StorageConfig = {
  provider: "localStorage",
  enableEncryption: false,
  enableCompression: false,
  maxStorageSize: 5 * 1024 * 1024,
  ttl: 24 * 60 * 60 * 1000
}

export function createFormStorageManager(config?: Partial<StorageConfig>): FormStorageManager {
  return new FormStorageManager(config)
}