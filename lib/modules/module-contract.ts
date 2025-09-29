/**
 * HT-035.2.1: Module Contract and Interface Definitions
 * 
 * Defines the contracts and interfaces that modules must implement
 * for hot-pluggable activation, security isolation, and integration.
 * 
 * Features:
 * - Module lifecycle contracts
 * - Capability interfaces
 * - Integration contracts
 * - Security and permission contracts
 * - Configuration contracts
 */

// =============================================================================
// CORE MODULE CONTRACTS
// =============================================================================

/**
 * Base module contract that all modules must implement
 */
export interface ModuleContract {
  /** Unique module identifier */
  readonly id: string
  
  /** Module name */
  readonly name: string
  
  /** Module version */
  readonly version: string
  
  /** Module description */
  readonly description: string
  
  /** Module author */
  readonly author: string
  
  /** Module license */
  readonly license: string
  
  /** Module metadata */
  readonly metadata: ModuleMetadata
  
  /** Initialize the module */
  initialize(context: ModuleContext): Promise<ModuleInitializationResult>
  
  /** Cleanup module resources */
  cleanup(): Promise<ModuleCleanupResult>
  
  /** Get module health status */
  getHealthStatus(): Promise<ModuleHealthStatus>
  
  /** Get module configuration schema */
  getConfigurationSchema(): ModuleConfigurationSchema
  
  /** Validate module configuration */
  validateConfiguration(config: Record<string, unknown>): ModuleConfigurationValidation
}

/**
 * Module context provided during initialization
 */
export interface ModuleContext {
  /** Tenant ID */
  tenantId: string
  
  /** Module configuration */
  configuration: Record<string, unknown>
  
  /** Available services */
  services: ModuleServices
  
  /** Module permissions */
  permissions: ModulePermissions
  
  /** Resource quotas */
  quotas: ResourceQuotas
  
  /** Event emitter for lifecycle events */
  events: ModuleEventEmitter
  
  /** Logger for module operations */
  logger: ModuleLogger
  
  /** Metrics collector */
  metrics: ModuleMetricsCollector
}

/**
 * Module services available to modules
 */
export interface ModuleServices {
  /** Database service */
  database: DatabaseService
  
  /** File system service */
  filesystem: FileSystemService
  
  /** Network service */
  network: NetworkService
  
  /** Configuration service */
  configuration: ConfigurationService
  
  /** Authentication service */
  authentication: AuthenticationService
  
  /** Notification service */
  notification: NotificationService
  
  /** Cache service */
  cache: CacheService
}

/**
 * Module permissions interface
 */
export interface ModulePermissions {
  /** Check if module has specific permission */
  hasPermission(permission: string): boolean
  
  /** Check if module can access specific resource */
  canAccessResource(resource: string, operation: string): boolean
  
  /** Get list of granted permissions */
  getGrantedPermissions(): string[]
  
  /** Request additional permission */
  requestPermission(permission: string, reason: string): Promise<boolean>
}

/**
 * Resource quotas interface
 */
export interface ResourceQuotas {
  /** Memory quota */
  memory: MemoryQuota
  
  /** CPU quota */
  cpu: CpuQuota
  
  /** Storage quota */
  storage: StorageQuota
  
  /** Network quota */
  network: NetworkQuota
  
  /** Check if quota allows operation */
  checkQuota(resource: ResourceType, amount: number): boolean
  
  /** Reserve quota for operation */
  reserveQuota(resource: ResourceType, amount: number): Promise<boolean>
  
  /** Release quota after operation */
  releaseQuota(resource: ResourceType, amount: number): void
}

// =============================================================================
// MODULE LIFECYCLE CONTRACTS
// =============================================================================

/**
 * Module initialization result
 */
export interface ModuleInitializationResult {
  /** Whether initialization was successful */
  success: boolean
  
  /** Initialization errors */
  errors: ModuleError[]
  
  /** Initialization warnings */
  warnings: ModuleWarning[]
  
  /** Module capabilities discovered during initialization */
  capabilities: ModuleCapability[]
  
  /** Required dependencies */
  dependencies: ModuleDependency[]
  
  /** Module configuration validation results */
  configurationValidation: ModuleConfigurationValidation
}

/**
 * Module cleanup result
 */
export interface ModuleCleanupResult {
  /** Whether cleanup was successful */
  success: boolean
  
  /** Cleanup errors */
  errors: ModuleError[]
  
  /** Resources that were cleaned up */
  cleanedResources: CleanedResource[]
  
  /** Time taken for cleanup */
  cleanupTime: number
}

/**
 * Module health status
 */
export interface ModuleHealthStatus {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy'
  
  /** Health check results */
  checks: HealthCheckResult[]
  
  /** Module uptime */
  uptime: number
  
  /** Last health check time */
  lastCheck: Date
  
  /** Performance metrics */
  metrics: ModulePerformanceMetrics
  
  /** Error rate */
  errorRate: number
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  /** Check identifier */
  id: string
  
  /** Check name */
  name: string
  
  /** Check status */
  status: 'pass' | 'fail' | 'warn'
  
  /** Check response time */
  responseTime: number
  
  /** Check error message if failed */
  error?: string
  
  /** Check details */
  details?: Record<string, unknown>
  
  /** Check timestamp */
  timestamp: Date
}

// =============================================================================
// CAPABILITY CONTRACTS
// =============================================================================

/**
 * Module capability interface
 */
export interface ModuleCapability {
  /** Capability identifier */
  id: string
  
  /** Capability name */
  name: string
  
  /** Capability description */
  description: string
  
  /** Capability version */
  version: string
  
  /** Capability category */
  category: CapabilityCategory
  
  /** Capability requirements */
  requirements: CapabilityRequirement[]
  
  /** Capability interfaces */
  interfaces: CapabilityInterface[]
  
  /** Capability metadata */
  metadata: CapabilityMetadata
}

/**
 * Capability category
 */
export interface CapabilityCategory {
  /** Category identifier */
  id: string
  
  /** Category name */
  name: string
  
  /** Category description */
  description: string
  
  /** Parent category */
  parent?: string
  
  /** Category tags */
  tags: string[]
}

/**
 * Capability requirement
 */
export interface CapabilityRequirement {
  /** Requirement type */
  type: 'dependency' | 'permission' | 'resource' | 'configuration' | 'service'
  
  /** Requirement value */
  value: string
  
  /** Whether requirement is mandatory */
  required: boolean
  
  /** Requirement version constraint */
  version?: string
  
  /** Requirement description */
  description?: string
}

/**
 * Capability interface
 */
export interface CapabilityInterface {
  /** Interface name */
  name: string
  
  /** Interface version */
  version: string
  
  /** Interface methods */
  methods: InterfaceMethod[]
  
  /** Interface events */
  events: InterfaceEvent[]
  
  /** Interface properties */
  properties: InterfaceProperty[]
}

/**
 * Interface method
 */
export interface InterfaceMethod {
  /** Method name */
  name: string
  
  /** Method description */
  description: string
  
  /** Method parameters */
  parameters: MethodParameter[]
  
  /** Method return type */
  returnType: string
  
  /** Whether method is async */
  async: boolean
  
  /** Method permissions */
  permissions: string[]
}

/**
 * Interface event
 */
export interface InterfaceEvent {
  /** Event name */
  name: string
  
  /** Event description */
  description: string
  
  /** Event data schema */
  dataSchema: Record<string, unknown>
  
  /** Whether event is async */
  async: boolean
  
  /** Event permissions */
  permissions: string[]
}

/**
 * Interface property
 */
export interface InterfaceProperty {
  /** Property name */
  name: string
  
  /** Property description */
  description: string
  
  /** Property type */
  type: string
  
  /** Whether property is read-only */
  readonly: boolean
  
  /** Property permissions */
  permissions: string[]
}

/**
 * Method parameter
 */
export interface MethodParameter {
  /** Parameter name */
  name: string
  
  /** Parameter type */
  type: string
  
  /** Whether parameter is required */
  required: boolean
  
  /** Parameter default value */
  defaultValue?: unknown
  
  /** Parameter description */
  description?: string
}

/**
 * Capability metadata
 */
export interface CapabilityMetadata {
  /** Capability tags */
  tags: string[]
  
  /** Capability documentation */
  documentation: string
  
  /** Capability examples */
  examples: string[]
  
  /** Capability changelog */
  changelog: string[]
  
  /** Capability support information */
  support: SupportInformation
}

/**
 * Support information
 */
export interface SupportInformation {
  /** Support contact */
  contact: string
  
  /** Support documentation URL */
  documentationUrl: string
  
  /** Support issues URL */
  issuesUrl: string
  
  /** Support status */
  status: 'active' | 'deprecated' | 'experimental'
}

// =============================================================================
// INTEGRATION CONTRACTS
// =============================================================================

/**
 * UI integration contract
 */
export interface UIIntegrationContract {
  /** Register UI routes */
  registerRoutes(routes: UIRouteDefinition[]): Promise<void>
  
  /** Unregister UI routes */
  unregisterRoutes(routeIds: string[]): Promise<void>
  
  /** Register UI components */
  registerComponents(components: UIComponentDefinition[]): Promise<void>
  
  /** Unregister UI components */
  unregisterComponents(componentIds: string[]): Promise<void>
  
  /** Update navigation menu */
  updateNavigation(navigation: NavigationDefinition): Promise<void>
  
  /** Apply theme to module components */
  applyTheme(theme: ThemeDefinition): Promise<void>
}

/**
 * API integration contract
 */
export interface APIIntegrationContract {
  /** Register API routes */
  registerRoutes(routes: APIRouteDefinition[]): Promise<void>
  
  /** Unregister API routes */
  unregisterRoutes(routeIds: string[]): Promise<void>
  
  /** Register API middleware */
  registerMiddleware(middleware: APIMiddlewareDefinition[]): Promise<void>
  
  /** Unregister API middleware */
  unregisterMiddleware(middlewareIds: string[]): Promise<void>
  
  /** Configure API authentication */
  configureAuthentication(config: AuthenticationConfig): Promise<void>
  
  /** Configure API rate limiting */
  configureRateLimit(config: RateLimitConfig): Promise<void>
}

/**
 * Database integration contract
 */
export interface DatabaseIntegrationContract {
  /** Run database migrations */
  runMigrations(migrations: DatabaseMigration[]): Promise<MigrationResult>
  
  /** Rollback database migrations */
  rollbackMigrations(targetVersion: string): Promise<RollbackResult>
  
  /** Create database schema */
  createSchema(schema: SchemaDefinition): Promise<void>
  
  /** Drop database schema */
  dropSchema(schemaName: string): Promise<void>
  
  /** Create database connection pool */
  createConnectionPool(config: ConnectionPoolConfig): Promise<void>
  
  /** Destroy database connection pool */
  destroyConnectionPool(poolName: string): Promise<void>
}

// =============================================================================
// CONFIGURATION CONTRACTS
// =============================================================================

/**
 * Module configuration schema
 */
export interface ModuleConfigurationSchema {
  /** Configuration properties */
  properties: Record<string, ConfigurationProperty>
  
  /** Required properties */
  required: string[]
  
  /** Configuration validation rules */
  validation: ConfigurationValidation[]
  
  /** Configuration dependencies */
  dependencies: ConfigurationDependency[]
}

/**
 * Configuration property
 */
export interface ConfigurationProperty {
  /** Property type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum'
  
  /** Property description */
  description: string
  
  /** Property default value */
  default?: unknown
  
  /** Property validation constraints */
  constraints?: PropertyConstraints
  
  /** Property enum values */
  enum?: unknown[]
  
  /** Property format */
  format?: string
}

/**
 * Property constraints
 */
export interface PropertyConstraints {
  /** Minimum value (for numbers) */
  minimum?: number
  
  /** Maximum value (for numbers) */
  maximum?: number
  
  /** Minimum length (for strings/arrays) */
  minLength?: number
  
  /** Maximum length (for strings/arrays) */
  maxLength?: number
  
  /** Regular expression pattern (for strings) */
  pattern?: string
  
  /** Custom validation function */
  validator?: string
}

/**
 * Configuration validation
 */
export interface ConfigurationValidation {
  /** Validation type */
  type: 'required' | 'format' | 'range' | 'custom'
  
  /** Validation rule */
  rule: string
  
  /** Validation message */
  message: string
  
  /** Validation parameters */
  parameters?: Record<string, unknown>
}

/**
 * Configuration dependency
 */
export interface ConfigurationDependency {
  /** Dependent property */
  property: string
  
  /** Dependency condition */
  condition: DependencyCondition
  
  /** Required properties when condition is met */
  required: string[]
}

/**
 * Dependency condition
 */
export interface DependencyCondition {
  /** Condition type */
  type: 'equals' | 'not_equals' | 'in' | 'not_in' | 'exists' | 'not_exists'
  
  /** Condition value */
  value: unknown
  
  /** Condition property to check */
  property: string
}

/**
 * Module configuration validation result
 */
export interface ModuleConfigurationValidation {
  /** Whether configuration is valid */
  valid: boolean
  
  /** Validation errors */
  errors: ConfigurationError[]
  
  /** Validation warnings */
  warnings: ConfigurationWarning[]
  
  /** Sanitized configuration */
  sanitizedConfig?: Record<string, unknown>
}

/**
 * Configuration error
 */
export interface ConfigurationError {
  /** Error property path */
  path: string
  
  /** Error message */
  message: string
  
  /** Error code */
  code: string
  
  /** Error value */
  value: unknown
  
  /** Error details */
  details?: Record<string, unknown>
}

/**
 * Configuration warning
 */
export interface ConfigurationWarning {
  /** Warning property path */
  path: string
  
  /** Warning message */
  message: string
  
  /** Warning code */
  code: string
  
  /** Warning value */
  value: unknown
}

// =============================================================================
// SERVICE CONTRACTS
// =============================================================================

/**
 * Database service contract
 */
export interface DatabaseService {
  /** Execute query */
  query(sql: string, parameters?: unknown[]): Promise<QueryResult>
  
  /** Execute transaction */
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>
  
  /** Get connection from pool */
  getConnection(): Promise<Connection>
  
  /** Release connection to pool */
  releaseConnection(connection: Connection): void
  
  /** Check database health */
  healthCheck(): Promise<HealthCheckResult>
}

/**
 * File system service contract
 */
export interface FileSystemService {
  /** Read file */
  readFile(path: string): Promise<Buffer>
  
  /** Write file */
  writeFile(path: string, data: Buffer): Promise<void>
  
  /** Check if file exists */
  exists(path: string): Promise<boolean>
  
  /** Delete file */
  deleteFile(path: string): Promise<void>
  
  /** List directory contents */
  listDirectory(path: string): Promise<string[]>
  
  /** Create directory */
  createDirectory(path: string): Promise<void>
  
  /** Delete directory */
  deleteDirectory(path: string): Promise<void>
}

/**
 * Network service contract
 */
export interface NetworkService {
  /** Make HTTP request */
  request(config: RequestConfig): Promise<Response>
  
  /** Create WebSocket connection */
  createWebSocket(url: string, options?: WebSocketOptions): Promise<WebSocket>
  
  /** Create server */
  createServer(config: ServerConfig): Promise<Server>
  
  /** Check network connectivity */
  checkConnectivity(host: string, port: number): Promise<boolean>
}

/**
 * Configuration service contract
 */
export interface ConfigurationService {
  /** Get configuration value */
  get<T>(path: string, defaultValue?: T): T
  
  /** Set configuration value */
  set(path: string, value: unknown): void
  
  /** Get module configuration */
  getModuleConfig(moduleId: string): Record<string, unknown>
  
  /** Set module configuration */
  setModuleConfig(moduleId: string, config: Record<string, unknown>): void
  
  /** Watch configuration changes */
  watch(path: string, callback: (value: unknown) => void): void
  
  /** Unwatch configuration changes */
  unwatch(path: string, callback: (value: unknown) => void): void
}

/**
 * Authentication service contract
 */
export interface AuthenticationService {
  /** Authenticate user */
  authenticate(credentials: Credentials): Promise<AuthenticationResult>
  
  /** Authorize operation */
  authorize(user: User, operation: string, resource: string): Promise<boolean>
  
  /** Get user permissions */
  getUserPermissions(user: User): Promise<string[]>
  
  /** Validate token */
  validateToken(token: string): Promise<TokenValidationResult>
  
  /** Refresh token */
  refreshToken(token: string): Promise<TokenRefreshResult>
}

/**
 * Notification service contract
 */
export interface NotificationService {
  /** Send notification */
  send(notification: Notification): Promise<void>
  
  /** Subscribe to notifications */
  subscribe(channel: string, callback: (notification: Notification) => void): void
  
  /** Unsubscribe from notifications */
  unsubscribe(channel: string, callback: (notification: Notification) => void): void
  
  /** Broadcast notification */
  broadcast(notification: Notification): Promise<void>
}

/**
 * Cache service contract
 */
export interface CacheService {
  /** Get cached value */
  get<T>(key: string): Promise<T | null>
  
  /** Set cached value */
  set(key: string, value: unknown, ttl?: number): Promise<void>
  
  /** Delete cached value */
  delete(key: string): Promise<void>
  
  /** Clear cache */
  clear(): Promise<void>
  
  /** Get cache statistics */
  getStats(): Promise<CacheStats>
}

// =============================================================================
// EVENT AND METRICS CONTRACTS
// =============================================================================

/**
 * Module event emitter contract
 */
export interface ModuleEventEmitter {
  /** Emit event */
  emit(event: string, data?: unknown): void
  
  /** Listen to event */
  on(event: string, listener: (data?: unknown) => void): void
  
  /** Remove event listener */
  off(event: string, listener: (data?: unknown) => void): void
  
  /** Listen to event once */
  once(event: string, listener: (data?: unknown) => void): void
}

/**
 * Module logger contract
 */
export interface ModuleLogger {
  /** Log debug message */
  debug(message: string, ...args: unknown[]): void
  
  /** Log info message */
  info(message: string, ...args: unknown[]): void
  
  /** Log warning message */
  warn(message: string, ...args: unknown[]): void
  
  /** Log error message */
  error(message: string, ...args: unknown[]): void
  
  /** Log with custom level */
  log(level: LogLevel, message: string, ...args: unknown[]): void
}

/**
 * Module metrics collector contract
 */
export interface ModuleMetricsCollector {
  /** Increment counter */
  increment(name: string, value?: number, tags?: Record<string, string>): void
  
  /** Set gauge value */
  gauge(name: string, value: number, tags?: Record<string, string>): void
  
  /** Record histogram value */
  histogram(name: string, value: number, tags?: Record<string, string>): void
  
  /** Record timing */
  timing(name: string, duration: number, tags?: Record<string, string>): void
  
  /** Get metrics */
  getMetrics(): Promise<ModuleMetrics>
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ResourceType = 'memory' | 'cpu' | 'storage' | 'network'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type CapabilityType = 'ui' | 'api' | 'database' | 'service' | 'integration'

export interface MemoryQuota {
  maxHeapSize: number
  maxStackSize: number
  gcThreshold: number
}

export interface CpuQuota {
  maxUsage: number
  quotaPeriod: number
  throttlingEnabled: boolean
}

export interface StorageQuota {
  maxSize: number
  path: string
  cleanupEnabled: boolean
}

export interface NetworkQuota {
  maxBandwidth: number
  connectionLimit: number
  allowedHosts: string[]
}

export interface ModuleError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

export interface ModuleWarning {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

export interface CleanedResource {
  type: string
  identifier: string
  size?: number
}

export interface ModulePerformanceMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  resourceUsage: ResourceUsage
}

export interface ResourceUsage {
  memory: number
  cpu: number
  storage: number
  network: number
}

export interface ModuleDependency {
  id: string
  version: string
  required: boolean
}

export interface UIRouteDefinition {
  id: string
  path: string
  component: string
  permissions: string[]
}

export interface UIComponentDefinition {
  id: string
  name: string
  path: string
  lazy: boolean
}

export interface NavigationDefinition {
  items: NavigationItem[]
}

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  permissions: string[]
}

export interface ThemeDefinition {
  colors: Record<string, string>
  typography: Record<string, unknown>
  spacing: Record<string, number>
}

export interface APIRouteDefinition {
  id: string
  path: string
  methods: string[]
  permissions: string[]
}

export interface APIMiddlewareDefinition {
  id: string
  name: string
  path: string
  order: number
}

export interface AuthenticationConfig {
  type: string
  config: Record<string, unknown>
}

export interface RateLimitConfig {
  requests: number
  window: number
  keyGenerator?: string
}

export interface DatabaseMigration {
  version: string
  file: string
  rollback?: string
}

export interface MigrationResult {
  success: boolean
  migrations: string[]
  errors: string[]
}

export interface RollbackResult {
  success: boolean
  rollbacks: string[]
  errors: string[]
}

export interface SchemaDefinition {
  name: string
  tables: TableDefinition[]
}

export interface TableDefinition {
  name: string
  columns: ColumnDefinition[]
}

export interface ColumnDefinition {
  name: string
  type: string
  nullable: boolean
}

export interface ConnectionPoolConfig {
  min: number
  max: number
  idleTimeout: number
}

export interface QueryResult {
  rows: Record<string, unknown>[]
  rowCount: number
}

export interface Transaction {
  query(sql: string, parameters?: unknown[]): Promise<QueryResult>
  commit(): Promise<void>
  rollback(): Promise<void>
}

export interface Connection {
  query(sql: string, parameters?: unknown[]): Promise<QueryResult>
  release(): void
}

export interface RequestConfig {
  url: string
  method: string
  headers?: Record<string, string>
  body?: unknown
}

export interface Response {
  status: number
  headers: Record<string, string>
  data: unknown
}

export interface WebSocketOptions {
  headers?: Record<string, string>
}

export interface WebSocket {
  send(data: unknown): void
  close(): void
  on(event: string, listener: (data: unknown) => void): void
}

export interface ServerConfig {
  port: number
  host: string
}

export interface Server {
  start(): Promise<void>
  stop(): Promise<void>
}

export interface Credentials {
  username: string
  password: string
}

export interface AuthenticationResult {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export interface User {
  id: string
  username: string
  email: string
  permissions: string[]
}

export interface TokenValidationResult {
  valid: boolean
  user?: User
  error?: string
}

export interface TokenRefreshResult {
  success: boolean
  token?: string
  error?: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  memory: number
}

export interface ModuleMetrics {
  counters: Record<string, number>
  gauges: Record<string, number>
  histograms: Record<string, number[]>
  timings: Record<string, number[]>
}

export interface ModuleMetadata {
  createdAt: Date
  updatedAt: Date
  tags: string[]
  documentation: string
  changelog: string[]
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a module contract validator
 */
export function createModuleContractValidator(): ModuleContractValidator {
  return new ModuleContractValidator()
}

/**
 * Validate module contract implementation
 */
export function validateModuleContract(module: unknown): ModuleContractValidation {
  const validator = createModuleContractValidator()
  return validator.validate(module)
}

/**
 * Module contract validator class
 */
export class ModuleContractValidator {
  validate(module: unknown): ModuleContractValidation {
    const result: ModuleContractValidation = {
      valid: true,
      errors: [],
      warnings: []
    }

    if (!module || typeof module !== 'object') {
      result.errors.push({
        property: 'module',
        message: 'Module must be an object',
        code: 'INVALID_MODULE_TYPE'
      })
      result.valid = false
      return result
    }

    const moduleObj = module as Record<string, unknown>

    // Validate required properties
    const requiredProperties = ['id', 'name', 'version', 'description', 'author', 'license']
    for (const prop of requiredProperties) {
      if (!moduleObj[prop] || typeof moduleObj[prop] !== 'string') {
        result.errors.push({
          property: prop,
          message: `Module ${prop} must be a non-empty string`,
          code: 'MISSING_REQUIRED_PROPERTY'
        })
        result.valid = false
      }
    }

    // Validate required methods
    const requiredMethods = ['initialize', 'cleanup', 'getHealthStatus', 'getConfigurationSchema', 'validateConfiguration']
    for (const method of requiredMethods) {
      if (typeof moduleObj[method] !== 'function') {
        result.errors.push({
          property: method,
          message: `Module must implement ${method} method`,
          code: 'MISSING_REQUIRED_METHOD'
        })
        result.valid = false
      }
    }

    return result
  }
}

export interface ModuleContractValidation {
  valid: boolean
  errors: ContractValidationError[]
  warnings: ContractValidationWarning[]
}

export interface ContractValidationError {
  property: string
  message: string
  code: string
}

export interface ContractValidationWarning {
  property: string
  message: string
  code: string
}
