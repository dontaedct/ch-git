/**
 * HT-004.5.5: Enhanced Data Encryption & Security System
 * Advanced encryption for sensitive data with key management
 * Created: 2025-09-08T22:18:10.000Z
 */

import { createHash, createCipheriv, createDecipheriv, randomBytes, scrypt, createHmac } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// =============================================================================
// ENCRYPTION CONFIGURATION
// =============================================================================

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  tagLength: number;
  iterations: number;
}

export interface KeyManagementConfig {
  keyRotationDays: number;
  maxKeyAge: number;
  backupKeys: boolean;
  keyVersioning: boolean;
}

export interface SecurityPolicy {
  minPasswordLength: number;
  requireSpecialChars: boolean;
  passwordHistory: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

// Default configurations
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16, // 128 bits
  saltLength: 32, // 256 bits
  tagLength: 16, // 128 bits
  iterations: 100000, // PBKDF2 iterations
};

export const DEFAULT_KEY_MANAGEMENT_CONFIG: KeyManagementConfig = {
  keyRotationDays: 90,
  maxKeyAge: 365,
  backupKeys: true,
  keyVersioning: true,
};

export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  minPasswordLength: 12,
  requireSpecialChars: true,
  passwordHistory: 5,
  sessionTimeout: 3600, // 1 hour
  maxLoginAttempts: 5,
  lockoutDuration: 900, // 15 minutes
};

// =============================================================================
// ENCRYPTION KEY MANAGEMENT
// =============================================================================

export class EncryptionKeyManager {
  private keys: Map<string, Buffer> = new Map();
  private keyVersions: Map<string, string[]> = new Map();
  private config: KeyManagementConfig;
  
  constructor(config: KeyManagementConfig = DEFAULT_KEY_MANAGEMENT_CONFIG) {
    this.config = config;
  }
  
  /**
   * Generate a new encryption key
   */
  async generateKey(keyId: string, password?: string): Promise<Buffer> {
    const salt = randomBytes(DEFAULT_ENCRYPTION_CONFIG.saltLength);
    let key: Buffer;
    
    if (password) {
      key = await this.deriveKeyFromPassword(password, salt);
    } else {
      key = randomBytes(DEFAULT_ENCRYPTION_CONFIG.keyLength);
    }
    
    // Store key with versioning
    const version = this.generateKeyVersion();
    const versionedKeyId = `${keyId}:${version}`;
    
    this.keys.set(versionedKeyId, key);
    
    // Track key versions
    if (!this.keyVersions.has(keyId)) {
      this.keyVersions.set(keyId, []);
    }
    this.keyVersions.get(keyId)!.push(version);
    
    // Clean up old versions if needed
    this.cleanupOldVersions(keyId);
    
    return key;
  }
  
  /**
   * Get encryption key by ID and version
   */
  getKey(keyId: string, version?: string): Buffer | null {
    if (version) {
      return this.keys.get(`${keyId}:${version}`) || null;
    }
    
    // Get latest version
    const versions = this.keyVersions.get(keyId);
    if (!versions || versions.length === 0) {
      return null;
    }
    
    const latestVersion = versions[versions.length - 1];
    return this.keys.get(`${keyId}:${latestVersion}`) || null;
  }
  
  /**
   * Derive key from password using PBKDF2
   */
  private async deriveKeyFromPassword(password: string, salt: Buffer): Promise<Buffer> {
    return (await scryptAsync(password, salt, DEFAULT_ENCRYPTION_CONFIG.keyLength)) as Buffer;
  }
  
  /**
   * Generate key version identifier
   */
  private generateKeyVersion(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * Clean up old key versions
   */
  private cleanupOldVersions(keyId: string): void {
    const versions = this.keyVersions.get(keyId);
    if (!versions || versions.length <= 3) {
      return; // Keep at least 3 versions
    }
    
    // Remove oldest versions
    const versionsToRemove = versions.slice(0, versions.length - 3);
    versionsToRemove.forEach(version => {
      this.keys.delete(`${keyId}:${version}`);
    });
    
    this.keyVersions.set(keyId, versions.slice(-3));
  }
  
  /**
   * Rotate encryption key
   */
  async rotateKey(keyId: string, newPassword?: string): Promise<Buffer> {
    return await this.generateKey(keyId, newPassword);
  }
  
  /**
   * Get all key versions for a key ID
   */
  getKeyVersions(keyId: string): string[] {
    return this.keyVersions.get(keyId) || [];
  }
  
  /**
   * Delete key and all versions
   */
  deleteKey(keyId: string): void {
    const versions = this.keyVersions.get(keyId) || [];
    versions.forEach(version => {
      this.keys.delete(`${keyId}:${version}`);
    });
    this.keyVersions.delete(keyId);
  }
}

// =============================================================================
// FIELD-LEVEL ENCRYPTION
// =============================================================================

export class FieldEncryption {
  private keyManager: EncryptionKeyManager;
  private config: EncryptionConfig;
  
  constructor(
    keyManager: EncryptionKeyManager,
    config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG
  ) {
    this.keyManager = keyManager;
    this.config = config;
  }
  
  /**
   * Encrypt sensitive field data
   */
  async encryptField(
    data: string,
    fieldName: string,
    keyId: string = 'default'
  ): Promise<string> {
    try {
      const key = this.keyManager.getKey(keyId);
      if (!key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }
      
      const salt = randomBytes(this.config.saltLength);
      const iv = randomBytes(this.config.ivLength);
      
      // Derive field-specific key
      const fieldKey = await this.deriveFieldKey(key, fieldName, salt);
      
      const cipher = createCipheriv(this.config.algorithm, fieldKey, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Create encrypted payload with metadata
      const payload = {
        version: '1.0',
        field: fieldName,
        keyId: keyId,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        data: encrypted,
        timestamp: Date.now(),
      };
      
      return Buffer.from(JSON.stringify(payload)).toString('base64');
    } catch (error) {
      throw new Error(`Field encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Decrypt sensitive field data
   */
  async decryptField(
    encryptedData: string,
    fieldName: string,
    keyId?: string
  ): Promise<string> {
    try {
      const payload = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
      
      // Validate payload
      if (payload.version !== '1.0') {
        throw new Error('Unsupported encryption version');
      }
      
      if (payload.field !== fieldName) {
        throw new Error('Field name mismatch');
      }
      
      const actualKeyId = keyId || payload.keyId;
      const key = this.keyManager.getKey(actualKeyId);
      if (!key) {
        throw new Error(`Decryption key not found: ${actualKeyId}`);
      }
      
      const salt = Buffer.from(payload.salt, 'base64');
      const iv = Buffer.from(payload.iv, 'base64');
      // Derive field-specific key
      const fieldKey = await this.deriveFieldKey(key, fieldName, salt);
      
      const decipher = createDecipheriv(this.config.algorithm, fieldKey, iv);
      
      let decrypted = decipher.update(payload.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Field decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Derive field-specific key from master key
   */
  private async deriveFieldKey(masterKey: Buffer, fieldName: string, salt: Buffer): Promise<Buffer> {
    const fieldInfo = `${fieldName}:${salt.toString('hex')}`;
    return (await scryptAsync(masterKey, Buffer.from(fieldInfo, 'utf8'), this.config.keyLength)) as Buffer;
  }
  
  /**
   * Check if data is encrypted
   */
  isEncrypted(data: string): boolean {
    try {
      const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
      return payload.version === '1.0' && payload.data && payload.tag;
    } catch {
      return false;
    }
  }
  
  /**
   * Get encryption metadata
   */
  getEncryptionMetadata(encryptedData: string): any {
    try {
      const payload = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
      return {
        version: payload.version,
        field: payload.field,
        keyId: payload.keyId,
        timestamp: payload.timestamp,
      };
    } catch {
      return null;
    }
  }
}

// =============================================================================
// DATA CLASSIFICATION AND ENCRYPTION
// =============================================================================

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

export interface SensitiveField {
  fieldName: string;
  classification: DataClassification;
  encryptionRequired: boolean;
  keyId?: string;
  ttl?: number; // Time to live in seconds
}

export class DataClassificationManager {
  private fieldDefinitions: Map<string, SensitiveField> = new Map();
  private encryption: FieldEncryption;
  
  constructor(encryption: FieldEncryption) {
    this.encryption = encryption;
    this.initializeDefaultFields();
  }
  
  /**
   * Initialize default sensitive field definitions
   */
  private initializeDefaultFields(): void {
    const defaultFields: SensitiveField[] = [
      // User data
      { fieldName: 'email', classification: DataClassification.CONFIDENTIAL, encryptionRequired: true },
      { fieldName: 'phone', classification: DataClassification.CONFIDENTIAL, encryptionRequired: true },
      { fieldName: 'address', classification: DataClassification.CONFIDENTIAL, encryptionRequired: true },
      { fieldName: 'ssn', classification: DataClassification.RESTRICTED, encryptionRequired: true },
      { fieldName: 'credit_card', classification: DataClassification.RESTRICTED, encryptionRequired: true },
      
      // Task data
      { fieldName: 'task_description', classification: DataClassification.INTERNAL, encryptionRequired: false },
      { fieldName: 'task_notes', classification: DataClassification.INTERNAL, encryptionRequired: false },
      { fieldName: 'task_attachments', classification: DataClassification.CONFIDENTIAL, encryptionRequired: true },
      
      // System data
      { fieldName: 'api_keys', classification: DataClassification.RESTRICTED, encryptionRequired: true },
      { fieldName: 'passwords', classification: DataClassification.RESTRICTED, encryptionRequired: true },
      { fieldName: 'tokens', classification: DataClassification.RESTRICTED, encryptionRequired: true },
    ];
    
    defaultFields.forEach(field => {
      this.fieldDefinitions.set(field.fieldName, field);
    });
  }
  
  /**
   * Register a sensitive field
   */
  registerSensitiveField(field: SensitiveField): void {
    this.fieldDefinitions.set(field.fieldName, field);
  }
  
  /**
   * Get field classification
   */
  getFieldClassification(fieldName: string): SensitiveField | null {
    return this.fieldDefinitions.get(fieldName) || null;
  }
  
  /**
   * Encrypt sensitive data based on classification
   */
  async encryptSensitiveData(
    data: Record<string, any>,
    keyId: string = 'default'
  ): Promise<Record<string, any>> {
    const encrypted: Record<string, any> = {};
    
    for (const [fieldName, value] of Object.entries(data)) {
      const fieldDef = this.getFieldClassification(fieldName);
      
      if (fieldDef && fieldDef.encryptionRequired && typeof value === 'string') {
        try {
          encrypted[fieldName] = await this.encryption.encryptField(value, fieldName, keyId);
        } catch (error) {
          console.error(`Failed to encrypt field ${fieldName}:`, error);
          encrypted[fieldName] = value; // Keep original value on encryption failure
        }
      } else {
        encrypted[fieldName] = value;
      }
    }
    
    return encrypted;
  }
  
  /**
   * Decrypt sensitive data
   */
  async decryptSensitiveData(
    encryptedData: Record<string, any>,
    keyId?: string
  ): Promise<Record<string, any>> {
    const decrypted: Record<string, any> = {};
    
    for (const [fieldName, value] of Object.entries(encryptedData)) {
      if (typeof value === 'string' && this.encryption.isEncrypted(value)) {
        try {
          decrypted[fieldName] = await this.encryption.decryptField(value, fieldName, keyId);
        } catch (error) {
          console.error(`Failed to decrypt field ${fieldName}:`, error);
          decrypted[fieldName] = value; // Keep encrypted value on decryption failure
        }
      } else {
        decrypted[fieldName] = value;
      }
    }
    
    return decrypted;
  }
  
  /**
   * Get all sensitive fields
   */
  getSensitiveFields(): SensitiveField[] {
    return Array.from(this.fieldDefinitions.values());
  }
  
  /**
   * Get fields by classification
   */
  getFieldsByClassification(classification: DataClassification): SensitiveField[] {
    return Array.from(this.fieldDefinitions.values())
      .filter(field => field.classification === classification);
  }
}

// =============================================================================
// SECURITY HEADERS AND POLICIES
// =============================================================================

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'Strict-Transport-Security': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

export class SecurityPolicyManager {
  private config: SecurityPolicy;
  
  constructor(config: SecurityPolicy = DEFAULT_SECURITY_POLICY) {
    this.config = config;
  }
  
  /**
   * Generate comprehensive security headers
   */
  generateSecurityHeaders(domain?: string): SecurityHeaders {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];
    
    if (domain) {
      cspDirectives.push(`frame-ancestors 'self' ${domain}`);
    }
    
    return {
      'Content-Security-Policy': cspDirectives.join('; '),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    };
  }
  
  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < this.config.minPasswordLength) {
      errors.push(`Password must be at least ${this.config.minPasswordLength} characters long`);
    }
    
    if (this.config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Generate secure session token
   */
  generateSessionToken(): string {
    const randomBytes = require('crypto').randomBytes(32);
    return randomBytes.toString('hex');
  }
  
  /**
   * Hash password securely
   */
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(32);
    const hash = await scryptAsync(password, salt, 64) as Buffer;
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }
  
  /**
   * Verify password hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const [saltHex, hashHex] = hash.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      const hashBuffer = Buffer.from(hashHex, 'hex');
      
      const derivedHash = await scryptAsync(password, salt, 64) as Buffer;
      return derivedHash.equals(hashBuffer);
    } catch {
      return false;
    }
  }
}

// =============================================================================
// VULNERABILITY SCANNING
// =============================================================================

export interface VulnerabilityScanResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  recommendation: string;
  affectedFields?: string[];
}

export class VulnerabilityScanner {
  private classificationManager: DataClassificationManager;
  
  constructor(classificationManager: DataClassificationManager) {
    this.classificationManager = classificationManager;
  }
  
  /**
   * Scan data for security vulnerabilities
   */
  async scanData(data: Record<string, any>): Promise<VulnerabilityScanResult[]> {
    const vulnerabilities: VulnerabilityScanResult[] = [];
    
    for (const [fieldName, value] of Object.entries(data)) {
      const fieldDef = this.classificationManager.getFieldClassification(fieldName);
      
      if (!fieldDef) continue;
      
      // Check for unencrypted sensitive data
      if (fieldDef.encryptionRequired && typeof value === 'string' && !this.isEncrypted(value)) {
        vulnerabilities.push({
          severity: 'high',
          type: 'unencrypted_sensitive_data',
          description: `Sensitive field '${fieldName}' is not encrypted`,
          recommendation: 'Encrypt sensitive data before storage',
          affectedFields: [fieldName],
        });
      }
      
      // Check for weak passwords
      if (fieldName.includes('password') && typeof value === 'string') {
        const passwordValidation = new SecurityPolicyManager().validatePassword(value);
        if (!passwordValidation.valid) {
          vulnerabilities.push({
            severity: 'medium',
            type: 'weak_password',
            description: `Weak password detected in field '${fieldName}'`,
            recommendation: passwordValidation.errors.join('; '),
            affectedFields: [fieldName],
          });
        }
      }
      
      // Check for SQL injection patterns
      if (typeof value === 'string' && this.containsSQLInjectionPattern(value)) {
        vulnerabilities.push({
          severity: 'critical',
          type: 'sql_injection_pattern',
          description: `Potential SQL injection pattern detected in field '${fieldName}'`,
          recommendation: 'Sanitize input data and use parameterized queries',
          affectedFields: [fieldName],
        });
      }
      
      // Check for XSS patterns
      if (typeof value === 'string' && this.containsXSSPattern(value)) {
        vulnerabilities.push({
          severity: 'high',
          type: 'xss_pattern',
          description: `Potential XSS pattern detected in field '${fieldName}'`,
          recommendation: 'Sanitize input data and escape output',
          affectedFields: [fieldName],
        });
      }
    }
    
    return vulnerabilities;
  }
  
  /**
   * Check if value is encrypted
   */
  private isEncrypted(value: string): boolean {
    try {
      const payload = JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
      return payload.version === '1.0' && payload.data && payload.tag;
    } catch {
      return false;
    }
  }
  
  /**
   * Check for SQL injection patterns
   */
  private containsSQLInjectionPattern(value: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(;|\-\-|\/\*|\*\/)/,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\bUNION\s+SELECT\b)/i,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(value));
  }
  
  /**
   * Check for XSS patterns
   */
  private containsXSSPattern(value: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(value));
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createEncryptionSystem(
  keyManagementConfig?: KeyManagementConfig,
  encryptionConfig?: EncryptionConfig
): { keyManager: EncryptionKeyManager; fieldEncryption: FieldEncryption; classificationManager: DataClassificationManager } {
  const keyManager = new EncryptionKeyManager(keyManagementConfig);
  const fieldEncryption = new FieldEncryption(keyManager, encryptionConfig);
  const classificationManager = new DataClassificationManager(fieldEncryption);
  
  return {
    keyManager,
    fieldEncryption,
    classificationManager,
  };
}

export function createSecuritySystem(
  securityPolicy?: SecurityPolicy
): { policyManager: SecurityPolicyManager; vulnerabilityScanner: VulnerabilityScanner } {
  const policyManager = new SecurityPolicyManager(securityPolicy);
  const classificationManager = new DataClassificationManager(
    new FieldEncryption(new EncryptionKeyManager())
  );
  const vulnerabilityScanner = new VulnerabilityScanner(classificationManager);
  
  return {
    policyManager,
    vulnerabilityScanner,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  createEncryptionSystem,
  createSecuritySystem,
  DataClassification,
  DEFAULT_ENCRYPTION_CONFIG,
  DEFAULT_KEY_MANAGEMENT_CONFIG,
  DEFAULT_SECURITY_POLICY,
};
