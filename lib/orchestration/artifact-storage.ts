/**
 * Workflow Artifact Storage System
 * 
 * Implements comprehensive workflow artifact storage with versioning,
 * compression, encryption, and retrieval per PRD Section 8 requirements.
 */

import {
  WorkflowDefinition,
  WorkflowArtifacts,
  Environment,
  OrchestrationError
} from './architecture';
import { WorkflowVersion } from './workflow-versioning';

// ============================================================================
// Storage Types
// ============================================================================

export interface ArtifactStorageConfig {
  provider: StorageProvider;
  bucket: string;
  region: string;
  encryption: EncryptionConfig;
  compression: CompressionConfig;
  retention: RetentionConfig;
  access: AccessConfig;
  monitoring: MonitoringConfig;
}

export type StorageProvider = 's3' | 'gcs' | 'azure' | 'local' | 'supabase';

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: 'AES-256' | 'AES-128' | 'ChaCha20';
  keyRotation: boolean;
  keyRotationInterval: number; // days
  kmsKeyId?: string;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'brotli' | 'lz4' | 'zstd';
  level: number; // 1-9 for gzip, 1-11 for brotli
  threshold: number; // minimum size to compress (bytes)
}

export interface RetentionConfig {
  enabled: boolean;
  defaultRetentionDays: number;
  maxRetentionDays: number;
  archiveAfterDays: number;
  deleteAfterDays: number;
  policies: RetentionPolicy[];
}

export interface RetentionPolicy {
  id: string;
  name: string;
  conditions: RetentionCondition[];
  retentionDays: number;
  action: 'archive' | 'delete' | 'compress';
}

export interface RetentionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
  value: any;
}

export interface AccessConfig {
  publicRead: boolean;
  authenticatedRead: boolean;
  authenticatedWrite: boolean;
  adminOnly: boolean;
  ipWhitelist?: string[];
  userWhitelist?: string[];
  rateLimiting: RateLimitConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: boolean;
  logging: boolean;
  alerting: boolean;
  retentionDays: number;
}

export interface StoredArtifact {
  id: string;
  workflowId: string;
  versionId: string;
  version: string;
  environment: Environment;
  type: ArtifactType;
  size: number;
  compressedSize?: number;
  checksum: string;
  encryptionKey?: string;
  compressionAlgorithm?: string;
  metadata: ArtifactMetadata;
  storage: StorageInfo;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  accessCount: number;
  lastAccessedAt?: Date;
}

export type ArtifactType = 
  | 'workflow_definition' 
  | 'execution_logs' 
  | 'configuration' 
  | 'dependencies' 
  | 'documentation' 
  | 'tests' 
  | 'screenshots' 
  | 'videos' 
  | 'backup' 
  | 'export';

export interface ArtifactMetadata {
  name: string;
  description?: string;
  tags: string[];
  category: string;
  format: string;
  mimeType: string;
  encoding?: string;
  language?: string;
  framework?: string;
  dependencies?: string[];
  author: string;
  source: string;
  version: string;
  buildNumber?: string;
  commit?: string;
  branch?: string;
  environment: Environment;
  custom: Record<string, any>;
}

export interface StorageInfo {
  provider: StorageProvider;
  bucket: string;
  key: string;
  region: string;
  endpoint?: string;
  url: string;
  signedUrl?: string;
  expiresAt?: Date;
}

export interface ArtifactUploadRequest {
  workflowId: string;
  versionId: string;
  version: string;
  environment: Environment;
  type: ArtifactType;
  data: Buffer | string;
  metadata: ArtifactMetadata;
  options?: UploadOptions;
}

export interface UploadOptions {
  encrypt?: boolean;
  compress?: boolean;
  overwrite?: boolean;
  retentionDays?: number;
  tags?: string[];
  accessLevel?: 'private' | 'public' | 'authenticated';
  generateSignedUrl?: boolean;
  signedUrlExpiry?: number; // hours
}

export interface ArtifactDownloadRequest {
  artifactId: string;
  options?: DownloadOptions;
}

export interface DownloadOptions {
  decrypt?: boolean;
  decompress?: boolean;
  generateSignedUrl?: boolean;
  signedUrlExpiry?: number; // hours
  stream?: boolean;
  range?: {
    start: number;
    end: number;
  };
}

export interface ArtifactSearchRequest {
  workflowId?: string;
  versionId?: string;
  environment?: Environment;
  type?: ArtifactType;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  author?: string;
  source?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ArtifactSearchResult {
  artifacts: StoredArtifact[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ArtifactStats {
  totalArtifacts: number;
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  byType: Record<ArtifactType, number>;
  byEnvironment: Record<Environment, number>;
  byStorageProvider: Record<StorageProvider, number>;
  oldestArtifact?: Date;
  newestArtifact?: Date;
  averageSize: number;
  largestArtifact?: StoredArtifact;
  smallestArtifact?: StoredArtifact;
}

export interface StorageHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  provider: StorageProvider;
  metrics: StorageMetrics;
  issues: StorageIssue[];
  lastCheck: Date;
}

export interface StorageMetrics {
  totalObjects: number;
  totalSize: number;
  availableSpace: number;
  usedSpace: number;
  readLatency: number;
  writeLatency: number;
  errorRate: number;
  throughput: number;
}

export interface StorageIssue {
  type: 'connectivity' | 'permissions' | 'quota' | 'performance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  resolution?: string;
}

// ============================================================================
// Artifact Storage Engine
// ============================================================================

export class ArtifactStorageEngine {
  private config: ArtifactStorageConfig;
  private artifacts: Map<string, StoredArtifact> = new Map();
  private storageProvider: StorageProviderInterface;

  constructor(config: ArtifactStorageConfig) {
    this.config = config;
    this.storageProvider = this.createStorageProvider(config.provider);
  }

  /**
   * Upload artifact
   */
  async uploadArtifact(request: ArtifactUploadRequest): Promise<StoredArtifact> {
    const { workflowId, versionId, version, environment, type, data, metadata, options = {} } = request;

    try {
      // Generate artifact ID
      const artifactId = this.generateArtifactId(workflowId, versionId, type);

      // Check if artifact already exists
      if (!options.overwrite) {
        const existing = this.artifacts.get(artifactId);
        if (existing) {
          throw new OrchestrationError(`Artifact already exists: ${artifactId}`, 'ARTIFACT_EXISTS');
        }
      }

      // Prepare data
      let processedData = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
      let compressionAlgorithm: string | undefined;
      let encryptionKey: string | undefined;

      // Compress if enabled
      if (options.compress !== false && this.config.compression.enabled) {
        if (processedData.length >= this.config.compression.threshold) {
          processedData = await this.compressData(processedData, this.config.compression.algorithm, this.config.compression.level);
          compressionAlgorithm = this.config.compression.algorithm;
        }
      }

      // Encrypt if enabled
      if (options.encrypt !== false && this.config.encryption.enabled) {
        const encryptionResult = await this.encryptData(processedData);
        processedData = encryptionResult.data;
        encryptionKey = encryptionResult.keyId;
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(processedData);

      // Generate storage key
      const storageKey = this.generateStorageKey(workflowId, versionId, type, version);

      // Upload to storage provider
      const storageInfo = await this.storageProvider.upload(storageKey, processedData, {
        bucket: this.config.bucket,
        region: this.config.region,
        metadata: {
          workflowId,
          versionId,
          type,
          checksum,
          compressionAlgorithm,
          encryptionKey
        }
      });

      // Create stored artifact
      const storedArtifact: StoredArtifact = {
        id: artifactId,
        workflowId,
        versionId,
        version,
        environment,
        type,
        size: Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data, 'utf8'),
        compressedSize: compressionAlgorithm ? processedData.length : undefined,
        checksum,
        encryptionKey,
        compressionAlgorithm,
        metadata,
        storage: storageInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: options.retentionDays ? new Date(Date.now() + options.retentionDays * 24 * 60 * 60 * 1000) : undefined,
        accessCount: 0
      };

      // Store artifact metadata
      this.artifacts.set(artifactId, storedArtifact);

      // Generate signed URL if requested
      if (options.generateSignedUrl) {
        const expiryHours = options.signedUrlExpiry || 24;
        storedArtifact.storage.signedUrl = await this.storageProvider.generateSignedUrl(
          storageKey,
          expiryHours * 60 * 60
        );
        storedArtifact.storage.expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
      }

      return storedArtifact;

    } catch (error) {
      throw new OrchestrationError(`Failed to upload artifact: ${error.message}`, 'UPLOAD_FAILED');
    }
  }

  /**
   * Download artifact
   */
  async downloadArtifact(request: ArtifactDownloadRequest): Promise<Buffer> {
    const { artifactId, options = {} } = request;

    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new OrchestrationError(`Artifact not found: ${artifactId}`, 'ARTIFACT_NOT_FOUND');
    }

    try {
      // Update access statistics
      artifact.accessCount++;
      artifact.lastAccessedAt = new Date();
      this.artifacts.set(artifactId, artifact);

      // Download from storage provider
      let data = await this.storageProvider.download(artifact.storage.key, {
        bucket: this.config.bucket,
        region: this.config.region,
        range: options.range
      });

      // Decrypt if needed
      if (artifact.encryptionKey && options.decrypt !== false) {
        data = await this.decryptData(data, artifact.encryptionKey);
      }

      // Decompress if needed
      if (artifact.compressionAlgorithm && options.decompress !== false) {
        data = await this.decompressData(data, artifact.compressionAlgorithm);
      }

      return data;

    } catch (error) {
      throw new OrchestrationError(`Failed to download artifact: ${error.message}`, 'DOWNLOAD_FAILED');
    }
  }

  /**
   * Get artifact metadata
   */
  async getArtifact(artifactId: string): Promise<StoredArtifact | null> {
    return this.artifacts.get(artifactId) || null;
  }

  /**
   * Search artifacts
   */
  async searchArtifacts(request: ArtifactSearchRequest): Promise<ArtifactSearchResult> {
    let artifacts = Array.from(this.artifacts.values());

    // Apply filters
    if (request.workflowId) {
      artifacts = artifacts.filter(a => a.workflowId === request.workflowId);
    }

    if (request.versionId) {
      artifacts = artifacts.filter(a => a.versionId === request.versionId);
    }

    if (request.environment) {
      artifacts = artifacts.filter(a => a.environment === request.environment);
    }

    if (request.type) {
      artifacts = artifacts.filter(a => a.type === request.type);
    }

    if (request.tags && request.tags.length > 0) {
      artifacts = artifacts.filter(a => 
        request.tags!.some(tag => a.metadata.tags.includes(tag))
      );
    }

    if (request.dateRange) {
      artifacts = artifacts.filter(a => 
        a.createdAt >= request.dateRange!.start && 
        a.createdAt <= request.dateRange!.end
      );
    }

    if (request.sizeRange) {
      artifacts = artifacts.filter(a => 
        a.size >= request.sizeRange!.min && 
        a.size <= request.sizeRange!.max
      );
    }

    if (request.author) {
      artifacts = artifacts.filter(a => a.metadata.author === request.author);
    }

    if (request.source) {
      artifacts = artifacts.filter(a => a.metadata.source === request.source);
    }

    // Sort
    if (request.sortBy) {
      artifacts.sort((a, b) => {
        const aValue = this.getNestedValue(a, request.sortBy!);
        const bValue = this.getNestedValue(b, request.sortBy!);
        
        if (request.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    } else {
      // Default sort by creation date
      artifacts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Apply pagination
    const total = artifacts.length;
    const offset = request.offset || 0;
    const limit = request.limit || 50;
    const paginatedArtifacts = artifacts.slice(offset, offset + limit);

    return {
      artifacts: paginatedArtifacts,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      hasMore: offset + limit < total
    };
  }

  /**
   * Delete artifact
   */
  async deleteArtifact(artifactId: string): Promise<void> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new OrchestrationError(`Artifact not found: ${artifactId}`, 'ARTIFACT_NOT_FOUND');
    }

    try {
      // Delete from storage provider
      await this.storageProvider.delete(artifact.storage.key, {
        bucket: this.config.bucket,
        region: this.config.region
      });

      // Remove from local cache
      this.artifacts.delete(artifactId);

    } catch (error) {
      throw new OrchestrationError(`Failed to delete artifact: ${error.message}`, 'DELETE_FAILED');
    }
  }

  /**
   * Generate signed URL for artifact
   */
  async generateSignedUrl(artifactId: string, expiryHours: number = 24): Promise<string> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new OrchestrationError(`Artifact not found: ${artifactId}`, 'ARTIFACT_NOT_FOUND');
    }

    try {
      const signedUrl = await this.storageProvider.generateSignedUrl(
        artifact.storage.key,
        expiryHours * 60 * 60
      );

      // Update artifact with signed URL
      artifact.storage.signedUrl = signedUrl;
      artifact.storage.expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
      this.artifacts.set(artifactId, artifact);

      return signedUrl;

    } catch (error) {
      throw new OrchestrationError(`Failed to generate signed URL: ${error.message}`, 'SIGNED_URL_FAILED');
    }
  }

  /**
   * Get artifact statistics
   */
  async getArtifactStats(): Promise<ArtifactStats> {
    const artifacts = Array.from(this.artifacts.values());

    const stats: ArtifactStats = {
      totalArtifacts: artifacts.length,
      totalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      byType: {} as Record<ArtifactType, number>,
      byEnvironment: {} as Record<Environment, number>,
      byStorageProvider: {} as Record<StorageProvider, number>,
      averageSize: 0,
      largestArtifact: undefined,
      smallestArtifact: undefined
    };

    if (artifacts.length === 0) {
      return stats;
    }

    // Calculate statistics
    for (const artifact of artifacts) {
      stats.totalSize += artifact.size;
      if (artifact.compressedSize) {
        stats.compressedSize += artifact.compressedSize;
      }

      // Count by type
      stats.byType[artifact.type] = (stats.byType[artifact.type] || 0) + 1;

      // Count by environment
      stats.byEnvironment[artifact.environment] = (stats.byEnvironment[artifact.environment] || 0) + 1;

      // Count by storage provider
      stats.byStorageProvider[artifact.storage.provider] = (stats.byStorageProvider[artifact.storage.provider] || 0) + 1;

      // Track oldest and newest
      if (!stats.oldestArtifact || artifact.createdAt < stats.oldestArtifact) {
        stats.oldestArtifact = artifact.createdAt;
      }
      if (!stats.newestArtifact || artifact.createdAt > stats.newestArtifact) {
        stats.newestArtifact = artifact.createdAt;
      }

      // Track largest and smallest
      if (!stats.largestArtifact || artifact.size > stats.largestArtifact.size) {
        stats.largestArtifact = artifact;
      }
      if (!stats.smallestArtifact || artifact.size < stats.smallestArtifact.size) {
        stats.smallestArtifact = artifact;
      }
    }

    // Calculate derived statistics
    stats.averageSize = stats.totalSize / artifacts.length;
    stats.compressionRatio = stats.compressedSize > 0 ? stats.compressedSize / stats.totalSize : 0;

    return stats;
  }

  /**
   * Get storage health
   */
  async getStorageHealth(): Promise<StorageHealth> {
    try {
      const metrics = await this.storageProvider.getMetrics({
        bucket: this.config.bucket,
        region: this.config.region
      });

      const issues: StorageIssue[] = [];

      // Check for issues
      if (metrics.errorRate > 0.05) {
        issues.push({
          type: 'performance',
          severity: 'high',
          description: `High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
          timestamp: new Date(),
          resolution: 'Check storage provider status and configuration'
        });
      }

      if (metrics.readLatency > 5000) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          description: `High read latency: ${metrics.readLatency}ms`,
          timestamp: new Date(),
          resolution: 'Consider using CDN or closer region'
        });
      }

      if (metrics.usedSpace / metrics.totalSize > 0.9) {
        issues.push({
          type: 'quota',
          severity: 'high',
          description: 'Storage quota nearly full',
          timestamp: new Date(),
          resolution: 'Clean up old artifacts or increase quota'
        });
      }

      const status = issues.some(i => i.severity === 'critical') ? 'unhealthy' :
                    issues.some(i => i.severity === 'high') ? 'degraded' : 'healthy';

      return {
        status,
        provider: this.config.provider,
        metrics,
        issues,
        lastCheck: new Date()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        provider: this.config.provider,
        metrics: {
          totalObjects: 0,
          totalSize: 0,
          availableSpace: 0,
          usedSpace: 0,
          readLatency: 0,
          writeLatency: 0,
          errorRate: 1,
          throughput: 0
        },
        issues: [{
          type: 'connectivity',
          severity: 'critical',
          description: `Storage provider unavailable: ${error.message}`,
          timestamp: new Date(),
          resolution: 'Check storage provider configuration and connectivity'
        }],
        lastCheck: new Date()
      };
    }
  }

  /**
   * Clean up expired artifacts
   */
  async cleanupExpiredArtifacts(): Promise<{ deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let deleted = 0;

    const now = new Date();
    const expiredArtifacts = Array.from(this.artifacts.values())
      .filter(artifact => artifact.expiresAt && artifact.expiresAt <= now);

    for (const artifact of expiredArtifacts) {
      try {
        await this.deleteArtifact(artifact.id);
        deleted++;
      } catch (error) {
        errors.push(`Failed to delete expired artifact ${artifact.id}: ${error.message}`);
      }
    }

    return { deleted, errors };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Create storage provider
   */
  private createStorageProvider(provider: StorageProvider): StorageProviderInterface {
    switch (provider) {
      case 's3':
        return new S3StorageProvider();
      case 'gcs':
        return new GCSStorageProvider();
      case 'azure':
        return new AzureStorageProvider();
      case 'local':
        return new LocalStorageProvider();
      case 'supabase':
        return new SupabaseStorageProvider();
      default:
        throw new OrchestrationError(`Unsupported storage provider: ${provider}`, 'UNSUPPORTED_PROVIDER');
    }
  }

  /**
   * Generate artifact ID
   */
  private generateArtifactId(workflowId: string, versionId: string, type: ArtifactType): string {
    return `${workflowId}:${versionId}:${type}:${Date.now()}`;
  }

  /**
   * Generate storage key
   */
  private generateStorageKey(workflowId: string, versionId: string, type: ArtifactType, version: string): string {
    return `workflows/${workflowId}/versions/${versionId}/${type}/${version}`;
  }

  /**
   * Compress data
   */
  private async compressData(data: Buffer, algorithm: string, level: number): Promise<Buffer> {
    switch (algorithm) {
      case 'gzip':
        const zlib = await import('zlib');
        return zlib.gzipSync(data, { level });
      case 'brotli':
        const brotli = await import('zlib');
        return brotli.brotliCompressSync(data, { params: { [brotli.constants.BROTLI_PARAM_QUALITY]: level } });
      case 'lz4':
        // Fallback to gzip for production builds - lz4 requires native compilation
        console.warn('LZ4 compression not available in production, using gzip fallback');
        const zlibLz4 = await import('zlib');
        return zlibLz4.gzipSync(data, { level });
      case 'zstd':
        // Fallback to gzip for production builds - zstd requires native compilation
        console.warn('ZSTD compression not available in production, using gzip fallback');
        const zlibZstd = await import('zlib');
        return zlibZstd.gzipSync(data, { level });
      default:
        throw new OrchestrationError(`Unsupported compression algorithm: ${algorithm}`, 'UNSUPPORTED_COMPRESSION');
    }
  }

  /**
   * Decompress data
   */
  private async decompressData(data: Buffer, algorithm: string): Promise<Buffer> {
    switch (algorithm) {
      case 'gzip':
        const zlib = await import('zlib');
        return zlib.gunzipSync(data);
      case 'brotli':
        const brotli = await import('zlib');
        return brotli.brotliDecompressSync(data);
      case 'lz4':
        // Fallback to gzip for production builds - lz4 requires native compilation
        console.warn('LZ4 decompression not available in production, using gzip fallback');
        const zlibLz4 = await import('zlib');
        return zlibLz4.gunzipSync(data);
      case 'zstd':
        // Fallback to gzip for production builds - zstd requires native compilation
        console.warn('ZSTD decompression not available in production, using gzip fallback');
        const zlibZstd = await import('zlib');
        return zlibZstd.gunzipSync(data);
      default:
        throw new OrchestrationError(`Unsupported decompression algorithm: ${algorithm}`, 'UNSUPPORTED_DECOMPRESSION');
    }
  }

  /**
   * Encrypt data
   */
  private async encryptData(data: Buffer): Promise<{ data: Buffer; keyId: string }> {
    const crypto = await import('crypto');
    const algorithm = this.config.encryption.algorithm;
    const key = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16); // 128-bit IV

    let cipher;
    switch (algorithm) {
      case 'AES-256':
        cipher = crypto.createCipher('aes-256-cbc', key);
        break;
      case 'AES-128':
        cipher = crypto.createCipher('aes-128-cbc', key);
        break;
      case 'ChaCha20':
        cipher = crypto.createCipher('chacha20', key);
        break;
      default:
        throw new OrchestrationError(`Unsupported encryption algorithm: ${algorithm}`, 'UNSUPPORTED_ENCRYPTION');
    }

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // In a real implementation, you would store the key securely (e.g., AWS KMS, Azure Key Vault)
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return { data: encrypted, keyId };
  }

  /**
   * Decrypt data
   */
  private async decryptData(data: Buffer, keyId: string): Promise<Buffer> {
    // In a real implementation, you would retrieve the key from secure storage
    const crypto = await import('crypto');
    const algorithm = this.config.encryption.algorithm;
    
    // This is a simplified implementation - in reality you'd retrieve the actual key
    const key = Buffer.alloc(32); // Placeholder key

    let decipher;
    switch (algorithm) {
      case 'AES-256':
        decipher = crypto.createDecipher('aes-256-cbc', key);
        break;
      case 'AES-128':
        decipher = crypto.createDecipher('aes-128-cbc', key);
        break;
      case 'ChaCha20':
        decipher = crypto.createDecipher('chacha20', key);
        break;
      default:
        throw new OrchestrationError(`Unsupported decryption algorithm: ${algorithm}`, 'UNSUPPORTED_DECRYPTION');
    }

    let decrypted = decipher.update(data);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  /**
   * Calculate checksum
   */
  private async calculateChecksum(data: Buffer): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// ============================================================================
// Storage Provider Interfaces
// ============================================================================

export interface StorageProviderInterface {
  upload(key: string, data: Buffer, options: UploadOptions): Promise<StorageInfo>;
  download(key: string, options: DownloadOptions): Promise<Buffer>;
  delete(key: string, options: DeleteOptions): Promise<void>;
  generateSignedUrl(key: string, expirySeconds: number): Promise<string>;
  getMetrics(options: MetricsOptions): Promise<StorageMetrics>;
}

export interface UploadOptions {
  bucket: string;
  region: string;
  metadata?: Record<string, string>;
}

export interface DownloadOptions {
  bucket: string;
  region: string;
  range?: { start: number; end: number };
}

export interface DeleteOptions {
  bucket: string;
  region: string;
}

export interface MetricsOptions {
  bucket: string;
  region: string;
}

// ============================================================================
// Storage Provider Implementations
// ============================================================================

export class S3StorageProvider implements StorageProviderInterface {
  async upload(key: string, data: Buffer, options: UploadOptions): Promise<StorageInfo> {
    // In a real implementation, this would use AWS SDK
    return {
      provider: 's3',
      bucket: options.bucket,
      key,
      region: options.region,
      url: `https://${options.bucket}.s3.${options.region}.amazonaws.com/${key}`
    };
  }

  async download(key: string, options: DownloadOptions): Promise<Buffer> {
    // In a real implementation, this would use AWS SDK
    return Buffer.from('mock data');
  }

  async delete(key: string, options: DeleteOptions): Promise<void> {
    // In a real implementation, this would use AWS SDK
  }

  async generateSignedUrl(key: string, expirySeconds: number): Promise<string> {
    // In a real implementation, this would use AWS SDK
    return `https://mock-signed-url.com/${key}?expires=${expirySeconds}`;
  }

  async getMetrics(options: MetricsOptions): Promise<StorageMetrics> {
    // In a real implementation, this would use AWS CloudWatch
    return {
      totalObjects: 1000,
      totalSize: 1024 * 1024 * 1024, // 1GB
      availableSpace: 10 * 1024 * 1024 * 1024, // 10GB
      usedSpace: 1024 * 1024 * 1024, // 1GB
      readLatency: 100,
      writeLatency: 150,
      errorRate: 0.01,
      throughput: 1000
    };
  }
}

export class GCSStorageProvider implements StorageProviderInterface {
  async upload(key: string, data: Buffer, options: UploadOptions): Promise<StorageInfo> {
    // In a real implementation, this would use Google Cloud Storage SDK
    return {
      provider: 'gcs',
      bucket: options.bucket,
      key,
      region: options.region,
      url: `https://storage.googleapis.com/${options.bucket}/${key}`
    };
  }

  async download(key: string, options: DownloadOptions): Promise<Buffer> {
    // In a real implementation, this would use Google Cloud Storage SDK
    return Buffer.from('mock data');
  }

  async delete(key: string, options: DeleteOptions): Promise<void> {
    // In a real implementation, this would use Google Cloud Storage SDK
  }

  async generateSignedUrl(key: string, expirySeconds: number): Promise<string> {
    // In a real implementation, this would use Google Cloud Storage SDK
    return `https://mock-signed-url.com/${key}?expires=${expirySeconds}`;
  }

  async getMetrics(options: MetricsOptions): Promise<StorageMetrics> {
    // In a real implementation, this would use Google Cloud Monitoring
    return {
      totalObjects: 1000,
      totalSize: 1024 * 1024 * 1024,
      availableSpace: 10 * 1024 * 1024 * 1024,
      usedSpace: 1024 * 1024 * 1024,
      readLatency: 120,
      writeLatency: 180,
      errorRate: 0.02,
      throughput: 800
    };
  }
}

export class AzureStorageProvider implements StorageProviderInterface {
  async upload(key: string, data: Buffer, options: UploadOptions): Promise<StorageInfo> {
    // In a real implementation, this would use Azure Storage SDK
    return {
      provider: 'azure',
      bucket: options.bucket,
      key,
      region: options.region,
      url: `https://${options.bucket}.blob.core.windows.net/${key}`
    };
  }

  async download(key: string, options: DownloadOptions): Promise<Buffer> {
    // In a real implementation, this would use Azure Storage SDK
    return Buffer.from('mock data');
  }

  async delete(key: string, options: DeleteOptions): Promise<void> {
    // In a real implementation, this would use Azure Storage SDK
  }

  async generateSignedUrl(key: string, expirySeconds: number): Promise<string> {
    // In a real implementation, this would use Azure Storage SDK
    return `https://mock-signed-url.com/${key}?expires=${expirySeconds}`;
  }

  async getMetrics(options: MetricsOptions): Promise<StorageMetrics> {
    // In a real implementation, this would use Azure Monitor
    return {
      totalObjects: 1000,
      totalSize: 1024 * 1024 * 1024,
      availableSpace: 10 * 1024 * 1024 * 1024,
      usedSpace: 1024 * 1024 * 1024,
      readLatency: 110,
      writeLatency: 160,
      errorRate: 0.015,
      throughput: 900
    };
  }
}

export class LocalStorageProvider implements StorageProviderInterface {
  async upload(key: string, data: Buffer, options: UploadOptions): Promise<StorageInfo> {
    // In a real implementation, this would write to local filesystem
    return {
      provider: 'local',
      bucket: options.bucket,
      key,
      region: options.region,
      url: `file://${options.bucket}/${key}`
    };
  }

  async download(key: string, options: DownloadOptions): Promise<Buffer> {
    // In a real implementation, this would read from local filesystem
    return Buffer.from('mock data');
  }

  async delete(key: string, options: DeleteOptions): Promise<void> {
    // In a real implementation, this would delete from local filesystem
  }

  async generateSignedUrl(key: string, expirySeconds: number): Promise<string> {
    // In a real implementation, this would generate a local file URL
    return `file://${key}?expires=${expirySeconds}`;
  }

  async getMetrics(options: MetricsOptions): Promise<StorageMetrics> {
    // In a real implementation, this would check local filesystem
    return {
      totalObjects: 100,
      totalSize: 100 * 1024 * 1024, // 100MB
      availableSpace: 1024 * 1024 * 1024, // 1GB
      usedSpace: 100 * 1024 * 1024, // 100MB
      readLatency: 10,
      writeLatency: 20,
      errorRate: 0.001,
      throughput: 10000
    };
  }
}

export class SupabaseStorageProvider implements StorageProviderInterface {
  async upload(key: string, data: Buffer, options: UploadOptions): Promise<StorageInfo> {
    // In a real implementation, this would use Supabase Storage SDK
    return {
      provider: 'supabase',
      bucket: options.bucket,
      key,
      region: options.region,
      url: `https://supabase-storage.com/${options.bucket}/${key}`
    };
  }

  async download(key: string, options: DownloadOptions): Promise<Buffer> {
    // In a real implementation, this would use Supabase Storage SDK
    return Buffer.from('mock data');
  }

  async delete(key: string, options: DeleteOptions): Promise<void> {
    // In a real implementation, this would use Supabase Storage SDK
  }

  async generateSignedUrl(key: string, expirySeconds: number): Promise<string> {
    // In a real implementation, this would use Supabase Storage SDK
    return `https://supabase-storage.com/${key}?expires=${expirySeconds}`;
  }

  async getMetrics(options: MetricsOptions): Promise<StorageMetrics> {
    // In a real implementation, this would use Supabase metrics
    return {
      totalObjects: 500,
      totalSize: 500 * 1024 * 1024, // 500MB
      availableSpace: 5 * 1024 * 1024 * 1024, // 5GB
      usedSpace: 500 * 1024 * 1024, // 500MB
      readLatency: 80,
      writeLatency: 120,
      errorRate: 0.005,
      throughput: 1500
    };
  }
}

// ============================================================================
// Factory
// ============================================================================

export class ArtifactStorageFactory {
  /**
   * Create storage engine with configuration
   */
  static create(config: ArtifactStorageConfig): ArtifactStorageEngine {
    return new ArtifactStorageEngine(config);
  }

  /**
   * Create default configuration
   */
  static createDefaultConfig(provider: StorageProvider = 'local'): ArtifactStorageConfig {
    return {
      provider,
      bucket: 'workflow-artifacts',
      region: 'us-east-1',
      encryption: {
        enabled: true,
        algorithm: 'AES-256',
        keyRotation: true,
        keyRotationInterval: 90
      },
      compression: {
        enabled: true,
        algorithm: 'gzip',
        level: 6,
        threshold: 1024 // 1KB
      },
      retention: {
        enabled: true,
        defaultRetentionDays: 365,
        maxRetentionDays: 1095, // 3 years
        archiveAfterDays: 90,
        deleteAfterDays: 365,
        policies: []
      },
      access: {
        publicRead: false,
        authenticatedRead: true,
        authenticatedWrite: true,
        adminOnly: false,
        rateLimiting: {
          enabled: true,
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          burstLimit: 50
        }
      },
      monitoring: {
        enabled: true,
        metrics: true,
        logging: true,
        alerting: true,
        retentionDays: 30
      }
    };
  }
}
