/**
 * HT-024.1.1: Client Data Architecture & Basic Isolation Design
 *
 * Simple client data architecture with basic client isolation and data separation
 * Designed for agency custom micro-app toolkit with ≤7-day deployment
 */

export interface ClientDataContext {
  clientId: string
  userId?: string
  sessionId?: string
  requestSource: 'web' | 'api' | 'system'
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface ClientDataBoundary {
  clientId: string
  isolationLevel: 'strict' | 'shared' | 'readonly'
  allowCrossClientAccess: boolean
  dataRetentionDays: number
  maxStorageQuotaMB: number
  accessPermissions: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
    canExport: boolean
    canImport: boolean
  }
  auditingEnabled: boolean
  encryptionRequired: boolean
}

export interface ClientDataRecord {
  id: string
  clientId: string
  type: 'app_data' | 'user_config' | 'micro_app_state' | 'theme_config' | 'form_data'
  data: Record<string, unknown>
  metadata: {
    version: string
    createdBy?: string
    lastModifiedBy?: string
    tags?: string[]
    isShared?: boolean
    shareScope?: string[]
  }
  timestamps: {
    createdAt: Date
    updatedAt: Date
    lastAccessedAt?: Date
    expiresAt?: Date
  }
  isolation: {
    boundary: string
    accessLevel: 'private' | 'shared' | 'public'
    restrictions?: string[]
  }
}

export interface ClientDataValidation {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    severity: 'error' | 'warning'
  }>
  warnings: Array<{
    field: string
    message: string
    recommendation?: string
  }>
  clientId: string
  validatedAt: Date
}

export interface DataAccessPattern {
  patternName: string
  description: string
  accessType: 'read' | 'write' | 'read-write' | 'bulk-export' | 'bulk-import'
  clientScope: 'single' | 'multi' | 'cross-boundary'
  cacheStrategy: 'none' | 'memory' | 'redis' | 'database'
  cacheConfig?: {
    ttlSeconds: number
    maxEntries?: number
    invalidationStrategy: 'ttl' | 'manual' | 'dependency'
  }
  performanceTargets: {
    maxResponseTimeMs: number
    maxThroughputRps: number
    cacheHitRatio?: number
  }
  securityConstraints: {
    requiresAuth: boolean
    requiresEncryption: boolean
    allowsCrossClient: boolean
    auditRequired: boolean
  }
}

/**
 * Client Isolation Strategy
 *
 * 1. STRICT ISOLATION (Default)
 *    - Complete data separation per client
 *    - No cross-client data access
 *    - Separate cache namespaces
 *    - Individual audit logs
 *
 * 2. SHARED ISOLATION
 *    - Controlled data sharing between clients
 *    - Explicit sharing permissions required
 *    - Shared cache with client prefixes
 *    - Consolidated audit logs
 *
 * 3. READONLY ISOLATION
 *    - Read-only access to shared reference data
 *    - Private write access to client data
 *    - Hybrid cache strategy
 *    - Separate audit streams
 */
export const CLIENT_ISOLATION_STRATEGIES = {
  STRICT: {
    name: 'strict',
    description: 'Complete client data isolation',
    crossClientAccess: false,
    sharedResources: false,
    cacheStrategy: 'client_namespaced',
    auditStrategy: 'per_client'
  },
  SHARED: {
    name: 'shared',
    description: 'Controlled sharing with explicit permissions',
    crossClientAccess: true,
    sharedResources: true,
    cacheStrategy: 'shared_with_prefixes',
    auditStrategy: 'consolidated'
  },
  READONLY: {
    name: 'readonly',
    description: 'Read-only access to shared reference data',
    crossClientAccess: 'readonly',
    sharedResources: 'readonly',
    cacheStrategy: 'hybrid',
    auditStrategy: 'dual_stream'
  }
} as const

/**
 * Data Separation Boundaries
 *
 * Physical and logical boundaries for client data separation:
 *
 * 1. DATABASE LEVEL
 *    - Table-level isolation with client_id columns
 *    - Row Level Security (RLS) policies
 *    - Separate connection pools per client (optional)
 *
 * 2. APPLICATION LEVEL
 *    - Client-aware data access layer
 *    - Request context validation
 *    - Client-scoped queries
 *
 * 3. CACHE LEVEL
 *    - Client-prefixed cache keys
 *    - Separate cache namespaces
 *    - Client-aware invalidation
 *
 * 4. API LEVEL
 *    - Client authentication tokens
 *    - Request header validation
 *    - Client-scoped endpoints
 */
export const DATA_SEPARATION_BOUNDARIES = {
  DATABASE: {
    strategy: 'rls_with_client_id',
    implementation: 'supabase_rls',
    indexing: 'client_id_composite',
    isolation: 'row_level'
  },
  APPLICATION: {
    strategy: 'context_aware_dal',
    implementation: 'client_context_provider',
    validation: 'request_context',
    fallback: 'deny_access'
  },
  CACHE: {
    strategy: 'namespaced_keys',
    implementation: 'redis_with_prefixes',
    invalidation: 'client_scoped',
    fallback: 'database_query'
  },
  API: {
    strategy: 'token_based_auth',
    implementation: 'jwt_with_client_claims',
    validation: 'header_and_token',
    fallback: 'unauthorized'
  }
} as const

/**
 * Database Schema Design for Client Data Architecture
 *
 * Core tables designed for multi-client micro-app data:
 */
export const CLIENT_DATA_SCHEMA = {
  // Main client configuration table
  clients: {
    tableName: 'app_clients',
    columns: {
      id: 'UUID PRIMARY KEY',
      client_name: 'TEXT NOT NULL',
      client_type: 'TEXT CHECK (client_type IN (\'individual\', \'organization\', \'agency\'))',
      isolation_strategy: 'TEXT DEFAULT \'strict\'',
      storage_quota_mb: 'INTEGER DEFAULT 1000',
      data_retention_days: 'INTEGER DEFAULT 90',
      is_active: 'BOOLEAN DEFAULT true',
      created_at: 'TIMESTAMPTZ DEFAULT NOW()',
      updated_at: 'TIMESTAMPTZ DEFAULT NOW()'
    },
    indexes: [
      'idx_app_clients_client_name',
      'idx_app_clients_client_type',
      'idx_app_clients_is_active'
    ],
    rls: true
  },

  // Client-scoped micro-app data
  client_app_data: {
    tableName: 'client_app_data',
    columns: {
      id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      client_id: 'UUID NOT NULL REFERENCES app_clients(id) ON DELETE CASCADE',
      app_type: 'TEXT NOT NULL',
      data_key: 'TEXT NOT NULL',
      data_value: 'JSONB NOT NULL',
      data_type: 'TEXT CHECK (data_type IN (\'config\', \'state\', \'content\', \'theme\'))',
      version: 'INTEGER DEFAULT 1',
      is_shared: 'BOOLEAN DEFAULT false',
      share_scope: 'TEXT[]',
      metadata: 'JSONB DEFAULT \'{}\'::jsonb',
      created_at: 'TIMESTAMPTZ DEFAULT NOW()',
      updated_at: 'TIMESTAMPTZ DEFAULT NOW()',
      last_accessed_at: 'TIMESTAMPTZ',
      expires_at: 'TIMESTAMPTZ'
    },
    indexes: [
      'idx_client_app_data_client_id',
      'idx_client_app_data_app_type_client_id',
      'idx_client_app_data_data_key',
      'idx_client_app_data_data_type',
      'idx_client_app_data_is_shared',
      'idx_client_app_data_expires_at'
    ],
    rls: true,
    constraints: [
      'UNIQUE(client_id, app_type, data_key)'
    ]
  },

  // Client data access audit log
  client_data_audit: {
    tableName: 'client_data_audit',
    columns: {
      id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      client_id: 'UUID NOT NULL REFERENCES app_clients(id) ON DELETE CASCADE',
      user_id: 'UUID REFERENCES auth.users(id)',
      action: 'TEXT NOT NULL CHECK (action IN (\'read\', \'write\', \'delete\', \'export\', \'import\'))',
      resource_type: 'TEXT NOT NULL',
      resource_id: 'TEXT NOT NULL',
      success: 'BOOLEAN NOT NULL',
      error_message: 'TEXT',
      request_metadata: 'JSONB DEFAULT \'{}\'::jsonb',
      created_at: 'TIMESTAMPTZ DEFAULT NOW()'
    },
    indexes: [
      'idx_client_data_audit_client_id',
      'idx_client_data_audit_user_id',
      'idx_client_data_audit_action',
      'idx_client_data_audit_created_at',
      'idx_client_data_audit_resource_type'
    ],
    rls: true,
    partitioning: 'monthly_by_created_at'
  },

  // Client data sharing permissions
  client_data_sharing: {
    tableName: 'client_data_sharing',
    columns: {
      id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      owner_client_id: 'UUID NOT NULL REFERENCES app_clients(id) ON DELETE CASCADE',
      shared_with_client_id: 'UUID NOT NULL REFERENCES app_clients(id) ON DELETE CASCADE',
      resource_type: 'TEXT NOT NULL',
      resource_pattern: 'TEXT NOT NULL',
      permissions: 'TEXT[] NOT NULL',
      expires_at: 'TIMESTAMPTZ',
      is_active: 'BOOLEAN DEFAULT true',
      created_at: 'TIMESTAMPTZ DEFAULT NOW()',
      updated_at: 'TIMESTAMPTZ DEFAULT NOW()'
    },
    indexes: [
      'idx_client_data_sharing_owner_client_id',
      'idx_client_data_sharing_shared_with_client_id',
      'idx_client_data_sharing_resource_type',
      'idx_client_data_sharing_is_active',
      'idx_client_data_sharing_expires_at'
    ],
    rls: true,
    constraints: [
      'UNIQUE(owner_client_id, shared_with_client_id, resource_type, resource_pattern)',
      'CHECK (owner_client_id != shared_with_client_id)'
    ]
  }
} as const

/**
 * Data Access Patterns for Client Micro-Apps
 *
 * Optimized patterns for common micro-app data operations:
 */
export const CLIENT_DATA_ACCESS_PATTERNS: DataAccessPattern[] = [
  {
    patternName: 'client_config_read',
    description: 'Read client-specific configuration data',
    accessType: 'read',
    clientScope: 'single',
    cacheStrategy: 'redis',
    cacheConfig: {
      ttlSeconds: 3600,
      maxEntries: 1000,
      invalidationStrategy: 'manual'
    },
    performanceTargets: {
      maxResponseTimeMs: 50,
      maxThroughputRps: 1000,
      cacheHitRatio: 0.9
    },
    securityConstraints: {
      requiresAuth: true,
      requiresEncryption: false,
      allowsCrossClient: false,
      auditRequired: false
    }
  },
  {
    patternName: 'micro_app_state_sync',
    description: 'Synchronize micro-app state data',
    accessType: 'read-write',
    clientScope: 'single',
    cacheStrategy: 'memory',
    cacheConfig: {
      ttlSeconds: 60,
      maxEntries: 100,
      invalidationStrategy: 'dependency'
    },
    performanceTargets: {
      maxResponseTimeMs: 100,
      maxThroughputRps: 500,
      cacheHitRatio: 0.8
    },
    securityConstraints: {
      requiresAuth: true,
      requiresEncryption: false,
      allowsCrossClient: false,
      auditRequired: true
    }
  },
  {
    patternName: 'shared_theme_data',
    description: 'Access shared theme configuration across clients',
    accessType: 'read',
    clientScope: 'multi',
    cacheStrategy: 'redis',
    cacheConfig: {
      ttlSeconds: 7200,
      maxEntries: 500,
      invalidationStrategy: 'manual'
    },
    performanceTargets: {
      maxResponseTimeMs: 75,
      maxThroughputRps: 800,
      cacheHitRatio: 0.95
    },
    securityConstraints: {
      requiresAuth: true,
      requiresEncryption: false,
      allowsCrossClient: true,
      auditRequired: false
    }
  },
  {
    patternName: 'bulk_data_export',
    description: 'Export client data for backup or migration',
    accessType: 'bulk-export',
    clientScope: 'single',
    cacheStrategy: 'none',
    performanceTargets: {
      maxResponseTimeMs: 30000,
      maxThroughputRps: 10
    },
    securityConstraints: {
      requiresAuth: true,
      requiresEncryption: true,
      allowsCrossClient: false,
      auditRequired: true
    }
  },
  {
    patternName: 'form_data_persistence',
    description: 'Persist form builder data with versioning',
    accessType: 'write',
    clientScope: 'single',
    cacheStrategy: 'database',
    performanceTargets: {
      maxResponseTimeMs: 200,
      maxThroughputRps: 200
    },
    securityConstraints: {
      requiresAuth: true,
      requiresEncryption: false,
      allowsCrossClient: false,
      auditRequired: true
    }
  }
]

/**
 * Data Architecture Performance Targets (from HT-024 requirements)
 */
export const PERFORMANCE_TARGETS = {
  stateUpdateTime: 200, // ms - <200ms state update time
  dataRetrievalTime: 100, // ms - <100ms data retrieval time
  clientSwitchingTime: 500, // ms - <500ms client switching time
  cacheHitRatio: 0.7, // >70% cache hit ratio
  dataConsistency: 0.99, // 99% data consistency across clients
  dataPersistenceReliability: 0.99, // 99% data persistence reliability
  realTimeSyncTime: 500 // ms - Sub-500ms real-time synchronization
} as const

/**
 * Client Data Architecture Summary
 *
 * This architecture provides:
 *
 * ✅ CLIENT DATA ARCHITECTURE DESIGNED
 * - Multi-client micro-app data structure
 * - Flexible isolation strategies (strict, shared, readonly)
 * - Performance-optimized data patterns
 *
 * ✅ CLIENT ISOLATION STRATEGY DEFINED
 * - Three isolation levels with clear boundaries
 * - Cross-client access controls
 * - Security-first design approach
 *
 * ✅ DATA SEPARATION BOUNDARIES ESTABLISHED
 * - Database: RLS with client_id isolation
 * - Application: Context-aware data access layer
 * - Cache: Namespaced keys with client prefixes
 * - API: Token-based client authentication
 *
 * ✅ DATABASE SCHEMA DESIGN COMPLETED
 * - Core tables: app_clients, client_app_data, client_data_audit, client_data_sharing
 * - Proper indexing for performance
 * - RLS policies for security
 * - Audit logging for compliance
 *
 * ✅ DATA ACCESS PATTERNS DEFINED
 * - 5 optimized patterns for common operations
 * - Cache strategies aligned with usage patterns
 * - Performance targets mapped to HT-024 requirements
 * - Security constraints per access type
 */