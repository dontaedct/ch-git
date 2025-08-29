/**
 * Environment Variable Encryption Utilities - Phase 1, Task 2
 * Provides encryption capabilities for sensitive environment variables in production
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { createHash, createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// =============================================================================
// ENCRYPTION CONFIGURATION
// =============================================================================

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits for AES
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits for GCM

// =============================================================================
// KEY DERIVATION
// =============================================================================

/**
 * Derive encryption key from master password and salt
 */
async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
}

/**
 * Generate random salt
 */
function generateSalt(): Buffer {
  return randomBytes(SALT_LENGTH);
}

/**
 * Generate random IV
 */
function generateIV(): Buffer {
  return randomBytes(IV_LENGTH);
}

// =============================================================================
// ENCRYPTION FUNCTIONS
// =============================================================================

/**
 * Encrypt a value with a master password
 */
export async function encryptValue(value: string, masterPassword: string): Promise<string> {
  try {
    if (!value || !masterPassword) {
      throw new Error('Value and master password are required');
    }

    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(masterPassword, salt);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]).toString('base64');
    
    return `ENC:${result}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt a value with a master password
 */
export async function decryptValue(encryptedValue: string, masterPassword: string): Promise<string> {
  try {
    if (!encryptedValue || !masterPassword) {
      throw new Error('Encrypted value and master password are required');
    }

    if (!encryptedValue.startsWith('ENC:')) {
      throw new Error('Invalid encrypted value format');
    }

    const encryptedData = Buffer.from(encryptedValue.slice(4), 'base64');
    
    if (encryptedData.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
      throw new Error('Invalid encrypted data length');
    }

    const salt = encryptedData.subarray(0, SALT_LENGTH);
    const iv = encryptedData.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = encryptedData.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = encryptedData.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    const key = await deriveKey(masterPassword, salt);
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Encrypt multiple environment variables
 */
export async function encryptEnvironment(
  variables: Record<string, string>,
  masterPassword: string
): Promise<Record<string, string>> {
  const encrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(variables)) {
    if (value && value.trim() !== '') {
      encrypted[key] = await encryptValue(value, masterPassword);
    } else {
      encrypted[key] = value; // Keep empty values as-is
    }
  }
  
  return encrypted;
}

/**
 * Decrypt multiple environment variables
 */
export async function decryptEnvironment(
  encryptedVariables: Record<string, string>,
  masterPassword: string
): Promise<Record<string, string>> {
  const decrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(encryptedVariables)) {
    if (value?.startsWith('ENC:')) {
      decrypted[key] = await decryptValue(value, masterPassword);
    } else {
      decrypted[key] = value; // Keep non-encrypted values as-is
    }
  }
  
  return decrypted;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith('ENC:');
}

/**
 * Validate encrypted value format
 */
export function validateEncryptedValue(value: string): boolean {
  try {
    if (!isEncrypted(value)) {
      return false;
    }

    const encryptedData = Buffer.from(value.slice(4), 'base64');
    return encryptedData.length >= SALT_LENGTH + IV_LENGTH + TAG_LENGTH;
  } catch {
    return false;
  }
}

// =============================================================================
// MASTER PASSWORD MANAGEMENT
// =============================================================================

/**
 * Generate a strong master password
 */
export function generateMasterPassword(length: number = 32): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * Validate master password strength
 */
export function validateMasterPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 16) {
    errors.push('Password must be at least 16 characters long');
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
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Hash master password for storage (one-way)
 */
export function hashMasterPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// =============================================================================
// ROTATION UTILITIES
// =============================================================================

/**
 * Re-encrypt values with new master password
 */
export async function rotateEncryption(
  encryptedVariables: Record<string, string>,
  oldMasterPassword: string,
  newMasterPassword: string
): Promise<Record<string, string>> {
  // First decrypt with old password
  const decrypted = await decryptEnvironment(encryptedVariables, oldMasterPassword);
  
  // Then encrypt with new password
  return await encryptEnvironment(decrypted, newMasterPassword);
}

// =============================================================================
// DEPLOYMENT UTILITIES
// =============================================================================

/**
 * Get master password from environment or prompt
 */
export function getMasterPassword(): string {
  const envPassword = process.env.ENV_MASTER_PASSWORD;
  
  if (envPassword) {
    return envPassword;
  }
  
  // In production, this should come from a secure source
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENV_MASTER_PASSWORD must be set in production');
  }
  
  // For development, could prompt user or use default
  return process.env.ENV_MASTER_PASSWORD_DEV ?? 'development-only-password';
}

/**
 * Decrypt environment variables at runtime if needed
 */
export async function processEnvironmentDecryption(env: Record<string, string | undefined>): Promise<Record<string, string | undefined>> {
  const masterPassword = getMasterPassword();
  const processed: Record<string, string | undefined> = { ...env };
  
  for (const [key, value] of Object.entries(env)) {
    if (value && isEncrypted(value)) {
      try {
        processed[key] = await decryptValue(value, masterPassword);
      } catch (error) {
        console.error(`Failed to decrypt ${key}:`, error);
        // Keep encrypted value to maintain warn-but-run philosophy
        processed[key] = value;
      }
    }
  }
  
  return processed;
}

// =============================================================================
// CLI UTILITIES
// =============================================================================

/**
 * Encrypt environment file
 */
export async function encryptEnvFile(
  sourceEnv: Record<string, string>,
  sensitiveKeys: string[],
  masterPassword: string
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(sourceEnv)) {
    if (sensitiveKeys.includes(key) && value && value.trim() !== '') {
      result[key] = await encryptValue(value, masterPassword);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Format environment variables for .env file
 */
export function formatEnvFile(env: Record<string, string>): string {
  return Object.entries(env)
    .map(([key, value]) => {
      // Wrap values with spaces or special characters in quotes
      const needsQuotes = /\s|["'\\$`]/.test(value);
      const formattedValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
      return `${key}=${formattedValue}`;
    })
    .join('\n');
}