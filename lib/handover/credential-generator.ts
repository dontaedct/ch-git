import { randomBytes, scrypt, createHash } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export interface SecureCredentials {
  username: string;
  password: string;
  hashedPassword: string;
  salt: string;
  apiKey?: string;
  recoveryCode: string;
  expiresAt?: Date;
}

export interface CredentialOptions {
  passwordLength?: number;
  includeSpecialChars?: boolean;
  includeApiKey?: boolean;
  expirationDays?: number;
  customUsername?: string;
}

export class CredentialGenerator {
  private static readonly SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  private static readonly LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly NUMBERS = '0123456789';

  static async generateSecureCredentials(
    clientId: string,
    options: CredentialOptions = {}
  ): Promise<SecureCredentials> {
    const {
      passwordLength = 16,
      includeSpecialChars = true,
      includeApiKey = false,
      expirationDays,
      customUsername
    } = options;

    const username = customUsername || this.generateUsername(clientId);
    const password = this.generatePassword(passwordLength, includeSpecialChars);
    const salt = this.generateSalt();
    const hashedPassword = await this.hashPassword(password, salt);
    const recoveryCode = this.generateRecoveryCode();
    const apiKey = includeApiKey ? this.generateApiKey(clientId) : undefined;
    const expiresAt = expirationDays ? this.calculateExpiration(expirationDays) : undefined;

    return {
      username,
      password,
      hashedPassword,
      salt,
      apiKey,
      recoveryCode,
      expiresAt
    };
  }

  static async validatePassword(password: string, hashedPassword: string, salt: string): Promise<boolean> {
    try {
      const hash = await this.hashPassword(password, salt);
      return hash === hashedPassword;
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }

  static generateTemporaryPassword(length: number = 12): string {
    return this.generatePassword(length, true);
  }

  static generateApiKey(clientId: string): string {
    const timestamp = Date.now().toString();
    const randomComponent = randomBytes(16).toString('hex');
    const clientComponent = createHash('sha256').update(clientId).digest('hex').substring(0, 8);

    return `ck_${clientComponent}_${timestamp}_${randomComponent}`;
  }

  static generateWebhookSecret(): string {
    return randomBytes(32).toString('hex');
  }

  static generateRecoveryCode(): string {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      codes.push(randomBytes(2).toString('hex').toUpperCase());
    }
    return codes.join('-');
  }

  static rotateCredentials(currentCredentials: SecureCredentials): Promise<SecureCredentials> {
    const clientId = this.extractClientIdFromUsername(currentCredentials.username);
    return this.generateSecureCredentials(clientId, {
      customUsername: currentCredentials.username,
      includeApiKey: !!currentCredentials.apiKey
    });
  }

  static maskCredentials(credentials: SecureCredentials): Partial<SecureCredentials> {
    return {
      username: credentials.username,
      password: this.maskPassword(credentials.password),
      apiKey: credentials.apiKey ? this.maskApiKey(credentials.apiKey) : undefined,
      recoveryCode: this.maskRecoveryCode(credentials.recoveryCode),
      expiresAt: credentials.expiresAt
    };
  }

  private static generateUsername(clientId: string): string {
    const clientHash = createHash('md5').update(clientId).digest('hex').substring(0, 6);
    const timestamp = Date.now().toString().substring(-4);
    return `admin_${clientHash}_${timestamp}`;
  }

  private static generatePassword(length: number, includeSpecialChars: boolean): string {
    let charset = this.LETTERS + this.NUMBERS;
    if (includeSpecialChars) {
      charset += this.SPECIAL_CHARS;
    }

    let password = '';

    // Ensure at least one character from each category
    password += this.LETTERS.charAt(Math.floor(Math.random() * this.LETTERS.length));
    password += this.NUMBERS.charAt(Math.floor(Math.random() * this.NUMBERS.length));

    if (includeSpecialChars) {
      password += this.SPECIAL_CHARS.charAt(Math.floor(Math.random() * this.SPECIAL_CHARS.length));
    }

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private static generateSalt(): string {
    return randomBytes(16).toString('hex');
  }

  private static async hashPassword(password: string, salt: string): Promise<string> {
    const hash = (await scryptAsync(password, salt, 64)) as Buffer;
    return hash.toString('hex');
  }

  private static calculateExpiration(days: number): Date {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + days);
    return expiration;
  }

  private static extractClientIdFromUsername(username: string): string {
    // Extract client ID from username pattern: admin_{clientHash}_{timestamp}
    const parts = username.split('_');
    return parts.length >= 2 ? parts[1] : 'unknown';
  }

  private static maskPassword(password: string): string {
    if (password.length <= 4) return '*'.repeat(password.length);
    return password.substring(0, 2) + '*'.repeat(password.length - 4) + password.substring(password.length - 2);
  }

  private static maskApiKey(apiKey: string): string {
    const parts = apiKey.split('_');
    if (parts.length >= 2) {
      return `${parts[0]}_${parts[1]}_****_****`;
    }
    return '****';
  }

  private static maskRecoveryCode(recoveryCode: string): string {
    const parts = recoveryCode.split('-');
    return parts.map((part, index) => index % 2 === 0 ? part : '****').join('-');
  }
}

export interface CredentialStorage {
  storeCredentials(clientId: string, credentials: SecureCredentials): Promise<void>;
  retrieveCredentials(clientId: string): Promise<SecureCredentials | null>;
  deleteCredentials(clientId: string): Promise<void>;
  updateCredentials(clientId: string, updates: Partial<SecureCredentials>): Promise<void>;
}

export class SecureCredentialStorage implements CredentialStorage {
  async storeCredentials(clientId: string, credentials: SecureCredentials): Promise<void> {
    // Implementation would store in secure database with encryption
    try {
      // Store in encrypted format in database
      console.log(`Storing credentials for client: ${clientId}`);
      // Actual implementation would use encrypted storage
    } catch (error) {
      throw new Error(`Failed to store credentials: ${error}`);
    }
  }

  async retrieveCredentials(clientId: string): Promise<SecureCredentials | null> {
    try {
      // Retrieve and decrypt from database
      console.log(`Retrieving credentials for client: ${clientId}`);
      // Actual implementation would decrypt from secure storage
      return null;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  async deleteCredentials(clientId: string): Promise<void> {
    try {
      // Securely delete from database
      console.log(`Deleting credentials for client: ${clientId}`);
      // Actual implementation would securely delete
    } catch (error) {
      throw new Error(`Failed to delete credentials: ${error}`);
    }
  }

  async updateCredentials(clientId: string, updates: Partial<SecureCredentials>): Promise<void> {
    try {
      // Update credentials in secure storage
      console.log(`Updating credentials for client: ${clientId}`);
      // Actual implementation would update encrypted storage
    } catch (error) {
      throw new Error(`Failed to update credentials: ${error}`);
    }
  }
}

export const credentialGenerator = new CredentialGenerator();
export const credentialStorage = new SecureCredentialStorage();